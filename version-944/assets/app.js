(function() {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mainNav = document.querySelector("[data-main-nav]");

    if (menuButton && mainNav) {
        menuButton.addEventListener("click", function() {
            mainNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    }

    dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
            var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function() {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    function normalize(text) {
        return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function applyFilter(input) {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }

        var value = normalize(input.value);
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .wide-card"));

        cards.forEach(function(card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.textContent
            ].join(" "));
            card.style.display = !value || text.indexOf(value) !== -1 ? "" : "none";
        });
    }

    var filterForm = document.querySelector("[data-filter-form]");
    var filterInput = document.querySelector("[data-filter-input]");

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q");
        if (queryValue) {
            filterInput.value = queryValue;
        }
        applyFilter(filterInput);
        filterInput.addEventListener("input", function() {
            applyFilter(filterInput);
        });
    }

    if (filterForm && filterInput) {
        filterForm.addEventListener("submit", function(event) {
            if (filterForm.getAttribute("action")) {
                return;
            }
            event.preventDefault();
            applyFilter(filterInput);
        });
    }

    var chipRow = document.querySelector("[data-chip-row]");
    if (chipRow && filterInput) {
        chipRow.addEventListener("click", function(event) {
            var chip = event.target.closest("[data-chip]");
            if (!chip) {
                return;
            }
            filterInput.value = chip.getAttribute("data-chip");
            applyFilter(filterInput);
        });
    }

    window.MoviePlayer = {
        setup: function(url) {
            var video = document.getElementById("movie-player");
            var overlay = document.getElementById("play-overlay");
            var hlsPlayer = null;
            var ready = false;

            if (!video) {
                return;
            }

            function attach() {
                if (ready) {
                    return;
                }
                ready = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsPlayer = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsPlayer.loadSource(url);
                    hlsPlayer.attachMedia(video);
                } else {
                    video.src = url;
                }
            }

            function play() {
                attach();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function() {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }

            video.addEventListener("click", function() {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener("play", function() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });

            window.addEventListener("beforeunload", function() {
                if (hlsPlayer) {
                    hlsPlayer.destroy();
                }
            });
        }
    };
})();
