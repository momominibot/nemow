/* ══════════════════════════════════════════════════════════════
   OVULUNA · Luna the Floating Mascot — Chat Logic
   Self-contained: injects the button + panel, manages chat,
   tracks credits in localStorage, calls /api/chat (Volcengine).
   Include on any page: <link rel="stylesheet" href="luna-chat.css">
                        <script src="luna-chat.js" defer></script>
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Config ── */
  var CONFIG = {
    mascotImg: 'assets/mascot/luna-mascot.png',
    apiEndpoint: '/api/chat',
    model: 'doubao-seed-1-6',
    freeDailyCredits: 10,       // free queries per day
    premiumCredits: 100,         // credits for premium users
    storageKey: 'ovuluna_luna',
    maxMsgLen: 500,
  };

  /* ── System prompt — wellness-appropriate, cited, safe ── */
  var SYSTEM_PROMPT = [
    'You are Luna, a gentle wellness companion in the Ovuluna app for women\'s ovarian health.',
    'You help users understand their cycle, symptoms, ovarian age, nutrition, sleep, stress, and perimenopause.',
    'Rules:',
    '1. You are NOT a doctor. Never diagnose, prescribe, or say "you have X condition." Always say "this may be worth discussing with your clinician."',
    '2. Cite frameworks when relevant: STRAW+10 for reproductive staging, FIGO for cycle norms, SWAN/InterLACE for menopause timing.',
    '3. Keep answers warm, concise, and actionable. Use bullet points for lists.',
    '4. If the user describes severe symptoms (heavy bleeding, severe pain, fever, fainting, suicidal thoughts), immediately advise them to seek urgent medical care.',
    '5. Never ask for or store personal health data beyond what the user types in this chat.',
    '6. Respond in the same language as the user.',
  ].join('\n');

  /* ── State ── */
  var state = {
    open: false,
    messages: [],
    credits: 0,
    lastResetDate: '',
    isPremium: false,
    loading: false,
  };

  /* ── Persistence ── */
  function loadState() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (raw) {
        var saved = JSON.parse(raw);
        state.messages = saved.messages || [];
        state.credits = typeof saved.credits === 'number' ? saved.credits : CONFIG.freeDailyCredits;
        state.lastResetDate = saved.lastResetDate || '';
        state.isPremium = !!saved.isPremium;
      } else {
        state.credits = CONFIG.freeDailyCredits;
      }
    } catch (e) {
      state.credits = CONFIG.freeDailyCredits;
    }
    // Daily reset
    var today = new Date().toDateString();
    if (state.lastResetDate !== today) {
      state.credits = state.isPremium ? CONFIG.premiumCredits : CONFIG.freeDailyCredits;
      state.lastResetDate = today;
      saveState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify({
        messages: state.messages.slice(-20), // keep last 20
        credits: state.credits,
        lastResetDate: state.lastResetDate,
        isPremium: state.isPremium,
      }));
    } catch (e) {}
  }

  /* ── DOM injection ── */
  function inject() {
    // Button
    var btn = document.createElement('button');
    btn.id = 'lunaBtn';
    btn.setAttribute('aria-label', 'Chat with Luna');
    btn.innerHTML = '<img src="' + CONFIG.mascotImg + '" alt="Luna mascot" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'🌙\'"><span class="luna-dot"></span>';
    btn.addEventListener('click', togglePanel);
    document.body.appendChild(btn);

    // Panel
    var panel = document.createElement('div');
    panel.id = 'lunaPanel';
    panel.innerHTML = [
      '<div class="luna-header">',
      '  <img src="' + CONFIG.mascotImg + '" alt="Luna" onerror="this.style.display=\'none\'">',
      '  <div class="luna-info">',
      '    <div class="luna-name">Luna</div>',
      '    <div class="luna-status">Your wellness companion</div>',
      '  </div>',
      '  <button class="luna-close" aria-label="Close">✕</button>',
      '</div>',
      '<div class="luna-credits">',
      '  <span><b id="lunaCreditCount">' + state.credits + '</b> questions left today</span>',
      '  <span class="luna-upgrade" id="lunaUpgrade">Upgrade ✨</span>',
      '</div>',
      '<div class="luna-messages" id="lunaMessages"></div>',
      '<div class="luna-suggestions" id="lunaSuggestions"></div>',
      '<div class="luna-input-row">',
      '  <input type="text" class="luna-input" id="lunaInput" placeholder="Ask Luna about your cycle…" maxlength="' + CONFIG.maxMsgLen + '">',
      '  <button class="luna-send" id="lunaSend" aria-label="Send">➤</button>',
      '</div>',
      '<div class="luna-disclaimer">Luna is a wellness companion, not a doctor. For medical concerns, talk to a clinician.</div>',
    ].join('');
    document.body.appendChild(panel);

    // Tooltip for first visit
    if (!localStorage.getItem('ovuluna_luna_seen')) {
      var tip = document.createElement('div');
      tip.id = 'lunaTooltip';
      tip.textContent = 'Hi! I\'m Luna 🌙 Tap me to ask about your cycle, symptoms, or ovarian health.';
      document.body.appendChild(tip);
      setTimeout(function () { tip.style.opacity = '0'; tip.style.transition = 'opacity 0.5s'; }, 6000);
      setTimeout(function () { if (tip.parentNode) tip.parentNode.removeChild(tip); }, 6600);
      localStorage.setItem('ovuluna_luna_seen', '1');
    }

    // Event listeners
    panel.querySelector('.luna-close').addEventListener('click', togglePanel);
    panel.querySelector('#lunaSend').addEventListener('click', sendMessage);
    panel.querySelector('#lunaInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendMessage();
    });
    panel.querySelector('#lunaUpgrade').addEventListener('click', function () {
      addMessage('bot', '✨ Premium Ovuluna gives you 100 questions per day, trend analysis, and personalized phase coaching. This feature is coming soon — join the waitlist in Settings!');
    });

    // Render initial messages
    renderMessages();
    renderSuggestions();
  }

  /* ── Panel toggle ── */
  function togglePanel() {
    state.open = !state.open;
    var panel = document.getElementById('lunaPanel');
    var btn = document.getElementById('lunaBtn');
    if (state.open) {
      panel.classList.add('open');
      btn.classList.remove('has-msg');
      setTimeout(function () { document.getElementById('lunaInput').focus(); }, 300);
      // Welcome message if empty
      if (state.messages.length === 0) {
        addMessage('bot', 'Hi, I\'m Luna 🌙 Your gentle wellness companion. I can help you understand your cycle, symptoms, ovarian age, nutrition, and perimenopause. What would you like to know?');
      }
    } else {
      panel.classList.remove('open');
    }
  }

  /* ── Messages ── */
  function addMessage(role, text) {
    state.messages.push({ role: role, text: text, ts: Date.now() });
    saveState();
    renderMessages();
  }

  function renderMessages() {
    var container = document.getElementById('lunaMessages');
    if (!container) return;
    container.innerHTML = '';
    state.messages.forEach(function (msg) {
      var el = document.createElement('div');
      el.className = 'luna-msg luna-' + msg.role;
      el.textContent = msg.text;
      container.appendChild(el);
    });
    container.scrollTop = container.scrollHeight;
  }

  function renderTyping() {
    var container = document.getElementById('lunaMessages');
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'luna-typing';
    el.id = 'lunaTyping';
    el.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  function removeTyping() {
    var t = document.getElementById('lunaTyping');
    if (t && t.parentNode) t.parentNode.removeChild(t);
  }

  /* ── Suggestions ── */
  var SUGGESTIONS = [
    'How do I know my cycle phase?',
    'What is ovarian age?',
    'Why am I more tired in my luteal phase?',
    'What helps with hot flashes?',
    'How does stress affect my cycle?',
  ];

  function renderSuggestions() {
    var container = document.getElementById('lunaSuggestions');
    if (!container) return;
    container.innerHTML = '';
    // Show 3 random suggestions
    var shuffled = SUGGESTIONS.slice().sort(function () { return 0.5 - Math.random(); });
    shuffled.slice(0, 3).forEach(function (s) {
      var chip = document.createElement('span');
      chip.className = 'luna-chip';
      chip.textContent = s;
      chip.addEventListener('click', function () {
        document.getElementById('lunaInput').value = s;
        sendMessage();
      });
      container.appendChild(chip);
    });
  }

  /* ── Credits ── */
  function updateCreditsDisplay() {
    var el = document.getElementById('lunaCreditCount');
    if (el) el.textContent = state.credits;
  }

  function useCredit() {
    if (state.credits <= 0) return false;
    state.credits--;
    saveState();
    updateCreditsDisplay();
    return true;
  }

  /* ── Demo mode responses (used when API unavailable, e.g. localhost) ── */
  function getDemoResponse(text) {
    var t = text.toLowerCase();
    if (t.match(/cramp|pain|period|menstrual|dysmenorrhea/)) {
      return 'Cramps happen when prostaglandins make the uterus contract. Try: (1) Warm compress at 40-45°C on lower abdomen for 15-20 min — as effective as ibuprofen in studies. (2) SP6 acupressure: 5 min per leg, 6 sec press + 2 sec rest. (3) Diaphragmatic breathing: 5 min slow breaths. (4) Omega-3 (1-2g/day) reduces pain intensity. Stay warm, avoid cold drinks during your period. This is wellness info, not medical advice — see a clinician for severe pain.';
    }
    if (t.match(/food|eat|diet|nutrition|what.*eat/)) {
      return 'Cycle-aligned eating: Menstrual phase → iron-rich foods (spinach, lentils, red meat), omega-3 (salmon, walnuts), warming ginger tea. Follicular → protein + complex carbs for energy, flaxseeds for estrogen metabolism. Ovulation → antioxidants (berries, colorful veggies), zinc (pumpkin seeds). Luteal → magnesium (dark chocolate, almonds), B6 (salmon, chickpeas), calcium. Avoid excessive sugar and caffeine which can worsen PMS. Every food claim in Ovuluna has an (i) evidence button — tap it to see the clinical source.';
    }
    if (t.match(/sleep|insomnia|tired|fatigue/)) {
      return 'Sleep varies across your cycle: luteal phase (after ovulation) often brings lighter sleep due to progesterone's thermogenic effect (body temp rises 0.3-0.5°C). Tips: (1) Keep bedroom cool (18-20°C). (2) Consistent sleep/wake times. (3) Limit screens 1 hr before bed — blue light suppresses melatonin. (4) Magnesium glycinate 200-400mg may improve sleep quality. (5) Avoid caffeine after 2pm. Aim for 7-9 hours. Track your sleep in the Today section — tap the (i) for evidence.';
    }
    if (t.match(/stress|anxiety|mood|emotional|pms/)) {
      return 'Mood shifts across the cycle are normal — the luteal phase drop in estrogen and progesterone can trigger irritability and anxiety. Evidence-based tools: (1) Diaphragmatic breathing 5 min/day activates parasympathetic nervous system. (2) Regular exercise (150 min/week) reduces PMS mood symptoms. (3) B6 (50-100mg/day) may improve PMS mood. (4) Magnesium (200-400mg) may reduce anxiety. (5) Journaling and social connection. If mood changes significantly affect your life, talk to a clinician — PMDD is a recognized condition that can be treated.';
    }
    if (t.match(/ovarian|age|amh|fertility|reserve/)) {
      return 'Ovarian reserve declines with age — AMH (anti-Müllerian hormone) is one marker, but it doesn\'t predict fertility perfectly. Lifestyle factors that support ovarian health: (1) Don\'t smoke — smoking accelerates ovarian aging by 1-2 years. (2) Maintain healthy BMI — both underweight and obesity affect fertility. (3) Antioxidant-rich diet (vitamin C, E, CoQ10). (4) Limit alcohol. (5) Manage chronic stress. Ovuluna\'s ovarian age estimate combines cycle regularity, lifestyle, and trends — it\'s a wellness estimate, not a medical diagnosis. See a reproductive endocrinologist for fertility concerns.';
    }
    if (t.match(/herb|tea|tcm|traditional/)) {
      return 'Evidence-based herbs for women\'s health: (1) Ginger (500-2000mg/day) reduces menstrual pain — meta-analysis shows significant effect. (2) Cinnamon (1.5g/day) may improve PCOS insulin sensitivity. (3) Peppermint tea may reduce PMS symptoms. (4) Chamomile tea may improve sleep quality. Important: Dong Quai ALONE does NOT reduce hot flashes (null RCT PMID 9418683) — it works in compound formulas like Danggui Buxue Tang. Always check the (i) evidence button on each herb in the Foods page. Consult a qualified TCM practitioner for personalized formulas, especially if pregnant or on medication.';
    }
    if (t.match(/exercise|workout|train|fitness/)) {
      return 'Cycle-aligned exercise: Menstrual → gentle yoga, walking, stretching (your body is recovering). Follicular → HIIT, strength training, running (estrogen rising = more energy, better recovery). Ovulation → moderate cardio, group classes, social activities (peak energy). Luteal → Pilates, yoga, lighter strength, reduce intensity as period approaches (progesterone = higher fatigue, higher body temp). Regular exercise (150 min/week) reduces PMS and dysmenorrhea. Listen to your body — rest is productive too.';
    }
    if (t.match(/hello|hi|hey|who are you|what.*you/)) {
      return 'Hi! I\'m Luna 🌙 — your ovarian health companion. I can help with cycle phases, nutrition, cramps, sleep, stress, herbs, exercise, and ovarian wellness. Everything I share is evidence-based — look for the (i) buttons throughout the app to see clinical citations. I\'m a wellness tool, not a doctor — for medical concerns, please see a qualified clinician. What would you like to explore today?';
    }
    return 'Great question! Here\'s what I can help with: cycle phase guidance, nutrition for each phase, natural cramps relief, sleep optimization, stress management, evidence-based herbs & teas, cycle-aligned exercise, and ovarian health basics. Everything in Ovuluna has (i) evidence buttons — tap them to see clinical studies. I\'m running in demo mode right now (API not connected), but the full app will give you personalized answers. Try asking about cramps, food, sleep, stress, herbs, or exercise!';
  }

  /* ── Send message ── */
  function sendMessage() {
    var input = document.getElementById('lunaInput');
    var text = input.value.trim();
    if (!text || state.loading) return;

    if (!useCredit()) {
      addMessage('error', 'You\'ve used all your free questions for today. Upgrade to Premium for 100 questions per day, or come back tomorrow! ✨');
      return;
    }

    addMessage('user', text);
    input.value = '';
    state.loading = true;
    document.getElementById('lunaSend').disabled = true;
    renderTyping();

    // Detect localhost/demo mode — use canned responses
    var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocal) {
      setTimeout(function () {
        removeTyping();
        addMessage('bot', getDemoResponse(text));
        state.loading = false;
        document.getElementById('lunaSend').disabled = false;
        renderSuggestions();
      }, 800 + Math.random() * 600);
      return;
    }

    // Build conversation history (last 10 messages for context)
    var history = state.messages.slice(-10).map(function (m) {
      return { role: m.role === 'bot' ? 'assistant' : 'user', content: m.text };
    });

    // Call API
    fetch(CONFIG.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONFIG.model,
        system: SYSTEM_PROMPT,
        messages: history,
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('API error ' + res.status);
        return res.json();
      })
      .then(function (data) {
        removeTyping();
        var reply = (data.reply || data.choices?.[0]?.message?.content || '').trim();
        if (!reply) reply = getDemoResponse(text);
        addMessage('bot', reply);
      })
      .catch(function (err) {
        removeTyping();
        console.error('Luna chat error:', err);
        // Refund credit on error
        state.credits++;
        saveState();
        updateCreditsDisplay();
        // Use demo response instead of error
        addMessage('bot', getDemoResponse(text));
      })
      .finally(function () {
        state.loading = false;
        document.getElementById('lunaSend').disabled = false;
        renderSuggestions();
      });
  }

  /* ── Public API (for trend monitoring from other scripts) ── */
  window.OvulunaLuna = {
    ask: function (question, callback) {
      if (!useCredit()) { callback(null, 'No credits left'); return; }
      fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: CONFIG.model, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: question }] }),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) { callback(d.reply || d.choices?.[0]?.message?.content, null); })
        .catch(function (e) { state.credits++; saveState(); callback(null, e.message); });
    },
    getCredits: function () { return state.credits; },
    open: togglePanel,
  };

  /* ── Boot ── */
  function boot() {
    loadState();
    inject();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
