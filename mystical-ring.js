/* ══════════════════════════════════════════════════════════════
   OVULUNA · Mystical Interactive Cycle Ring
   Drag the glowing orb, tap the ring, or use ± to explore
   every day of your cycle. Phases, moon phases, and mystical
   descriptions update in real time.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var container = document.getElementById('cyclering');
  if (!container) return;

  /* ── Read config from data attributes ── */
  var config = {
    today: parseInt(container.dataset.day || '9', 10),
    length: parseInt(container.dataset.len || '28', 10),
    period: (container.dataset.period || '0,5').split(',').map(Number),
    fertile: (container.dataset.fertile || '11,16').split(',').map(Number),
    ovulation: parseInt(container.dataset.ovulation || '14', 10),
  };

  var currentDay = config.today;
  var isDragging = false;
  var animFrame = null;

  /* ── Ring geometry ── */
  var SIZE = 300;
  var CX = SIZE / 2;
  var CY = SIZE / 2;
  var R = 110;
  var STROKE = 16;

  /* ── Phase definitions ── */
  function getPhase(day, len) {
    var p = config.period;
    var f = config.fertile;
    var ov = config.ovulation;
    if (day >= p[0] && day <= p[1]) return { key: 'menstrual', name: 'Menstrual', moon: '🌑', desc: 'Release and renewal. Rest, nourish, go inward.' };
    if (day >= f[0] && day <= f[1]) {
      if (Math.abs(day - ov) <= 1) return { key: 'ovulation', name: 'Ovulation', moon: '🌕', desc: 'Peak vitality and radiance. Your energy is at its highest.' };
      return { key: 'follicular', name: 'Follicular', moon: '🌒', desc: 'Rising energy. New beginnings, clarity, and growing strength.' };
    }
    if (day > p[1] && day < f[0]) return { key: 'follicular', name: 'Follicular', moon: '🌒', desc: 'Rising energy. New beginnings, clarity, and growing strength.' };
    return { key: 'luteal', name: 'Luteal', moon: '🌖', desc: 'Inner wisdom. Nesting, reflection, and gentle slowing down.' };
  }

  /* ── Color palette (mystical) ── */
  var COLORS = {
    track: 'rgba(160, 130, 200, 0.15)',
    menstrual: '#d8607a',
    follicular: '#8a9ad8',
    ovulation: '#f0c060',
    luteal: '#9b7bb8',
    orb: '#f0c878',
    orbGlow: 'rgba(240, 200, 120, 0.5)',
    star: '#f0e0c0',
    moon: '#e8d8b0',
  };

  /* ── Polar helpers ── */
  function polar(angle, radius) {
    return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)];
  }
  function dayToAngle(day) {
    return -Math.PI / 2 + (day / config.length) * 2 * Math.PI;
  }
  function angleToDay(angle) {
    var normalized = (angle + Math.PI / 2) / (2 * Math.PI);
    normalized = ((normalized % 1) + 1) % 1;
    return Math.round(normalized * config.length);
  }

  /* ── Arc path generator ── */
  function arcPath(startDay, endDay, color, width, opacity) {
    var a0 = dayToAngle(startDay);
    var a1 = dayToAngle(endDay);
    var large = (endDay - startDay) / config.length > 0.5 ? 1 : 0;
    var p0 = polar(a0, R);
    var p1 = polar(a1, R);
    return '<path d="M' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1) +
      ' A' + R + ',' + R + ' 0 ' + large + ' 1 ' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1) +
      '" fill="none" stroke="' + color + '" stroke-width="' + width +
      '" stroke-linecap="round" opacity="' + (opacity || 1) + '"/>';
  }

  /* ── Generate stars around the ring ── */
  function generateStars(count) {
    var stars = '';
    for (var i = 0; i < count; i++) {
      var angle = (i / count) * 2 * Math.PI + (i * 0.7);
      var radius = R + 28 + (i % 3) * 6;
      var pos = polar(angle, radius);
      var size = 1 + (i % 3) * 0.8;
      var delay = (i * 0.3) % 2;
      stars += '<circle class="mystical-star" cx="' + pos[0].toFixed(1) + '" cy="' + pos[1].toFixed(1) +
        '" r="' + size.toFixed(1) + '" fill="' + COLORS.star +
        '" style="animation-delay:' + delay.toFixed(1) + 's"/>';
    }
    return stars;
  }

  /* ── Generate moon phase markers ── */
  function generateMoonMarkers() {
    var markers = '';
    var phases = [
      { day: 1, icon: '🌑', label: 'New Moon' },
      { day: Math.round(config.length * 0.25), icon: '🌒', label: 'Waxing' },
      { day: config.ovulation, icon: '🌕', label: 'Full Moon' },
      { day: Math.round(config.length * 0.75), icon: '🌖', label: 'Waning' },
    ];
    for (var i = 0; i < phases.length; i++) {
      var angle = dayToAngle(phases[i].day);
      var pos = polar(angle, R - 32);
      markers += '<text x="' + pos[0].toFixed(1) + '" y="' + pos[1].toFixed(1) +
        '" text-anchor="middle" dominant-baseline="middle" font-size="14" opacity="0.7">' +
        phases[i].icon + '</text>';
    }
    return markers;
  }

  /* ── Render the ring SVG ── */
  function render() {
    var phase = getPhase(currentDay, config.length);
    var todayAngle = dayToAngle(currentDay);
    var orbPos = polar(todayAngle, R);

    var svg = '<svg width="' + SIZE + '" height="' + SIZE + '" viewBox="0 0 ' + SIZE + ' ' + SIZE + '" id="mysticalRingSvg">';

    // Outer decorative circle
    svg += '<circle cx="' + CX + '" cy="' + CY + '" r="' + (R + 22) + '" fill="none" stroke="rgba(160,130,200,0.1)" stroke-width="1" stroke-dasharray="2,6"/>';

    // Stars
    svg += generateStars(16);

    // Background track (glowing)
    svg += '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="none" stroke="' + COLORS.track + '" stroke-width="' + STROKE + '"/>';

    // Phase segments with glow
    // Menstrual
    svg += arcPath(config.period[0], config.period[1], COLORS.menstrual, STROKE, 0.85);
    // Follicular (after period, before fertile)
    if (config.period[1] + 1 < config.fertile[0]) {
      svg += arcPath(config.period[1] + 1, config.fertile[0] - 1, COLORS.follicular, STROKE, 0.7);
    }
    // Fertile window
    svg += arcPath(config.fertile[0], config.fertile[1], COLORS.ovulation, STROKE, 0.8);
    // Luteal (after fertile, before next period)
    if (config.fertile[1] + 1 < config.length) {
      svg += arcPath(config.fertile[1] + 1, config.length, COLORS.luteal, STROKE, 0.75);
    }

    // Moon phase markers
    svg += generateMoonMarkers();

    // Day tick marks
    for (var d = 1; d <= config.length; d += 2) {
      var tickAngle = dayToAngle(d - 0.5);
      var inner = polar(tickAngle, R - STROKE / 2 - 3);
      var outer = polar(tickAngle, R - STROKE / 2 - 7);
      svg += '<line x1="' + inner[0].toFixed(1) + '" y1="' + inner[1].toFixed(1) +
        '" x2="' + outer[0].toFixed(1) + '" y2="' + outer[1].toFixed(1) +
        '" stroke="rgba(122,92,150,0.3)" stroke-width="1"/>';
    }

    // Today orb glow
    svg += '<circle class="mystical-orb-glow" cx="' + orbPos[0].toFixed(1) + '" cy="' + orbPos[1].toFixed(1) +
      '" r="16" fill="' + COLORS.orbGlow + '"/>';

    // Today orb (interactive)
    svg += '<circle class="mystical-orb" cx="' + orbPos[0].toFixed(1) + '" cy="' + orbPos[1].toFixed(1) +
      '" r="11" fill="' + COLORS.orb + '" stroke="#fff" stroke-width="3" style="filter:drop-shadow(0 0 6px rgba(240,200,120,0.8))"/>';

    svg += '</svg>';

    container.innerHTML = svg;

    // Update center display
    updateCenter(phase);

    // Attach interaction listeners
    attachListeners();
  }

  /* ── Update center display ── */
  function updateCenter(phase) {
    var centerEl = container.parentElement.querySelector('.mystical-center');
    if (!centerEl) return;

    centerEl.innerHTML =
      '<div class="mystical-moon">' + phase.moon + '</div>' +
      '<div class="mystical-day">Day ' + currentDay + '</div>' +
      '<div class="mystical-day-label">of ' + config.length + '</div>' +
      '<div class="mystical-phase phase-' + phase.key + '">' + phase.name + '</div>' +
      '<div class="mystical-desc">' + phase.desc + '</div>';
  }

  /* ── Interaction: drag, tap, stepper ── */
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

    function onUp() {
      isDragging = false;
    }

    // Drag on orb
    var orb = svg.querySelector('.mystical-orb');
    if (orb) {
      orb.addEventListener('mousedown', onDown);
      orb.addEventListener('touchstart', onDown, { passive: false });
    }

    // Tap anywhere on SVG to jump
    svg.addEventListener('click', function (e) {
      if (isDragging) return;
      var angle = getAngleFromEvent(e);
      var day = angleToDay(angle);
      if (day < 1) day = 1;
      if (day > config.length) day = config.length;
      currentDay = day;
      render();
    });

    // Global drag listeners
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
  }

  /* ── Build the full widget (ring + center + controls) ── */
  function buildWidget() {
    // Replace the old ringwrap content
    var wrap = container.closest('.ringwrap') || container.parentElement;
    if (!wrap) return;

    // Clear old content
    wrap.innerHTML = '';
    wrap.className = 'mystical-ring-wrap';

    // Glow backdrop
    var glow = document.createElement('div');
    glow.className = 'mystical-glow';
    wrap.appendChild(glow);

    // Ring container
    container.id = 'cyclering';
    container.style.position = 'relative';
    container.style.zIndex = '2';
    wrap.appendChild(container);

    // Center display
    var center = document.createElement('div');
    center.className = 'mystical-center';
    wrap.appendChild(center);

    // Stepper controls
    var stepper = document.createElement('div');
    stepper.className = 'mystical-stepper';
    stepper.innerHTML =
      '<button class="mystical-step-btn" id="mysticalPrev">−</button>' +
      '<span class="mystical-step-label" id="mysticalDayLabel">Day ' + currentDay + '</span>' +
      '<button class="mystical-step-btn" id="mysticalNext">+</button>';
    wrap.parentElement.insertBefore(stepper, wrap.nextSibling);

    // Today button
    var todayBtn = document.createElement('button');
    todayBtn.className = 'mystical-today-btn';
    todayBtn.id = 'mysticalToday';
    todayBtn.textContent = '✦ Return to today';
    wrap.parentElement.insertBefore(todayBtn, stepper.nextSibling);

    // Hint
    var hint = document.createElement('div');
    hint.className = 'mystical-hint';
    hint.innerHTML = '<span class="ms">touch_app</span> Drag the orb or tap the ring to explore';
    wrap.parentElement.insertBefore(hint, todayBtn.nextSibling);

    // Stepper events
    document.getElementById('mysticalPrev').addEventListener('click', function () {
      currentDay = currentDay > 1 ? currentDay - 1 : config.length;
      render();
    });
    document.getElementById('mysticalNext').addEventListener('click', function () {
      currentDay = currentDay < config.length ? currentDay + 1 : 1;
      render();
    });
    document.getElementById('mysticalToday').addEventListener('click', function () {
      currentDay = config.today;
      render();
    });

    // Initial render
    render();
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
