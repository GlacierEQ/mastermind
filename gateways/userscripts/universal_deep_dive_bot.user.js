// ==UserScript==
// @name         Universal Deep Dive Query Bot (Socratic Infinity)
// @namespace    https://github.com/glaciereq
// @version      2.0.0
// @description  Auto-drives structured deep-dive questioning on ChatGPT, Perplexity, DeepSeek, Gemini, Liner, Notion, and more.
// @match        *://chatgpt.com/*
// @match        *://chat.openai.com/*
// @match        *://www.perplexity.ai/*
// @match        *://chat.deepseek.com/*
// @match        *://gemini.google.com/*
// @match        *://liner.ai/*
// @match        *://www.notion.so/*
// @match        *://jules.google.com/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
    'use strict';

    /* ==========================================================================================
       1. ADAPTER DEFINITIONS
       Defines how to interface with each specific platform.
       ========================================================================================== */

    const ADAPTERS = [
        {
            name: 'ChatGPT',
            match: (url) => url.includes('chatgpt.com') || url.includes('chat.openai.com'),
            input: ['#prompt-textarea', 'textarea[data-id="root"]', 'div[contenteditable="true"][id="prompt-textarea"]'],
            send: ['button[data-testid="send-button"]', 'button[aria-label="Send prompt"]'],
            stop: ['button[aria-label="Stop generating"]', 'button[data-testid="stop-button"]'],
            msgRole: '[data-message-author-role]', // attribute indicating role
            assistantVal: 'assistant',
            msgTextSelector: '.markdown', // within the message container
        },
        {
            name: 'Perplexity',
            match: (url) => url.includes('perplexity.ai'),
            input: ['textarea[placeholder*="Ask"]', 'textarea'],
            send: ['button[aria-label="Submit"]', 'button[icon="arrow-right"]', 'button svg[data-icon="arrow-right"]'], // Perplexity often uses SVGs inside buttons
            stop: ['button[aria-label="Stop"]'], // Varies, often just no send button available
            // Perplexity structure is complex; fallback to prose reading
            msgContainer: '.prose', // text blocks
        },
        {
            name: 'DeepSeek',
            match: (url) => url.includes('chat.deepseek.com'),
            input: ['textarea', '#chat-input'],
            send: ['div[role="button"]:has(svg)', 'button'], // Generic fallback usually works if tailored
            stop: ['div[role="button"]:has(span:contains("Stop"))'],
        },
        {
            name: 'Gemini',
            match: (url) => url.includes('gemini.google.com'),
            input: ['div[contenteditable="true"]', 'textarea'], // Gemini uses contenteditable divs
            send: ['button[aria-label*="Send"]', 'button[aria-label*="Submit"]'],
            stop: ['button[aria-label*="Stop"]'],
        },
        {
            name: 'Claude (Generic Support)', // Not explicitly requested but useful
            match: (url) => url.includes('claude.ai'),
            input: ['div[contenteditable="true"]'],
            send: ['button[aria-label*="Send"]'],
        },
        {
            name: 'Generic Fallback',
            match: () => true, // Always matches if no others did
            input: ['textarea', 'div[contenteditable="true"]', 'input[type="text"]'],
            send: ['button[type="submit"]', 'button[aria-label*="send" i]', 'button[aria-label*="submit" i]', 'svg[data-icon="send"]'],
            stop: ['button[aria-label*="stop" i]'],
        }
    ];

    // Current Adapter State
    let CA = null;

    function detectAdapter() {
        const url = window.location.href;
        for (const a of ADAPTERS) {
            if (a.match(url)) {
                console.log(`[DeepDive] Adapter activated: ${a.name}`);
                return a;
            }
        }
        return ADAPTERS[ADAPTERS.length - 1]; // Fallback
    }

    /* ==========================================================================================
       2. CORE SETTINGS & UI
       ========================================================================================== */
    const DEFAULTS = {
        enabled: false,
        mode: 'SOCRATIC', // SOCRATIC | HYBRID | AUTONOMOUS
        depth: 4,
        maxIterations: 12,
        iteration: 0,
        goal: 'Deeply understand the topic. Identify unknowns, contradictions, and demand new data.',
        askForNewDataHard: true,
        includeContextTurns: 6,
        cooldownMs: 2000, // Slightly higher for generic safety
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

    let lastHandledHash = '';
    let observer = null;
    let busy = false;

    // UI Styles
    GM_addStyle(`
    #ddqb-panel {
      position: fixed; right: 14px; bottom: 14px; z-index: 999999; width: 320px;
      background: rgba(15,15,15,0.95); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px; padding: 12px; font-family: sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    #ddqb-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    #ddqb-header strong { font-size:13px; color:#fff; }
    #ddqb-adapter-badge { font-size:10px; background:#333; padding:2px 6px; border-radius:4px; margin-left:8px; opacity:0.8; }
    .ddqb-row { display:flex; gap:8px; margin-bottom:8px; }
    .ddqb-btn { flex:1; padding:8px; border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; background:rgba(255,255,255,0.1); color:#fff; transition:0.2s; }
    .ddqb-btn:hover { background:rgba(255,255,255,0.2); }
    .ddqb-btn.primary { background:rgba(0,120,255,0.3); border:1px solid rgba(0,120,255,0.5); }
    .ddqb-btn.primary:hover { background:rgba(0,120,255,0.5); }
    .ddqb-field { margin-bottom:8px; }
    .ddqb-field label { display:block; font-size:11px; opacity:0.7; margin-bottom:4px; }
    .ddqb-field input, .ddqb-field select, .ddqb-field textarea {
      width:100%; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1);
      color:#fff; padding:6px; border-radius:6px; font-size:12px;
    }
    .ddqb-field textarea { min-height:60px; resize:vertical; }
  `);

    function mountPanel() {
        if (document.getElementById('ddqb-panel')) return;
        CA = detectAdapter();

        const div = document.createElement('div');
        div.id = 'ddqb-panel';
        div.innerHTML = `
      <div id="ddqb-header">
        <div>
          <strong>Deep Dive Bot</strong>
          <span id="ddqb-adapter-badge">${CA.name}</span>
        </div>
        <div id="ddqb-status" style="font-size:11px;">OFF</div>
      </div>
      <div class="ddqb-row">
        <button id="ddqb-toggle" class="ddqb-btn primary">Start</button>
        <button id="ddqb-prime" class="ddqb-btn">Prime</button>
      </div>
      <div class="ddqb-field">
        <label>Mode</label>
        <select id="ddqb-mode">
          <option value="SOCRATIC">Socratic (Pause)</option>
          <option value="HYBRID">Hybrid (Plan & Proceed)</option>
          <option value="AUTONOMOUS">Autonomous (Loop)</option>
        </select>
      </div>
      <div class="ddqb-row">
         <div class="ddqb-field" style="flex:1"><label>Depth (1-5)</label><input id="ddqb-depth" type="number" min="1" max="5"></div>
         <div class="ddqb-field" style="flex:1"><label>Max Iter</label><input id="ddqb-iter" type="number" min="1" max="50"></div>
      </div>
      <div class="ddqb-field">
        <label>Goal</label>
        <textarea id="ddqb-goal"></textarea>
      </div>
      <div class="ddqb-row">
        <button id="ddqb-step" class="ddqb-btn">Step Once</button>
        <button id="ddqb-reset" class="ddqb-btn">Reset</button>
      </div>
    `;
        document.body.appendChild(div);

        // Bindings
        const cfg = S.all();
        const els = {
            mode: div.querySelector('#ddqb-mode'),
            depth: div.querySelector('#ddqb-depth'),
            iter: div.querySelector('#ddqb-iter'),
            goal: div.querySelector('#ddqb-goal'),
            stat: div.querySelector('#ddqb-status'),
            toggle: div.querySelector('#ddqb-toggle')
        };

        els.mode.value = cfg.mode;
        els.depth.value = cfg.depth;
        els.iter.value = cfg.maxIterations;
        els.goal.value = cfg.goal;

        els.mode.onchange = e => S.set('mode', e.target.value);
        els.depth.onchange = e => S.set('depth', parseInt(e.target.value) || 3);
        els.iter.onchange = e => S.set('maxIterations', parseInt(e.target.value) || 10);
        els.goal.onchange = e => S.set('goal', e.target.value);

        div.querySelector('#ddqb-toggle').onclick = toggleRun;
        div.querySelector('#ddqb-prime').onclick = primeBot;
        div.querySelector('#ddqb-step').onclick = () => step({ manual: true });
        div.querySelector('#ddqb-reset').onclick = resetBot;

        updateUI();
    }

    function updateUI() {
        const isOn = S.get('enabled');
        const btn = document.getElementById('ddqb-toggle');
        const stat = document.getElementById('ddqb-status');
        if (btn) btn.textContent = isOn ? 'Stop' : 'Start';
        if (stat) {
            stat.textContent = isOn ? `ON (${S.get('iteration')}/${S.get('maxIterations')})` : 'OFF';
            stat.style.color = isOn ? '#0f0' : '#888';
        }
    }

    /* ==========================================================================================
       3. DOM INTERACTION (ADAPTER-DRIVEN)
       ========================================================================================== */

    function qAny(selectors, base = document) {
        if (!selectors) return null;
        if (typeof selectors === 'string') return base.querySelector(selectors);
        for (const sel of selectors) {
            const el = base.querySelector(sel);
            if (el && el.offsetParent !== null) return el; // Check visibility
        }
        return null;
    }

    function getComposer() {
        return qAny(CA.input);
    }

    function getSendBtn() {
        // Some sites (Perplexity) hide the send button until text is typed.
        // We might need to look for specific icons or buttons within forms.
        // The selector list in ADAPTERS handles this priority.
        return qAny(CA.send);
    }

    function isGenerating() {
        // If a stop button exists and is visible, we are generating.
        return !!qAny(CA.stop);
    }

    function getText(limit = 10000) {
        // Get last assistant message text
        // Strategy 1: Explicit roles
        if (CA.msgRole) {
            const msgs = Array.from(document.querySelectorAll(CA.msgRole));
            const last = msgs.filter(m => m.getAttribute('data-message-author-role') === CA.assistantVal).pop();
            if (last) return last.innerText.slice(-limit);
        }
        // Strategy 2: Prose/Text containers (fallback)
        const blocks = Array.from(document.querySelectorAll(CA.msgContainer || '.prose, .markdown, article'));
        // Filter out obviously non-content blocks if possible
        const visible = blocks.filter(b => b.offsetParent !== null && b.innerText.length > 20);
        if (visible.length > 0) return visible[visible.length - 1].innerText.slice(-limit);

        return "";
    }

    async function typeAndSend(text) {
        const input = getComposer();
        if (!input) {
            console.error('[DeepDive] No input found!');
            return false;
        }

        // Input method depends on element type
        if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
            input.value = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            // contenteditable
            input.focus();
            input.innerText = text; // innerText often safer for React contenteditables than innerHTML
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }

        await new Promise(r => setTimeout(r, 600)); // wait for UI validation

        // Try to find send button
        let btn = getSendBtn();

        // Fallback: search relative to input's form or container
        if (!btn) {
            // Look for a button nearby
            const parent = input.closest('form') || input.closest('div[class*="input"], div[class*="compose"]');
            if (parent) {
                btn = parent.querySelector('button[type="submit"], button:not([disabled])');
            }
        }

        if (btn) {
            btn.click();
            return true;
        } else {
            // Last resort: Enter key
            const enter = new KeyboardEvent('keydown', {
                bubbles: true, cancelable: true, keyCode: 13, key: 'Enter'
            });
            input.dispatchEvent(enter);
            return true;
        }
    }

    /* ==========================================================================================
       4. LOGIC ENGINE
       ========================================================================================== */

    function buildPrompt(txt, cfg) {
        const isNew = !txt || txt.length < 50;

        if (isNew) {
            // Intro / Primer
            return `
You are **Deep Dive Bot** (Universal Mode).
Goal: ${cfg.goal}
Task: analyze the topic deeply.
1. Outline the key unknowns.
2. Formulate 3-5 critical questions that require NEW data/evidence.
3. Propose a plan to get that data.
`.trim();
        }

        // Iteration logic
        return `
DEEP DIVE (Iter ${cfg.iteration}/${cfg.maxIterations} | Depth ${cfg.depth}/5)
GOAL: ${cfg.goal}

Your instructions:
1. Review your last response. Identify any speculative assumptions.
2. CONTRADICTION CHECK: What evidence would disprove your current hypothesis?
3. DATA GAP: What specific file, log, docs, or web result do we need now?
4. ACTION:
   - If you need input, ask for it.
   - If you can browse/search, do so.
   - Output structured JSON/YAML summary of unknowns at the end.
   
Refine the inquiry. Dig deeper.
`.trim();
    }

    async function step({ manual } = {}) {
        if (busy) return;
        busy = true;
        try {
            if (isGenerating()) { console.log('[DeepDive] Busy generating...'); return; }

            const cfg = S.all();
            if (!manual && !cfg.enabled) return;

            const txt = getText();
            const h = btoa(encodeURIComponent(txt.slice(-200))); // simple hash of end

            if (!manual && h === lastHandledHash) return; // Already processed this reply

            if (cfg.iteration >= cfg.maxIterations) {
                S.set('enabled', false);
                updateUI();
                console.log('[DeepDive] Max iterations reached.');
                return;
            }

            // Execute
            const nextIter = manual ? cfg.iteration : cfg.iteration + 1;
            if (!manual) S.set('iteration', nextIter);

            const prompt = buildPrompt(txt, { ...cfg, iteration: nextIter });
            await typeAndSend(prompt);

            lastHandledHash = h; // mark as handled

        } catch (e) {
            console.error('[DeepDive] Step error:', e);
        } finally {
            busy = false;
        }
    }

    function toggleRun() {
        const next = !S.get('enabled');
        S.set('enabled', next);
        if (next) {
            if (S.get('autoPrimeOnStart')) step({ manual: true }); // Kickoff
            startObserver();
        } else {
            stopObserver();
        }
        updateUI();
    }

    function primeBot() {
        // Force a "Primer" prompt
        S.set('iteration', 0);
        step({ manual: true });
    }

    function resetBot() {
        S.set('iteration', 0);
        lastHandledHash = '';
        updateUI();
    }

    /* ==========================================================================================
       5. LIFECYCLE
       ========================================================================================== */

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(() => {
            // Debounced check
            if (isGenerating()) return;
            // We only auto-step if enabled and not busy
            if (S.get('enabled') && !busy) {
                setTimeout(() => step({ manual: false }), 2000);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function stopObserver() {
        if (observer) observer.disconnect();
        observer = null;
    }

    // Init
    window.addEventListener('load', () => {
        setTimeout(mountPanel, 1500); // Wait for app hydration
    });

    // Backup mount (SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(mountPanel, 1500);
        }
    }).observe(document, { subtree: true, childList: true });

})();
