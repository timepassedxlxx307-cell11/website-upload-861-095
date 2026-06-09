(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = $('[data-menu-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
            document.body.classList.toggle('menu-open', nav.classList.contains('open'));
        });
    }

    function setupHero() {
        var root = $('[data-hero]');
        if (!root) {
            return;
        }
        var slides = $all('[data-hero-slide]', root);
        var dots = $all('[data-hero-dot]', root);
        var prev = $('[data-hero-prev]', root);
        var next = $('[data-hero-next]', root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilter() {
        var panels = $all('[data-filter-panel]');
        panels.forEach(function (panel) {
            var input = $('[data-search-input]', panel);
            var chips = $all('[data-filter-value]', panel);
            var list = $('[data-filter-list]') || panel.nextElementSibling;
            var empty = $('[data-empty-state]');
            var activeCategory = 'all';

            if (!list) {
                return;
            }

            var cards = $all('[data-movie-card]', list);

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search-text') || '').toLowerCase();
                    var category = card.getAttribute('data-category') || '';
                    var matchText = !query || text.indexOf(query) !== -1;
                    var matchCategory = activeCategory === 'all' || category === activeCategory;
                    var show = matchText && matchCategory;
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
                input.addEventListener('input', apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    chips.forEach(function (item) {
                        item.classList.remove('active');
                    });
                    chip.classList.add('active');
                    activeCategory = chip.getAttribute('data-filter-value') || 'all';
                    apply();
                });
            });

            apply();
        });
    }

    window.initMoviePlayer = function (videoId, playId, coverId, source) {
        var video = document.getElementById(videoId);
        var playButton = document.getElementById(playId);
        var cover = document.getElementById(coverId);
        var attached = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add('hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }
        if (playButton) {
            playButton.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilter();
    });
})();
