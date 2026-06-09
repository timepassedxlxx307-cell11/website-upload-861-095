(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            menuButton.textContent = mobileMenu.classList.contains('is-open') ? '×' : '☰';
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showHero(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showHero(i);
            });
        });

        showHero(0);
        window.setInterval(function () {
            showHero(active + 1);
        }, 5200);
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function runFilter(root) {
        var input = root.querySelector('[data-card-search]');
        var typeSelect = root.querySelector('[data-type-filter]');
        var regionSelect = root.querySelector('[data-region-filter]');
        var yearSelect = root.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
        if (!cards.length) {
            cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        }
        var noResults = root.querySelector('[data-no-results]') || document.querySelector('[data-no-results]');
        var query = normalize(input ? input.value : '');
        var type = normalize(typeSelect ? typeSelect.value : '');
        var region = normalize(regionSelect ? regionSelect.value : '');
        var year = normalize(yearSelect ? yearSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-filter'));
            var cardType = normalize(card.getAttribute('data-type'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var matched = (!query || text.indexOf(query) !== -1) &&
                (!type || cardType === type) &&
                (!region || cardRegion === region) &&
                (!year || cardYear === year);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (noResults) {
            noResults.classList.toggle('is-visible', visible === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (root) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        var input = root.querySelector('[data-card-search]');
        if (q && input && !input.value) {
            input.value = q;
        }
        Array.prototype.slice.call(root.querySelectorAll('[data-card-search], [data-type-filter], [data-region-filter], [data-year-filter]')).forEach(function (control) {
            control.addEventListener('input', function () {
                runFilter(root);
            });
            control.addEventListener('change', function () {
                runFilter(root);
            });
        });
        runFilter(root);
    });

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-start');
        var src = shell.getAttribute('data-m3u8');
        var hlsInstance = null;

        function loadVideo() {
            if (!video || !src || video.getAttribute('data-loaded') === 'true') {
                return;
            }
            video.setAttribute('data-loaded', 'true');
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function startVideo() {
            if (!video) {
                return;
            }
            loadVideo();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startVideo();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });
        }

        shell.addEventListener('click', function (event) {
            if (event.target === shell) {
                startVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
