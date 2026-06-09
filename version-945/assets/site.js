(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobilePanel = document.querySelector(".mobile-panel");

        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        var searchInputs = document.querySelectorAll(".movie-search, .top-search input, .mobile-search input");

        searchInputs.forEach(function (input) {
            if (initialQuery) {
                input.value = initialQuery;
            }
        });

        var localSearchInputs = document.querySelectorAll(".movie-search");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        var emptyState = document.querySelector(".empty-state");

        function filterCards(query) {
            var words = normalize(query).split(/\s+/).filter(Boolean);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var matched = words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", cards.length > 0 && visible === 0);
            }
        }

        if (cards.length > 0) {
            filterCards(initialQuery);
        }

        localSearchInputs.forEach(function (input) {
            input.addEventListener("input", function () {
                filterCards(input.value);
            });
        });

        document.querySelectorAll("[data-filter-button]").forEach(function (button) {
            button.addEventListener("click", function () {
                var value = button.getAttribute("data-filter-button") || "";
                localSearchInputs.forEach(function (input) {
                    input.value = value;
                });
                filterCards(value);
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var activeSlide = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeSlide = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === activeSlide);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === activeSlide);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeSlide + 1);
            }, 5200);
        }

        document.querySelectorAll(".movie-player").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-start");
            var message = player.querySelector(".player-message");
            var stream = player.getAttribute("data-stream");
            var initialized = false;
            var hlsInstance = null;

            function setMessage(value) {
                if (message) {
                    message.textContent = value || "";
                }
            }

            function initialize() {
                if (!video || !stream || initialized) {
                    return Promise.resolve();
                }

                initialized = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    return Promise.resolve();
                }

                setMessage("视频暂时无法播放，请稍后再试");
                return Promise.reject(new Error("hls unavailable"));
            }

            function playVideo() {
                initialize().then(function () {
                    return video.play();
                }).then(function () {
                    player.classList.add("is-playing");
                    setMessage("");
                }).catch(function () {
                    player.classList.remove("is-playing");
                    if (!message || !message.textContent) {
                        setMessage("点击视频控件开始播放");
                    }
                });
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }

            if (video) {
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    player.classList.remove("is-playing");
                });
                video.addEventListener("error", function () {
                    setMessage("视频暂时无法播放，请稍后再试");
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
