/* ══════════════════════════════════════════════════════════════
   OVULUNA · Clinical Evidence (i) Popup — Logic
   Listens for taps on .qi[data-evidence] elements,
   opens a bottom sheet with the matching EVIDENCE_DB entry.
   Depends on: evidence-db.js (loaded before this)
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var LEVEL_LABELS = {
    strong: 'Strong evidence',
    moderate: 'Moderate evidence',
    weak: 'Emerging evidence',
    consensus: 'Clinical consensus'
  };

  var sheetEl = null;
  var backdropEl = null;
  var currentKey = null;

  /* ── Build DOM once ── */
  function ensureSheet() {
    if (sheetEl) return;

    backdropEl = document.createElement('div');
    backdropEl.className = 'qi-backdrop';
    backdropEl.addEventListener('click', closeSheet);

    sheetEl = document.createElement('div');
    sheetEl.className = 'qi-sheet';
    sheetEl.setAttribute('role', 'dialog');
    sheetEl.setAttribute('aria-modal', 'true');
    sheetEl.innerHTML =
      '<div class="qi-handle"></div>' +
      '<div class="qi-header">' +
        '<div class="qi-icon">i</div>' +
        '<div class="qi-title" id="qiTitle">Clinical Evidence</div>' +
        '<button class="qi-close" id="qiClose" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="qi-body" id="qiBody"></div>';

    document.body.appendChild(backdropEl);
    document.body.appendChild(sheetEl);

    document.getElementById('qiClose').addEventListener('click', closeSheet);

    // swipe down to close
    var startY = 0, currentY = 0, dragging = false;
    sheetEl.addEventListener('touchstart', function (e) {
      if (sheetEl.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      dragging = true;
    }, { passive: true });
    sheetEl.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      currentY = e.touches[0].clientY;
      var dy = currentY - startY;
      if (dy > 0) {
        sheetEl.style.transition = 'none';
        sheetEl.style.transform = 'translateX(-50%) translateY(' + dy + 'px)';
      }
    }, { passive: true });
    sheetEl.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      sheetEl.style.transition = '';
      sheetEl.style.transform = '';
      if (currentY - startY > 100) closeSheet();
    });
  }

  /* ── Open sheet for a key ── */
  function openSheet(key) {
    ensureSheet();
    var entry = (window.EVIDENCE_DB || {})[key];
    if (!entry) {
      console.warn('[evidence] No entry for key:', key);
      return;
    }
    currentKey = key;

    var titleEl = document.getElementById('qiTitle');
    var bodyEl = document.getElementById('qiBody');

    titleEl.textContent = entry.claim.length > 60 ? entry.claim.substring(0, 57) + '…' : entry.claim;

    var levelClass = entry.level || 'consensus';
    var levelLabel = LEVEL_LABELS[levelClass] || 'Clinical evidence';

    var sourceHtml = '';
    if (entry.source) {
      var s = entry.source;
      var parts = [];
      if (s.authors) parts.push('<b>' + s.authors + '</b>');
      if (s.year) parts.push('(' + s.year + ')');
      if (s.title) parts.push('<i>' + s.title + '</i>');
      if (s.journal) parts.push(s.journal);
      sourceHtml = parts.join('. ');
      if (s.doi) sourceHtml += ' · DOI: <a href="https://doi.org/' + s.doi + '" target="_blank" rel="noopener">' + s.doi + '</a>';
      if (s.pmid) sourceHtml += ' · PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/' + s.pmid + '" target="_blank" rel="noopener">' + s.pmid + '</a>';
    }

    bodyEl.innerHTML =
      '<div class="qi-section">' +
        '<div class="qi-label">The claim</div>' +
        '<div class="qi-claim">' + escapeHtml(entry.claim) + '</div>' +
      '</div>' +
      '<div class="qi-section">' +
        '<div class="qi-label">What the evidence says</div>' +
        '<div class="qi-evidence">' + escapeHtml(entry.evidence) + '</div>' +
      '</div>' +
      (sourceHtml ?
      '<div class="qi-section">' +
        '<div class="qi-label">Source</div>' +
        '<div class="qi-source">' + sourceHtml + '</div>' +
      '</div>' : '') +
      '<div class="qi-section">' +
        '<span class="qi-level ' + levelClass + '">' + levelLabel + '</span>' +
      '</div>' +
      '<div class="qi-disclaimer">' +
        '<span class="qi-d-icon">💛</span>' +
        '<span><b>Wellness, not diagnosis.</b> ' + escapeHtml(entry.wellnessNote || 'This information is for wellness education only and is not medical advice. Always consult a qualified healthcare provider for personal medical concerns.') + '</span>' +
      '</div>';

    // show
    requestAnimationFrame(function () {
      backdropEl.classList.add('open');
      sheetEl.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeSheet() {
    if (!sheetEl) return;
    backdropEl.classList.remove('open');
    sheetEl.classList.remove('open');
    document.body.style.overflow = '';
    currentKey = null;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ── Global click delegation ── */
  document.addEventListener('click', function (e) {
    var target = e.target.closest('.qi[data-evidence]');
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      openSheet(target.getAttribute('data-evidence'));
    }
  });

  /* ── Keyboard: Escape closes ── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheetEl && sheetEl.classList.contains('open')) {
      closeSheet();
    }
  });

  /* ── Public API ── */
  window.OvulunaEvidence = {
    open: openSheet,
    close: closeSheet,
    get: function (key) { return (window.EVIDENCE_DB || {})[key]; }
  };

})();
