(function () {
  function textOf(value) {
    return (value || "").toString().toLowerCase();
  }

  function openMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var wrap = document.querySelector("[data-hero-carousel]");
    if (!wrap) {
      return;
    }
    var slides = Array.prototype.slice.call(wrap.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(wrap.querySelectorAll(".hero-dot"));
    var prev = wrap.querySelector(".hero-prev");
    var next = wrap.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function run() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-index")) || 0);
        run();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        run();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        run();
      });
    }
    show(0);
    run();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".filter-input");
      var selects = Array.prototype.slice.call(panel.querySelectorAll(".filter-select"));
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
      var empty = scope.querySelector(".empty-result");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      if (input && q) {
        input.value = q;
      }
      function apply() {
        var keyword = textOf(input ? input.value : "");
        var values = {};
        selects.forEach(function (select) {
          values[select.getAttribute("data-filter")] = select.value;
        });
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = textOf([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = !keyword || haystack.indexOf(keyword) !== -1;
          Object.keys(values).forEach(function (key) {
            if (values[key] && card.getAttribute("data-" + key) !== values[key]) {
              ok = false;
            }
          });
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  window.setupMoviePlayer = function (video, button, overlay, source) {
    if (!video || !button || !overlay || !source) {
      return;
    }
    var ready = false;
    var hls = null;
    function attach() {
      if (ready) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    }
    function play() {
      attach();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }
    button.addEventListener("click", play);
    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!ready) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    openMobileNav();
    initHero();
    initFilters();
  });
})();
