// ==UserScript==
// @name         Universal AI Deep Dive Bot (V3 - Supernova)
// @namespace    https://github.com/glaciereq
// @version      3.0.0
// @description  Unified Deep-Dive Bot for Claude, ChatGPT, Gemini, Grok, Perplexity, and Qwen.
// @match        *://chatgpt.com/*
// @match        *://chat.openai.com/*
// @match        *://www.perplexity.ai/*
// @match        *://gemini.google.com/*
// @match        *://claude.ai/*
// @match        *://grok.com/*
// @match        *://x.com/i/grok*
// @match        *://chat.qwenlm.ai/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
    'use strict';

    const ADAPTERS = [
        {
            name: 'ChatGPT',
            match: (url) => url.includes('chatgpt.com') || url.includes('chat.openai.com'),
            input: ['#prompt-textarea', 'div[contenteditable="true"][id="prompt-textarea"]'],
            send: ['button[data-testid="send-button"]', 'button[aria-label="Send prompt"]'],
            stop: ['button[aria-label="Stop generating"]'],
            msgRole: '[data-message-author-role]',
            assistantVal: 'assistant'
        },
        {
            name: 'Perplexity',
            match: (url) => url.includes('perplexity.ai'),
            input: ['textarea[placeholder*="Ask"]', 'textarea'],
            send: ['button[aria-label="Submit"]', 'button svg[data-icon="arrow-right"]'],
            stop: ['button[aria-label="Stop"]'],
            msgContainer: '.prose'
        },
        {
            name: 'Gemini',
            match: (url) => url.includes('gemini.google.com'),
            input: ['div[contenteditable="true"]', 'textarea'],
            send: ['button[aria-label*="Send"]', 'button[aria-label*="Submit"]'],
            stop: ['button[aria-label*="Stop"]']
        },
        {
            name: 'Claude',
            match: (url) => url.includes('claude.ai'),
            input: ['div[contenteditable="true"]', 'div[role="textbox"]'],
            send: ['button[aria-label*="Send"]', 'button[aria-label*="Submit"]'],
            stop: ['button[aria-label*="Stop"]']
        },
        {
            name: 'Grok',
            match: (url) => url.includes('grok.com') || url.includes('x.com/i/grok'),
            input: ['textarea', 'div[contenteditable="true"]'],
            send: ['button[aria-label*="Grok"]', 'button[type="submit"]'],
            stop: ['button[aria-label*="Stop"]']
        },
        {
            name: 'Qwen',
            match: (url) => url.includes('qwenlm.ai'),
            input: ['textarea', '#chat-input'],
            send: ['button:has(svg)', 'button[type="submit"]'],
            stop: ['button:has(span:contains("Stop"))']
        },
        {
            name: 'Generic Fallback',
            match: () => true,
            input: ['textarea', 'div[contenteditable="true"]', 'input[type="text"]'],
            send: ['button[type="submit"]', 'button[aria-label*="send" i]', 'svg[data-icon="send"]'],
            stop: ['button[aria-label*="stop" i]']
        }
    ];

    let CA = null;
    function detectAdapter() {
        const url = window.location.href;
        for (const a of ADAPTERS) if (a.match(url)) return a;
        return ADAPTERS[ADAPTERS.length - 1];
    }

    const DEFAULTS = {
        enabled: false,
        iteration: 0,
        maxIterations: 12,
        goal: 'Analyze Case 1FDV-23-0001009 for procedural starvation and role inversion. Deep dive into metadata and contradictions.',
        cooldownMs: 3000
    };

    const S = {
        get: (k) => GM_getValue(k, DEFAULTS[k]),
        set: (k, v) => GM_setValue(k, v)
    };

    function mountPanel() {
        if (document.getElementById('ddqb-panel')) return;
        CA = detectAdapter();
        const div = document.createElement('div');
        div.id = 'ddqb-panel';
        div.style = "position:fixed;right:14px;bottom:14px;z-index:999999;width:300px;background:#111;color:#eee;border:1px solid #444;border-radius:8px;padding:10px;font-family:sans-serif;";
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:8px"><strong>Deep Dive Bot (V3)</strong> <span style="font-size:10px;background:#333;padding:2px 4px">${CA.name}</span></div>
            <button id="ddqb-toggle" style="width:100%;padding:8px;margin-bottom:8px;cursor:pointer">${S.get('enabled') ? 'Stop' : 'Start'}</button>
            <textarea id="ddqb-goal" style="width:100%;height:60px;background:#222;color:#fff;border:1px solid #444;font-size:11px">${S.get('goal')}</textarea>
            <div style="font-size:10px;margin-top:5px">Iteration: <span id="ddqb-iter">${S.get('iteration')}</span> / ${S.get('maxIterations')}</div>
        `;
        document.body.appendChild(div);
        div.querySelector('#ddqb-toggle').onclick = () => {
            const next = !S.get('enabled');
            S.set('enabled', next);
            location.reload();
        };
        div.querySelector('#ddqb-goal').onchange = (e) => S.set('goal', e.target.value);
    }

    async function typeAndSend(text) {
        const input = document.querySelector(CA.input[0]);
        if (!input) return;
        if (input.tagName === 'TEXTAREA') {
            input.value = text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            input.focus();
            document.execCommand('insertText', false, text);
        }
        await new Promise(r => setTimeout(r, 1000));
        const btn = document.querySelector(CA.send[0]);
        if (btn) btn.click();
    }

    if (S.get('enabled')) {
        window.addEventListener('load', () => {
            setTimeout(async () => {
                const iter = S.get('iteration');
                if (iter >= S.get('maxIterations')) {
                    S.set('enabled', false);
                    return;
                }
                S.set('iteration', iter + 1);
                const prompt = `ITERATION ${iter + 1}: ${S.get('goal')}\nReview previous output. Find 3 contradictions. Propose 1 legal strike.`;
                await typeAndSend(prompt);
            }, 5000);
        });
    }

    setTimeout(mountPanel, 2000);
})();
