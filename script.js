(function () {
  'use strict';

  /* Hero slideshow — crossfade carousel */
  (function initHeroSlideshow() {
    const stage = document.querySelector('.hero-slideshow');
    if (!stage) return;

    const slides = Array.prototype.slice.call(
      stage.querySelectorAll('.hero-slide')
    );
    if (slides.length === 0) return;

    const carousel = stage.closest('.hero-carousel') || stage.parentNode;
    const INTERVAL = 3000;
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const canHover = window.matchMedia('(hover: hover)').matches;
    let current = 0;
    let timer = null;
    let onScreen = true;

    stage.setAttribute('aria-roledescription', 'carousel');

    /* Single slide: just show it, no controls */
    if (slides.length === 1) {
      slides[0].classList.add('is-active');
      slides[0].setAttribute('aria-hidden', 'false');
      return;
    }

    const ARROW_SVG =
      '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" ' +
      'fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round">';

    /* Arrows */
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'hero-arrow prev';
    prevBtn.setAttribute('aria-label', 'Anterior');
    prevBtn.innerHTML = ARROW_SVG + '<polyline points="15 18 9 12 15 6"/></svg>';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'hero-arrow next';
    nextBtn.setAttribute('aria-label', 'Siguiente');
    nextBtn.innerHTML = ARROW_SVG + '<polyline points="9 18 15 12 9 6"/></svg>';

    stage.appendChild(prevBtn);
    stage.appendChild(nextBtn);

    /* Dots */
    const dots = document.createElement('div');
    dots.className = 'hero-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Seleccionar diapositiva');

    const dotButtons = slides.map(function (slide, i) {
      const strong = slide.querySelector('figcaption strong');
      const name = strong ? strong.textContent : 'Diapositiva ' + (i + 1);
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', name);
      dot.addEventListener('click', function () { goTo(i, true); });
      dots.appendChild(dot);
      return dot;
    });

    if (stage.nextSibling) carousel.insertBefore(dots, stage.nextSibling);
    else carousel.appendChild(dots);

    const POSITIONS = ['is-active', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next'];

    function render() {
      const total = slides.length;
      slides.forEach(function (slide, i) {
        /* Signed circular offset of this slide from the current one */
        let off = ((i - current) % total + total) % total;
        if (off > total / 2) off -= total;

        slide.classList.remove.apply(slide.classList, POSITIONS);
        let cls;
        if (off === 0) cls = 'is-active';
        else if (off === -1) cls = 'is-prev';
        else if (off === 1) cls = 'is-next';
        else if (off < 0) cls = 'is-far-prev';
        else cls = 'is-far-next';

        slide.classList.add(cls);
        slide.setAttribute('aria-hidden', off === 0 ? 'false' : 'true');
      });
      dotButtons.forEach(function (dot, i) {
        const active = i === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
        dot.tabIndex = active ? 0 : -1;
      });
    }

    function goTo(index, userInitiated) {
      current = (index + slides.length) % slides.length;
      render();
      if (userInitiated) restart();
    }
    function next(user) { goTo(current + 1, user); }
    function prev(user) { goTo(current - 1, user); }

    function tick() {
      /* Live checks each tick — never relies on a sticky "paused" flag, so a
         missed mouseleave/blur can never freeze the carousel permanently. */
      if (document.hidden) return;
      if (canHover && typeof stage.matches === 'function' && stage.matches(':hover')) return;
      next(false);
    }
    function start() {
      if (timer || reduceMotion || !onScreen) return;
      timer = window.setInterval(tick, INTERVAL);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    prevBtn.addEventListener('click', function () { prev(true); });
    nextBtn.addEventListener('click', function () { next(true); });

    /* Resume promptly when returning to the tab (timer also self-guards) */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) restart();
    });

    /* Keyboard */
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(true); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(true); }
    });

    /* Swipe (touch) */
    let startX = 0;
    let startY = 0;
    let tracking = false;
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      stop();
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(true); else prev(true);
      } else {
        start();
      }
    }, { passive: true });

    /* Pause autoplay while the hero is off-screen — no point compositing six
       images (and contending with scroll) when nobody can see them. */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) start(); else stop();
      }, { threshold: 0 });
      io.observe(stage);
    }

    render();
    start();
  })();

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
