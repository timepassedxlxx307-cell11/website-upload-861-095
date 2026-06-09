(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        if (menuButton) {
            menuButton.addEventListener("click", function () {
                var opened = document.body.classList.toggle("nav-open");
                menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var activeIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === activeIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === activeIndex);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        var filterForms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        filterForms.forEach(function (area) {
            var input = area.querySelector("[data-filter-text]");
            var region = area.querySelector("[data-filter-region]");
            var year = area.querySelector("[data-filter-year]");
            var genre = area.querySelector("[data-filter-genre]");
            var cards = Array.prototype.slice.call(document.querySelectorAll(area.getAttribute("data-filter-area")));
            var empty = document.querySelector(area.getAttribute("data-empty-target"));

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function matches(card) {
                var query = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var yearValue = normalize(year && year.value);
                var genreValue = normalize(genre && genre.value);
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var ok = true;
                if (query) {
                    ok = ok && text.indexOf(query) !== -1;
                }
                if (regionValue) {
                    ok = ok && normalize(card.getAttribute("data-region")) === regionValue;
                }
                if (yearValue) {
                    ok = ok && normalize(card.getAttribute("data-year")) === yearValue;
                }
                if (genreValue) {
                    ok = ok && normalize(card.getAttribute("data-genre")).indexOf(genreValue) !== -1;
                }
                return ok;
            }

            function applyFilters() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, region, year, genre].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        });
    });
})();
