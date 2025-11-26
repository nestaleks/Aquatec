// Slider and minor enhancements
(function () {
  // Current year in footer
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var slider = document.querySelector('.slider');
  if (!slider) return;

  var track = slider.querySelector('.slider__track');
  var slides = Array.from(slider.querySelectorAll('.slide'));
  var prevBtn = slider.querySelector('.slider__btn.prev');
  var nextBtn = slider.querySelector('.slider__btn.next');
  var dotsEl = slider.querySelector('.slider__dots');
  var autoplay = slider.getAttribute('data-autoplay') === 'true';
  var interval = parseInt(slider.getAttribute('data-interval') || '5000', 10);
  var index = 0; // position index (starts at first visible slide)
  var timer = null;
  var perView = 1; // slides per view (responsive)
  var maxIndex = 0; // maximum starting index given perView

  function getPerView() {
    var w = window.innerWidth || document.documentElement.clientWidth;
    // Always show 3/2/1 slides across breakpoints (desktop/tablet/mobile)
    if (w >= 1024) return 3;
    if (w >= 600) return 2;
    return 1;
  }

  function layoutSlides() {
    perView = getPerView();
    // CSS полностью контролирует размеры через media queries
    maxIndex = Math.max(0, slides.length - perView);
  }

  function go(i) {
    // normalize index within [0, maxIndex] with wrap-around
    if (maxIndex < 0) maxIndex = 0;
    if (i < 0) {
      index = maxIndex; // wrap to last position
    } else if (i > maxIndex) {
      index = 0; // wrap to beginning
    } else {
      index = i;
    }
    
    // Простое смещение: каждый слайд занимает (width + margin)
    if (slides.length > 0) {
      var slideWidth = slides[0].offsetWidth;
      var marginRight = parseFloat(getComputedStyle(slides[0]).marginRight) || 0;
      var offset = -index * (slideWidth + marginRight);
      track.style.transform = 'translateX(' + offset + 'px)';
    }
    updateDots();
  }

  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  function updateDots() {
    var buttons = dotsEl.querySelectorAll('button');
    buttons.forEach(function (b, i) { b.setAttribute('aria-selected', i === index ? 'true' : 'false'); });
  }

  function buildDots() {
    dotsEl.innerHTML = '';
    // One dot per possible starting position
    for (var i = 0; i <= maxIndex; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      var startIdx = i + 1;
      var endIdx = Math.min(i + perView, slides.length);
      var label = perView > 1 ? ('Bewertungen ' + startIdx + '–' + endIdx) : ('Bewertung ' + startIdx);
      b.setAttribute('aria-label', label);
      (function (pos) {
        b.addEventListener('click', function () { go(pos); stop(); start(); });
      })(i);
      dotsEl.appendChild(b);
    }
    updateDots();
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); stop(); start(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); stop(); start(); });

  // Keyboard navigation
  slider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { prev(); stop(); start(); }
    if (e.key === 'ArrowRight') { next(); stop(); start(); }
  });

  function start() {
    if (!autoplay) return;
    stop();
    timer = setInterval(next, interval);
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // Pause on hover/focus
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);

  // Pause when tab not visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  // Handle responsive changes
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var prevPerView = perView;
      layoutSlides();
      if (index > maxIndex) index = maxIndex;
      buildDots();
      go(index);
    }, 150);
  });

  // Init
  layoutSlides();
  buildDots();
  go(0);
  start();
})();
