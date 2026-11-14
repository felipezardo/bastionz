/* Rastreador de inimigos (combate): dano segue as regras do livro (p. 8). */
(function () {
  const MB = window.MB; const { el, t } = MB; const KEY = 'mb.enemies.v1';
  let list = null;
  const load = () => (list = list || MB.rstore.load(KEY));
  const save = () => MB.rstore.save(KEY, list);
  const clamp = (n, a, b) => Math.min(b, Math.max(a, Math.round(+n) || 0));

  /** Bestiário: todo o elenco dos 72 Mitos. */
  MB.bestiary = (() => {
    const out = [];
    for (const m of window.MB_MYTHS) {
      const en = m.cast.en, pt = m.cast.pt;
      en.forEach((c, i) => out.push({ mythId: m.id, myth: m.name, name: { en: c.name, pt: (pt[i] || c).name },
        vig: c.vig, cla: c.cla, spi: c.spi, gd: c.gd, details: { en: c.details.join(' '), pt: (pt[i] || c).details.join(' ') } }));
    }
    return out;
  })();

  MB.enemyStore = {
    add(o) {
      load();
      const g = (v, d) => ({ cur: clamp(v, 0, 99) || d, max: clamp(v, 0, 99) || d });
      const c = { id: MB.uid(), name: String(o.name || t('en.unnamed')).slice(0, 80), vig: g(o.vig, 6), cla: g(o.cla, 6), spi: g(o.spi, 6), gd: { cur: clamp(o.gd, 0, 99), max: clamp(o.gd, 0, 99) }, notes: String(o.notes || '').slice(0, 1500), status: '' };
      list.push(c); save(); return c;
    },
    all: () => load(),
  };

  /** Aplica Dano: Guarda primeiro; excesso vai ao VIG. Retorna chave do resultado. */
  function applyDamage(c, dmg) {
    const exposed = c.cla.cur === 0; const gd = exposed ? 0 : c.gd.cur;
    if (dmg <= 0) return 'evade';
    if (dmg < gd) { c.gd.cur = gd - dmg; return 'evade'; }
    if (dmg === gd) { c.gd.cur = 0; c.status = c.status || 'scar'; return 'scar'; }
    const excess = dmg - gd; const before = c.vig.cur; c.gd.cur = 0; c.vig.cur = Math.max(0, before - excess);
    if (c.vig.cur === 0) { c.status = 'slain'; return 'slain'; }
    if (excess * 2 >= before) { c.status = 'mortal'; return 'mortal'; }
    c.status = 'wounded'; return 'wounded';
  }

  MB.renderEnemies = function (box) {
    load();
    const listBox = el('div', { class: 'enemy-list' });
    const draw = () => {
      listBox.replaceChildren(...(list.length ? list.map(card) : [el('p', { class: 'muted', text: t('en.empty') })]));
    };
    const persist = MB.debounce(save, 250);

    function card(c) {
      const out = el('p', { class: 'enemy-out', 'aria-live': 'polite' });
      const badges = el('span', { class: 'badges' });
      const paintState = () => {
        const b = [];
        if (c.status) b.push(el('span', { class: 'badge ' + c.status, text: t('en.res.' + c.status) }));
        if (c.cla.cur === 0) b.push(el('span', { class: 'badge', text: t('en.state.exposed') }));
        if (c.vig.cur === 0) b.push(el('span', { class: 'badge', text: t('en.state.exhausted') }));
        if (c.spi.cur === 0) b.push(el('span', { class: 'badge', text: t('en.state.impaired') }));
        badges.replaceChildren(...b);
        node.classList.toggle('slain', c.status === 'slain');
      };
      const boxes = {};
      const nb = (key, sub, label) => {
        const b = MB.numBox({ value: c[key][sub], min: 0, max: 99, label: `${label} ${t(sub === 'cur' ? 'sheet.cur' : 'sheet.max')}`, dotted: sub === 'max',
          onChange: (n) => { c[key][sub] = n; paintState(); persist(); } });
        boxes[key + sub] = b.input; return b.node;
      };
      const stat = (key, label) => el('div', { class: 'estat' }, el('span', { class: 'lbl', text: label }), nb(key, 'cur', label), nb(key, 'max', label),
        key === 'gd' ? null : el('button', { class: 'btn sm icon-btn ghost', type: 'button', title: t('en.save', label), 'aria-label': `${c.name}: ${t('en.save', label)}`, html: MB.icons.d20,
          onclick: () => MB.rollDice('d20', { label: `${c.name}: ${t('en.save', label)}`, target: c[key].cur }) }));
      const dmg = el('input', { type: 'number', min: 0, max: 99, value: 1, 'aria-label': t('en.damage'), class: 'dmg' });
      const refresh = () => { for (const k of ['vig', 'cla', 'spi', 'gd']) { boxes[k + 'cur'].value = c[k].cur; } paintState(); persist(); };
      const notesView = el('p', { class: 'enotes-view' });
      const paintNotes = () => notesView.replaceChildren(...(c.notes ? MB.diceify(c.notes, c.name) : [el('span', { class: 'muted', text: t('en.notes') })]));
      const notesEdit = el('textarea', { rows: 3, class: 'enotes', hidden: true, placeholder: t('en.notes'), 'aria-label': t('en.notes'), maxlength: 1500,
        oninput: (e) => { c.notes = e.target.value; paintNotes(); persist(); } });
      const editBtn = el('button', { class: 'btn sm ghost', type: 'button', text: t('en.editNotes'), onclick: () => { notesEdit.hidden = !notesEdit.hidden; if (!notesEdit.hidden) notesEdit.focus(); } });
      paintNotes();
      const node = el('article', { class: 'rcard enemy' },
        el('div', { class: 'enemy-head' },
          el('input', { type: 'text', class: 'ename', value: c.name, maxlength: 80, 'aria-label': t('en.name'), oninput: (e) => { c.name = e.target.value; persist(); } }),
          badges,
          el('button', { class: 'btn sm icon-btn ghost', type: 'button', title: t('en.dup'), 'aria-label': t('en.dup'), html: MB.icons.copy,
            onclick: () => { const cp = JSON.parse(JSON.stringify(c)); cp.id = MB.uid(); cp.name += ' 2'; list.splice(list.indexOf(c) + 1, 0, cp); save(); draw(); } }),
          el('button', { class: 'btn sm icon-btn ghost danger', type: 'button', title: t('en.remove'), 'aria-label': t('en.remove'), html: MB.icons.trash,
            onclick: () => { list = list.filter((x) => x !== c); save(); draw(); } })),
        el('div', { class: 'estats' }, stat('vig', t('v.vig')), stat('cla', t('v.cla')), stat('spi', t('v.spi')), stat('gd', t('v.gd'))),
        el('div', { class: 'enemy-actions' },
          dmg,
          el('button', { class: 'btn sm primary', type: 'button', text: t('en.apply'), onclick: () => {
            const r = applyDamage(c, clamp(dmg.value, 0, 99)); out.textContent = t('en.res.' + r + '.d'); refresh();
          } }),
          el('button', { class: 'btn sm', type: 'button', text: t('en.restore'), onclick: () => { c.gd.cur = c.gd.max; if (c.status === 'scar') c.status = ''; out.textContent = ''; refresh(); } })),
        out,
        notesView, editBtn,
        notesEdit);
      notesEdit.value = c.notes;
      paintState();
      return node;
    }

    /* ----- Adicionar: livre e do livro ----- */
    const f = {};
    const field = (id, label, type, val) => el('div', { class: 'field' }, el('label', { for: 'ef-' + id, text: label }),
      (f[id] = el('input', { id: 'ef-' + id, type, value: val, min: type === 'number' ? 0 : null, max: type === 'number' ? 99 : null, maxlength: type === 'text' ? 80 : null })));
    const custom = el('div', { class: 'panel' }, el('h2', { text: t('en.addCustom') }),
      field('name', t('en.name'), 'text', ''),
      el('div', { class: 'row4' }, field('vig', t('v.vig'), 'number', 6), field('cla', t('v.cla'), 'number', 6), field('spi', t('v.spi'), 'number', 6), field('gd', t('v.gd'), 'number', 2)),
      el('button', { class: 'btn primary', type: 'button', html: MB.icons.plus + '<span>' + t('en.add') + '</span>', onclick: () => {
        MB.enemyStore.add({ name: f.name.value, vig: f.vig.value, cla: f.cla.value, spi: f.spi.value, gd: f.gd.value }); f.name.value = ''; draw(); MB.toast(t('en.added'), 'ok');
      } }));
    const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const results = el('ul', { class: 'results' });
    const search = el('input', { type: 'search', placeholder: t('en.search'), 'aria-label': t('en.search'),
      oninput: MB.debounce(() => {
        const q = fold(search.value.trim()); const L = MB.lang();
        const hits = (q ? MB.bestiary.filter((b) => fold(b.name[L] + ' ' + b.myth[L]).includes(q)) : MB.bestiary.slice(0, 8)).slice(0, 24);
        results.replaceChildren(...hits.map((b) => el('li', {},
          el('div', {}, el('b', { text: b.name[L] }), el('small', { text: ` · ${b.myth[L]} · ${t('v.vig')} ${b.vig} ${t('v.cla')} ${b.cla} ${t('v.spi')} ${b.spi} ${t('v.gd')} ${b.gd}` })),
          el('button', { class: 'btn sm', type: 'button', 'aria-label': `${t('en.add')}: ${b.name[L]}`, html: MB.icons.plus,
            onclick: () => { MB.enemyStore.add({ name: b.name[L], vig: b.vig, cla: b.cla, spi: b.spi, gd: b.gd, notes: b.details[L] }); draw(); MB.toast(t('en.added'), 'ok'); } }))));
      }, 120) });
    const book = el('div', { class: 'panel' }, el('h2', { text: t('en.fromBook') }), search, results);
    search.dispatchEvent(new Event('input'));

    box.replaceChildren(el('div', { class: 'two' },
      el('div', {}, el('div', { class: 'actions', style: 'margin-bottom:1rem' },
        el('h2', { text: t('en.title') }), el('span', { class: 'spacer' }),
        list.length ? el('button', { class: 'btn sm ghost danger', type: 'button', text: t('en.clear'), onclick: async () => {
          if (await MB.confirm(t('en.clear'), t('en.clearBody'), t('del.ok'), t('del.cancel'))) { list = []; save(); draw(); } } }) : null), listBox),
      el('div', { class: 'stack' }, custom, book)));
    draw();
  };
})();
