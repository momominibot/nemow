/* ══════════════════════════════════════════════════════════════
   OVULUNA · Global Error Logger + User Feedback
   - Catches all uncaught JS errors automatically
   - Lets users submit bug reports / feedback
   - Stores in localStorage (ready to sync to Supabase later)
   - Include on every page: <script src="error-logger.js" defer></script>
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var STORAGE_KEY = 'ovuluna_error_log';
  var FEEDBACK_KEY = 'ovuluna_feedback';
  var MAX_ERRORS = 100;
  var MAX_FEEDBACK = 200;

  /* ── Error storage ── */
  function loadErrors() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) { return []; }
  }

  function saveErrors(errors) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(errors.slice(-MAX_ERRORS)));
    } catch (e) {}
  }

  function logError(type, message, source, line, col, stack) {
    var errors = loadErrors();
    errors.push({
      type: type,
      message: message ? String(message).substring(0, 500) : '',
      source: source ? String(source).substring(0, 200) : '',
      line: line || 0,
      col: col || 0,
      stack: stack ? String(stack).substring(0, 1000) : '',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      timeReadable: new Date().toLocaleString()
    });
    saveErrors(errors);
  }

  /* ── Auto-catch uncaught errors ── */
  window.addEventListener('error', function (e) {
    logError('uncaught', e.message, e.filename, e.lineno, e.colno, e.error && e.error.stack);
  });

  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason;
    var msg = reason ? (reason.message || String(reason)) : 'Unknown promise rejection';
    var stack = reason && reason.stack ? reason.stack : '';
    logError('unhandled-promise', msg, '', 0, 0, stack);
  });

  /* ── Feedback storage ── */
  function loadFeedback() {
    try {
      return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
    } catch (e) { return []; }
  }

  function saveFeedback(items) {
    try {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(items.slice(-MAX_FEEDBACK)));
    } catch (e) {}
  }

  window.ovulunaSubmitFeedback = function (category, message, contact) {
    if (!message || !message.trim()) return false;
    var items = loadFeedback();
    items.push({
      category: category || 'general',
      message: String(message).substring(0, 2000),
      contact: contact ? String(contact).substring(0, 200) : '',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      timeReadable: new Date().toLocaleString(),
      status: 'new'
    });
    saveFeedback(items);
    return true;
  };

  window.ovulunaGetErrors = function () { return loadErrors(); };
  window.ovulunaGetFeedback = function () { return loadFeedback(); };
  window.ovulunaClearErrors = function () { localStorage.removeItem(STORAGE_KEY); };
  window.ovulunaClearFeedback = function () { localStorage.removeItem(FEEDBACK_KEY); };

  /* ── Floating feedback button (injected on every page) ── */
  function injectFeedbackButton() {
    // Don't inject on admin/debug pages
    if (document.body.classList.contains('no-feedback-btn')) return;

    var btn = document.createElement('button');
    btn.id = 'ovuluna-feedback-btn';
    btn.setAttribute('aria-label', 'Report a bug or send feedback');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    btn.style.cssText = 'position:fixed;bottom:90px;right:16px;z-index:9999;width:44px;height:44px;border-radius:50%;background:var(--mauve,#8b6c82);color:#fff;border:none;box-shadow:0 4px 16px rgba(139,108,130,.4);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s;';
    btn.onmouseenter = function () { btn.style.transform = 'scale(1.1)'; };
    btn.onmouseleave = function () { btn.style.transform = 'scale(1)'; };
    btn.onclick = openFeedbackModal;
    document.body.appendChild(btn);
  }

  function openFeedbackModal() {
    // Remove existing modal if any
    var existing = document.getElementById('ovuluna-feedback-modal');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'ovuluna-feedback-modal';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };

    var card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:20px;padding:24px;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3);';
    card.onclick = function (e) { e.stopPropagation(); };

    card.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
        '<h3 style="margin:0;font-family:Newsreader,serif;font-size:20px;font-weight:600;color:#2d2328">Send Feedback</h3>' +
        '<button id="ovuluna-fb-close" style="background:none;border:none;font-size:22px;cursor:pointer;color:#888;line-height:1;padding:0 4px">&times;</button>' +
      '</div>' +
      '<div style="margin-bottom:12px">' +
        '<label style="display:block;font-size:12px;font-weight:700;color:#666;margin-bottom:6px;letter-spacing:.04em">CATEGORY</label>' +
        '<select id="ovuluna-fb-category" style="width:100%;padding:10px 12px;border:1.5px solid #e0d8e0;border-radius:10px;font-size:14px;font-family:Manrope,sans-serif;background:#fff;color:#333">' +
          '<option value="bug">Bug / Something broken</option>' +
          '<option value="ui">Design / alignment issue</option>' +
          '<option value="feature">Feature request</option>' +
          '<option value="content">Content / text issue</option>' +
          '<option value="general">General feedback</option>' +
        '</select>' +
      '</div>' +
      '<div style="margin-bottom:12px">' +
        '<label style="display:block;font-size:12px;font-weight:700;color:#666;margin-bottom:6px;letter-spacing:.04em">WHAT HAPPENED?</label>' +
        '<textarea id="ovuluna-fb-message" rows="4" placeholder="Describe what you saw, what you expected, and how to reproduce it..." style="width:100%;padding:10px 12px;border:1.5px solid #e0d8e0;border-radius:10px;font-size:14px;font-family:Manrope,sans-serif;resize:vertical;min-height:80px;color:#333"></textarea>' +
      '</div>' +
      '<div style="margin-bottom:16px">' +
        '<label style="display:block;font-size:12px;font-weight:700;color:#666;margin-bottom:6px;letter-spacing:.04em">EMAIL (optional, so we can follow up)</label>' +
        '<input type="email" id="ovuluna-fb-contact" placeholder="you@example.com" style="width:100%;padding:10px 12px;border:1.5px solid #e0d8e0;border-radius:10px;font-size:14px;font-family:Manrope,sans-serif;color:#333">' +
      '</div>' +
      '<div style="font-size:11px;color:#999;margin-bottom:14px;line-height:1.4">Your feedback is stored on this device only. Nothing is sent to a server. We will review it in the admin dashboard.</div>' +
      '<button id="ovuluna-fb-submit" style="width:100%;padding:13px;background:#8b6c82;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;font-family:Manrope,sans-serif;cursor:pointer">Submit Feedback</button>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    document.getElementById('ovuluna-fb-close').onclick = function () { overlay.remove(); };
    document.getElementById('ovuluna-fb-submit').onclick = function () {
      var cat = document.getElementById('ovuluna-fb-category').value;
      var msg = document.getElementById('ovuluna-fb-message').value.trim();
      var contact = document.getElementById('ovuluna-fb-contact').value.trim();
      if (!msg) {
        document.getElementById('ovuluna-fb-message').style.borderColor = '#e4572e';
        return;
      }
      var ok = window.ovulunaSubmitFeedback(cat, msg, contact);
      if (ok) {
        card.innerHTML = '<div style="text-align:center;padding:20px 0">' +
          '<div style="font-size:40px;margin-bottom:12px">&#10003;</div>' +
          '<h3 style="margin:0 0 8px;font-family:Newsreader,serif;font-size:20px;color:#2d2328">Thank you!</h3>' +
          '<p style="margin:0;color:#666;font-size:14px;line-height:1.5">Your feedback has been saved. We review every report and will fix issues in the next update.</p>' +
          '<button id="ovuluna-fb-done" style="margin-top:16px;padding:10px 28px;background:#8b6c82;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">Close</button>' +
          '</div>';
        document.getElementById('ovuluna-fb-done').onclick = function () { overlay.remove(); };
      }
    };
  }

  // Inject after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFeedbackButton);
  } else {
    injectFeedbackButton();
  }

})();
