/* Utilitários de UI: criação de DOM, ícones, bandeiras, toasts, diálogos. */
(function () {
  const MB = (window.MB = window.MB || {});

  MB.$ = (sel, root = document) => root.querySelector(sel);

  /** Cria elementos sem usar innerHTML com dados do usuário. */
  MB.el = function (tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v; // somente strings estáticas internas
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (v === true) n.setAttribute(k, '');
      else n.setAttribute(k, v);
    }
    for (const c of kids.flat()) {
      if (c == null || c === false) continue;
      n.append(c.nodeType ? c : document.createTextNode(c));
    }
    return n;
  };

  const svg = (d, extra = '') =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  MB.icons = {
    d20: svg('<path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M12 2v20M3 7l9 5 9-5M3 17l9-5 9 5"/>'),
    shuffle: svg('<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    trash: svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
    copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
    download: svg('<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>'),
    upload: svg('<path d="M12 15V3M7 8l5-5 5 5M4 21h16"/>'),
    swap: svg('<path d="M4 8h14l-3-3M20 16H6l3 3"/>'),
    print: svg('<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svg('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>'),
    up: svg('<path d="M6 15l6-6 6 6"/>'),
  };

  /** Bandeiras em SVG (emojis de bandeira não aparecem no Windows). */
  MB.flags = {
    pt: '<svg viewBox="0 0 60 42" aria-hidden="true"><rect width="60" height="42" fill="#009b3a"/><path d="M30 5 54 21 30 37 6 21z" fill="#fedf00"/><circle cx="30" cy="21" r="8.5" fill="#002776"/><path d="M22 19c6-2 12-1 16 3" stroke="#fff" stroke-width="1.6" fill="none"/></svg>',
    en: '<svg viewBox="0 0 60 42" aria-hidden="true"><rect width="60" height="42" fill="#012169"/><path d="M0 0l60 42M60 0 0 42" stroke="#fff" stroke-width="8"/><path d="M0 0l60 42M60 0 0 42" stroke="#c8102e" stroke-width="3"/><path d="M30 0v42M0 21h60" stroke="#fff" stroke-width="13"/><path d="M30 0v42M0 21h60" stroke="#c8102e" stroke-width="7"/></svg>',
  };

  MB.toast = function (msg, kind = '') {
    const box = MB.$('#toasts');
    const t = MB.el('div', { class: 'toast ' + kind, text: msg });
    box.append(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2600);
  };

  /** Diálogo de confirmação acessível (substitui window.confirm). */
  MB.confirm = function (title, body, okLabel, cancelLabel) {
    return new Promise((resolve) => {
      const dlg = MB.el('dialog', { 'aria-labelledby': 'cf-t' });
      const done = (v) => { dlg.close(); dlg.remove(); resolve(v); };
      dlg.append(MB.el('div', { class: 'dlg' },
        MB.el('h2', { id: 'cf-t', text: title }),
        MB.el('p', { text: body }),
        MB.el('div', { class: 'actions' },
          MB.el('button', { class: 'btn danger', type: 'button', text: okLabel, onclick: () => done(true) }),
          MB.el('button', { class: 'btn ghost', type: 'button', text: cancelLabel, onclick: () => done(false), autofocus: true }))));
      dlg.addEventListener('cancel', () => resolve(false));
      document.body.append(dlg);
      dlg.showModal();
    });
  };

  /** Abre um <dialog> de conteúdo livre e o remove ao fechar. */
  MB.openDialog = function (content, labelId) {
    const dlg = MB.el('dialog', { 'aria-labelledby': labelId });
    dlg.append(content);
    dlg.addEventListener('close', () => dlg.remove());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    document.body.append(dlg);
    dlg.showModal();
    return dlg;
  };

  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Anima um número "rolando" antes de fixar o valor final. */
  MB.tumble = function (node, valueEl, finalText, sides, ms) {
    return new Promise((res) => {
      if (reduce()) { valueEl.textContent = finalText; return res(); }
      node.classList.add('rolling');
      const iv = setInterval(() => { valueEl.textContent = 1 + Math.floor(Math.random() * sides); }, 60);
      setTimeout(() => { clearInterval(iv); node.classList.remove('rolling'); valueEl.textContent = finalText; res(); }, ms);
    });
  };

  MB.debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  MB.download = function (filename, text) {
    const a = MB.el('a', { href: URL.createObjectURL(new Blob([text], { type: 'application/json' })), download: filename });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  MB.pickFile = function (accept) {
    return new Promise((resolve) => {
      const inp = MB.el('input', { type: 'file', accept, class: 'sr-only', tabindex: '-1' });
      inp.addEventListener('change', () => { resolve(inp.files[0] || null); inp.remove(); });
      document.body.append(inp); inp.click();
    });
  };
})();
