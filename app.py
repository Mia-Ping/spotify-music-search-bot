from flask import Flask, render_template, request, redirect, session, url_for, jsonify
import requests
import urllib.parse
import os
import base64
import json
import time
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = '022966be939f1d0d11d12c0da0978b71'  # Change this to a random secret key

# Spotify API credentials
CLIENT_ID = '112198efe8bc4ae49492ad78031679a8'
CLIENT_SECRET = '9deeb3255e3d4d7187903c8b5ae2dd90'
REDIRECT_URI = 'http://127.0.0.1:5005/callback'

# Spotify API endpoints
AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'

@app.route('/') 
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    # Auth Step 1: Request authorization from user
    scope = 'user-read-private user-read-email user-library-read user-library-modify user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private user-top-read'
    
    params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'scope': scope,
        'redirect_uri': REDIRECT_URI,
        'show_dialog': True
    }
    
    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"
    logger.debug(f"Redirecting to Spotify auth URL: {auth_url}")
    return redirect(auth_url)

@app.route('/callback')
def callback():
    logger.debug(f"Received callback with args: {request.args}")
    
    # Auth Step 4: Requests refresh and access tokens
    if 'error' in request.args:
        logger.error(f"Error in callback: {request.args['error']}")
        return jsonify({"error": request.args['error']})
    
    if 'code' in request.args:
        # Auth Step 5: Exchange authorization code for tokens
        auth_token = request.args['code']
        
        # Prepare the request to exchange the auth code for tokens
        auth_options = {
            'code': auth_token,
            'redirect_uri': REDIRECT_URI,
            'grant_type': 'authorization_code',
        }
        
        # Base64 encode the client ID and secret
        auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
        
        try:
            # Make the request to get tokens
            response = requests.post(
                TOKEN_URL,
                data=auth_options,
                headers={
                    'Authorization': f'Basic {auth_header}',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            )
            
            response.raise_for_status()  # Raise an error for bad status codes
            tokens = response.json()
            
            logger.debug("Successfully received tokens from Spotify")
            
            if 'error' in tokens:
                logger.error(f"Error in tokens response: {tokens['error']}")
                return jsonify({"error": tokens['error']})
            
            # Save tokens in session
            session['access_token'] = tokens['access_token']
            session['refresh_token'] = tokens['refresh_token']
            session['expires_at'] = time.time() + tokens['expires_in']
            
            # Redirect to dashboard
            return redirect(url_for('dashboard'))
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error exchanging auth code for tokens: {str(e)}")
            return jsonify({"error": f"Failed to exchange authorization code: {str(e)}"})
    
    logger.error("No code provided in callback")
    return jsonify({"error": "No code provided"})

@app.route('/dashboard')
def dashboard():
    if 'access_token' not in session:
        return redirect(url_for('login'))
    
    # Check if token is expired
    if time.time() > session['expires_at']:
        return redirect(url_for('refresh_token'))
    
    # Set up headers for API requests
    headers = {
        'Authorization': f"Bearer {session['access_token']}"
    }
    
    try:
        # Get user profile
        response = requests.get(API_BASE_URL + 'me', headers=headers)
        response.raise_for_status()
        user_data = response.json()
        logger.debug(f"User data: {json.dumps(user_data, indent=2)}")
        
        # Get user playlists with error handling
        try:
            playlists_response = requests.get(API_BASE_URL + 'me/playlists', headers=headers)
            playlists_response.raise_for_status()
            playlists_data = playlists_response.json()
        except Exception as e:
            logger.error(f"Error fetching playlists: {str(e)}")
            playlists_data = {'items': []}
        
        # Get recently played tracks with error handling
        try:
            recent_response = requests.get(API_BASE_URL + 'me/player/recently-played', headers=headers)
            recent_response.raise_for_status()
            recent_tracks_data = recent_response.json()
        except Exception as e:
            logger.error(f"Error fetching recent tracks: {str(e)}")
            recent_tracks_data = {'items': []}
        
        # Ensure data structures are dictionaries with 'items' key
        if not isinstance(playlists_data, dict):
            playlists_data = {'items': []}
        if 'items' not in playlists_data:
            playlists_data['items'] = []
            
        if not isinstance(recent_tracks_data, dict):
            recent_tracks_data = {'items': []}
        if 'items' not in recent_tracks_data:
            recent_tracks_data['items'] = []
        
        logger.debug(f"Playlists data: {json.dumps(playlists_data, indent=2)}")
        logger.debug(f"Recent tracks data: {json.dumps(recent_tracks_data, indent=2)}")
        
        return render_template(
            'dashboard.html',
            user=user_data,
            playlists=playlists_data,
            recent_tracks=recent_tracks_data
        )
        
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        return render_template(
            'dashboard.html',
            user={},
            playlists={'items': []},
            recent_tracks={'items': []}
        )

@app.route('/search', methods=['GET', 'POST'])
def search():
    if 'access_token' not in session:
        return redirect(url_for('login'))
    
    # Check if token is expired
    if time.time() > session['expires_at']:
        return redirect(url_for('refresh_token'))
    
    if request.method == 'POST':
        query = request.form.get('query', '')
        search_type = request.form.get('type', 'track')
        
        # Search Spotify
        headers = {
            'Authorization': f"Bearer {session['access_token']}"
        }
        
        params = {
            'q': query,
            'type': search_type,
            'limit': 20
        }
        
        try:
            response = requests.get(
                API_BASE_URL + 'search',
                headers=headers,
                params=params
            )
            response.raise_for_status()
            results = response.json()
            
            # Ensure results is a dictionary
            if not isinstance(results, dict):
                results = {}
            
            # Ensure each section has an 'items' key
            for key in ['tracks', 'artists', 'albums', 'playlists']:
                if key in results and not isinstance(results[key], dict):
                    results[key] = {'items': []}
                elif key in results and 'items' not in results[key]:
                    results[key]['items'] = []
            
            return render_template(
                'search_results.html',
                query=query,
                results=results
            )
            
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
            return render_template(
                'search_results.html',
                query=query,
                results={}
            )
    
    return render_template('search.html')

@app.route('/audio_recognition')
def audio_recognition():
    if 'access_token' not in session:
        return redirect(url_for('login'))
    
    return render_template('audio_recognition.html')

@app.route('/humming_search')
def humming_search():
    if 'access_token' not in session:
        return redirect(url_for('login'))
    
    return render_template('humming_search.html')

@app.route('/playlist_management')
def playlist_management():
    if 'access_token' not in session:
        return redirect(url_for('login'))
    
    # Check if token is expired
    if time.time() > session['expires_at']:
        return redirect(url_for('refresh_token'))
    
    # Get user playlists
    headers = {
        'Authorization': f"Bearer {session['access_token']}"
    }
    
    try:
        response = requests.get(API_BASE_URL + 'me/playlists', headers=headers)
        response.raise_for_status()
        playlists = response.json()
        
        # Ensure playlists is a dictionary with 'items' key
        if not isinstance(playlists, dict):
            playlists = {'items': []}
        if 'items' not in playlists:
            playlists['items'] = []
        
        logger.debug(f"Playlists data: {json.dumps(playlists, indent=2)}")
        
        return render_template(
            'playlist_management.html',
            playlists=playlists
        )
        
    except Exception as e:
        logger.error(f"Playlist management error: {str(e)}")
        return render_template(
            'playlist_management.html',
            playlists={'items': []}
        )

@app.route('/logout')
def logout():
    # Clear session
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5005)
