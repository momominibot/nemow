/* ══════════════════════════════════════════════════════════════
   OVULUNA · Dark Mode Controller
   Self-injects a sun/moon toggle into .top on every page.
   Persists preference in localStorage under 'ovuluna_theme'.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'ovuluna_theme';
  var currentTheme = 'light';

  /* ── Read saved preference (default light) ── */
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      currentTheme = saved;
    }
  } catch (e) { /* localStorage unavailable */ }

  /* ── Apply theme immediately (before paint to avoid flash) ── */
  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  applyTheme(currentTheme);

  /* ── Build starfield overlay ── */
  function buildStars() {
    if (document.querySelector('.dark-stars')) return;
    var stars = document.createElement('div');
    stars.className = 'dark-stars';
    stars.setAttribute('aria-hidden', 'true');
    // Generate 60 stars with deterministic pseudo-random positions
    var count = 60;
    for (var i = 0; i < count; i++) {
      var s = document.createElement('i');
      // Pseudo-random but stable positions using a simple LCG
      var seed = (i * 9301 + 49297) % 233280;
      var x = (seed / 233280) * 100;
      var seed2 = (i * 4096 + 150889) % 714025;
      var y = (seed2 / 714025) * 100;
      var delay = ((i * 0.37) % 3).toFixed(2);
      var dur = (2.5 + (i % 5) * 0.5).toFixed(1);
      s.style.left = x + '%';
      s.style.top = y + '%';
      s.style.animationDelay = delay + 's';
      s.style.animationDuration = dur + 's';
      stars.appendChild(s);
    }
    document.body.appendChild(stars);
  }

  /* ── Build toggle button ── */
  function buildToggle() {
    var top = document.querySelector('.top');
    if (!top) return; // gracefully skip pages without .top

    // Avoid double-injection
    if (top.querySelector('.theme-toggle')) return;

    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.setAttribute('title', 'Toggle dark mode');

    var sun = document.createElement('span');
    sun.className = 'tt-sun';
    sun.textContent = '\u2600\uFE0F'; // ☀️

    var moon = document.createElement('span');
    moon.className = 'tt-moon';
    moon.textContent = '\uD83C\uDF19'; // 🌙

    btn.appendChild(sun);
    btn.appendChild(moon);

    btn.addEventListener('click', function () {
      var next = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });

    // Insert as last child in .top (after existing icons)
    top.appendChild(btn);
  }

  /* ── Boot ── */
  function init() {
    buildStars();
    buildToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
