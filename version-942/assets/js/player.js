(function () {
    function attachPlayer(video, url, cover) {
        var started = false;
        var hlsInstance = null;

        function requestPlay() {
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        }

        function begin() {
            if (started) {
                return;
            }

            started = true;

            if (cover) {
                cover.classList.add("is-hidden");
            }

            video.setAttribute("controls", "controls");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                requestPlay();
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    requestPlay();
                });
                requestPlay();
            } else {
                video.src = url;
                requestPlay();
            }
        }

        if (cover) {
            cover.addEventListener("click", begin);
        }

        video.addEventListener("click", function () {
            if (!started) {
                begin();
            }
        });

        video.addEventListener("error", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.initMoviePlayer = function (videoId, url, coverId) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);

        if (!video || !url) {
            return;
        }

        attachPlayer(video, url, cover);
    };
})();
