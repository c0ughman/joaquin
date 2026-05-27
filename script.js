(function () {
  'use strict';

  /* Hero slideshow */
  const slides = document.querySelectorAll('.hero-slide');
  const slideshow = document.querySelector('.hero-slideshow');
  const SLIDE_INTERVAL = 5500;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (slides.length > 1) {
    let current = 0;
    let timer = null;
    let isPaused = false;

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

    function advanceSlide() {
      current = (current + 1) % slides.length;
      updateHeroCarousel();
    }

    function startAutoplay() {
      if (prefersReducedMotion || timer) return;
      timer = window.setInterval(function () {
        if (!isPaused) advanceSlide();
      }, SLIDE_INTERVAL);
    }

    function stopAutoplay() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    updateHeroCarousel();
    startAutoplay();

    if (slideshow) {
      slideshow.addEventListener('mouseenter', function () {
        isPaused = true;
      });

      slideshow.addEventListener('mouseleave', function () {
        isPaused = false;
      });

      slideshow.addEventListener('focusin', function () {
        isPaused = true;
      });

      slideshow.addEventListener('focusout', function () {
        isPaused = false;
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
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
