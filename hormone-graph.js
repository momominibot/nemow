/* Hormone Cycle Graph — interactive SVG, 4 hormones, 28 days
   Syncs with mystical ring via window.OvulunaHormone.setDay(day)
*/
(function() {
  var HORMONES = {
    estrogen: { name: 'Estrogen', color: '#c48bd4', full: 'Estradiol (E2)' },
    progesterone: { name: 'Progesterone', color: '#e8a898', full: 'Progesterone (P4)' },
    lh: { name: 'LH', color: '#7fc8a9', full: 'Luteinizing Hormone' },
    fsh: { name: 'FSH', color: '#7fb4d4', full: 'Follicle-Stimulating Hormone' }
  };

  var PHASES = [
    { name: 'Menstrual', start: 1, end: 5, color: 'rgba(232,168,152,.12)' },
    { name: 'Follicular', start: 6, end: 12, color: 'rgba(196,181,224,.12)' },
    { name: 'Ovulation', start: 13, end: 16, color: 'rgba(240,200,120,.15)' },
    { name: 'Luteal', start: 17, end: 28, color: 'rgba(127,180,212,.1)' }
  ];

  // Generate hormone values for each day (0-100 scale, relative)
  function genHormoneData() {
    var data = { estrogen: [], progesterone: [], lh: [], fsh: [] };
    for (var day = 1; day <= 28; day++) {
      // Estrogen: rises follicular, peak day 13, dip ovulation, second rise luteal, drop
      var e = 0;
      if (day <= 5) e = 15 + day * 2;
      else if (day <= 13) e = 25 + (day - 5) * 9; // rise to ~97 at day 13
      else if (day === 14) e = 55; // dip at ovulation
      else if (day <= 21) e = 55 + (day - 14) * 4; // second rise to ~83
      else e = 83 - (day - 21) * 10; // drop to ~13 at day 28
      data.estrogen.push(Math.max(5, Math.min(100, e)));

      // Progesterone: low follicular, rises after ovulation, peak day 20-22, drops
      var p = 0;
      if (day <= 14) p = 5 + (day > 12 ? (day - 12) * 3 : 0);
      else if (day <= 21) p = 11 + (day - 14) * 12; // rise to ~95 at day 21
      else p = 95 - (day - 21) * 13; // drop to ~4 at day 28
      data.progesterone.push(Math.max(3, Math.min(100, p)));

      // LH: low most cycle, sharp surge day 12-13
      var l = 8;
      if (day === 11) l = 15;
      else if (day === 12) l = 45;
      else if (day === 13) l = 92; // peak surge
      else if (day === 14) l = 35;
      else if (day === 15) l = 12;
      data.lh.push(Math.max(5, Math.min(100, l)));

      // FSH: rises early follicular (day 1-3), dips, small peak ovulation
      var f = 0;
      if (day <= 3) f = 35 + (3 - day) * 5; // peak ~45 at day 1
      else if (day <= 12) f = 20 - (day - 3) * 1; // gradual dip to ~11
      else if (day <= 14) f = 11 + (day - 12) * 8; // small peak ~27 at ovulation
      else f = 27 - (day - 14) * 1.2; // gradual decline
      data.fsh.push(Math.max(5, Math.min(100, f)));
    }
    return data;
  }

  var hormoneData = genHormoneData();
  var visibleHormones = { estrogen: true, progesterone: true, lh: true, fsh: true };
  var currentDay = 9;
  var W = 340, H = 180, PAD_L = 28, PAD_R = 8, PAD_T = 12, PAD_B = 22;
  var plotW = W - PAD_L - PAD_R;
  var plotH = H - PAD_T - PAD_B;

  function xForDay(day) { return PAD_L + ((day - 1) / 27) * plotW; }
  function yForVal(val) { return PAD_T + plotH - (val / 100) * plotH; }

  function buildPath(key) {
    var pts = hormoneData[key];
    var d = 'M ' + xForDay(1).toFixed(1) + ' ' + yForVal(pts[0]).toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      // Smooth curve using quadratic bezier
      var prevX = xForDay(i);
      var prevY = yForVal(pts[i - 1]);
      var currX = xForDay(i + 1);
      var currY = yForVal(pts[i]);
      var cpx = (prevX + currX) / 2;
      d += ' Q ' + prevX.toFixed(1) + ' ' + prevY.toFixed(1) + ' ' + cpx.toFixed(1) + ' ' + ((prevY + currY) / 2).toFixed(1);
    }
    var last = pts[pts.length - 1];
    d += ' T ' + xForDay(28).toFixed(1) + ' ' + yForVal(last).toFixed(1);
    return d;
  }

  function getInsight(day) {
    if (day <= 5) return '<b>Menstrual phase.</b> Estrogen and progesterone are at their lowest. Your body is shedding the uterine lining. Energy may be lower — prioritize rest, iron-rich foods, and gentle movement. <span class="qi" data-evidence="estradiol-follicular" style="font-size:8px">i</span>';
    if (day <= 12) return '<b>Follicular phase.</b> Estrogen is climbing steadily as follicles mature. FSH stimulated follicle growth earlier this phase. Energy and mood typically improve. Great time for higher-intensity exercise, complex carbs, and social activities. <span class="qi" data-evidence="estrogen-insulin-follicular" style="font-size:8px">i</span>';
    if (day <= 16) return '<b>Ovulation window.</b> LH surged 24-36 hours ago, triggering egg release. Estrogen peaked and dipped slightly. This is your most fertile window. Libido and energy are typically high. Stay hydrated, avoid excessive alcohol. <span class="qi" data-evidence="lh-surge-ovulation" style="font-size:8px">i</span>';
    if (day <= 22) return '<b>Early luteal.</b> Progesterone is rising sharply as the corpus luteum forms. Estrogen has a second, smaller peak. Progesterone raises body temperature by 0.3-0.5°C and may cause heavier sleep. Magnesium and B6 can support this phase. <span class="qi" data-evidence="progesterone-thermogenic" style="font-size:8px">i</span>';
    return '<b>Late luteal / premenstrual.</b> Both estrogen and progesterone are dropping as the corpus luteum degenerates. This hormonal withdrawal can trigger PMS symptoms: mood swings, bloating, cravings, fatigue. Prioritize sleep, reduce caffeine and sugar, gentle exercise, and stress management. <span class="qi" data-evidence="pms-hormone-withdrawal" style="font-size:8px">i</span>';
  }

  function render(container) {
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';

    // Phase backgrounds
    PHASES.forEach(function(ph) {
      var x1 = xForDay(ph.start);
      var x2 = xForDay(ph.end) + (plotW / 27);
      svg += '<rect x="' + x1.toFixed(1) + '" y="' + PAD_T + '" width="' + (x2 - x1).toFixed(1) + '" height="' + plotH + '" fill="' + ph.color + '" rx="3"/>';
    });

    // Grid lines
    [0, 25, 50, 75, 100].forEach(function(v) {
      var y = yForVal(v);
      svg += '<line x1="' + PAD_L + '" y1="' + y.toFixed(1) + '" x2="' + (W - PAD_R) + '" y2="' + y.toFixed(1) + '" stroke="rgba(107,82,142,.08)" stroke-width="0.5"/>';
      svg += '<text x="' + (PAD_L - 4) + '" y="' + (y + 3).toFixed(1) + '" text-anchor="end" font-size="7" fill="rgba(107,82,142,.4)" font-weight="600">' + v + '</text>';
    });

    // Day markers (every 7 days)
    [1, 7, 14, 21, 28].forEach(function(d) {
      var x = xForDay(d);
      svg += '<text x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="7.5" fill="rgba(107,82,142,.5)" font-weight="700">D' + d + '</text>';
    });

    // Hormone curves
    Object.keys(HORMONES).forEach(function(key) {
      if (!visibleHormones[key]) return;
      var h = HORMONES[key];
      // Glow
      svg += '<path d="' + buildPath(key) + '" fill="none" stroke="' + h.color + '" stroke-width="4" stroke-opacity="0.15" stroke-linecap="round"/>';
      // Main line
      svg += '<path d="' + buildPath(key) + '" fill="none" stroke="' + h.color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    });

    // Current day vertical line
    var cx = xForDay(currentDay);
    svg += '<line x1="' + cx.toFixed(1) + '" y1="' + PAD_T + '" x2="' + cx.toFixed(1) + '" y2="' + (PAD_T + plotH) + '" stroke="rgba(196,181,224,.5)" stroke-width="1" stroke-dasharray="3,2"/>';

    // Day dot on each hormone curve
    Object.keys(HORMONES).forEach(function(key) {
      if (!visibleHormones[key]) return;
      var h = HORMONES[key];
      var val = hormoneData[key][currentDay - 1];
      var dy = yForVal(val);
      svg += '<circle cx="' + cx.toFixed(1) + '" cy="' + dy.toFixed(1) + '" r="3.5" fill="#fff" stroke="' + h.color + '" stroke-width="2"/>';
    });

    // Day marker at bottom
    svg += '<circle cx="' + cx.toFixed(1) + '" cy="' + (PAD_T + plotH + 2) + '" r="4" fill="var(--mauve)" stroke="#fff" stroke-width="1.5"/>';

    svg += '</svg>';
    container.innerHTML = svg;
  }

  function init() {
    var card = document.getElementById('hormoneGraphCard');
    if (!card) return;

    // Build legend
    var legendHtml = '';
    Object.keys(HORMONES).forEach(function(key) {
      var h = HORMONES[key];
      legendHtml += '<div class="hormone-legend-item" data-hormone="' + key + '"><span class="hormone-legend-dot" style="background:' + h.color + '"></span>' + h.name + '</div>';
    });

    card.innerHTML =
      '<div class="hormone-header">' +
        '<span class="hormone-title">Hormones This Cycle <span class="qi" data-evidence="menstrual-cycle-hormones" style="font-size:8px">i</span></span>' +
        '<span class="hormone-day-label" id="hormoneDayLabel">Day 9</span>' +
      '</div>' +
      '<div class="hormone-legend" id="hormoneLegend">' + legendHtml + '</div>' +
      '<div class="hormone-svg-wrap" id="hormoneSvgWrap"><div class="hormone-tooltip" id="hormoneTooltip"></div></div>' +
      '<div class="hormone-phase-labels">' +
        PHASES.map(function(p) { return '<span class="hormone-phase-label" style="color:' + (p.name === 'Ovulation' ? '#c9a24b' : 'var(--taupe)') + '">' + p.name + '</span>'; }).join('') +
      '</div>' +
      '<div class="hormone-insight" id="hormoneInsight">' + getInsight(currentDay) + '</div>';

    var svgWrap = document.getElementById('hormoneSvgWrap');
    render(svgWrap);

    // Legend toggle
    card.querySelectorAll('.hormone-legend-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var key = item.dataset.hormone;
        visibleHormones[key] = !visibleHormones[key];
        item.classList.toggle('dimmed', !visibleHormones[key]);
        render(svgWrap);
      });
    });

    // Tooltip on hover
    var tooltip = document.getElementById('hormoneTooltip');
    svgWrap.addEventListener('mousemove', function(e) {
      var rect = svgWrap.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var day = Math.round(1 + (x - PAD_L * (rect.width / W)) / (plotW * (rect.width / W)) * 27);
      day = Math.max(1, Math.min(28, day));
      var html = '<span class="tt-day">Day ' + day + '</span>';
      Object.keys(HORMONES).forEach(function(key) {
        if (!visibleHormones[key]) return;
        var h = HORMONES[key];
        html += '<span style="color:' + h.color + '">●</span> ' + h.name + ': ' + hormoneData[key][day - 1].toFixed(0) + '%<br>';
      });
      tooltip.innerHTML = html;
      tooltip.style.display = 'block';
      tooltip.style.left = x + 'px';
      tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
    });
    svgWrap.addEventListener('mouseleave', function() { tooltip.style.display = 'none'; });

    // Touch support
    svgWrap.addEventListener('touchmove', function(e) {
      var touch = e.touches[0];
      var rect = svgWrap.getBoundingClientRect();
      var x = touch.clientX - rect.left;
      var day = Math.round(1 + (x - PAD_L * (rect.width / W)) / (plotW * (rect.width / W)) * 27);
      day = Math.max(1, Math.min(28, day));
      setDay(day);
    });
  }

  function setDay(day) {
    currentDay = Math.max(1, Math.min(28, day));
    var label = document.getElementById('hormoneDayLabel');
    if (label) label.textContent = 'Day ' + currentDay;
    var insight = document.getElementById('hormoneInsight');
    if (insight) insight.innerHTML = getInsight(currentDay);
    var svgWrap = document.getElementById('hormoneSvgWrap');
    if (svgWrap) render(svgWrap);
  }

  // Public API
  window.OvulunaHormone = { setDay: setDay, getDay: function() { return currentDay; } };

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Sync with mystical ring if present
  var ringSyncInterval = setInterval(function() {
    if (window.OvulunaRing && typeof window.OvulunaRing.getCurrentDay === 'function') {
      var ringDay = window.OvulunaRing.getCurrentDay();
      if (ringDay !== currentDay) setDay(ringDay);
      clearInterval(ringSyncInterval);
    }
  }, 500);
  setTimeout(function() { clearInterval(ringSyncInterval); }, 5000);
})();
