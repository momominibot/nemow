/* ══════════════════════════════════════════════════════════════
   OVULUNA · Onboarding Flow
   Multi-step questionnaire that personalizes the app experience.
   Saves answers to localStorage under 'ovuluna_onboarding'.
   Uses OvarianModel (ovarian-model.js) for ovarian age estimate.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var t = (window.OVULUNA_I18N && window.OVULUNA_I18N.t) || function(s) { return s; };

  var STORAGE_KEY = 'ovuluna_onboarding';
  var answers = {};
  var currentStep = 0;

  /* ── Step definitions ── */
  var steps = [
    {
      id: 'welcome',
      section: 'Welcome',
      type: 'welcome',
      title: 'Your ovarian wellness journey begins here',
      subtitle: 'A few gentle questions to personalize your experience. Takes about 2 minutes.'
    },
    {
      id: 'age',
      section: 'About You',
      type: 'wheel',
      title: 'How old are you?',
      subtitle: 'This helps us tailor guidance to your life stage.',
      field: 'age',
      min: 18, max: 65, default: 28, unit: t('years')
    },
    {
      id: 'height-weight',
      section: 'About You',
      type: 'height-weight',
      title: 'Your height and weight',
      subtitle: 'We use this to set your daily hydration and movement goals.',
      fields: ['heightCm', 'weightKg']
    },
    {
      id: 'cycle-status',
      section: 'Your Cycle',
      type: 'single',
      title: 'How would you describe your cycle?',
      subtitle: 'This helps us understand where you are in your reproductive journey.',
      field: 'cycle',
      options: [
        { value: 'regular', label: 'Regular cycles', desc: 'Predictable 21-35 day cycles' },
        { value: 'variable', label: 'Variable / irregular', desc: 'Cycle length varies by 7+ days' },
        { value: 'newbie', label: 'Just started my period', desc: 'Cycles still regulating (first 2-3 years)' },
        { value: 'skipped', label: 'Skipped periods', desc: 'Occasionally miss periods' },
        { value: 'contraceptive', label: 'On hormonal contraception', desc: 'Pill, IUD, implant, or ring' },
        { value: 'post12', label: 'Post-menopause', desc: 'No period for 12+ months' }
      ]
    },
    {
      id: 'cycle-length',
      section: 'Your Cycle',
      type: 'wheel',
      title: "What's your average cycle length?",
      subtitle: 'From the first day of one period to the first day of the next.',
      field: 'cycleLength',
      min: 21, max: 45, default: 28, unit: t('days'),
      showIf: function(a) { return a.cycle === 'regular' || a.cycle === 'variable'; }
    },
    {
      id: 'last-period',
      section: 'Your Cycle',
      type: 'calendar',
      title: 'When did your last period start?',
      subtitle: 'Tap the date on the calendar.',
      field: 'lastPeriod',
      showIf: function(a) { return a.cycle !== 'post12' && a.cycle !== 'contraceptive'; }
    },
    {
      id: 'first-period-age',
      section: 'Your Cycle',
      type: 'wheel',
      title: 'How old were you when your first period started?',
      subtitle: "This helps us understand your cycle patterns. Optional — skip if you're not sure.",
      field: 'firstPeriodAge',
      min: 8, max: 18, default: 12, unit: t('years'),
      showIf: function(a) { return a.cycle !== 'post12'; }
    },
    {
      id: 'mom-meno',
      section: 'Family History',
      type: 'wheel',
      title: 'At what age did your mother reach menopause?',
      subtitle: 'Family history can give clues about your own menopause journey.',
      field: 'momMeno',
      min: 35, max: 60, default: 51, unit: t('years'),
      optional: true, optionalLabel: "I don't know"
    },
    {
      id: 'smoking',
      section: 'Lifestyle',
      type: 'single',
      title: 'Do you smoke?',
      subtitle: 'Smoking can affect hormone balance and ovarian health.',
      field: 'smoke',
      options: [
        { value: 'never', label: 'Never smoked' },
        { value: 'former', label: 'Former smoker' },
        { value: 'current', label: 'Current smoker' }
      ]
    },
    {
      id: 'sleep',
      section: 'Lifestyle',
      type: 'single',
      title: 'How would you describe your sleep?',
      subtitle: 'Good sleep supports hormone balance and overall wellness.',
      field: 'sleep',
      options: [
        { value: 'good', label: 'Good — 7-9h, consistent' },
        { value: 'normal', label: 'Fair — mostly okay' },
        { value: 'poor', label: 'Poor — trouble sleeping' }
      ]
    },
    {
      id: 'circadian',
      section: 'Lifestyle',
      type: 'single',
      title: 'Do you work night shifts or have irregular sleep hours?',
      subtitle: 'Consistent sleep rhythms support regular cycles and ovarian wellness.',
      field: 'circ',
      options: [
        { value: 'none', label: 'No — regular schedule' },
        { value: 'some', label: 'Occasionally' },
        { value: 'chronic', label: 'Often / night shifts' }
      ]
    },
    {
      id: 'activity',
      section: 'Lifestyle',
      type: 'single',
      title: 'How active are you?',
      subtitle: 'This helps us set movement goals that fit your lifestyle.',
      field: 'activity',
      options: [
        { value: 'sedentary', label: 'Mostly sedentary', desc: 'Little or no exercise' },
        { value: 'light', label: 'Lightly active', desc: 'Light exercise 1-3 days/week' },
        { value: 'moderate', label: 'Moderately active', desc: 'Moderate exercise 3-5 days/week' },
        { value: 'active', label: 'Very active', desc: 'Hard exercise 6-7 days/week' }
      ]
    },
    {
      id: 'goals',
      section: 'Your Goals',
      type: 'multi',
      title: 'What are your main wellness goals?',
      subtitle: "Select all that apply — we'll personalize your journey around what matters to you.",
      field: 'goals',
      options: [
        { value: 'wellness', label: 'Overall wellness' },
        { value: 'cycle', label: 'Cycle tracking' },
        { value: 'education', label: 'Cycle education & body literacy' },
        { value: 'mental', label: 'Mental health & stress' },
        { value: 'sleep', label: 'Sleep optimization' },
        { value: 'movement', label: 'Movement & strength' },
        { value: 'fertility', label: 'Fertility / trying to conceive' },
        { value: 'perimenopause', label: 'Perimenopause support' },
        { value: 'hormones', label: 'Hormone balance' },
        { value: 'longevity', label: 'Ovarian longevity / anti-aging' }
      ],
      minSelect: 1
    },
    {
      id: 'diet',
      section: 'Your Goals',
      type: 'multi',
      title: 'Any dietary preferences?',
      subtitle: "We'll tailor food suggestions to your preferences.",
      field: 'diet',
      options: [
        { value: 'omnivore', label: 'No restrictions' },
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
        { value: 'pescatarian', label: 'Pescatarian' },
        { value: 'gluten-free', label: 'Gluten-free' },
        { value: 'dairy-free', label: 'Dairy-free' }
      ],
      optional: true
    },
    {
      id: 'personalize',
      section: 'Your Profile',
      type: 'personalize',
      title: "We're crafting your personalized experience"
    },
    {
      id: 'cycle-score',
      section: 'Your Cycle Score',
      type: 'cycle-score',
      title: 'Your Cycle Wellness Score',
      subtitle: 'We build your baseline over 3 cycles for the most accurate insights.'
    },
    {
      id: 'done',
      section: 'All Set',
      type: 'done',
      title: 'Welcome to Ovuluna',
      subtitle: 'Your personalized ovarian wellness journey is ready to begin.'
    }
  ];

  /* ── DOM references ── */
  var scrollEl, footEl, backBtn, skipBtn, jsection, jcount, barfill, jdots;

  function init() {
    scrollEl = document.getElementById('scroll');
    footEl = document.getElementById('foot');
    backBtn = document.getElementById('back');
    skipBtn = document.getElementById('skip');
    jsection = document.getElementById('jsection');
    jcount = document.getElementById('jcount');
    barfill = document.getElementById('barfill');
    jdots = document.getElementById('jdots');

    // Load saved answers if any
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) answers = JSON.parse(saved);
    } catch(e) {}

    backBtn.addEventListener('click', goBack);
    skipBtn.addEventListener('click', skipStep);

    renderStep();
  }

  /* ── Get visible steps (filter by showIf) ── */
  function getVisibleSteps() {
    return steps.filter(function(s) {
      if (!s.showIf) return true;
      try { return s.showIf(answers); } catch(e) { return true; }
    });
  }

  /* ── Render current step ── */
  function renderStep() {
    var visible = getVisibleSteps();
    var step = visible[currentStep];
    if (!step) { finish(); return; }

    // Update header
    jsection.textContent = t(step.section) || '';
    jcount.textContent = (currentStep + 1) + ' / ' + visible.length;
    var progress = ((currentStep + 1) / visible.length) * 100;
    barfill.style.width = progress + '%';

    // Back button
    if (currentStep > 0 && step.type !== 'welcome') {
      backBtn.classList.remove('hide');
    } else {
      backBtn.classList.add('hide');
    }

    // Skip button (for optional steps)
    if (step.optional || step.type === 'welcome' || step.type === 'done') {
      skipBtn.classList.add('hide');
    } else if (step.type === 'personalize') {
      skipBtn.classList.add('hide');
    } else {
      skipBtn.classList.remove('hide');
    }

    // Render content based on type
    scrollEl.innerHTML = '';
    switch(step.type) {
      case 'welcome': renderWelcome(step); break;
      case 'wheel': renderWheel(step); break;
      case 'height-weight': renderHeightWeight(step); break;
      case 'single': renderSingle(step); break;
      case 'multi': renderMulti(step); break;
      case 'calendar': renderCalendar(step); break;
      case 'personalize': renderPersonalize(step); break;
      case 'cycle-score': renderCycleScore(step); break;
      case 'done': renderDone(step); break;
    }
  }

  /* ── Welcome step ── */
  function renderWelcome(step) {
    var div = document.createElement('div');
    div.className = 'welcome';
    div.innerHTML =
      '<div class="brandmark"><span class="dot"></span><b>OVULUNA</b></div>' +
      '<img class="hero" src="assets/onboarding/luna.png" alt="Ovuluna" onerror="this.style.display=\'none\'">' +
      '<h1>' + t(step.title) + '</h1>' +
      '<p>' + t(step.subtitle) + '</p>';
    scrollEl.appendChild(div);
    footEl.innerHTML = '<button class="cta" id="nextBtn">' + t('Get Started') + '</button>';
    document.getElementById('nextBtn').addEventListener('click', nextStep);
  }

  /* ── Language step ── */

  function renderWheel(step) {
    var val = answers[step.field] || step.default;
    var div = document.createElement('div');
    div.style.cssText = 'flex:1;display:flex;flex-direction:column;justify-content:center;padding:20px 24px;';
    div.innerHTML =
      '<h1 class="q">' + t(step.title) + '</h1>' +
      '<p class="sub">' + t(step.subtitle) + '</p>' +
      '<div class="wheel">' +
        '<div class="val" id="wheelVal">' + val + '</div>' +
        '<input type="range" min="' + step.min + '" max="' + step.max + '" value="' + val + '" id="wheelInput">' +
      '</div>' +
      (step.optional ? '<button class="gdk" id="dontKnow">' + (step.optionalLabel || "Skip") + '</button>' : '');
    scrollEl.appendChild(div);

    var input = document.getElementById('wheelInput');
    var valEl = document.getElementById('wheelVal');
    input.addEventListener('input', function() {
      valEl.textContent = this.value;
      answers[step.field] = parseInt(this.value);
      saveAnswers();
    });

    if (step.optional) {
      document.getElementById('dontKnow').addEventListener('click', function() {
        answers[step.field] = null;
        saveAnswers();
        nextStep();
      });
    }

    footEl.innerHTML = '<button class="cta" id="nextBtn" disabled>' + t('Continue') + '</button>';
    var nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = false; // wheel always has a default value
    nextBtn.addEventListener('click', nextStep);
  }

  /* ── Height & Weight step (dual metric/imperial) ── */
  function renderHeightWeight(step) {
    var units = answers.units || localStorage.getItem('ovuluna_units') || 'metric';
    var hCm = answers.heightCm || '';
    var wKg = answers.weightKg || '';
    var div = document.createElement('div');
    div.style.cssText = 'flex:1;display:flex;flex-direction:column;justify-content:center;padding:20px 24px;';

    // Wheel picker CSS (injected once)
    if (!document.getElementById('wheelPickerStyle')) {
      var style = document.createElement('style');
      style.id = 'wheelPickerStyle';
      style.textContent =
        '.wheel-wrap{position:relative;height:160px;overflow:hidden;border-radius:16px;background:var(--card);border:1.5px solid var(--line);}' +
        '.wheel-wrap::before{content:"";position:absolute;top:0;left:0;right:0;height:56px;background:linear-gradient(to bottom,var(--card),transparent);pointer-events:none;z-index:2;}' +
        '.wheel-wrap::after{content:"";position:absolute;bottom:0;left:0;right:0;height:56px;background:linear-gradient(to top,var(--card),transparent);pointer-events:none;z-index:2;}' +
        '.wheel-mask{position:absolute;top:50%;left:8px;right:8px;transform:translateY(-50%);height:48px;border-top:1.5px solid var(--mauve);border-bottom:1.5px solid var(--mauve);border-radius:10px;pointer-events:none;z-index:1;opacity:.4;}' +
        '.wheel-scroll{height:100%;overflow-y:scroll;scroll-snap-type:y mandatory;scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}' +
        '.wheel-scroll::-webkit-scrollbar{display:none;}' +
        '.wheel-item{height:48px;display:flex;align-items:center;justify-content:center;scroll-snap-align:center;font:700 18px var(--sans);color:var(--muted);transition:color .15s,transform .15s;}' +
        '.wheel-item.selected{color:var(--ink);font-size:22px;transform:scale(1.05);}' +
        '.wheel-label{font:700 11px var(--sans);color:var(--mauve);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;display:block;text-align:center;}';
      document.head.appendChild(style);
    }

    function buildWheel(id, values, selectedVal, unitLabel) {
      var html = '<span class="wheel-label">' + unitLabel + '</span>';
      html += '<div class="wheel-wrap" id="' + id + 'Wrap"><div class="wheel-mask"></div><div class="wheel-scroll" id="' + id + '">';
      html += '<div class="wheel-item" style="height:56px"></div>';
      values.forEach(function(v) {
        html += '<div class="wheel-item" data-val="' + v + '">' + v + '</div>';
      });
      html += '<div class="wheel-item" style="height:56px"></div>';
      html += '</div></div>';
      return html;
    }

    function initWheel(id, values, selectedVal, onChange) {
      var scroll = document.getElementById(id);
      if (!scroll) return;
      var items = scroll.querySelectorAll('.wheel-item[data-val]');
      var itemHeight = 48;

      function getSelected() {
        var center = scroll.scrollTop + scroll.clientHeight / 2;
        var idx = Math.round((center - 56 - itemHeight / 2) / itemHeight);
        idx = Math.max(0, Math.min(values.length - 1, idx));
        return {idx: idx, val: values[idx]};
      }

      function updateHighlight() {
        var sel = getSelected();
        items.forEach(function(item, i) {
          item.classList.toggle('selected', i === sel.idx);
        });
      }

      var scrollTimeout;
      var isProgrammaticScroll = false;
      scroll.addEventListener('scroll', function() {
        if (isProgrammaticScroll) return;
        updateHighlight();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
          var sel = getSelected();
          if (onChange) onChange(sel.val);
        }, 150);
      });

      // Set initial position
      if (selectedVal !== '' && selectedVal !== undefined) {
        var idx = values.indexOf(parseInt(selectedVal));
        if (idx < 0) idx = values.indexOf(selectedVal);
        if (idx >= 0) {
          setTimeout(function() {
            scroll.scrollTop = 56 + idx * itemHeight;
            updateHighlight();
          }, 50);
        }
      }
    }

    // Generate value ranges
    var cmValues = []; for (var i = 120; i <= 220; i++) cmValues.push(i);
    var kgValues = []; for (var i = 30; i <= 200; i++) kgValues.push(i);
    var ftValues = [4, 5, 6, 7];
    var inValues = []; for (var i = 0; i <= 11; i++) inValues.push(i);
    var lbsValues = []; for (var i = 66; i <= 440; i++) lbsValues.push(i);

    div.innerHTML =
      '<h1 class="q">' + t(step.title) + '</h1>' +
      '<p class="sub">' + t(step.subtitle) + '</p>' +
      '<div style="display:flex;gap:8px;margin-bottom:18px;background:var(--card);border:1.5px solid var(--line);border-radius:12px;padding:4px">' +
        '<button id="unitMetric" style="flex:1;padding:10px;border:none;border-radius:9px;font:700 13px var(--sans);cursor:pointer;transition:.15s;background:' + (units==='metric'?'var(--mauve)':'transparent') + ';color:' + (units==='metric'?'#fff':'var(--muted)') + '">Metric (cm/kg)</button>' +
        '<button id="unitImperial" style="flex:1;padding:10px;border:none;border-radius:9px;font:700 13px var(--sans);cursor:pointer;transition:.15s;background:' + (units==='imperial'?'var(--mauve)':'transparent') + ';color:' + (units==='imperial'?'#fff':'var(--muted)') + '">Imperial (ft/lbs)</button>' +
      '</div>' +
      '<div id="metricInputs" style="display:' + (units==='metric'?'grid':'none') + ';grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">' +
        buildWheel('heightWheel', cmValues, hCm, 'Height (cm)') +
        buildWheel('weightWheel', kgValues, wKg, 'Weight (kg)') +
      '</div>' +
      '<div id="imperialInputs" style="display:' + (units==='imperial'?'grid':'none') + ';grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">' +
        buildWheel('heightFtWheel', ftValues, '', 'ft') +
        buildWheel('heightInWheel', inValues, '', 'in') +
        buildWheel('weightLbsWheel', lbsValues, '', 'lbs') +
      '</div>' +
      '<p style="font:500 12px var(--sans);color:var(--muted);text-align:center">Scroll to select. Used for water goal and activity targets</p>';
    scrollEl.appendChild(div);

    var currentH = hCm || 165;
    var currentW = wKg || 58;
    var currentFt = 5, currentIn = 5, currentLbs = 128;

    if (units === 'imperial' && hCm) {
      var totalIn = Math.round(hCm / 2.54);
      currentFt = Math.floor(totalIn / 12);
      currentIn = totalIn % 12;
    }
    if (units === 'imperial' && wKg) {
      currentLbs = Math.round(wKg * 2.20462);
    }

    function validate() {
      var btn = document.getElementById('nextBtn');
      var currentUnits = document.getElementById('metricInputs').style.display === 'grid' ? 'metric' : 'imperial';
      if (currentUnits === 'metric') {
        if (currentH >= 120 && currentH <= 220 && currentW >= 30 && currentW <= 200) {
          btn.disabled = false;
          answers.heightCm = currentH;
          answers.weightKg = currentW;
          saveAnswers();
        } else {
          btn.disabled = true;
        }
      } else {
        if (currentFt >= 4 && currentFt <= 7 && currentIn >= 0 && currentIn <= 11 && currentLbs >= 66 && currentLbs <= 440) {
          btn.disabled = false;
          answers.heightCm = Math.round((currentFt * 12 + currentIn) * 2.54);
          answers.weightKg = Math.round(currentLbs / 2.20462);
          saveAnswers();
        } else {
          btn.disabled = true;
        }
      }
    }

    setTimeout(function() {
      if (units === 'metric') {
        initWheel('heightWheel', cmValues, currentH, function(v) { currentH = v; validate(); });
        initWheel('weightWheel', kgValues, currentW, function(v) { currentW = v; validate(); });
      } else {
        initWheel('heightFtWheel', ftValues, currentFt, function(v) { currentFt = v; validate(); });
        initWheel('heightInWheel', inValues, currentIn, function(v) { currentIn = v; validate(); });
        initWheel('weightLbsWheel', lbsValues, currentLbs, function(v) { currentLbs = v; validate(); });
      }
    }, 100);

    document.getElementById('unitMetric').addEventListener('click', function() {
      answers.units = 'metric';
      localStorage.setItem('ovuluna_units', 'metric');
      document.getElementById('metricInputs').style.display = 'grid';
      document.getElementById('imperialInputs').style.display = 'none';
      this.style.background = 'var(--mauve)';
      this.style.color = '#fff';
      document.getElementById('unitImperial').style.background = 'transparent';
      document.getElementById('unitImperial').style.color = 'var(--muted)';
      currentH = answers.heightCm || 165;
      currentW = answers.weightKg || 58;
      setTimeout(function() {
        initWheel('heightWheel', cmValues, currentH, function(v) { currentH = v; validate(); });
        initWheel('weightWheel', kgValues, currentW, function(v) { currentW = v; validate(); });
      }, 50);
      validate();
    });

    document.getElementById('unitImperial').addEventListener('click', function() {
      answers.units = 'imperial';
      localStorage.setItem('ovuluna_units', 'imperial');
      document.getElementById('metricInputs').style.display = 'none';
      document.getElementById('imperialInputs').style.display = 'grid';
      this.style.background = 'var(--mauve)';
      this.style.color = '#fff';
      document.getElementById('unitMetric').style.background = 'transparent';
      document.getElementById('unitMetric').style.color = 'var(--muted)';
      if (answers.heightCm) {
        var totalIn = Math.round(answers.heightCm / 2.54);
        currentFt = Math.floor(totalIn / 12);
        currentIn = totalIn % 12;
      }
      if (answers.weightKg) {
        currentLbs = Math.round(answers.weightKg * 2.20462);
      }
      setTimeout(function() {
        initWheel('heightFtWheel', ftValues, currentFt, function(v) { currentFt = v; validate(); });
        initWheel('heightInWheel', inValues, currentIn, function(v) { currentIn = v; validate(); });
        initWheel('weightLbsWheel', lbsValues, currentLbs, function(v) { currentLbs = v; validate(); });
      }, 50);
      validate();
    });

    footEl.innerHTML = '<button class="cta" id="nextBtn" disabled>' + t('Continue') + '</button>';
    document.getElementById('nextBtn').addEventListener('click', nextStep);
    validate();
  }

  /* ── Single choice step ── */
  function renderSingle(step) {
    var div = document.createElement('div');
    div.style.cssText = 'flex:1;display:flex;flex-direction:column;padding:20px 24px;';
    div.innerHTML =
      '<h1 class="q">' + t(step.title) + '</h1>' +
      '<p class="sub">' + t(step.subtitle) + '</p>' +
      '<div id="optList" style="display:flex;flex-direction:column;gap:10px"></div>';
    scrollEl.appendChild(div);

    var list = document.getElementById('optList');
    step.options.forEach(function(opt) {
      var el = document.createElement('div');
      el.className = 'opt' + (answers[step.field] === opt.value ? ' selected' : '');
      el.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border:1.5px solid var(--line);border-radius:14px;cursor:pointer;transition:.15s;background:var(--card)';
      if (answers[step.field] === opt.value) {
        el.style.borderColor = 'var(--sage, #5E9B93)';
        el.style.background = 'var(--sage-tint, #E8EBE2)';
      }
      el.innerHTML =
        '<div style="flex:1;min-width:0">' +
          '<div style="font:700 14px var(--sans);color:var(--ink)">' + t(opt.label) + '</div>' +
          (opt.desc ? '<div style="font:500 12px var(--sans);color:var(--muted);margin-top:2px">' + t(opt.desc) + '</div>' : '') +
        '</div>' +
        '<span class="tick" style="margin-left:auto;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--line);display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
          (answers[step.field] === opt.value ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="var(--sage,#5E9B93)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') +
        '</span>';
      el.addEventListener('click', function() {
        answers[step.field] = opt.value;
        saveAnswers();
        // Update visual
        list.querySelectorAll('.opt').forEach(function(o) {
          o.style.borderColor = 'var(--line)';
          o.style.background = 'var(--card)';
          o.querySelector('.tick').innerHTML = '';
        });
        el.style.borderColor = 'var(--sage, #5E9B93)';
        el.style.background = 'var(--sage-tint, #E8EBE2)';
        el.querySelector('.tick').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="var(--sage,#5E9B93)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        document.getElementById('nextBtn').disabled = false;
      });
      list.appendChild(el);
    });

    footEl.innerHTML = '<button class="cta" id="nextBtn" disabled>' + t('Continue') + '</button>';
    if (answers[step.field]) document.getElementById('nextBtn').disabled = false;
    document.getElementById('nextBtn').addEventListener('click', nextStep);
  }

  /* ── Multi choice step ── */
  function renderMulti(step) {
    var selected = answers[step.field] || [];
    var div = document.createElement('div');
    div.style.cssText = 'flex:1;display:flex;flex-direction:column;padding:20px 24px;';
    div.innerHTML =
      '<h1 class="q">' + t(step.title) + '</h1>' +
      '<p class="sub">' + t(step.subtitle) + '</p>' +
      '<div id="optGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div>';
    scrollEl.appendChild(div);

    var grid = document.getElementById('optGrid');
    step.options.forEach(function(opt) {
      var isSel = selected.indexOf(opt.value) !== -1;
      var el = document.createElement('div');
      el.className = 'gcard' + (isSel ? ' selected' : '');
      el.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 10px;border:1.5px solid var(--line);border-radius:16px;cursor:pointer;transition:.15s;background:var(--card);text-align:center;min-height:120px;justify-content:center';
      if (isSel) {
        el.style.borderColor = 'var(--sage, #5E9B93)';
        el.style.background = 'var(--sage-tint, #E8EBE2)';
      }
      el.innerHTML =
        '<span style="font:600 12.5px var(--sans);color:var(--ink);line-height:1.2">' + t(opt.label) + '</span>';
      el.addEventListener('click', function() {
        var idx = selected.indexOf(opt.value);
        if (idx === -1) {
          selected.push(opt.value);
          el.style.borderColor = 'var(--sage, #5E9B93)';
          el.style.background = 'var(--sage-tint, #E8EBE2)';
        } else {
          selected.splice(idx, 1);
          el.style.borderColor = 'var(--line)';
          el.style.background = 'var(--card)';
        }
        answers[step.field] = selected.slice();
        saveAnswers();
        var min = step.minSelect || 0;
        document.getElementById('nextBtn').disabled = selected.length < min;
      });
      grid.appendChild(el);
    });

    footEl.innerHTML = '<button class="cta" id="nextBtn" ' + (selected.length < (step.minSelect || 0) ? 'disabled' : '') + '>' + t('Continue') + '</button>';
    document.getElementById('nextBtn').addEventListener('click', nextStep);
  }

  /* ── Calendar step ── */
  function renderCalendar(step) {
    var today = new Date();
    var startDate = answers.lastPeriod ? new Date(answers.lastPeriod) : null;
    var periodDays = answers.periodDays || 5;
    var phase = startDate ? 'end' : 'start';
    var div = document.createElement('div');
    div.style.cssText = 'flex:1;display:flex;flex-direction:column;padding:20px 24px;';
    div.innerHTML =
      '<h1 class="q" id="calTitle">' + t(step.title) + '</h1>' +
      '<p class="sub" id="calSub">' + t(step.subtitle) + '</p>' +
      '<div id="durationSection" style="display:none;margin-bottom:14px">' +
        '<p style="font:700 12px var(--sans);color:var(--mauve);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">How many days did it last?</p>' +
        '<div id="durationBtns" style="display:flex;gap:6px;flex-wrap:wrap"></div>' +
      '</div>' +
      '<div class="cal" id="calWidget"></div>';
    scrollEl.appendChild(div);

    var calWidget = document.getElementById('calWidget');
    var month = today.getMonth();
    var year = today.getFullYear();

    function updatePhaseUI() {
      var title = document.getElementById('calTitle');
      var sub = document.getElementById('calSub');
      var durSection = document.getElementById('durationSection');
      if (phase === 'start') {
        title.textContent = t('When did your last period start?');
        sub.textContent = t('Tap the date on the calendar.');
        durSection.style.display = 'none';
      } else {
        title.textContent = t('How long did it last?');
        sub.textContent = t('Your period started on ' + startDate.toLocaleDateString() + '. Select duration below.');
        durSection.style.display = 'block';
      }
    }

    // Build duration buttons
    var durBtns = document.getElementById('durationBtns');
    for (var d = 2; d <= 10; d++) {
      var btn = document.createElement('button');
      btn.textContent = d + (d === 1 ? ' day' : ' days');
      btn.style.cssText = 'padding:8px 14px;border:1.5px solid var(--line);border-radius:99px;background:var(--card);font:600 13px var(--sans);color:var(--ink);cursor:pointer;transition:.15s';
      if (d === periodDays) {
        btn.style.borderColor = 'var(--terra)';
        btn.style.background = 'rgba(212,121,90,.1)';
      }
      btn.addEventListener('click', function() {
        periodDays = parseInt(this.textContent);
        answers.periodDays = periodDays;
        // Calculate end date
        var end = new Date(startDate);
        end.setDate(end.getDate() + periodDays - 1);
        answers.periodEnd = end.toISOString();
        saveAnswers();
        // Update button styles
        durBtns.querySelectorAll('button').forEach(function(b) {
          b.style.borderColor = 'var(--line)';
          b.style.background = 'var(--card)';
        });
        this.style.borderColor = 'var(--terra)';
        this.style.background = 'rgba(212,121,90,.1)';
        document.getElementById('nextBtn').disabled = false;
      });
      durBtns.appendChild(btn);
    }

    function renderMonth() {
      var firstDay = new Date(year, month, 1).getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      var dowNames = ['S','M','T','W','T','F','S'];

      var html = '<div class="cmh">' +
        '<button id="prevMonth" style="border:none;background:none;cursor:pointer;font-size:18px;color:var(--mauve)">‹</button>' +
        '<span>' + monthNames[month] + ' ' + year + '</span>' +
        '<button id="nextMonth" style="border:none;background:none;cursor:pointer;font-size:18px;color:var(--mauve)">›</button>' +
      '</div><div class="cgrid">';
      dowNames.forEach(function(d) { html += '<div class="dow">' + d + '</div>'; });
      for (var i = 0; i < firstDay; i++) html += '<div></div>';
      for (var d = 1; d <= daysInMonth; d++) {
        var dateStr = year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        var isSel = startDate && startDate.toISOString().slice(0,10) === dateStr;
        var isFuture = new Date(year, month, d) > today;
        html += '<button class="day' + (isSel ? ' on' : '') + (isFuture ? ' mut' : '') + '" data-date="' + dateStr + '"' + (isFuture ? ' disabled' : '') + '>' + d + '</button>';
      }
      html += '</div>';
      calWidget.innerHTML = html;

      document.getElementById('prevMonth').addEventListener('click', function() {
        month--; if (month < 0) { month = 11; year--; }
        renderMonth();
      });
      document.getElementById('nextMonth').addEventListener('click', function() {
        month++; if (month > 11) { month = 0; year++; }
        renderMonth();
      });
      calWidget.querySelectorAll('.day:not(.mut)').forEach(function(btn) {
        btn.addEventListener('click', function() {
          startDate = new Date(this.dataset.date);
          answers.lastPeriod = startDate.toISOString();
          // Default end date = start + 4 days (5 day period)
          var end = new Date(startDate);
          end.setDate(end.getDate() + periodDays - 1);
          answers.periodEnd = end.toISOString();
          answers.periodDays = periodDays;
          saveAnswers();
          calWidget.querySelectorAll('.day').forEach(function(d) { d.classList.remove('on'); });
          this.classList.add('on');
          // Move to duration phase
          phase = 'end';
          updatePhaseUI();
          document.getElementById('nextBtn').disabled = false;
        });
      });
    }
    renderMonth();
    updatePhaseUI();

    footEl.innerHTML = '<button class="cta" id="nextBtn" ' + (startDate ? '' : 'disabled') + '>' + t('Continue') + '</button>';
    document.getElementById('nextBtn').addEventListener('click', nextStep);
  }

  /* ── Personalize / loading step ── */
  function renderPersonalize(step) {
    var div = document.createElement('div');
    div.className = 'pers';
    div.innerHTML =
      '<div class="pers-orb">' +
        '<img src="assets/onboarding/luna.png" alt="" onerror="this.style.display=\'none\'">' +
        '<div class="sparkles">' +
          '<i style="--s:8px;--d:2s;--t:0s;left:20%;top:15%"></i>' +
          '<i style="--s:12px;--d:2.8s;--t:.5s;left:75%;top:25%"></i>' +
          '<i style="--s:6px;--d:2.2s;--t:1s;left:85%;top:60%"></i>' +
          '<i style="--s:10px;--d:3s;--t:1.5s;left:15%;top:70%"></i>' +
          '<i style="--s:8px;--d:2.5s;--t:.8s;left:50%;top:10%"></i>' +
        '</div>' +
      '</div>' +
      '<h2 id="persTitle">Analyzing your profile…</h2>' +
      '<div class="plist">' +
        '<div class="pl" id="pl1"><span class="pc">✓</span> Cycle context</div>' +
        '<div class="pl" id="pl2"><span class="pc">✓</span> Lifestyle factors</div>' +
        '<div class="pl" id="pl3"><span class="pc">✓</span> Ovarian wellness stage</div>' +
        '<div class="pl" id="pl4"><span class="pc">✓</span> Personalized recommendations</div>' +
      '</div>';
    scrollEl.appendChild(div);
    footEl.innerHTML = '';

    // Animate checklist
    var items = ['pl1','pl2','pl3','pl4'];
    var titles = ['Analyzing your profile…', 'Mapping your cycle…', 'Calculating wellness stage…', 'Curating recommendations…', 'Almost ready…'];
    var i = 0;
    var interval = setInterval(function() {
      if (i < items.length) {
        document.getElementById(items[i]).classList.add('done');
        if (i < titles.length) document.getElementById('persTitle').textContent = titles[i+1] || titles[titles.length-1];
        i++;
      } else {
        clearInterval(interval);
        setTimeout(nextStep, 600);
      }
    }, 500);
  }

  /* ── Done step ── */
  function renderCycleScore(step) {
    var div = document.createElement('div');
    div.className = 'cscore';
    div.innerHTML =
      '<div class="cs-orb">' +
        '<div class="cs-moon"></div>' +
        '<div class="sparkles">' +
          '<i style="--s:8px;--d:2s;--t:0s;left:20%;top:15%"></i>' +
          '<i style="--s:12px;--d:2.8s;--t:.5s;left:75%;top:25%"></i>' +
          '<i style="--s:6px;--d:2.2s;--t:1s;left:85%;top:60%"></i>' +
          '<i style="--s:10px;--d:3s;--t:1.5s;left:15%;top:70%"></i>' +
        '</div>' +
      '</div>' +
      '<h2 style="font-family:var(--serif);font-size:24px;color:var(--ink);text-align:center;margin:16px 0 8px">Your Cycle Wellness Score</h2>' +
      '<p style="font:500 13px var(--sans);color:var(--muted);text-align:center;line-height:1.6;margin:0 0 24px">We need 3 cycles of data to build your personal baseline. The more you log, the smarter your insights become.</p>' +
      '<div class="cs-cycles">' +
        '<div class="cs-cycle cs-active">' +
          '<div class="cs-circle">1</div>' +
          '<div class="cs-label">Cycle 1</div>' +
          '<div class="cs-sub">Start logging</div>' +
        '</div>' +
        '<div class="cs-line"></div>' +
        '<div class="cs-cycle">' +
          '<div class="cs-circle">2</div>' +
          '<div class="cs-label">Cycle 2</div>' +
          '<div class="cs-sub">Patterns emerge</div>' +
        '</div>' +
        '<div class="cs-line"></div>' +
        '<div class="cs-cycle">' +
          '<div class="cs-circle">3</div>' +
          '<div class="cs-label">Cycle 3</div>' +
          '<div class="cs-sub">Score unlocked</div>' +
        '</div>' +
      '</div>' +
      '<div class="cs-metrics">' +
        '<div class="cs-metric"><span class="cs-mic">📊</span><div><b>Cycle regularity</b><span>Variance in cycle length</span></div></div>' +
        '<div class="cs-metric"><span class="cs-mic">📅</span><div><b>Cycle & period length</b><span>Within healthy ranges</span></div></div>' +
        '<div class="cs-metric"><span class="cs-mic">🌡️</span><div><b>Ovulation confirmation</b><span>BBT or symptom tracking</span></div></div>' +
        '<div class="cs-metric"><span class="cs-mic">💜</span><div><b>Symptom burden</b><span>Cramps, mood, energy</span></div></div>' +
      '</div>' +
      '<div class="cs-note">Your score updates after each completed cycle. Export it anytime to share with your healthcare provider.</div>' +
      '<button class="cs-backfill" id="csBackfill">Have past cycles? Add them now</button>';
    scrollEl.appendChild(div);
    footEl.innerHTML = '';

    // Backfill button opens cycle entry
    var bfBtn = document.getElementById('csBackfill');
    if (bfBtn) {
      bfBtn.addEventListener('click', function() {
        openBackfillModal();
      });
    }
  }


  function dayOptions() {
    var s = '';
    for (var i = 1; i <= 31; i++) s += '<option value="' + String(i).padStart(2,'0') + '">' + String(i).padStart(2,'0') + '</option>';
    return s;
  }
  function monthOptions() {
    var s = '';
    for (var i = 1; i <= 12; i++) s += '<option value="' + String(i).padStart(2,'0') + '">' + String(i).padStart(2,'0') + '</option>';
    return s;
  }
  function yearOptions() {
    var s = '';
    var cy = new Date().getFullYear();
    for (var y = cy; y >= cy - 5; y--) s += '<option value="' + y + '">' + String(y).slice(-2) + '</option>';
    return s;
  }

  function openBackfillModal() {
    // Remove existing modal
    var existing = document.getElementById('bfModal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'bfModal';
    modal.className = 'bf-modal';
    modal.innerHTML =
      '<div class="bf-overlay"></div>' +
      '<div class="bf-card">' +
        '<div class="bf-head">' +
          '<h3>Add Past Cycles</h3>' +
          '<p>Enter the start date of your last 3 cycles to unlock your score immediately.</p>' +
          '<button class="bf-close" id="bfClose">&times;</button>' +
        '</div>' +
        '<div class="bf-cycles">' +
          '<div class="bf-cycle">' +
            '<label>Cycle 1 (most recent)</label>' +
            '<div class="bf-ddmmyy">' +
              '<select id="bfDay1" class="bf-dd"><option value="">DD</option>' + dayOptions() + '</select>' +
              '<span class="bf-sep">/</span>' +
              '<select id="bfMonth1" class="bf-mm"><option value="">MM</option>' + monthOptions() + '</select>' +
              '<span class="bf-sep">/</span>' +
              '<select id="bfYear1" class="bf-yy"><option value="">YY</option>' + yearOptions() + '</select>' +
            '</div>' +
          '</div>' +
          '<div class="bf-cycle">' +
            '<label>Cycle 2</label>' +
            '<div class="bf-ddmmyy">' +
              '<select id="bfDay2" class="bf-dd"><option value="">DD</option>' + dayOptions() + '</select>' +
              '<span class="bf-sep">/</span>' +
              '<select id="bfMonth2" class="bf-mm"><option value="">MM</option>' + monthOptions() + '</select>' +
              '<span class="bf-sep">/</span>' +
              '<select id="bfYear2" class="bf-yy"><option value="">YY</option>' + yearOptions() + '</select>' +
            '</div>' +
          '</div>' +
          '<div class="bf-cycle">' +
            '<label>Cycle 3 (oldest)</label>' +
            '<div class="bf-ddmmyy">' +
              '<select id="bfDay3" class="bf-dd"><option value="">DD</option>' + dayOptions() + '</select>' +
              '<span class="bf-sep">/</span>' +
              '<select id="bfMonth3" class="bf-mm"><option value="">MM</option>' + monthOptions() + '</select>' +
              '<span class="bf-sep">/</span>' +
              '<select id="bfYear3" class="bf-yy"><option value="">YY</option>' + yearOptions() + '</select>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="bf-actions">' +
          '<button class="bf-skip" id="bfSkip">Skip for now</button>' +
          '<button class="bf-save" id="bfSave">Save cycles</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    // Close handlers
    document.getElementById('bfClose').addEventListener('click', closeBackfill);
    document.getElementById('bfSkip').addEventListener('click', closeBackfill);
    document.querySelector('.bf-overlay').addEventListener('click', closeBackfill);

    // Save handler
    document.getElementById('bfSave').addEventListener('click', function() {
      function getDate(n) {
        var d = document.getElementById('bfDay' + n).value;
        var m = document.getElementById('bfMonth' + n).value;
        var y = document.getElementById('bfYear' + n).value;
        if (d && m && y) return y + '-' + m.padStart(2,'0') + '-' + d.padStart(2,'0');
        return '';
      }
      var d1 = getDate(1);
      var d2 = getDate(2);
      var d3 = getDate(3);
      var cycles = [];
      if (d1) cycles.push({ start: d1, end: null, source: 'backfill' });
      if (d2) cycles.push({ start: d2, end: null, source: 'backfill' });
      if (d3) cycles.push({ start: d3, end: null, source: 'backfill' });
      if (cycles.length > 0) {
        try {
          localStorage.setItem('ovuluna_cycles', JSON.stringify(cycles));
        } catch(e) {}
      }
      closeBackfill();
      // Update the cycle score visual
      updateCycleScoreVisual(cycles.length);
    });
  }

  function closeBackfill() {
    var modal = document.getElementById('bfModal');
    if (modal) modal.remove();
  }

  function updateCycleScoreVisual(count) {
    var circles = document.querySelectorAll('.cs-circle');
    var labels = document.querySelectorAll('.cs-sub');
    for (var i = 0; i < circles.length; i++) {
      if (i < count) {
        circles[i].parentElement.classList.add('cs-active');
        if (labels[i]) labels[i].textContent = 'Logged';
      }
    }
  }

  function renderDone(step) {
    // Compute ovarian age estimate if possible (adults only)
    var ovInfo = '';

    if (false) {
      // Disabled: teen persona removed (18+ only)
      ovInfo = '<div style="background:linear-gradient(135deg,#E8E0F5,#F5E6E0);border-radius:16px;padding:20px;margin:16px 0;text-align:center">' +
        '<div style="font:700 11px var(--sans);color:var(--mauve);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Your Cycle Journey</div>' +
        '<div style="font-family:var(--serif);font-size:22px;color:var(--ink);margin:4px 0 8px">Your body is still finding its rhythm</div>' +
        '<div style="font:500 12px var(--sans);color:var(--muted);line-height:1.5">Irregular cycles are completely normal in the first 2-3 years after your first period. We\'ll help you learn what\'s normal for <i>your</i> body.</div>' +
      '</div>';
    } else {
      try {
        if (window.OvarianModel && answers.age) {
          var result = window.OvarianModel.computeOvarianAge({
            age: answers.age,
            amh: null,
            momMeno: answers.momMeno || null,
            smoke: answers.smoke || 'never',
            cycle: answers.cycle || 'regular',
            circ: answers.circ || 'none',
            sleep: answers.sleep || 'normal'
          });
          if (result && result.ovAge) {
            // Save ovarian age estimate for home page display
            try {
              localStorage.setItem('ovuluna_ovarian_age', JSON.stringify({
                ovAge: result.ovAge,
                chrono: result.chrono,
                delta: result.delta,
                straw: result.straw,
                ttm: result.ttm,
                calculatedAt: new Date().toISOString()
              }));
            } catch(e) {}
            ovInfo = '<div style="background:var(--sage-tint,#E8EBE2);border-radius:16px;padding:16px;margin:16px 0;text-align:center">' +
              '<div style="font:700 11px var(--sans);color:var(--sage,#5E9B93);text-transform:uppercase;letter-spacing:.06em">Estimated Ovarian Age</div>' +
              '<div style="font-family:var(--serif);font-size:36px;color:var(--mauve);margin:4px 0">' + result.ovAge + '</div>' +
              '<div style="font:500 11px var(--sans);color:var(--muted)">Chronological: ' + result.chrono + ' · ' + result.straw.name + '</div>' +
              '<div style="font:500 10px var(--sans);color:var(--muted);margin-top:6px;font-style:italic">Wellness estimate only — not a medical diagnosis</div>' +
            '</div>';
          }
        }
      } catch(e) {}
    }

    var minorNote = isTeen ? '<p style="font:500 11px var(--sans);color:var(--muted);font-style:italic;margin-top:8px">We recommend sharing this app with a trusted adult or guardian. Your data stays on your device.</p>' : '';

    var div = document.createElement('div');
    div.className = 'welcome';
    div.innerHTML =
      '<div class="brandmark"><span class="dot"></span><b>OVULUNA</b></div>' +
      '<img class="hero" src="assets/onboarding/luna.png" alt="" onerror="this.style.display=\'none\'">' +
      '<h1>' + t(step.title) + '</h1>' +
      '<p>' + step.subtitle + '</p>' +
      ovInfo +
      minorNote +
      '<p class="disc">Your data stays on your device — we never collect or store it. Ovuluna is a wellness tool, not a medical device. You can export a summary to share with your healthcare provider.</p>';
    scrollEl.appendChild(div);
    footEl.innerHTML = '<button class="cta coral" id="enterBtn">Enter Ovuluna</button>';
    document.getElementById('enterBtn').addEventListener('click', function() {
      answers.completed = true;
      answers.completedAt = new Date().toISOString();
      saveAnswers();
      window.location.href = 'home.html';
    });
  }

  /* ── Navigation ── */
  function nextStep() {
    var visible = getVisibleSteps();
    currentStep++;
    if (currentStep >= visible.length) {
      finish();
    } else {
      renderStep();
      scrollEl.scrollTop = 0;
    }
  }

  function goBack() {
    if (currentStep > 0) {
      currentStep--;
      renderStep();
      scrollEl.scrollTop = 0;
    }
  }

  function skipStep() {
    var visible = getVisibleSteps();
    var step = visible[currentStep];
    if (step && step.field) {
      answers[step.field] = null;
      saveAnswers();
    }
    nextStep();
  }

  function finish() {
    answers.completed = true;
    answers.completedAt = new Date().toISOString();
    saveAnswers();
    window.location.href = 'home.html';
  }

  /* ── Persistence ── */
  function saveAnswers() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch(e) {}
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
