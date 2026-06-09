(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    if (menuButton) {
      menuButton.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }

    var query = new URLSearchParams(window.location.search).get('q') || '';
    var searchInput = document.querySelector('[data-search-input]');
    if (searchInput && query) {
      searchInput.value = query;
    }

    function filterScope(scope, text) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
      var empty = document.querySelector('[data-empty-state]');
      var normalized = normalize(text);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matched = !normalized || haystack.indexOf(normalized) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    filterForms.forEach(function (form) {
      var input = form.querySelector('[data-search-input]');
      var scope = document.querySelector(form.getAttribute('data-filter-form')) || document;
      if (!input) {
        return;
      }
      function run() {
        filterScope(scope, input.value);
      }
      input.addEventListener('input', run);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        run();
      });
      run();
    });
  });
})();
