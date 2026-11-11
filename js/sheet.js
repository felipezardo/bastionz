/* Ficha do cavaleiro: layout fiel à ficha oficial. Os campos atualizam só o próprio nó (sem re-renderizar a tela). */
(function () {
  const MB = window.MB; const { el, t } = MB;
  MB.views = MB.views || {};
  const rollLog = []; // histórico da sessão

  /** Caixa numérica com limites, botões ▲▼ e animação. */
  function numBox({ value, min, max, label, dotted, onChange }) {
    const input = el('input', { type: 'number', inputmode: 'numeric', min, max, step: 1, value, 'aria-label': label,
      oninput: () => { const n = parseInt(input.value, 10); if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n))); },
      onchange: () => { const n = Math.min(max, Math.max(min, parseInt(input.value, 10) || 0)); input.value = n; onChange(n); } });
    const bump = () => { input.classList.remove('bump'); void input.offsetWidth; input.classList.add('bump'); };
    const step = (d) => { const n = Math.min(max, Math.max(min, (parseInt(input.value, 10) || 0) + d)); input.value = n; onChange(n); bump(); };
    const node = el('div', { class: 'nbox' + (dotted ? ' max' : '') }, input,
      el('button', { class: 'step up', type: 'button', tabindex: '-1', 'aria-label': `${t('sheet.inc')}: ${label}`, text: '▲', onclick: () => step(1) }),
      el('button', { class: 'step down', type: 'button', tabindex: '-1', 'aria-label': `${t('sheet.dec')}: ${label}`, text: '▼', onclick: () => step(-1) }));
    return { node, input };
  }
  const slabel = (key) => { const [a, b] = t('vl.' + key); return el('span', { class: 'slabel' }, a, b ? el('small', { text: b }) : null); };

  MB.views.sheet = function (root, id) {
    const k = MB.store.get(id);
    if (!k) {
      root.replaceChildren(el('div', { class: 'view empty' }, el('h1', { tabindex: '-1', text: t('sheet.notFound') }),
        el('p', {}, el('a', { class: 'btn primary', href: '#/', text: t('sheet.back') }))));
      return { crumb: '?', title: t('sheet.notFound') };
    }
    const kd = MB.kdata(k.knightId);
    const savebar = el('span', { class: 'savebar', 'aria-live': 'polite' });
    const commit = MB.debounce(() => { MB.store.save(k); savebar.textContent = t('sheet.saved'); }, 250);
    const touch = () => { savebar.textContent = ''; commit(); };

    /* ----- Rolagens ----- */
    const resBig = el('div', { class: 'big', text: '—' }); const resNote = el('div', { class: 'note', text: t('rolls.hint') });
    const resNode = el('div', { class: 'result', 'aria-live': 'polite' }, resBig, resNote);
    const logList = el('ul', { class: 'log' }, el('li', { text: t('rolls.empty') }));
    function show(text, note, ok, sides) {
      MB.tumble(resNode, resBig, String(text), sides, 450).then(() => {
        resBig.classList.remove('pop'); void resBig.offsetWidth; resBig.classList.add('pop');
        resNote.className = 'note ' + (ok === true ? 'ok' : ok === false ? 'bad' : ''); resNote.textContent = note;
        rollLog.unshift(note); rollLog.length = Math.min(rollLog.length, 12);
        logList.replaceChildren(...rollLog.map((n) => el('li', { text: n })));
        if (ok != null) MB.toast(note, ok ? 'ok' : 'bad');
      });
    }
    function rollSave(key) {
      const r = MB.d(20); const n = k.virtues[key].cur; const ok = r <= n;
      show(r, t('rolls.saveRes', t('v.' + key), r, n, ok), ok, 20);
    }
    function rollFree(s) { const r = MB.d(s); show(r, `d${s} = ${r}`, null, s); }

    /* ----- Cabeçalho ----- */
    const nameIn = el('input', { class: 'under', type: 'text', maxlength: 80, value: k.name, placeholder: t('sheet.namePh'), 'aria-label': t('sheet.named'),
      oninput: () => { k.name = nameIn.value; touch(); } });
    const fateIn = el('input', { class: 'under', type: 'text', maxlength: 120, value: k.fate, placeholder: t('sheet.fatePh'), 'aria-label': t('sheet.fate'),
      oninput: () => { k.fate = fateIn.value; touch(); } });
    const shieldImg = el('img', { src: MB.portrait(k), alt: '', width: 150, height: 180 });
    const shield = el('button', { class: 'shield-btn', type: 'button', 'aria-label': t('sheet.portrait'),
      onclick: () => MB.portraitDialog(k, (value) => { k.image = value; shieldImg.src = MB.portrait(k); touch(); }) },
      shieldImg,
      el('span', { html: '<svg class="frame" viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true"><path d="M3,2.4H97V66C97,96 70,111.6 50,118.8C30,111.6 3,96 3,66Z" fill="none" stroke="#141a1c" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>' }),
      el('span', { class: 'hint', text: t('sheet.portrait') }));
    // o <span> com svg acima é só um invólucro; promove o svg para filho direto do botão
    shield.replaceChild(shield.querySelector('svg'), shield.children[1]);

    /* ----- Atributos ----- */
    const stats = ['vig', 'cla', 'spi'].map((key) => {
      const lab = t('v.' + key);
      const cur = numBox({ value: k.virtues[key].cur, min: 0, max: 19, label: `${lab} ${t('sheet.cur')}`, onChange: (n) => { k.virtues[key].cur = n; touch(); } });
      const mx = numBox({ value: k.virtues[key].max, min: 0, max: 19, label: `${lab} ${t('sheet.max')}`, dotted: true, onChange: (n) => { k.virtues[key].max = n; touch(); } });
      return el('div', { class: 'stat' }, slabel(key), cur.node, mx.node,
        el('button', { class: 'dbtn', type: 'button', title: t('rolls.save', lab), 'aria-label': t('rolls.save', lab), html: MB.icons.d20, onclick: () => rollSave(key) }));
    });
    const gCur = numBox({ value: k.guard.cur, min: 0, max: 99, label: `${t('vl.gd')[0]} ${t('sheet.cur')}`, onChange: (n) => { k.guard.cur = n; touch(); } });
    const gMax = numBox({ value: k.guard.max, min: 0, max: 99, label: `${t('vl.gd')[0]} ${t('sheet.max')}`, dotted: true, onChange: (n) => { k.guard.max = n; touch(); } });
    const guard = el('div', { class: 'stat' }, slabel('gd'), gCur.node, gMax.node, el('span'));

    const ranks = [0, 1, 2, 3, 4].map((i) => el('li', { text: t('rank.' + i) }));
    const paintRank = () => { const r = MB.rankIndex(k.glory); ranks.forEach((li, i) => { li.classList.toggle('on', i === r); if (i === r) li.setAttribute('aria-current', 'true'); else li.removeAttribute('aria-current'); }); };
    const glory = numBox({ value: k.glory, min: 0, max: 99, label: t('v.gl'), onChange: (n) => { k.glory = n; paintRank(); touch(); } });
    const gloryRow = el('div', { class: 'stat glory' }, slabel('gl'), glory.node);

    const ages = ['young', 'mature', 'old'].map((a) => el('label', {},
      el('input', { type: 'radio', name: 'age', value: a, checked: k.age === a, onchange: () => { k.age = a; touch(); } }), t('age.' + a)));

    /* ----- Painéis do lado direito ----- */
    const fatSwitch = el('input', { type: 'checkbox', checked: k.fatigued, onchange: () => { k.fatigued = fatSwitch.checked; featsBox.classList.toggle('fatigued', k.fatigued); touch(); } });
    const feat = (n) => el('div', { class: 'feat' }, el('b', { text: t('feat.' + n) }), ' – ' + t('feat.' + n + '.d'), el('small', { text: t('feat.' + n + '.s') }));
    const featsBox = el('div', { class: 'sec feats' + (k.fatigued ? ' fatigued' : '') }, feat('smite'), feat('focus'), feat('deny'));
    const notes = el('textarea', { rows: 5, maxlength: 4000, placeholder: t('sheet.notesPh'), 'aria-label': t('sheet.notes'),
      oninput: () => { k.notes = notes.value; touch(); } });
    notes.value = k.notes;

    const sheet = el('article', { class: 'sheet', 'aria-label': t('sheet.title') },
      el('div', { class: 'sheet-head' },
        el('div', {},
          el('h1', { class: 'sheet-title', tabindex: '-1', text: t('sheet.title') }),
          el('div', { class: 'lines' },
            el('label', {}, el('span', { text: t('sheet.named') }), nameIn),
            el('div', {}, t('sheet.knownAs') + ' ', el('span', { class: 'epi knighttitle', text: MB.epithet(k.knightId) }), t('sheet.knightSuffix') ? ' ' + t('sheet.knightSuffix') : ''),
            el('label', {}, el('span', { text: t('sheet.fate') }), fateIn))),
        shield),
      el('div', { class: 'sheet-body' },
        el('div', {},
          ...stats, guard, gloryRow,
          el('div', { class: 'cols2' },
            el('div', { class: 'ages' }, el('h3', { text: t('sheet.age') }), ages),
            el('div', {}, el('h3', { text: t('sheet.rank') }), el('ol', { class: 'ranks', style: 'list-style:none;padding:0;margin:0' }, ranks))),
          el('div', { class: 'static' }, el('h3', { text: t('sheet.recovery') }),
            el('p', {}, el('b', { text: 'VIG' }), ' – ' + t('rec.vig')),
            el('p', {}, el('b', { text: 'CLA' }), ' – ' + t('rec.cla')),
            el('p', {}, el('b', { text: t('v.spi') }), ' – ' + t('rec.spi')),
            el('p', {}, el('b', { text: t('rec.gdLabel') }), ' – ' + t('rec.gd'))),
          el('div', { class: 'oath' }, el('h3', { text: t('sheet.oath') }), el('p', { text: t('oath.1') }), el('p', { text: t('oath.2') }), el('p', { text: t('oath.3') }))),
        el('div', {},
          el('div', { class: 'sec' }, el('h3', { text: t('sheet.property') }), el('ul', {}, kd.property.map((p) => el('li', { text: p }))),
            el('p', { class: 'fine', style: 'text-align:left;margin:.4rem 0 0', text: t('sheet.gear') })),
          el('div', { class: 'sec' }, el('h3', { text: t('sheet.ability') }), el('p', {}, el('span', { class: 'name', text: kd.ability.name + '. ' }), kd.ability.text)),
          el('div', { class: 'sec' }, el('h3', { text: t('sheet.passion') }), el('p', {}, el('span', { class: 'name', text: kd.passion.name + '. ' }), kd.passion.text)),
          el('div', { class: 'sec' }, el('h3', { text: t('sheet.feats') }),
            el('label', { class: 'switch' }, fatSwitch, t('sheet.fatigued')), featsBox),
          el('div', { class: 'sec gambits' }, el('h3', { text: t('sheet.gambits') }),
            t('gam').map(([a, b]) => el('p', {}, el('b', { text: a }), ' ' + b))),
          el('div', { class: 'sec' }, el('h3', { text: t('sheet.notes') }), notes))),
      el('p', { class: 'fine', text: t('sheet.credit') }));

    const side = el('aside', { class: 'side no-print', 'aria-label': t('rolls.title') },
      el('div', { class: 'panel' }, el('h2', { text: t('rolls.title') }), resNode,
        el('h3', { style: 'font-size:1.05rem;margin:1rem 0 .5rem', text: t('rolls.free') }),
        el('div', { class: 'tray' }, [4, 6, 8, 10, 12, 20].map((s) => el('button', { class: 'die', type: 'button', 'aria-label': `d${s}`, text: 'd' + s, onclick: () => rollFree(s) }))),
        el('h3', { style: 'font-size:1.05rem;margin:1rem 0 .4rem', text: t('rolls.log') }), logList));

    const toolbar = el('div', { class: 'actions no-print', style: 'margin-bottom:1.2rem' },
      el('a', { class: 'btn ghost', href: '#/', text: '← ' + t('sheet.back') }),
      el('button', { class: 'btn', type: 'button', html: MB.icons.swap + '<span>' + t('sheet.changeKnight') + '</span>', onclick: async () => {
        const nid = await MB.pickKnight(k.knightId); if (!nid || nid === k.knightId) return;
        k.knightId = nid; MB.store.save(k); MB.refresh();
      } }),
      el('button', { class: 'btn', type: 'button', html: MB.icons.download + '<span>' + t('sheet.exportOne') + '</span>',
        onclick: () => { MB.store.save(k); MB.download((k.name || 'knight').replace(/[^\w-]+/g, '_') + '.mb.json', MB.store.exportJSON([k.id])); } }),
      el('button', { class: 'btn ghost', type: 'button', html: MB.icons.print + '<span>' + t('sheet.print') + '</span>', onclick: () => window.print() }),
      savebar);

    paintRank();
    root.replaceChildren(el('div', { class: 'view' }, toolbar, el('div', { class: 'sheetwrap' }, sheet, side)));
    return { crumb: k.name || kd.name, title: (k.name || kd.name) + ' — Mythic Bastionland' };
  };
})();
