# spotify-music-search-bot

这是一个基于Flask的Spotify音乐搜索应用，支持文本搜索、音频识别和哼唱搜索功能。

## 功能特点

- 文本搜索：搜索歌曲、艺术家、专辑和播放列表
- 音频识别：识别正在播放的音乐
- 哼唱搜索：通过哼唱旋律查找歌曲
- 播放列表管理：创建和管理播放列表
- Spotify账号集成：支持Spotify账号登录和音乐库管理

## 本地部署步骤

1. 确保已安装Python 3.8或更高版本

2. 克隆项目并进入项目目录：
   ```bash
   cd projects/spotify
   ```

3. 创建并激活虚拟环境：
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # 或
   .\venv\Scripts\activate  # Windows
   ```

4. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

5. 设置环境变量：
   创建.env文件并添加以下内容：
   ```
   FLASK_APP=app.py
   FLASK_ENV=development
   FLASK_DEBUG=1
   CLIENT_ID=你的_SPOTIFY_CLIENT_ID
   CLIENT_SECRET=你的_SPOTIFY_CLIENT_SECRET
   REDIRECT_URI=http://127.0.0.1:5005/callback
   ```

6. 运行应用：
   ```bash
   flask run --port=5005
   ```

7. 访问应用：
   打开浏览器访问 http://127.0.0.1:5005

## 注意事项

- 需要有Spotify开发者账号
- 需要在Spotify开发者控制台配置回调URL
- 确保麦克风权限已启用（用于音频识别和哼唱搜索功能）

## 技术栈

- Flask
- Spotify Web API
- HTML5 Audio API
- Bootstrap
- JavaScript 
75454d3 (Initial commit for spotify music search bot)
