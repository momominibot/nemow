/* ══════════════════════════════════════════════════════════════
   OVULUNA · Knowledge Hub Celestial Hero — JS
   Generates starfield, staggers orb/line timing, manages play state.
   Pure DOM, no libraries. Pairs with knowledge-hero.css (20s loop).
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var HERO_SELECTOR = '.kh-hero';
  var STAR_COUNT = 46;
  var LOOP_MS = 20000;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function buildStars(container) {
    var frag = document.createDocumentFragment();
    var starClasses = ['', 'gold', 'blue'];
    for (var i = 0; i < STAR_COUNT; i++) {
      var s = document.createElement('span');
      s.className = 'kh-star' + (pick(starClasses) ? ' ' + pick(starClasses) : '');
      var size = rand(1, 2.8);
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = rand(0, 100) + '%';
      s.style.top = rand(0, 100) + '%';
      s.style.setProperty('--dur', rand(2.2, 4.8).toFixed(2) + 's');
      s.style.setProperty('--delay', rand(0, 4).toFixed(2) + 's');
      s.style.setProperty('--peak', rand(0.5, 0.95).toFixed(2));
      frag.appendChild(s);
    }
    container.appendChild(frag);
  }

  function staggerOrbs(hero) {
    // 5 orbs appear one-by-one during Phase 3 (8-16s = 40%-80% of 20s)
    // CSS keyframe has pop at ~12% of its own timeline; shift via negative
    // animation-delay so each orb's "12%" lands at 42%, 50%, 58%, 66%, 74%.
    // orb-delay = -(target% - 12%) * 20s  → but animation-delay negative shifts start.
    // Simpler: set positive delays won't work with infinite loop cleanly; use
    // negative delay to pre-advance each orb's timeline.
    var targets = [42, 50, 58, 66, 74]; // percent of master loop when orb pops
    var orbs = hero.querySelectorAll('.kh-orb');
    orbs.forEach(function (orb, idx) {
      var targetPct = targets[idx] || (42 + idx * 8);
      // keyframe pop at 12% of orb timeline. We want 12%_orb == targetPct_master.
      // orb timeline offset = targetPct - 12 (percent). Negative delay = that * LOOP.
      var offsetPct = targetPct - 12;
      var delaySec = -(offsetPct / 100) * (LOOP_MS / 1000);
      orb.style.animationDelay = delaySec.toFixed(2) + 's';
      orb.style.setProperty('--orb-delay', delaySec.toFixed(2) + 's');
    });

    // lines draw just before/with each orb
    var lines = hero.querySelectorAll('.kh-line');
    lines.forEach(function (line, idx) {
      var targetPct = (targets[idx] || (42 + idx * 8)) - 4;
      // line keyframe draws at 38% of its timeline; want that at targetPct.
      var offsetPct = targetPct - 38;
      var delaySec = -(offsetPct / 100) * (LOOP_MS / 1000);
      line.style.animationDelay = delaySec.toFixed(2) + 's';
      line.style.setProperty('--line-delay', delaySec.toFixed(2) + 's');
    });
  }

  function pauseAnimations(hero, paused) {
    var els = hero.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      els[i].style.animationPlayState = paused ? 'paused' : 'running';
    }
  }

  function init(hero) {
    if (!hero || hero.dataset.khInit === '1') return;
    hero.dataset.khInit = '1';

    var stars = hero.querySelector('.kh-stars');
    if (stars) buildStars(stars);

    staggerOrbs(hero);

    // Respect reduced motion: CSS handles static fallback; skip play toggling.
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // Pause when tab hidden to save battery; resume on return.
    document.addEventListener('visibilitychange', function () {
      pauseAnimations(hero, document.hidden);
    });

    // Small delay so first paint settles before animation kicks (avoids jank).
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('kh-ready');
      });
    });
  }

  function boot() {
    var heroes = document.querySelectorAll(HERO_SELECTOR);
    for (var i = 0; i < heroes.length; i++) init(heroes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
