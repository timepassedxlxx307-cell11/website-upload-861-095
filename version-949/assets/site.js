(function () {
    function toggleMenu() {
        const menu = document.querySelector('[data-menu]');
        if (menu) {
            menu.classList.toggle('is-open');
        }
    }

    document.querySelectorAll('[data-menu-toggle]').forEach(function (button) {
        button.addEventListener('click', toggleMenu);
    });

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    function openSearchResults(box) {
        if (box) {
            box.classList.add('is-open');
        }
    }

    function closeSearchResults(box) {
        if (box) {
            box.classList.remove('is-open');
        }
    }

    function renderSearch(query, box) {
        const list = window.SEARCH_INDEX || [];
        const keyword = query.trim().toLowerCase();

        if (!keyword) {
            if (box) {
                box.innerHTML = '';
            }
            closeSearchResults(box);
            return;
        }

        const results = list.filter(function (item) {
            return item.searchText.indexOf(keyword) !== -1;
        }).slice(0, 12);

        if (!results.length) {
            box.innerHTML = '<div class="empty-search">没有找到匹配影片</div>';
            openSearchResults(box);
            return;
        }

        box.innerHTML = results.map(function (item) {
            return '<a href="' + item.url + '">' +
                '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                '<span><strong>' + item.title + '</strong><span>' + item.meta + '</span></span>' +
                '</a>';
        }).join('');
        openSearchResults(box);
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        const input = form.querySelector('input[type="search"]');
        const box = form.querySelector('[data-search-results]');

        if (!input || !box) {
            return;
        }

        input.addEventListener('input', function () {
            renderSearch(input.value, box);
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            renderSearch(input.value, box);
        });

        document.addEventListener('click', function (event) {
            if (!form.contains(event.target)) {
                closeSearchResults(box);
            }
        });
    });

    function updateCardFilter(input) {
        const section = input.closest('main') || document;
        const cards = Array.from(section.querySelectorAll('.movie-card'));
        const counter = section.querySelector('[data-filter-count]');
        const keyword = input.value.trim().toLowerCase();
        let visible = 0;

        cards.forEach(function (card) {
            const text = ((card.dataset.title || '') + ' ' + (card.dataset.meta || '')).toLowerCase();
            const matched = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (counter) {
            counter.textContent = String(visible);
        }
    }

    document.querySelectorAll('[data-card-filter]').forEach(function (input) {
        input.addEventListener('input', function () {
            updateCardFilter(input);
        });
    });

    document.querySelectorAll('[data-clear-filter]').forEach(function (button) {
        button.addEventListener('click', function () {
            const wrap = button.closest('.local-filter');
            const input = wrap ? wrap.querySelector('[data-card-filter]') : null;
            if (input) {
                input.value = '';
                updateCardFilter(input);
                input.focus();
            }
        });
    });
}());
