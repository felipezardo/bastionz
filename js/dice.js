/* Rolador de dados: transforma "3d10", "d8"… em botões e mostra a rolagem animada.
   Regra de Ataque (livro p. 8): vale o MAIOR dado; dados 4+ podem pagar Gambitos. */
(function () {
  const MB = window.MB; const { el, t } = MB;
  const RE = /(?<![\w])(\d{0,2})d(\d{1,3})(?![\w])/gi;
  const hist = []; let pop = null; let seq = 0;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function panel() {
    if (pop) return pop;
    const out = {};
    out.title = el('strong', { class: 'dp-title' });
    out.dice = el('div', { class: 'dp-dice', 'aria-hidden': 'true' });
    out.sum = el('p', { class: 'dp-sum', 'aria-live': 'polite' });
    out.hint = el('p', { class: 'dp-hint' });
    out.hist = el('ul', { class: 'dp-hist' });
    out.root = el('section', { class: 'dicepop', 'aria-label': t('dice.title'), hidden: true },
      el('div', { class: 'dp-head' }, out.title,
        el('button', { class: 'btn sm icon-btn ghost', type: 'button', 'aria-label': t('pick.close'), html: MB.icons.close, onclick: () => { out.root.hidden = true; } })),
      out.dice, out.sum, out.hint, out.hist);
    document.body.append(out.root);
    return (pop = out);
  }

  /** Rola uma expressão ("3d10", "d8"). opts: label, target (Salvaguarda: passa se <= target). */
  MB.rollDice = function (expr, opts = {}) {
    const m = /^(\d*)d(\d+)$/i.exec(expr.trim()); if (!m) return;
    const n = Math.min(+(m[1] || 1), 20); const sides = +m[2];
    const vals = Array.from({ length: n }, () => MB.d(sides));
    const p = panel(); const id = ++seq;
    p.root.hidden = false;
    p.title.textContent = (opts.label ? opts.label + ' — ' : '') + `${n > 1 ? n : ''}d${sides}`;
    p.sum.textContent = ''; p.hint.textContent = '';
    const tiles = vals.map(() => el('span', { class: 'die-tile rolling', text: '?' }));
    p.dice.replaceChildren(...tiles);
    const settle = () => {
      if (id !== seq) return;
      const max = Math.max(...vals); const sum = vals.reduce((a, b) => a + b, 0);
      tiles.forEach((tl, i) => { tl.classList.remove('rolling'); tl.textContent = vals[i]; tl.classList.add('settle'); if (vals[i] === max && n > 1) tl.classList.add('top'); });
      let text;
      if (opts.target != null) { const ok = vals[0] <= opts.target; text = `${vals[0]} / ${opts.target} — ${t(ok ? 'rolls.pass' : 'rolls.fail')}`; p.sum.className = 'dp-sum ' + (ok ? 'ok' : 'bad'); }
      else { text = n > 1 ? `${t('dice.max')}: ${max} · ${t('dice.sum')}: ${sum}` : `${vals[0]}`; p.sum.className = 'dp-sum'; }
      p.sum.textContent = text;
      p.hint.textContent = n > 1 && opts.target == null && vals.filter((v) => v >= 4).length > 1 ? t('dice.gambit') : '';
      hist.unshift(`${opts.label || 'd' + sides} (${n > 1 ? n : ''}d${sides}): [${vals.join(', ')}] → ${text}`); hist.length = Math.min(hist.length, 6);
      p.hist.replaceChildren(...hist.map((h) => el('li', { text: h })));
    };
    if (reduced()) return settle();
    const iv = setInterval(() => tiles.forEach((tl) => { if (tl.classList.contains('rolling')) tl.textContent = 1 + Math.floor(Math.random() * sides); }), 55);
    tiles.forEach((tl, i) => setTimeout(() => { tl.classList.remove('rolling'); tl.textContent = vals[i]; }, 450 + i * 120));
    setTimeout(() => { clearInterval(iv); settle(); }, 450 + n * 120 + 60);
  };

  /** Converte expressões de dados em botões. Devolve nós para usar em MB.el. */
  MB.diceify = function (text, ctx) {
    const out = []; let last = 0; const s = String(text || '');
    for (const m of s.matchAll(RE)) {
      const before = s.slice(last, m.index); out.push(before);
      const prev = s.slice(0, m.index).split(/[.;(),]/).pop().trim();
      const label = /^[+\s]*$/.test(prev) || prev.length > 32 ? ctx : (ctx ? `${ctx}: ${prev}` : prev);
      const expr = `${m[1] || ''}d${m[2]}`;
      out.push(el('button', { class: 'dx', type: 'button', title: t('dice.roll', expr), 'aria-label': t('dice.roll', expr), onclick: () => MB.rollDice(expr, { label }) }, `${m[1] || ''}d${m[2]}`));
      last = m.index + m[0].length;
    }
    out.push(s.slice(last));
    return out;
  };
})();
