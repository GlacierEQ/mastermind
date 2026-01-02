// ==UserScript==
// @name         ChatGPT Deep Dive Query Bot (Socratic Infinity)
// @namespace    https://example.local/
// @version      1.0.0
// @description  Auto-drives structured deep-dive questioning in ChatGPT: asks smart, ranked questions that demand new data and adapts each turn.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
  'use strict';

  /******************************************************************
   * 0) Resilience strategy (why this survives UI updates)
   * - Input: prefer #prompt-textarea, fallback to visible textarea/contenteditable
   * - Send: prefer button[data-testid="send-button"], fallback to submit buttons / aria labels
   * - Generation status: detect stop button / streaming affordances
   ******************************************************************/

  // --- Selectors inspired by known-working scripts and community snippets ---
  // (ChatGPT UI changes frequently; we use a layered fallback approach.)
  const INPUT_SELECTORS = [
    '#prompt-textarea',
    'textarea[data-testid="prompt-textarea"]',
    'textarea[data-id="root"]',
    'form textarea',
    'div[contenteditable="true"][data-id]',
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]'
  ];

  const SEND_SELECTORS = [
    'button[data-testid="send-button"]',
    'button[aria-label*="Send" i]',
    'form button[type="submit"]'
  ];

  const STOP_SELECTORS = [
    'button[data-testid="stop-button"]',
    'button[aria-label*="Stop" i]',
    'button[aria-label*="Cancel" i]'
  ];

  // Messages often carry data-message-author-role; if not, fall back to heuristics.
  const MSG_ROLE_SELECTOR = '[data-message-author-role]';
  const ASSISTANT_SELECTOR = '[data-message-author-role="assistant"]';
  const USER_SELECTOR = '[data-message-author-role="user"]';

  /******************************************************************
   * 1) Settings + state (persisted)
   ******************************************************************/
  const DEFAULTS = {
    enabled: false,
    mode: 'SOCRATIC', // SOCRATIC | HYBRID | AUTONOMOUS
    depth: 4,         // 1..5
    maxIterations: 12,
    iteration: 0,
    goal: 'Deeply understand and improve the current topic by identifying unknowns, contradictions, and required new data.',
    askForNewDataHard: true, // If true: bot must demand new info before proceeding
    includeContextTurns: 6,  // How many recent messages to quote for grounding
    cooldownMs: 1200,
    autoPrimeOnStart: true
  };

  const S = {
    get: (k) => GM_getValue(k, DEFAULTS[k]),
    set: (k, v) => GM_setValue(k, v),
    all: () => {
      const o = {};
      for (const k of Object.keys(DEFAULTS)) o[k] = GM_getValue(k, DEFAULTS[k]);
      return o;
    }
  };

  let lastHandledAssistantHash = '';
  let observer = null;
  let busy = false;

  /******************************************************************
   * 2) UI panel
   ******************************************************************/
  GM_addStyle(`
    #ddqb-panel {
      position: fixed;
      right: 14px;
      bottom: 14px;
      z-index: 999999;
      width: 320px;
      background: rgba(20,20,20,0.92);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 12px;
      padding: 12px;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      box-shadow: 0 12px 38px rgba(0,0,0,0.35);
    }
    #ddqb-panel * { box-sizing: border-box; }
    #ddqb-title { display:flex; align-items:center; justify-content:space-between; gap:10px; }
    #ddqb-title strong { font-size: 13px; letter-spacing: 0.3px; }
    #ddqb-mini { opacity: 0.85; font-size: 12px; }
    #ddqb-row { display:flex; gap:8px; margin-top:10px; }
    .ddqb-btn {
      width: 100%;
      border: 0;
      border-radius: 10px;
      padding: 9px 10px;
      cursor: pointer;
      font-weight: 650;
      font-size: 12px;
      background: rgba(255,255,255,0.10);
      color: #fff;
    }
    .ddqb-btn:hover { background: rgba(255,255,255,0.16); }
    .ddqb-btn.primary { background: rgba(0, 160, 255, 0.25); border: 1px solid rgba(0,160,255,0.35); }
    .ddqb-btn.primary:hover { background: rgba(0, 160, 255, 0.35); }
    .ddqb-field { margin-top: 10px; }
    .ddqb-field label { display:block; font-size: 11px; opacity: 0.85; margin-bottom: 6px; }
    .ddqb-field input, .ddqb-field select, .ddqb-field textarea {
      width:100%;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: #fff;
      padding: 8px 10px;
      font-size: 12px;
      outline: none;
    }
    .ddqb-field textarea { min-height: 66px; resize: vertical; }
    #ddqb-footer {
      margin-top: 10px;
      display:flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      font-size: 11px;
      opacity: 0.9;
    }
    #ddqb-statusDot {
      width: 9px; height: 9px;
      border-radius: 999px;
      background: #888;
      display: inline-block;
      margin-right: 7px;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.06);
    }
    #ddqb-hotkeys { opacity: 0.75; }
  `);

  function mountPanel() {
    if (document.getElementById('ddqb-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'ddqb-panel';
    panel.innerHTML = `
      <div id="ddqb-title">
        <div><strong>Deep Dive Query Bot</strong><span id="ddqb-mini"> · Socratic Infinity</span></div>
        <div><span id="ddqb-statusDot"></span><span id="ddqb-statusText">OFF</span></div>
      </div>

      <div id="ddqb-row">
        <button class="ddqb-btn primary" id="ddqb-toggle">Start</button>
        <button class="ddqb-btn" id="ddqb-prime">Prime</button>
      </div>

      <div class="ddqb-field">
        <label>Mode</label>
        <select id="ddqb-mode">
          <option value="SOCRATIC">Socratic (ask for new data, then wait)</option>
          <option value="HYBRID">Hybrid (ask + propose plan + minimal progress)</option>
          <option value="AUTONOMOUS">Autonomous (keep iterating)</option>
        </select>
      </div>

      <div id="ddqb-row">
        <div class="ddqb-field" style="flex:1">
          <label>Depth (1-5)</label>
          <input id="ddqb-depth" type="number" min="1" max="5"/>
        </div>
        <div class="ddqb-field" style="flex:1">
          <label>Max Iterations</label>
          <input id="ddqb-maxIter" type="number" min="1" max="99"/>
        </div>
      </div>

      <div class="ddqb-field">
        <label>Goal / North Star</label>
        <textarea id="ddqb-goal"></textarea>
      </div>

      <div id="ddqb-row">
        <button class="ddqb-btn" id="ddqb-step">Step Once</button>
        <button class="ddqb-btn" id="ddqb-reset">Reset</button>
      </div>

      <div id="ddqb-footer">
        <div><span id="ddqb-hotkeys">Hotkeys: Ctrl+Shift+D toggle · Ctrl+Shift+S step</span></div>
      </div>
    `;

    document.body.appendChild(panel);

    // Initialize fields
    const cfg = S.all();
    panel.querySelector('#ddqb-mode').value = cfg.mode;
    panel.querySelector('#ddqb-depth').value = cfg.depth;
    panel.querySelector('#ddqb-maxIter').value = cfg.maxIterations;
    panel.querySelector('#ddqb-goal').value = cfg.goal;

    // Bind controls
    panel.querySelector('#ddqb-toggle').addEventListener('click', toggleRun);
    panel.querySelector('#ddqb-prime').addEventListener('click', primeBot);
    panel.querySelector('#ddqb-step').addEventListener('click', () => deepDiveStep({ manual: true }));
    panel.querySelector('#ddqb-reset').addEventListener('click', resetState);

    panel.querySelector('#ddqb-mode').addEventListener('change', (e) => S.set('mode', e.target.value));
    panel.querySelector('#ddqb-depth').addEventListener('change', (e) => S.set('depth', clampInt(e.target.value, 1, 5)));
    panel.querySelector('#ddqb-maxIter').addEventListener('change', (e) => S.set('maxIterations', clampInt(e.target.value, 1, 99)));
    panel.querySelector('#ddqb-goal').addEventListener('change', (e) => S.set('goal', e.target.value.trim() || DEFAULTS.goal));

    syncStatusUI();
  }

  function syncStatusUI() {
    const enabled = !!S.get('enabled');
    const dot = document.getElementById('ddqb-statusDot');
    const txt = document.getElementById('ddqb-statusText');
    const toggle = document.getElementById('ddqb-toggle');

    if (dot) dot.style.background = enabled ? '#00d26a' : '#888';
    if (txt) txt.textContent = enabled ? `ON (iter ${S.get('iteration')}/${S.get('maxIterations')})` : 'OFF';
    if (toggle) toggle.textContent = enabled ? 'Stop' : 'Start';
  }

  /******************************************************************
   * 3) DOM helpers
   ******************************************************************/
  function clampInt(v, min, max) {
    const n = parseInt(String(v || ''), 10);
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function qAny(selectors) {
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el && isVisible(el)) return el;
    }
    return null;
  }

  function getComposer() {
    const el = qAny(INPUT_SELECTORS);
    if (!el) return null;

    const isTextarea = el.tagName === 'TEXTAREA';
    const isContentEditable = !!el.isContentEditable;

    return { el, kind: isTextarea ? 'textarea' : (isContentEditable ? 'contenteditable' : 'unknown') };
  }

  function getSendButton() {
    return qAny(SEND_SELECTORS);
  }

  function isGenerating() {
    return !!qAny(STOP_SELECTORS);
  }

  function hashText(t) {
    // light hash for change detection
    let h = 0;
    for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
    return String(h);
  }

  function getRecentMessages(limit) {
    // Prefer structured role nodes if present
    const roleNodes = Array.from(document.querySelectorAll(MSG_ROLE_SELECTOR))
      .filter(isVisible);

    if (roleNodes.length) {
      const sliced = roleNodes.slice(-limit);
      return sliced.map(n => ({
        role: n.getAttribute('data-message-author-role') || 'unknown',
        text: (n.innerText || '').trim()
      })).filter(m => m.text);
    }

    // Fallback heuristic: grab visible text blocks
    const fallbackBlocks = Array.from(document.querySelectorAll('main .markdown, main [class*="prose"], main article'))
      .filter(isVisible)
      .slice(-limit);

    return fallbackBlocks.map(n => ({ role: 'unknown', text: (n.innerText || '').trim() })).filter(m => m.text);
  }

  function getLastAssistantText() {
    const nodes = Array.from(document.querySelectorAll(ASSISTANT_SELECTOR)).filter(isVisible);
    const last = nodes[nodes.length - 1];
    if (last) return (last.innerText || '').trim();

    // fallback: grab last visible prose-ish block
    const prose = Array.from(document.querySelectorAll('main .markdown, main [class*="prose"], main article'))
      .filter(isVisible);
    const lastProse = prose[prose.length - 1];
    return lastProse ? (lastProse.innerText || '').trim() : '';
  }

  function setComposerValue(composer, text) {
    if (!composer) return false;
    const { el, kind } = composer;

    if (kind === 'textarea') {
      el.focus();
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }

    if (kind === 'contenteditable') {
      el.focus();
      // best effort: replace content
      el.innerText = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }

    // unknown: try value + input
    try {
      el.focus();
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    } catch (_) {
      return false;
    }
  }

  async function sendMessage(text) {
    const composer = getComposer();
    const sendBtn = getSendButton();
    if (!composer || !sendBtn) return false;

    setComposerValue(composer, text);

    // Small delay allows React state to update before click
    await sleep(80);
    sendBtn.click();
    return true;
  }

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  /******************************************************************
   * 4) Deep dive prompt engineering (the “smart” part)
   ******************************************************************/
  function buildDeepDivePrompt({ iteration, mode, depth, goal, contextTurns, askForNewDataHard }) {
    const recent = getRecentMessages(contextTurns);
    const lastAssistant = getLastAssistantText();

    // If there's no assistant output yet, ask the bot to set up a questioning frame.
    const hasAssistant = !!lastAssistant;

    const schema = `
Return ONLY this YAML shape:

deep_dive:
  iteration: ${iteration}
  mode: ${mode}
  objective: "<one sentence>"
  current_claims:
    - "<claim>"
  key_unknowns_ranked:
    - unknown: "<unknown>"
      why_it_matters: "<why>"
      evidence_needed: "<what new data would resolve it>"
  questions_for_user_ranked:
    - question: "<question>"
      what_a_good_answer_looks_like: "<criteria>"
  new_data_acquisition_plan:
    - source: "<web|document|screenshot|log|dataset|experiment|other>"
      exact_request: "<what to fetch or provide>"
      acceptance_test: "<how we verify>"
  contradiction_checks:
    - "<check>"
  next_action: "<WAIT_FOR_USER|BROWSE_IF_AVAILABLE|PROCEED_MINIMALLY>"
  minimal_progress_now:
    - "<what you can do without new data>"
`.trim();

    const rules = [
      `You are a Deep Dive Query Bot. Your job is to drive the conversation deeper by asking structured questions that REQUIRE new information, not rephrasing.`,
      askForNewDataHard
        ? `Hard rule: Do NOT proceed with speculative conclusions. If new data is required, ask for it and set next_action: WAIT_FOR_USER.`
        : `If new data is required, prefer asking for it, but you may proceed with clearly-labeled assumptions.`,
      `Be contradiction-sensitive: identify where the current answer could be wrong and what would falsify it.`,
      `Depth=${depth} means: 1=basic gaps, 3=strong investigative questions, 5=forensic-grade unknowns + validation steps.`,
      `If web browsing/tools are available in this environment, include a BROWSE_IF_AVAILABLE plan with 3-7 ultra-specific queries. If not, ask the user to provide links/screenshots/docs.`
    ].join('\n');

    const contextBlock = recent.length
      ? recent.map((m, i) => `[#${i + 1} ${m.role.toUpperCase()}]\n${m.text}`).join('\n\n')
      : '(No structured context nodes detected.)';

    const seed = hasAssistant
      ? `Use the most recent assistant output as the subject of inquiry.`
      : `We have not produced an answer yet. First, ask 5 clarifying questions to define scope and required data.`;

    return `
${rules}

GOAL:
${goal}

SEED:
${seed}

RECENT CONTEXT (quoted for grounding; do not invent facts beyond this):
${contextBlock}

LATEST ASSISTANT OUTPUT (if present):
${lastAssistant ? lastAssistant : '(none)'}

OUTPUT SCHEMA:
${schema}
`.trim();
  }

  function buildPrimerPrompt(goal) {
    return `
You are now operating as **Deep Dive Query Bot**.

Your behavior rules:
- You must drive progress by asking structured, ranked questions that require NEW data (documents, numbers, links, screenshots, logs, code, timelines).
- You must separate: Facts vs Assumptions vs Unknowns.
- You must propose an acquisition plan for missing data.
- You must include contradiction checks and falsification tests.
- You must stop and WAIT when the user needs to provide inputs.

Goal:
${goal}

Reply with a compact readiness checklist and the first 5 questions you need from me.
`.trim();
  }

  /******************************************************************
   * 5) Control flow: run loop + mutation observer
   ******************************************************************/
  async function deepDiveStep({ manual = false } = {}) {
    if (busy) return;
    busy = true;

    try {
      const cfg = S.all();
      if (!manual && !cfg.enabled) return;

      if (isGenerating()) return; // wait for completion

      if (cfg.iteration >= cfg.maxIterations) {
        S.set('enabled', false);
        syncStatusUI();
        return;
      }

      // Prevent double-firing on the same assistant output
      const lastAssistant = getLastAssistantText();
      const h = hashText(lastAssistant || '');
      if (!manual && lastAssistant && h === lastHandledAssistantHash) return;

      // Update iteration
      const nextIter = manual ? cfg.iteration : (cfg.iteration + 1);
      if (!manual) S.set('iteration', nextIter);

      const prompt = buildDeepDivePrompt({
        iteration: nextIter,
        mode: cfg.mode,
        depth: cfg.depth,
        goal: cfg.goal,
        contextTurns: cfg.includeContextTurns,
        askForNewDataHard: cfg.askForNewDataHard
      });

      await sleep(cfg.cooldownMs);
      const ok = await sendMessage(prompt);
      if (ok) {
        // update hash after sending, so we don't re-send until assistant changes
        lastHandledAssistantHash = h;
      }

      syncStatusUI();
    } finally {
      busy = false;
    }
  }

  async function primeBot() {
    const cfg = S.all();
    await sendMessage(buildPrimerPrompt(cfg.goal));
  }

  function resetState() {
    S.set('iteration', 0);
    lastHandledAssistantHash = '';
    syncStatusUI();
  }

  function toggleRun() {
    const enabled = !S.get('enabled');
    S.set('enabled', enabled);

    if (enabled) {
      if (S.get('autoPrimeOnStart')) primeBot();
      startObserver();
    } else {
      stopObserver();
    }
    syncStatusUI();
  }

  function startObserver() {
    if (observer) return;

    // Observe body for changes; when generation stops and a new assistant message appears, step.
    observer = new MutationObserver(async () => {
      if (!S.get('enabled')) return;
      if (busy) return;

      // Only act when not generating
      if (isGenerating()) return;

      // Debounce a little to allow final render
      await sleep(250);

      // In SOCRATIC mode, we still step after assistant replies — but the prompt itself forces WAIT_FOR_USER.
      // In AUTONOMOUS mode, it will keep stepping until maxIterations.
      await deepDiveStep({ manual: false });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: false
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  /******************************************************************
   * 6) Hotkeys + menu
   ******************************************************************/
  function onKeydown(e) {
    // Ctrl+Shift+D toggle
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
      e.preventDefault();
      toggleRun();
    }
    // Ctrl+Shift+S step
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
      e.preventDefault();
      deepDiveStep({ manual: true });
    }
  }

  GM_registerMenuCommand('Toggle Deep Dive (Ctrl+Shift+D)', toggleRun);
  GM_registerMenuCommand('Prime Bot', primeBot);
  GM_registerMenuCommand('Step Once (Ctrl+Shift+S)', () => deepDiveStep({ manual: true }));
  GM_registerMenuCommand('Reset Iteration', resetState);

  /******************************************************************
   * 7) Boot
   ******************************************************************/
  function boot() {
    mountPanel();
    document.addEventListener('keydown', onKeydown, true);

    // If script was enabled last session, resume observer.
    if (S.get('enabled')) startObserver();
    syncStatusUI();

    // Re-mount panel if ChatGPT hot-swaps DOM
    const remountObserver = new MutationObserver(() => {
      if (!document.getElementById('ddqb-panel')) mountPanel();
    });
    remountObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Wait a bit for app shell to load
  setTimeout(boot, 800);
})();
