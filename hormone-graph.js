// Hormone Cycle Graph — Phase-based bar charts
(function() {
  // Hormone data per phase (percentage of peak, 0-100)
  const phaseData = {
    menstrual: {
      days: 'Day 1-5',
      hormones: {
        estrogen: { value: 15, label: 'Low' },
        progesterone: { value: 5, label: 'Very low' },
        lh: { value: 10, label: 'Low' },
        fsh: { value: 45, label: 'Rising' }
      },
      insight: '<b>Menstrual phase:</b> Estrogen and progesterone are at their lowest. FSH rises to recruit new follicles. Energy may be low — prioritize rest, iron-rich foods, and gentle movement.'
    },
    follicular: {
      days: 'Day 6-13',
      hormones: {
        estrogen: { value: 65, label: 'Rising' },
        progesterone: { value: 8, label: 'Low' },
        lh: { value: 20, label: 'Building' },
        fsh: { value: 30, label: 'Moderate' }
      },
      insight: '<b>Follicular phase:</b> Estrogen climbs steadily, boosting energy, mood, and collagen production. This is your "growth" phase — great for new projects, socializing, and higher-intensity workouts.'
    },
    ovulation: {
      days: 'Day 14',
      hormones: {
        estrogen: { value: 100, label: 'Peak' },
        progesterone: { value: 25, label: 'Starting' },
        lh: { value: 100, label: 'Surge!' },
        fsh: { value: 35, label: 'Moderate' }
      },
      insight: '<b>Ovulation:</b> LH surge triggers egg release. Estrogen peaks — you may feel radiant, energetic, and socially confident. Libido is typically highest. Stay hydrated and support liver detox of excess estrogen.'
    },
    luteal: {
      days: 'Day 15-28',
      hormones: {
        estrogen: { value: 55, label: 'Secondary peak' },
        progesterone: { value: 100, label: 'Dominant' },
        lh: { value: 8, label: 'Low' },
        fsh: { value: 12, label: 'Low' }
      },
      insight: '<b>Luteal phase:</b> Progesterone dominates — calming but can cause fatigue, bloating, and mood shifts. Estrogen has a secondary mid-luteal peak. Prioritize magnesium, B6, sleep, and stress management.'
    }
  };

  const hormoneMeta = {
    estrogen: { short: 'E2', full: 'Estrogen', color: '#9b7fc4' },
    progesterone: { short: 'P4', full: 'Progesterone', color: '#e8a898' },
    lh: { short: 'LH', full: 'Luteinizing', color: '#8ab87e' },
    fsh: { short: 'FSH', full: 'Follicle-stim', color: '#7ba8c8' }
  };

  let currentPhase = 'follicular';

  function renderBars(phase) {
    const data = phaseData[phase];
    const container = document.getElementById('hormoneBars');
    if (!container) return;

    container.innerHTML = '';
    Object.keys(data.hormones).forEach(key => {
      const h = data.hormones[key];
      const meta = hormoneMeta[key];
      const col = document.createElement('div');
      col.className = 'hormone-bar-col';
      col.innerHTML = `
        <div class="hormone-bar-value">${h.label}</div>
        <div class="hormone-bar-track">
          <div class="hormone-bar-fill ${key}" style="height:0%"></div>
        </div>
        <div class="hormone-bar-label">${meta.short}
          <span class="full-name">${meta.full}</span>
        </div>
      `;
      container.appendChild(col);
      // Animate bar height
      setTimeout(() => {
        col.querySelector('.hormone-bar-fill').style.height = h.value + '%';
      }, 50);
    });

    // Update insight
    const insight = document.getElementById('hormoneInsight');
    if (insight) insight.innerHTML = data.insight;

    // Update day label
    const dayLabel = document.getElementById('hormoneDayLabel');
    if (dayLabel) dayLabel.textContent = data.days;

    // Update active tab
    document.querySelectorAll('.hormone-phase-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.phase === phase);
    });
  }

  function setPhase(phase) {
    if (!phaseData[phase]) return;
    currentPhase = phase;
    renderBars(phase);
  }

  // Day → phase mapping
  function dayToPhase(day) {
    if (day <= 5) return 'menstrual';
    if (day <= 13) return 'follicular';
    if (day === 14) return 'ovulation';
    return 'luteal';
  }

  // Public API for ring sync
  window.OvulunaHormone = {
    setDay: function(day) {
      setPhase(dayToPhase(day));
    },
    setPhase: setPhase
  };

  // Init
  document.addEventListener('DOMContentLoaded', function() {
    const card = document.getElementById('hormoneGraphCard');
    if (!card) return;

    // Build HTML structure
    card.innerHTML = `
      <div class="hormone-header">
        <div class="hormone-title">🌙 Hormone Cycle</div>
        <div class="hormone-day-label" id="hormoneDayLabel">Day 6-13</div>
      </div>
      <div class="hormone-phases" id="hormonePhases"></div>
      <div class="hormone-bars" id="hormoneBars"></div>
      <div class="hormone-insight" id="hormoneInsight"></div>
    `;

    // Build phase tabs
    const tabsContainer = document.getElementById('hormonePhases');
    if (tabsContainer) {
      Object.keys(phaseData).forEach(key => {
        const tab = document.createElement('div');
        tab.className = 'hormone-phase-tab' + (key === currentPhase ? ' active' : '');
        tab.dataset.phase = key;
        const names = { menstrual: 'Menstrual', follicular: 'Follicular', ovulation: 'Ovulation', luteal: 'Luteal' };
        tab.innerHTML = `${names[key]}<span class="phase-days">${phaseData[key].days}</span>`;
        tab.addEventListener('click', () => setPhase(key));
        tabsContainer.appendChild(tab);
      });
    }
    renderBars(currentPhase);
  });
})();
