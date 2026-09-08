/* ══════════════════════════════════════════════════════════════
   OVULUNA · Mystical Interactive Cycle Ring (simplified)
   HTML structure is in the page; this JS only renders the SVG
   and handles drag/tap/stepper interaction.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var container = document.getElementById('cyclering');
  var centerEl = document.getElementById('mysticalCenter');
  var dayLabel = document.getElementById('mysticalDayLabel');
  if (!container || !centerEl) return;

  var config = {
    today: parseInt(container.dataset.day || '9', 10),
    length: parseInt(container.dataset.len || '28', 10),
    period: (container.dataset.period || '0,5').split(',').map(Number),
    fertile: (container.dataset.fertile || '11,16').split(',').map(Number),
    ovulation: parseInt(container.dataset.ovulation || '14', 10),
  };

  var currentDay = config.today;
  var isDragging = false;

  var SIZE = 300, CX = SIZE / 2, CY = SIZE / 2, R = 110, STROKE = 16;

  function getPhase(day) {
    var p = config.period, f = config.fertile, ov = config.ovulation;
    if (day >= p[0] && day <= p[1]) return { key: 'menstrual', name: 'Menstrual', moon: '🌑', desc: 'Release and renewal. Rest, nourish, go inward.' };
    if (day >= f[0] && day <= f[1]) {
      if (Math.abs(day - ov) <= 1) return { key: 'ovulation', name: 'Ovulation', moon: '🌕', desc: 'Peak vitality and radiance. Your energy is at its highest.' };
      return { key: 'follicular', name: 'Follicular', moon: '🌒', desc: 'Rising energy. New beginnings, clarity, and growing strength.' };
    }
    if (day > p[1] && day < f[0]) return { key: 'follicular', name: 'Follicular', moon: '🌒', desc: 'Rising energy. New beginnings, clarity, and growing strength.' };
    return { key: 'luteal', name: 'Luteal', moon: '🌖', desc: 'Inner wisdom. Nesting, reflection, and gentle slowing down.' };
  }

  var COLORS = {
    track: 'rgba(160,130,200,0.15)', menstrual: '#d8607a', follicular: '#8a9ad8',
    ovulation: '#f0c060', luteal: '#9b7bb8', orb: '#f0c878', star: '#f0e0c0',
  };

  function polar(angle, radius) { return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)]; }
  function dayToAngle(day) { return -Math.PI / 2 + (day / config.length) * 2 * Math.PI; }
  function angleToDay(angle) {
    var n = ((angle + Math.PI / 2) / (2 * Math.PI) % 1 + 1) % 1;
    return Math.max(1, Math.min(config.length, Math.round(n * config.length)));
  }

  function arcPath(startDay, endDay, color, opacity) {
    var a0 = dayToAngle(startDay), a1 = dayToAngle(endDay);
    var large = (endDay - startDay) / config.length > 0.5 ? 1 : 0;
    var p0 = polar(a0, R), p1 = polar(a1, R);
    return '<path d="M' + p0[0].toFixed(1) + ',' + p0[1].toFixed(1) +
      ' A' + R + ',' + R + ' 0 ' + large + ' 1 ' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1) +
      '" fill="none" stroke="' + color + '" stroke-width="' + STROKE +
      '" stroke-linecap="round" opacity="' + (opacity || 1) + '"/>';
  }

  function render() {
    var phase = getPhase(currentDay);
    var orbPos = polar(dayToAngle(currentDay), R);
    var svg = '<svg width="' + SIZE + '" height="' + SIZE + '" viewBox="0 0 ' + SIZE + ' ' + SIZE + '" id="mysticalRingSvg" style="display:block;width:100%">';
    svg += '<circle cx="' + CX + '" cy="' + CY + '" r="' + (R + 22) + '" fill="none" stroke="rgba(160,130,200,0.1)" stroke-width="1" stroke-dasharray="2,6"/>';
    // stars
    for (var i = 0; i < 16; i++) {
      var sa = (i / 16) * 2 * Math.PI + i * 0.7;
      var sr = R + 28 + (i % 3) * 6;
      var sp = polar(sa, sr);
      svg += '<circle cx="' + sp[0].toFixed(1) + '" cy="' + sp[1].toFixed(1) + '" r="' + (1 + (i % 3) * 0.8).toFixed(1) + '" fill="' + COLORS.star + '" opacity="0.6"/>';
    }
    svg += '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="none" stroke="' + COLORS.track + '" stroke-width="' + STROKE + '"/>';
    svg += arcPath(config.period[0], config.period[1], COLORS.menstrual, 0.85);
    if (config.period[1] + 1 < config.fertile[0]) svg += arcPath(config.period[1] + 1, config.fertile[0] - 1, COLORS.follicular, 0.7);
    svg += arcPath(config.fertile[0], config.fertile[1], COLORS.ovulation, 0.8);
    if (config.fertile[1] + 1 < config.length) svg += arcPath(config.fertile[1] + 1, config.length, COLORS.luteal, 0.75);
    // moon markers
    var markers = [{ d: 1, icon: '🌑' }, { d: Math.round(config.length * 0.25), icon: '🌒' }, { d: config.ovulation, icon: '🌕' }, { d: Math.round(config.length * 0.75), icon: '🌖' }];
    for (var m = 0; m < markers.length; m++) {
      var mp = polar(dayToAngle(markers[m].d), R - 32);
      svg += '<text x="' + mp[0].toFixed(1) + '" y="' + mp[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" font-size="14" opacity="0.7">' + markers[m].icon + '</text>';
    }
    // tick marks
    for (var d = 1; d <= config.length; d += 2) {
      var ta = dayToAngle(d - 0.5);
      var ti = polar(ta, R - STROKE / 2 - 3), to = polar(ta, R - STROKE / 2 - 7);
      svg += '<line x1="' + ti[0].toFixed(1) + '" y1="' + ti[1].toFixed(1) + '" x2="' + to[0].toFixed(1) + '" y2="' + to[1].toFixed(1) + '" stroke="rgba(122,92,150,0.3)" stroke-width="1"/>';
    }
    // orb glow + orb
    svg += '<circle cx="' + orbPos[0].toFixed(1) + '" cy="' + orbPos[1].toFixed(1) + '" r="18" fill="rgba(240,200,120,0.35)"/>';
    svg += '<circle class="mystical-orb" cx="' + orbPos[0].toFixed(1) + '" cy="' + orbPos[1].toFixed(1) + '" r="11" fill="' + COLORS.orb + '" stroke="#fff" stroke-width="3" style="cursor:grab;filter:drop-shadow(0 0 6px rgba(240,200,120,0.8))"/>';
    svg += '</svg>';
    container.innerHTML = svg;
    centerEl.innerHTML =
      '<div class="mystical-moon">' + phase.moon + '</div>' +
      '<div class="mystical-day">Day ' + currentDay + '</div>' +
      '<div class="mystical-day-label">of ' + config.length + '</div>' +
      '<div class="mystical-phase phase-' + phase.key + '">' + phase.name + '</div>' +
      '<div class="mystical-desc">' + phase.desc + '</div>';
    if (dayLabel) dayLabel.textContent = 'Day ' + currentDay;
  }

  // Interaction
  function getAngle(e) {
    var svg = document.getElementById('mysticalRingSvg');
    if (!svg) return 0;
    var rect = svg.getBoundingClientRect();
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(cy - rect.top - rect.height / 2, cx - rect.left - rect.width / 2);
  }

  function onDown(e) { isDragging = true; e.preventDefault(); onMove(e); }
  function onMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    var day = angleToDay(getAngle(e));
    if (day !== currentDay) { currentDay = day; render(); }
  }
  function onUp() { isDragging = false; }

  function attach() {
    var svg = document.getElementById('mysticalRingSvg');
    if (!svg) return;
    var orb = svg.querySelector('.mystical-orb');
    if (orb) { orb.addEventListener('mousedown', onDown); orb.addEventListener('touchstart', onDown, { passive: false }); }
    svg.addEventListener('click', function (e) {
      if (isDragging) return;
      currentDay = angleToDay(getAngle(e));
      render();
    });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
  }

  var prevBtn = document.getElementById('mysticalPrev');
  var nextBtn = document.getElementById('mysticalNext');
  var todayBtn = document.getElementById('mysticalToday');
  if (prevBtn) prevBtn.addEventListener('click', function () { currentDay = currentDay > 1 ? currentDay - 1 : config.length; render(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { currentDay = currentDay < config.length ? currentDay + 1 : 1; render(); });
  if (todayBtn) todayBtn.addEventListener('click', function () { currentDay = config.today; render(); });

  // Boot
  render();
  attach();
})();
