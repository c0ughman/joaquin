(function () {
  'use strict';

  /* Hero slideshow */
  const slides = document.querySelectorAll('.hero-slide');
  const SLIDE_INTERVAL = 3000;

  if (slides.length > 1) {
    let current = 0;

    function updateHeroCarousel() {
      const total = slides.length;
      const prev = (current - 1 + total) % total;
      const next = (current + 1) % total;

      slides.forEach(function (slide, index) {
        slide.classList.remove('is-active', 'is-prev', 'is-next');
        if (index === current) slide.classList.add('is-active');
        else if (index === prev) slide.classList.add('is-prev');
        else if (index === next) slide.classList.add('is-next');
      });
    }

    updateHeroCarousel();

    window.setInterval(function () {
      current = (current + 1) % slides.length;
      updateHeroCarousel();
    }, SLIDE_INTERVAL);
  } else if (slides.length === 1) {
    slides[0].classList.add('is-active');
  }

  /* Smooth scroll for on-page anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
