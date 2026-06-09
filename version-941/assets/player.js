(function () {
  function initPlayer(url) {
    var video = document.querySelector('[data-video]');
    var layer = document.querySelector('[data-play-layer]');
    var button = document.querySelector('[data-play-button]');
    var attached = false;

    if (!video || !url) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ autoStartLoad: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video.hlsController = hls;
      } else {
        video.src = url;
      }
    }

    function start() {
      attach();
      video.controls = true;
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }
    if (layer) {
      layer.addEventListener('click', function () {
        start();
      });
    }
    video.addEventListener('click', function () {
      if (!attached) {
        start();
      }
    });
  }

  window.MoviePlayer = {
    init: initPlayer
  };
})();
