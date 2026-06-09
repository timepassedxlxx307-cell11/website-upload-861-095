import { H as Hls } from './video-vendor-dru42stk.js';

function initializePlayer(root) {
    var video = root.querySelector('video');
    var button = root.querySelector('[data-player-button]');
    var source = root.dataset.src;
    var hlsInstance = null;
    var attached = false;

    if (!video || !source || !button) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            attached = true;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            attached = true;
            return;
        }

        root.classList.add('player-card--unsupported');
        button.querySelector('strong').textContent = '当前浏览器暂不支持此播放源';
    }

    button.addEventListener('click', function () {
        attachSource();
        if (!attached) {
            return;
        }

        root.classList.add('is-playing');
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {
                root.classList.remove('is-playing');
            });
        }
    });

    video.addEventListener('play', function () {
        root.classList.add('is-playing');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

document.querySelectorAll('[data-player]').forEach(initializePlayer);
