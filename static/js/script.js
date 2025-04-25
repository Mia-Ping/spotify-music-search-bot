// Audio Recognition Functionality
document.addEventListener('DOMContentLoaded', () => {
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    const visualizer = document.getElementById('visualizer');
    const ctx = visualizer.getContext('2d');
    const startButton = document.getElementById('startRecording');
    const recordingStatus = document.getElementById('recordingStatus');
    const loadingResults = document.getElementById('loadingResults');
    const noResults = document.getElementById('noResults');
    const songResult = document.getElementById('songResult');

    // 音频可视化设置
    const setupAudioVisualizer = (stream) => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, visualizer.width, visualizer.height);

        const draw = () => {
            const drawVisual = requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);
            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.fillRect(0, 0, visualizer.width, visualizer.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#1DB954';
            ctx.beginPath();

            const sliceWidth = visualizer.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * visualizer.height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(visualizer.width, visualizer.height / 2);
            ctx.stroke();
        };

        draw();
    };

    // 开始录音
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            setupAudioVisualizer(stream);

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                simulateRecognition();
            };

            audioChunks = [];
            mediaRecorder.start();
            isRecording = true;
            startButton.textContent = '停止录音';
            recordingStatus.textContent = '正在录音...';
            noResults.style.display = 'none';
            songResult.style.display = 'none';
        } catch (err) {
            console.error('无法访问麦克风:', err);
            recordingStatus.textContent = '错误：无法访问麦克风';
        }
    };

    // 停止录音
    const stopRecording = () => {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        startButton.textContent = '开始录音';
        recordingStatus.textContent = '处理中...';
        loadingResults.style.display = 'block';
    };

    // 模拟识别过程
    const simulateRecognition = () => {
        setTimeout(() => {
            loadingResults.style.display = 'none';
            
            // 模拟80%的识别成功率
            if (Math.random() < 0.8) {
                displaySongResult({
                    title: '晴天',
                    artist: '周杰伦',
                    album: '叶惠美',
                    cover: 'https://example.com/album-cover.jpg'
                });
            } else {
                noResults.style.display = 'block';
                recordingStatus.textContent = '未能识别出音乐';
            }
        }, 2000);
    };

    // 显示识别结果
    const displaySongResult = (song) => {
        document.getElementById('songTitle').textContent = song.title;
        document.getElementById('artistName').textContent = song.artist;
        document.getElementById('albumName').textContent = song.album;
        document.getElementById('albumCover').src = song.cover;
        songResult.style.display = 'block';
        recordingStatus.textContent = '识别成功！';
    };

    // 事件监听器
    startButton.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });

    // 添加到音乐库
    document.getElementById('addToLibrary').addEventListener('click', () => {
        alert('歌曲已添加到音乐库！');
    });

    // 添加到播放列表
    document.getElementById('addToPlaylist').addEventListener('click', () => {
        alert('歌曲已添加到播放列表！');
    });
}); 