const menuButton = document.querySelector('[data-menu-button]');
const mobilePanel = document.querySelector('[data-mobile-panel]');

if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
        mobilePanel.classList.toggle('is-open');
    });
}

const backTop = document.querySelector('[data-back-top]');

if (backTop) {
    window.addEventListener('scroll', () => {
        backTop.classList.toggle('is-visible', window.scrollY > 500);
    });

    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const setSlide = (index) => {
        current = index;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => setSlide(index));
    });

    if (slides.length > 1) {
        window.setInterval(() => {
            setSlide((current + 1) % slides.length);
        }, 5200);
    }
}

const rails = Array.from(document.querySelectorAll('[data-rail]'));

rails.forEach((rail) => {
    const wrap = rail.closest('.rail-wrap');
    const prev = wrap ? wrap.querySelector('[data-rail-prev]') : null;
    const next = wrap ? wrap.querySelector('[data-rail-next]') : null;
    const move = (direction) => {
        rail.scrollBy({ left: direction * Math.max(260, rail.clientWidth * 0.78), behavior: 'smooth' });
    };

    if (prev) {
        prev.addEventListener('click', () => move(-1));
    }

    if (next) {
        next.addEventListener('click', () => move(1));
    }
});

const filterForm = document.querySelector('[data-filter-form]');

if (filterForm) {
    const keywordInput = filterForm.querySelector('[data-filter-keyword]');
    const yearSelect = filterForm.querySelector('[data-filter-year]');
    const typeSelect = filterForm.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('.js-filter-card'));
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (keywordInput && query) {
        keywordInput.value = query;
    }

    const applyFilter = () => {
        const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        const year = yearSelect ? yearSelect.value : '';
        const type = typeSelect ? typeSelect.value : '';

        cards.forEach((card) => {
            const haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.category
            ].join(' ').toLowerCase();
            const matchesKeyword = !keyword || haystack.includes(keyword);
            const matchesYear = !year || card.dataset.year === year;
            const matchesType = !type || (card.dataset.type || '').includes(type) || (card.dataset.genre || '').includes(type);
            card.classList.toggle('is-hidden', !(matchesKeyword && matchesYear && matchesType));
        });
    };

    ['input', 'change'].forEach((eventName) => {
        filterForm.addEventListener(eventName, applyFilter);
    });

    applyFilter();
}

const playerBox = document.querySelector('[data-player]');

if (playerBox) {
    const video = playerBox.querySelector('[data-video]');
    const playButton = playerBox.querySelector('[data-play-button]');
    const stream = playerBox.dataset.stream;
    let initialized = false;
    let hlsInstance = null;

    const loadHls = async () => {
        const module = await import('./hls-vendor-dru42stk.js');
        return module.H;
    };

    const attachStream = async () => {
        if (initialized || !video || !stream) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            initialized = true;
            return;
        }

        const Hls = await loadHls();

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            initialized = true;
        }
    };

    const startPlay = async () => {
        if (!video) {
            return;
        }

        playerBox.classList.add('is-loading');
        await attachStream();
        playerBox.classList.add('is-playing');
        playerBox.classList.remove('is-loading');

        try {
            await video.play();
        } catch (error) {
            playerBox.classList.remove('is-playing');
        }
    };

    if (playButton) {
        playButton.addEventListener('click', startPlay);
    }

    if (video) {
        video.addEventListener('click', () => {
            if (video.paused) {
                startPlay();
            }
        });
    }

    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
