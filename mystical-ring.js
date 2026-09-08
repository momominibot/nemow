// mystical-ring.js — Interactive glowing cycle ring with 28-day moon phase transitions
// Drag the orb, tap the ring, or use the moon to explore days. No +/- buttons.

(function () {
  'use strict';

  var container = document.getElementById('cyclering');
  if (!container) return;

  var SIZE = 300;
  var CX = SIZE / 2;
  var CY = SIZE / 2;
  var R_OUTER = 130;
  var R_INNER = 100;
  var R_MID = (R_OUTER + R_INNER) / 2;

  var config = {
    length: parseInt(container.dataset.len || '28', 10),
    today: parseInt(container.dataset.day || '1', 10),
    period: (container.dataset.period || '0,5').split(',').map(Number),
    fertile: (container.dataset.fertile || '11,16').split(',').map(Number),
    ovulation: parseInt(container.dataset.ovulation || '14', 10)
  };

  var currentDay = config.today;
  var isDragging = false;
  var animFrame = null;

  // 28 moon phase descriptions
  var MOON_PHASES = [
    { name: 'New Moon', emoji: '🌑', desc: 'Fresh start — set intentions' },
    { name: 'Waxing Crescent', emoji: '🌒', desc: 'Tiny spark of new energy' },
    { name: 'Waxing Crescent', emoji: '🌒', desc: 'Energy building gently' },
    { name: 'Waxing Crescent', emoji: '🌒', desc: 'Momentum gathering' },
    { name: 'First Quarter', emoji: '🌓', desc: 'Half lit — decision point' },
    { name: 'Waxing Gibbous', emoji: '🌔', desc: 'Almost full — refine' },
    { name: 'Waxing Gibbous', emoji: '🌔', desc: 'Building toward peak' },
    { name: 'Waxing Gibbous', emoji: '🌔', desc: 'Nearly radiant' },
    { name: 'Waxing Gibbous', emoji: '🌔', desc: 'Anticipation building' },
    { name: 'Waxing Gibbous', emoji: '🌔', desc: 'Almost at fullness' },
    { name: 'Waxing Gibbous', emoji: '🌔', desc: 'Peak approaching' },
    { name: 'Waxing Gibbous', emoji: '🌔', desc: 'Radiance imminent' },
    { name: 'Waxing Gibbous', emoji: '🌔', desc: 'One more night' },
    { name: 'Full Moon', emoji: '🌕', desc: 'Peak vitality — radiate' },
    { name: 'Waning Gibbous', emoji: '🌖', desc: 'Gratitude — share your light' },
    { name: 'Waning Gibbous', emoji: '🌖', desc: 'Beginning to turn inward' },
    { name: 'Waning Gibbous', emoji: '🌖', desc: 'Processing the cycle' },
    { name: 'Waning Gibbous', emoji: '🌖', desc: 'Releasing what no longer serves' },
    { name: 'Last Quarter', emoji: '🌗', desc: 'Half dark — let go' },
    { name: 'Waning Crescent', emoji: '🌘', desc: 'Rest and restore' },
    { name: 'Waning Crescent', emoji: '🌘', desc: 'Going inward' },
    { name: 'Waning Crescent', emoji: '🌘', desc: 'Deep rest needed' },
    { name: 'Waning Crescent', emoji: '🌘', desc: 'Almost new again' },
    { name: 'Waning Crescent', emoji: '🌘', desc: 'Dreaming of next cycle' },
    { name: 'Waning Crescent', emoji: '🌘', desc: 'Preparing for renewal' },
    { name: 'Waning Crescent', emoji: '🌘', desc: 'The quiet before dawn' },
    { name: 'New Moon', emoji: '🌑', desc: 'Cycle complete — begin again' }
  ];

  var PHASE_INFO = {
    menstrual: { name: 'Menstrual', color: '#e8a898', desc: 'Rest, release, reflect' },
    follicular: { name: 'Follicular', color: '#c4b5e0', desc: 'New energy, plan, create' },
    ovulation: { name: 'Ovulation', color: '#f0c878', desc: 'Peak vitality, connect, express' },
    luteal: { name: 'Luteal', color: '#7a5c96', desc: 'Nest, edit, prepare, rest' }
  };

  function getPhase(day) {
    if (day <= config.period[1]) return 'menstrual';
    if (day < config.fertile[0]) return 'follicular';
    if (day >= config.fertile[0] && day <= config.fertile[1]) return 'ovulation';
    return 'luteal';
  }

  function dayToAngle(day) {
    return ((day - 1) / config.length) * Math.PI * 2 - Math.PI / 2;
  }

  function angleToDay(angle) {
    var normalized = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    return Math.round((normalized / (Math.PI * 2)) * config.length) + 1;
  }

  // Generate SVG moon phase for a given day (0-1 illumination)
  function generateMoonSVG(day, size) {
    var illumination = (1 - Math.cos(2 * Math.PI * (day - 1) / config.length)) / 2;
    var isWaxing = day <= config.length / 2;
    var r = size / 2 - 2;
    var cx = size / 2;
    var cy = size / 2;

    var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
    svg += '<defs>';
    svg += '<clipPath id="moonClip' + size + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath>';
    svg += '<radialGradient id="moonGlow' + size + '" cx="50%" cy="50%" r="55%">';
    svg += '<stop offset="0%" stop-color="#fff8e7" stop-opacity="0.6"/>';
    svg += '<stop offset="60%" stop-color="#f0c878" stop-opacity="0.2"/>';
    svg += '<stop offset="100%" stop-color="#f0c878" stop-opacity="0"/>';
    svg += '</radialGradient>';
    svg += '</defs>';

    // Outer glow
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 4) + '" fill="url(#moonGlow' + size + ')"/>';

    // Realistic watercolor moon image clipped to circle
    svg += '<image href="assets/moon-follicular.png" x="0" y="0" width="' + size + '" height="' + size + '" clip-path="url(#moonClip' + size + ')" preserveAspectRatio="xMidYMid slice"/>';

    // Shadow side for phase transition (darker for visibility)
    var shadowWidth = r * 2 * (1 - illumination);
    if (shadowWidth > 0.5) {
      if (isWaxing) {
        svg += '<path d="M ' + cx + ' ' + (cy - r) + ' A ' + r + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) + ' A ' + (r - shadowWidth / 2) + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r) + ' Z" fill="rgba(18,10,45,0.82)"/>';
      } else {
        svg += '<path d="M ' + cx + ' ' + (cy - r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + ' A ' + (r - shadowWidth / 2) + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy - r) + ' Z" fill="rgba(18,10,45,0.82)"/>';
      }
    }

    // Subtle rim light
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="rgba(255,240,200,0.35)" stroke-width="0.8"/>';

    svg += '</svg>';
    return svg;
  }

  // Generate twinkling stars
  function generateStars(count) {
    var stars = '';
    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      var radius = R_OUTER + 12 + Math.random() * 18;
      var x = CX + Math.cos(angle) * radius;
      var y = CY + Math.sin(angle) * radius;
      var size = 1 + Math.random() * 2;
      var duration = 2 + Math.random() * 3;
      var delay = Math.random() * 3;
      stars += '<circle class="mystical-star" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + size.toFixed(1) + '" fill="rgba(240,200,120,0.8)" style="--twinkle-duration:' + duration.toFixed(1) + 's;--twinkle-delay:' + delay.toFixed(1) + 's"/>';
    }
    return stars;
  }

  function render() {
    var angle = dayToAngle(currentDay);
    var orbX = CX + Math.cos(angle) * R_MID;
    var orbY = CY + Math.sin(angle) * R_MID;
    var phase = getPhase(currentDay);
    var phaseInfo = PHASE_INFO[phase];
    var moonInfo = MOON_PHASES[Math.min(currentDay - 1, MOON_PHASES.length - 1)];

    // Build phase segments
    var segments = '';
    var phaseRanges = [
      { start: 1, end: config.period[1], cls: 'mystical-seg-menstrual' },
      { start: config.period[1] + 1, end: config.fertile[0] - 1, cls: 'mystical-seg-follicular' },
      { start: config.fertile[0], end: config.fertile[1], cls: 'mystical-seg-ovulation' },
      { start: config.fertile[1] + 1, end: config.length, cls: 'mystical-seg-luteal' }
    ];

    phaseRanges.forEach(function (p) {
      if (p.start > p.end) return;
      var a1 = dayToAngle(p.start);
      var a2 = dayToAngle(p.end);
      var largeArc = (a2 - a1) > Math.PI ? 1 : 0;
      var x1 = CX + Math.cos(a1) * R_OUTER;
      var y1 = CY + Math.sin(a1) * R_OUTER;
      var x2 = CX + Math.cos(a2) * R_OUTER;
      var y2 = CY + Math.sin(a2) * R_OUTER;
      var xi1 = CX + Math.cos(a2) * R_INNER;
      var yi1 = CY + Math.sin(a2) * R_INNER;
      var xi2 = CX + Math.cos(a1) * R_INNER;
      var yi2 = CY + Math.sin(a1) * R_INNER;
      segments += '<path class="' + p.cls + '" d="M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A ' + R_OUTER + ' ' + R_OUTER + ' 0 ' + largeArc + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' L ' + xi1.toFixed(1) + ' ' + yi1.toFixed(1) + ' A ' + R_INNER + ' ' + R_INNER + ' 0 ' + largeArc + ' 0 ' + xi2.toFixed(1) + ' ' + yi2.toFixed(1) + ' Z"/>';
    });

    // Day markers (28 small dots)
    var dayMarkers = '';
    for (var d = 1; d <= config.length; d++) {
      var da = dayToAngle(d);
      var dx = CX + Math.cos(da) * R_MID;
      var dy = CY + Math.sin(da) * R_MID;
      var isToday = d === config.today;
      var isCurrent = d === currentDay;
      var dotSize = isCurrent ? 0 : (isToday ? 3 : 1.5);
      if (!isCurrent) {
        dayMarkers += '<circle cx="' + dx.toFixed(1) + '" cy="' + dy.toFixed(1) + '" r="' + dotSize + '" fill="' + (isToday ? '#f0c878' : 'rgba(255,255,255,0.3)') + '"/>';
      }
    }

    // Moon phase markers at key days
    var moonMarkers = '';
    var keyDays = [1, 7, 14, 21];
    keyDays.forEach(function (d) {
      var ma = dayToAngle(d);
      var mx = CX + Math.cos(ma) * (R_OUTER + 24);
      var my = CY + Math.sin(ma) * (R_OUTER + 24);
      var moonEmoji = MOON_PHASES[Math.min(d - 1, MOON_PHASES.length - 1)].emoji;
      moonMarkers += '<text x="' + mx.toFixed(1) + '" y="' + my.toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="14" style="pointer-events:none">' + moonEmoji + '</text>';
    });

    var svg = '<svg width="' + SIZE + '" height="' + SIZE + '" viewBox="0 0 ' + SIZE + ' ' + SIZE + '" id="mysticalRingSvg">';
    svg += generateStars(20);
    svg += '<circle class="mystical-track" cx="' + CX + '" cy="' + CY + '" r="' + R_MID + '" fill="none" stroke="rgba(240,200,120,0.15)" stroke-width="1"/>';
    svg += segments;
    svg += dayMarkers;
    svg += moonMarkers;
    // Orb pulse ring
    svg += '<circle class="mystical-orb-pulse" cx="' + orbX.toFixed(1) + '" cy="' + orbY.toFixed(1) + '" r="14" fill="none" stroke="rgba(240,200,120,0.6)" stroke-width="2"/>';
    // Orb
    svg += '<circle class="mystical-orb" cx="' + orbX.toFixed(1) + '" cy="' + orbY.toFixed(1) + '" r="10" fill="#f0c878" stroke="#fff" stroke-width="2.5"/>';
    svg += '<circle cx="' + (orbX - 3).toFixed(1) + '" cy="' + (orbY - 3).toFixed(1) + '" r="3" fill="rgba(255,255,255,0.6)"/>';
    svg += '</svg>';

    container.innerHTML = svg;

    // Update center with smooth moon transition
    var centerEl = document.getElementById('mysticalCenter');
    if (centerEl) {
      var moonEl = centerEl.querySelector('.mystical-moon');
      if (moonEl) {
        // Fade out
        moonEl.style.opacity = '0';
        moonEl.style.transform = 'scale(0.85) rotate(-5deg)';
        setTimeout(function() {
          centerEl.innerHTML =
            '<div class="mystical-moon" style="opacity:0;transform:scale(0.85) rotate(5deg)">' + generateMoonSVG(currentDay, 56) + '</div>' +
            '<div class="mystical-day">Day ' + currentDay + ' of ' + config.length + '</div>' +
            '<div class="mystical-phase">' + phaseInfo.name + '</div>' +
            '<div class="mystical-desc">' + moonInfo.desc + '</div>';
          // Fade in
          requestAnimationFrame(function() {
            var newMoon = centerEl.querySelector('.mystical-moon');
            if (newMoon) {
              newMoon.style.opacity = '1';
              newMoon.style.transform = 'scale(1) rotate(0deg)';
            }
          });
        }, 180);
      } else {
        centerEl.innerHTML =
          '<div class="mystical-moon">' + generateMoonSVG(currentDay, 56) + '</div>' +
          '<div class="mystical-day">Day ' + currentDay + ' of ' + config.length + '</div>' +
          '<div class="mystical-phase">' + phaseInfo.name + '</div>' +
          '<div class="mystical-desc">' + moonInfo.desc + '</div>';
      }
    }

    attachListeners();
  }

  function attachListeners() {
    var svg = document.getElementById('mysticalRingSvg');
    if (!svg) return;

    function getAngleFromEvent(e) {
      var rect = svg.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      var x = clientX - rect.left - rect.width / 2;
      var y = clientY - rect.top - rect.height / 2;
      return Math.atan2(y, x);
    }

    function onDown(e) {
      isDragging = true;
      e.preventDefault();
      onMove(e);
    }

    function onMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      var angle = getAngleFromEvent(e);
      var day = angleToDay(angle);
      if (day < 1) day = 1;
      if (day > config.length) day = config.length;
      if (day !== currentDay) {
        currentDay = day;
        if (animFrame) cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(render);
      }
    }

    function onUp() { isDragging = false; }

    var orb = svg.querySelector('.mystical-orb');
    if (orb) {
      orb.addEventListener('mousedown', onDown);
      orb.addEventListener('touchstart', onDown, { passive: false });
    }

    // Tap anywhere on ring to jump
    svg.addEventListener('click', function (e) {
      if (isDragging) return;
      var angle = getAngleFromEvent(e);
      var day = angleToDay(angle);
      if (day < 1) day = 1;
      if (day > config.length) day = config.length;
      currentDay = day;
      render();
    });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
  }

  // Boot
  function init() {
    // Add today button if not exists
    if (!document.getElementById('mysticalToday')) {
      var wrap = document.getElementById('mysticalRingWrap') || container.closest('.mystical-ring-wrap') || container.parentElement;
      if (wrap) {
        var todayBtn = document.createElement('button');
        todayBtn.className = 'mystical-today-btn';
        todayBtn.id = 'mysticalToday';
        todayBtn.textContent = '✦ Return to today';
        todayBtn.addEventListener('click', function () {
          currentDay = config.today;
          render();
        });
        wrap.parentElement.insertBefore(todayBtn, wrap.nextSibling);

        var hint = document.createElement('div');
        hint.className = 'mystical-hint';
        hint.innerHTML = '<span class="ms">touch_app</span> Drag the glowing orb or tap the ring';
        wrap.parentElement.insertBefore(hint, todayBtn.nextSibling);
      }
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
