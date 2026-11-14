/* Página do Mestre: Tabelas de Faísca, Mitos/Cavaleiros, Inimigos e Aventuras. */
(function () {
  const MB = window.MB; const { el, t } = MB;
  MB.views = MB.views || {};
  const TABS = ['tables', 'myths', 'enemies', 'adventures'];
  const history = []; // rolagens de tabela da sessão
  /** Junta linhas quebradas do PDF em parágrafos: nova linha só após ponto/parêntese e com maiúscula. */
  const paras = (lines) => lines.reduce((acc, l) => {
    if (acc.length && !(/[.)!?]$/.test(acc[acc.length - 1]) && /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9]/.test(l))) acc[acc.length - 1] += ' ' + l; else acc.push(l);
    return acc;
  }, []);
  const state = { group: 0, table: 0, mythId: null };

  /* ---------- Tabelas de Faísca ---------- */
  function tablesTab(box) {
    const L = MB.lang(); const groups = window.MB_SPARK;
    const result = el('div', { class: 'result', 'aria-live': 'polite' }); const grid = el('div', { class: 'spark' });
    const histBox = el('ul', { class: 'log' });
    const groupBtns = el('div', { class: 'chips', role: 'group', 'aria-label': t('tbl.group') });
    const tableBtns = el('div', { class: 'chips', role: 'group', 'aria-label': t('tbl.pick') });
    let hi = null;

    const cur = () => groups[state.group].tables[state.table];
    const word = (tb, c, r) => tb.rows[L][r - 1][c];
    function drawGrid() {
      const tb = cur(); const [c1, c2] = tb.cols[L];
      grid.replaceChildren(el('table', {}, el('caption', { text: tb.name[L] }),
        el('thead', {}, el('tr', {}, el('th', { text: '#' }), el('th', { text: c1 }), el('th', { text: c2 }))),
        el('tbody', {}, tb.rows[L].map((r, i) => el('tr', { 'data-n': i + 1 }, el('td', { text: i + 1 }), el('td', { text: r[0] }), el('td', { text: r[1] }))))));
      result.replaceChildren(el('div', { class: 'big', text: '—' }), el('div', { class: 'note', text: t('tbl.hint') }));
    }
    function drawHist() { histBox.replaceChildren(...(history.length ? history.map((h) => el('li', { text: h })) : [el('li', { text: t('tbl.empty') })])); }
    function roll() {
      const tb = cur(); const a = MB.d(12), b = MB.d(12);
      const text = `${word(tb, 0, a)} ${word(tb, 1, b)}`;
      grid.querySelectorAll('.hit').forEach((n) => n.classList.remove('hit'));
      const rows = grid.querySelectorAll('tbody tr');
      rows[a - 1].children[1].classList.add('hit'); rows[b - 1].children[2].classList.add('hit');
      MB.tumble(result, result.firstChild, text, 12, 350).then(() => {
        result.querySelector('.note').textContent = `${tb.name[L]} · d12 ${a} + d12 ${b}`;
        history.unshift(`${tb.name[L]}: ${text}`); history.length = Math.min(history.length, 14); drawHist();
      });
    }
    function rollGroup() {
      const g = groups[state.group]; const lines = g.tables.map((tb) => `${tb.name[L]}: ${word(tb, 0, MB.d(12))} ${word(tb, 1, MB.d(12))}`);
      history.unshift(...lines.reverse()); history.length = Math.min(history.length, 14); drawHist();
      result.replaceChildren(el('ul', { class: 'groupres' }, lines.reverse().map((l) => el('li', { text: l }))));
    }
    function drawChips() {
      groupBtns.replaceChildren(...groups.map((g, i) => el('button', { class: 'chip', type: 'button', 'aria-pressed': String(i === state.group), text: g.name[L],
        onclick: () => { state.group = i; state.table = 0; drawChips(); drawGrid(); } })));
      tableBtns.replaceChildren(...groups[state.group].tables.map((tb, i) => el('button', { class: 'chip', type: 'button', 'aria-pressed': String(i === state.table), text: tb.name[L],
        onclick: () => { state.table = i; drawChips(); drawGrid(); } })));
    }
    box.replaceChildren(el('div', { class: 'two' },
      el('div', { class: 'stack' }, el('div', { class: 'panel' }, el('h2', { text: t('tbl.title') }), el('p', { class: 'muted', text: t('tbl.lead') }), groupBtns, tableBtns), el('div', { class: 'panel' }, grid)),
      el('div', { class: 'stack' }, el('div', { class: 'panel' }, result,
        el('div', { class: 'actions', style: 'margin-top:.8rem' },
          el('button', { class: 'btn primary', type: 'button', html: MB.icons.d20 + '<span>' + t('tbl.roll') + '</span>', onclick: roll }),
          el('button', { class: 'btn', type: 'button', text: t('tbl.rollGroup'), onclick: rollGroup }))),
        el('div', { class: 'panel' }, el('h2', { text: t('tbl.history') }), histBox))));
    drawChips(); drawGrid(); drawHist();
  }

  /** Tabela d6 própria do Mito: um d6 por coluna. */
  function mythTable(m) {
    const L = MB.lang(); const entry = (window.MB_MYTH_TABLES || {})[m.id];
    if (!entry) return null;
    const tb = entry[L]; const fallback = (L === 'pt' && entry.ptFallback) || (L === 'en' && entry.enFallback);
    const result = el('p', { class: 'statline', 'aria-live': 'polite' });
    const body = el('tbody', {}, tb.rows.map((r, i) => el('tr', {}, el('td', { text: i + 1 }), r.map((c) => el('td', { text: c })))));
    const roll = () => {
      body.querySelectorAll('.hit').forEach((n) => n.classList.remove('hit'));
      const picked = tb.cols.map((_, c) => { const d = MB.d(6); body.children[d - 1].children[c + 1].classList.add('hit'); return tb.rows[d - 1][c]; });
      result.textContent = picked.join(' · ');
      history.unshift(`${m.name[L]} – ${tb.title}: ${picked.join(' ')}`); history.length = Math.min(history.length, 14);
    };
    return el('div', {}, el('h3', { text: `${t('myth.table')}: ${tb.title}` }),
      fallback ? el('p', { class: 'muted', text: t('myth.tableFallback') }) : null,
      el('div', { class: 'spark' }, el('table', {}, el('thead', {}, el('tr', {}, el('th', { text: 'd6' }), tb.cols.map((c) => el('th', { text: c })))), body)),
      el('div', { class: 'actions', style: 'margin-top:.6rem' },
        el('button', { class: 'btn sm', type: 'button', html: MB.icons.d20 + '<span>' + t('myth.tableRoll') + '</span>', onclick: roll }), result));
  }

  /* ---------- Mitos e Cavaleiros ---------- */
  function mythsTab(box) {
    const L = MB.lang(); const mythBox = el('div', {}); const knightBox = el('div', {});
    const select = el('select', { 'aria-label': t('myth.pick'), onchange: () => { state.mythId = select.value; drawMyth(); } },
      window.MB_MYTHS.map((m) => el('option', { value: m.id, text: `${m.d6}·${m.d12}  ${m.name[L]}` })));
    function drawMyth() {
      const m = window.MB_MYTHS.find((x) => x.id === state.mythId);
      if (!m) { mythBox.replaceChildren(el('p', { class: 'muted', text: t('myth.none') })); return; }
      select.value = m.id;
      mythBox.replaceChildren(el('div', { class: 'panel myth' },
        el('div', { class: 'enemy-head' }, el('h2', { text: m.name[L] }), el('span', { class: 'dice-tag', text: t('forge.d6d12', m.d6, m.d12) }), el('span', { class: 'spacer' }),
          el('button', { class: 'btn sm', type: 'button', html: MB.icons.plus + '<span>' + t('myth.toAdventure') + '</span>', onclick: () => MB.addMythToAdventure(m.id) })),
        el('img', { class: 'mythart', src: `assets/myths/${m.id}.webp`, alt: '', width: 800, height: 418 }),
        el('h3', { text: t('myth.omens') }),
        el('ol', { class: 'omens' }, m.omens[L].map((o) => el('li', {}, el('label', {}, el('input', { type: 'checkbox' }), el('span', { text: o }))))),
        el('h3', { text: t('myth.places') }),
        el('dl', { class: 'places' }, m.places[L].flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })])),
        mythTable(m),
        el('h3', { text: t('myth.cast') }),
        el('div', { class: 'castgrid' }, m.cast[L].map((c) => el('div', { class: 'rcard' },
          el('div', { class: 'enemy-head' }, el('b', { text: c.name }), el('span', { class: 'spacer' }),
            el('button', { class: 'btn sm', type: 'button', html: MB.icons.plus + '<span>' + t('myth.toTracker') + '</span>',
              onclick: () => { MB.enemyStore.add({ name: c.name, vig: c.vig, cla: c.cla, spi: c.spi, gd: c.gd, notes: c.details.join(' ') }); MB.toast(t('en.added'), 'ok'); } })),
          el('p', { class: 'statline', text: `${t('v.vig')} ${c.vig} · ${t('v.cla')} ${c.cla} · ${t('v.spi')} ${c.spi} · ${c.gd} ${t('v.gd')}` }),
          paras(c.details).map((d) => el('p', {}, MB.diceify(d, c.name))))))));
    }
    const rollMyth = () => { const d6 = MB.d(6), d12 = MB.d(12); state.mythId = `${d6}-${d12}`; drawMyth(); };

    function rollKnight() {
      const id = MB.rollKnightId(); const kd = MB.kdata(id);
      const st = { vig: MB.rollVirtue('wanderer'), cla: MB.rollVirtue('wanderer'), spi: MB.rollVirtue('wanderer'), gd: MB.rollGuard('wanderer') };
      knightBox.replaceChildren(el('div', { class: 'panel kn' },
        el('img', { src: `assets/knights/${id}.webp`, alt: '', width: 120, height: 200 }),
        el('div', {}, el('h2', { text: kd.name }),
          el('p', { class: 'statline', text: `${t('v.vig')} ${st.vig} · ${t('v.cla')} ${st.cla} · ${t('v.spi')} ${st.spi} · ${st.gd} ${t('v.gd')}` }),
          el('p', {}, el('b', { text: kd.ability.name + '. ' }), MB.diceify(kd.ability.text, kd.name)),
          el('p', {}, el('b', { text: kd.passion.name + '. ' }), MB.diceify(kd.passion.text, kd.name)),
          el('button', { class: 'btn sm', type: 'button', html: MB.icons.plus + '<span>' + t('myth.toTracker') + '</span>',
            onclick: () => { MB.enemyStore.add({ name: kd.name, ...st, notes: `${kd.property.join('; ')}. ${kd.ability.name}: ${kd.ability.text}` }); MB.toast(t('en.added'), 'ok'); } }))));
    }
    box.replaceChildren(el('div', { class: 'stack' },
      el('div', { class: 'panel' }, el('h2', { text: t('myth.title') }), el('p', { class: 'muted', text: t('myth.lead') }),
        el('div', { class: 'actions' }, el('button', { class: 'btn primary', type: 'button', html: MB.icons.d20 + '<span>' + t('myth.roll') + '</span>', onclick: rollMyth }), select)),
      mythBox,
      el('div', { class: 'panel' }, el('h2', { text: t('myth.knightTitle') }), el('p', { class: 'muted', text: t('myth.knightLead') }),
        el('button', { class: 'btn', type: 'button', html: MB.icons.d20 + '<span>' + t('myth.knightRoll') + '</span>', onclick: rollKnight })),
      knightBox));
    drawMyth();
  }

  MB.views.referee = function (root, tab) {
    tab = TABS.includes(tab) ? tab : 'tables';
    const panel = el('div', { class: 'tabpanel', role: 'tabpanel', id: 'rp', 'aria-labelledby': 'tab-' + tab });
    root.replaceChildren(el('div', { class: 'view' },
      el('div', { class: 'pagehead' }, el('div', {}, el('p', { class: 'eyebrow', text: 'Mythic Bastionland' }),
        el('h1', { tabindex: '-1', text: t('ref.title') }), el('p', { text: t('ref.lead') }))),
      el('nav', { class: 'tabs', role: 'tablist', 'aria-label': t('ref.title') }, TABS.map((k) =>
        el('a', { role: 'tab', id: 'tab-' + k, href: '#/referee/' + k, 'aria-selected': String(k === tab), 'aria-controls': 'rp', text: t('tab.' + k) }))),
      panel));
    ({ tables: tablesTab, myths: mythsTab, enemies: MB.renderEnemies, adventures: MB.renderAdventures })[tab](panel);
    return { crumb: t('crumb.referee') + ' / ' + t('tab.' + tab), title: t('ref.title') };
  };
})();
