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
        var reply = (data.reply || data.choices?.[0]?.message?.content || 'I\'m here to help — could you rephrase that?').trim();
        addMessage('bot', reply);
      })
      .catch(function (err) {
        removeTyping();
        console.error('Luna chat error:', err);
        // Refund credit on error
        state.credits++;
        saveState();
        updateCreditsDisplay();
        addMessage('error', 'Sorry, I couldn\'t reach the AI service right now. Your credit has been refunded. Please try again in a moment.');
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
