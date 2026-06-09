(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            var parent = image.parentElement;
            if (parent) {
                parent.classList.add('image-missing');
            }
        }, { once: true });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restart();
            });
        });

        restart();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var scope = panel.closest('section') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var query = panel.querySelector('[data-filter-query]');
        var type = panel.querySelector('[data-filter-type]');
        var region = panel.querySelector('[data-filter-region]');
        var year = panel.querySelector('[data-filter-year]');
        var reset = panel.querySelector('[data-filter-reset]');
        var empty = scope.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var q = normalize(query && query.value);
            var t = normalize(type && type.value);
            var r = normalize(region && region.value);
            var y = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(' '));
                var matched = true;

                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (t && normalize(card.dataset.type).indexOf(t) === -1) {
                    matched = false;
                }
                if (r && normalize(card.dataset.region).indexOf(r) === -1) {
                    matched = false;
                }
                if (y && normalize(card.dataset.year) !== y) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [query, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                [query, type, region, year].forEach(function (control) {
                    if (control) {
                        control.value = '';
                    }
                });
                applyFilter();
            });
        }
    });
})();
