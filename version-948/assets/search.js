(function () {
    var results = document.getElementById('search-results');
    var status = document.querySelector('[data-search-status]');
    var empty = document.querySelector('[data-empty-state]');
    var panel = document.querySelector('[data-filter-panel]');
    var movies = window.MOVIE_LIBRARY || [];

    if (!results || !panel) {
        return;
    }

    var query = panel.querySelector('[data-filter-query]');
    var type = panel.querySelector('[data-filter-type]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var category = panel.querySelector('[data-filter-category]');
    var reset = panel.querySelector('[data-filter-reset]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card" data-card>',
            '    <a class="movie-card__cover" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="movie-card__play">立即观看</span>',
            '    </a>',
            '    <div class="movie-card__body">',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p class="movie-card__meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
            '        <p class="movie-card__desc">' + escapeHtml(movie.oneLine || '') + '</p>',
            '        <div class="movie-card__tags">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function getUrlQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function applySearch() {
        var q = normalize(query && query.value);
        var t = normalize(type && type.value);
        var r = normalize(region && region.value);
        var y = normalize(year && year.value);
        var c = normalize(category && category.value);

        var matched = movies.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' '));

            if (q && haystack.indexOf(q) === -1) {
                return false;
            }
            if (t && normalize(movie.type).indexOf(t) === -1) {
                return false;
            }
            if (r && normalize(movie.region).indexOf(r) === -1) {
                return false;
            }
            if (y && normalize(movie.year) !== y) {
                return false;
            }
            if (c && normalize(movie.category) !== c) {
                return false;
            }
            return true;
        }).slice(0, 240);

        results.innerHTML = matched.map(movieCard).join('\n');
        if (status) {
            status.textContent = '已显示 ' + matched.length + ' 条匹配结果；继续缩小条件可更快定位影片。';
        }
        if (empty) {
            empty.hidden = matched.length !== 0;
        }
    }

    [query, type, region, year, category].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applySearch);
            control.addEventListener('change', applySearch);
        }
    });

    if (reset) {
        reset.addEventListener('click', function () {
            [query, type, region, year, category].forEach(function (control) {
                if (control) {
                    control.value = '';
                }
            });
            applySearch();
        });
    }

    var initialQuery = getUrlQuery();
    if (initialQuery && query) {
        query.value = initialQuery;
        applySearch();
    }
})();
