// Audio Recognition Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the audio recognition page
    const startRecordingBtn = document.getElementById('startRecording');
    if (startRecordingBtn) {
        setupAudioRecognition();
    }
    
    // Check if we're on the humming search page
    const startHummingBtn = document.getElementById('startHumming');
    if (startHummingBtn) {
        setupHummingSearch();
    }
    
    // Check if we're on the playlist management page
    const createPlaylistForm = document.getElementById('createPlaylistForm');
    if (createPlaylistForm) {
        setupPlaylistManagement();
    }
});

// Audio Recognition Setup
function setupAudioRecognition() {
    const startRecordingBtn = document.getElementById('startRecording');
    const recordingStatus = document.getElementById('recordingStatus');
    const visualizer = document.getElementById('visualizer');
    const loadingResults = document.getElementById('loadingResults');
    const noResults = document.getElementById('noResults');
    const songResult = document.getElementById('songResult');
    
    let audioContext;
    let analyser;
    let microphone;
    let javascriptNode;
    let isRecording = false;
    
    startRecordingBtn.addEventListener('click', function() {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });
    
    function startRecording() {
        isRecording = true;
        startRecordingBtn.textContent = 'Stop Listening';
        recordingStatus.textContent = 'Listening...';
        
        // Initialize audio context
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            
            // Get microphone access
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function(stream) {
                    microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);
                    
                    // Setup visualizer
                    analyser.fftSize = 256;
                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);
                    
                    const canvasCtx = visualizer.getContext('2d');
                    canvasCtx.clearRect(0, 0, visualizer.width, visualizer.height);
                    
                    function draw() {
                        if (!isRecording) return;
                        
                        requestAnimationFrame(draw);
                        analyser.getByteFrequencyData(dataArray);
                        
                        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                        canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);
                        
                        const barWidth = (visualizer.width / bufferLength) * 2.5;
                        let x = 0;
                        
                        for (let i = 0; i < bufferLength; i++) {
                            const barHeight = dataArray[i] / 2;
                            canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                            canvasCtx.fillRect(x, visualizer.height - barHeight, barWidth, barHeight);
                            x += barWidth + 1;
                        }
                    }
                    
                    draw();
                    
                    // Simulate recognition after 5 seconds
                    setTimeout(function() {
                        if (isRecording) {
                            stopRecording();
                            simulateRecognition();
                        }
                    }, 5000);
                })
                .catch(function(err) {
                    console.error('Error accessing microphone:', err);
                    recordingStatus.textContent = 'Error accessing microphone. Please check permissions.';
                    isRecording = false;
                    startRecordingBtn.textContent = 'Start Listening';
                });
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
            recordingStatus.textContent = 'Audio recording is not supported in this browser.';
            isRecording = false;
            startRecordingBtn.textContent = 'Start Listening';
        }
    }
    
    function stopRecording() {
        isRecording = false;
        startRecordingBtn.textContent = 'Start Listening';
        recordingStatus.textContent = 'Processing audio...';
        
        if (microphone) {
            microphone.disconnect();
        }
        
        if (audioContext) {
            audioContext.close();
        }
    }
    
    function simulateRecognition() {
        // Show loading state
        loadingResults.style.display = 'block';
        noResults.style.display = 'none';
        songResult.style.display = 'none';
        
        // Simulate API call delay
        setTimeout(function() {
            loadingResults.style.display = 'none';
            
            // Simulate successful recognition
            const recognized = Math.random() > 0.2; // 80% chance of success
            
            if (recognized) {
                // Show song result
                document.getElementById('albumCover').src = 'https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268';
                document.getElementById('songTitle') .textContent = 'Blinding Lights';
                document.getElementById('artistName').textContent = 'The Weeknd';
                document.getElementById('albumName').textContent = 'After Hours';
                songResult.style.display = 'block';
                recordingStatus.textContent = 'Song identified!';
            } else {
                // Show no results
                noResults.style.display = 'block';
                recordingStatus.textContent = 'No song identified. Please try again.';
            }
        }, 2000);
    }
    
    // Add event listeners for result actions
    document.getElementById('addToLibrary').addEventListener('click', function() {
        alert('Song added to your library!');
    });
    
    document.getElementById('addToPlaylist').addEventListener('click', function() {
        alert('Please select a playlist to add this song to.');
    });
}

// Humming Search Setup
function setupHummingSearch() {
    const startHummingBtn = document.getElementById('startHumming');
    const stopHummingBtn = document.getElementById('stopHumming');
    const hummingStatus = document.getElementById('hummingStatus');
    const visualizer = document.getElementById('hummingVisualizer');
    const loadingResults = document.getElementById('loadingHummingResults');
    const noResults = document.getElementById('noHummingResults');
    const hummingMatches = document.getElementById('hummingMatches');
    
    let audioContext;
    let analyser;
    let microphone;
    let isRecording = false;
    
    startHummingBtn.addEventListener('click', function() {
        startHumming();
    });
    
    stopHummingBtn.addEventListener('click', function() {
        stopHumming();
    });
    
    function startHumming() {
        isRecording = true;
        startHummingBtn.style.display = 'none';
        stopHummingBtn.style.display = 'inline-block';
        hummingStatus.textContent = 'Recording your humming...';
        
        // Initialize audio context
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            
            // Get microphone access
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function(stream) {
                    microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);
                    
                    // Setup visualizer
                    analyser.fftSize = 256;
                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);
                    
                    const canvasCtx = visualizer.getContext('2d');
                    canvasCtx.clearRect(0, 0, visualizer.width, visualizer.height);
                    
                    function draw() {
                        if (!isRecording) return;
                        
                        requestAnimationFrame(draw);
                        analyser.getByteFrequencyData(dataArray);
                        
                        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                        canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);
                        
                        const barWidth = (visualizer.width / bufferLength) * 2.5;
                        let x = 0;
                        
                        for (let i = 0; i < bufferLength; i++) {
                            const barHeight = dataArray[i] / 2;
                            canvasCtx.fillStyle = `rgb(50, ${barHeight + 100}, 50)`;
                            canvasCtx.fillRect(x, visualizer.height - barHeight, barWidth, barHeight);
                            x += barWidth + 1;
                        }
                    }
                    
                    draw();
                })
                .catch(function(err) {
                    console.error('Error accessing microphone:', err);
                    hummingStatus.textContent = 'Error accessing microphone. Please check permissions.';
                    isRecording = false;
                    startHummingBtn.style.display = 'inline-block';
                    stopHummingBtn.style.display = 'none';
                });
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
            hummingStatus.textContent = 'Audio recording is not supported in this browser.';
            isRecording = false;
            startHummingBtn.style.display = 'inline-block';
            stopHummingBtn.style.display = 'none';
        }
    }
    
    function stopHumming() {
        isRecording = false;
        startHummingBtn.style.display = 'inline-block';
        stopHummingBtn.style.display = 'none';
        hummingStatus.textContent = 'Processing your humming...';
        
        if (microphone) {
            microphone.disconnect();
        }
        
        if (audioContext) {
            audioContext.close();
        }
        
        // Show loading state
        loadingResults.style.display = 'block';
        noResults.style.display = 'none';
        hummingMatches.style.display = 'none';
        
        // Simulate API call delay
        setTimeout(function() {
            loadingResults.style.display = 'none';
            
            // Simulate successful recognition
            const recognized = Math.random() > 0.3; // 70% chance of success
            
            if (recognized) {
                // Show matching songs
                hummingMatches.innerHTML = `
                    <div class="song-match">
                        <img src="https://i.scdn.co/image/ab67616d0000b273f46b9d202509a8f7384b90de" alt="Song Cover">
                        <div class="song-match-info">
                            <h4>Shape of You</h4>
                            <p>Ed Sheeran</p>
                            <p>÷ (Divide) </p>
                            <button class="play-match">Play</button>
                            <button class="add-match">Add to Library</button>
                        </div>
                    </div>
                    <div class="song-match">
                        <img src="https://i.scdn.co/image/ab67616d0000b2734121faee8df82c526cbab2be" alt="Song Cover">
                        <div class="song-match-info">
                            <h4>Watermelon Sugar</h4>
                            <p>Harry Styles</p>
                            <p>Fine Line</p>
                            <button class="play-match">Play</button>
                            <button class="add-match">Add to Library</button>
                        </div>
                    </div>
                    <div class="song-match">
                        <img src="https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431" alt="Song Cover">
                        <div class="song-match-info">
                            <h4>Blinding Lights</h4>
                            <p>The Weeknd</p>
                            <p>After Hours</p>
                            <button class="play-match">Play</button>
                            <button class="add-match">Add to Library</button>
                        </div>
                    </div>
                `;
                hummingMatches.style.display = 'block';
                hummingStatus.textContent = 'Found matching songs!';
                
                // Add event listeners to buttons
                const playButtons = document.querySelectorAll('.play-match') ;
                const addButtons = document.querySelectorAll('.add-match');
                
                playButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        alert('Playing song...');
                    });
                });
                
                addButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        alert('Song added to your library!');
                    });
                });
            } else {
                // Show no results
                noResults.style.display = 'block';
                hummingStatus.textContent = 'No matching songs found. Please try again.';
            }
        }, 3000);
    }
}

// Playlist Management Setup
function setupPlaylistManagement() {
    const createPlaylistForm = document.getElementById('createPlaylistForm');
    
    createPlaylistForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const playlistName = document.getElementById('playlistName').value;
        const playlistDescription = document.getElementById('playlistDescription').value;
        const isPublic = document.getElementById('isPublic').checked;
        
        // Simulate API call
        alert(`Creating playlist: ${playlistName}\nDescription: ${playlistDescription}\nPublic: ${isPublic}`);
        
        // In a real app, you would make an AJAX request to your Flask backend
        // which would then call the Spotify API to create the playlist
        
        // Simulate success and refresh
        setTimeout(function() {
            alert('Playlist created successfully!');
            // In a real app, you would refresh the playlist list or redirect
            document.getElementById('playlistName').value = '';
            document.getElementById('playlistDescription').value = '';
        }, 1000);
    });
    
    // Add event listeners for playlist actions
    const viewButtons = document.querySelectorAll('.view-playlist');
    const editButtons = document.querySelectorAll('.edit-playlist');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const playlistId = this.getAttribute('data-id');
            alert(`Viewing playlist with ID: ${playlistId}`);
            // In a real app, you would redirect to a playlist detail page
        });
    });
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const playlistId = this.getAttribute('data-id');
            alert(`Editing playlist with ID: ${playlistId}`);
            // In a real app, you would show an edit form or modal
        });
    });
}
