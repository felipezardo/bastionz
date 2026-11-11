/* Forja: randomizador de cavaleiros seguindo as regras do livro. Atualiza só o que mudou. */
(function () {
  const MB = window.MB; const { el, t } = MB;
  MB.views = MB.views || {};

  const TILES = [['vig', 18], ['cla', 18], ['spi', 18], ['gd', 12]];

  MB.views.forge = function (root) {
    const dr = MB.generate('wanderer');
    const refs = {};

    /* ----- Início (radiogroup) ----- */
    const startBtns = Object.keys(MB.STARTS).map((s) => {
      const st = MB.STARTS[s];
      return el('button', { class: 'start', type: 'button', role: 'radio', 'data-start': s,
        onclick: () => setStart(s) },
        el('strong', { text: t('start.' + s) }), el('span', { text: t('start.' + s + '.d') }),
        el('code', { text: `${t('forge.virtues')}: ${st.virtue} · ${t('v.gd')}: ${st.guard}` }));
    });
    const startBox = el('div', { class: 'starts', role: 'radiogroup', 'aria-label': t('forge.start') }, startBtns);
    startBox.addEventListener('keydown', (e) => {
      const keys = Object.keys(MB.STARTS); const i = keys.indexOf(dr.start);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setStart(keys[(i + 1) % 3]); startBtns[(i + 1) % 3].focus(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); setStart(keys[(i + 2) % 3]); startBtns[(i + 2) % 3].focus(); }
    });

    /* ----- Pré-visualização ----- */
    refs.img = el('img', { alt: '', width: 360, height: 836 });
    refs.card = el('div', { class: 'portrait-card' }, refs.img);
    refs.kname = el('h2', {}); refs.ktag = el('span', { class: 'dice-tag' });
    refs.perks = el('dl', { class: 'perks' });

    const tiles = TILES.map(([key, sides]) => {
      const val = el('span', { class: 'val', 'aria-live': 'polite' });
      const lblKey = key === 'gd' ? t('vl.gd')[0] : t('v.' + key);
      const node = el('div', { class: 'tile' },
        el('span', { class: 'lbl', text: lblKey }), val,
        el('button', { class: 'btn sm icon-btn ghost roll', type: 'button', title: t('forge.reroll', lblKey), 'aria-label': t('forge.reroll', lblKey),
          html: MB.icons.d20, onclick: () => rerollTile(key) }));
      refs[key] = { node, val, sides };
      return node;
    });

    refs.name = el('input', { type: 'text', id: 'f-name', maxlength: 80, placeholder: t('forge.namePh'), autocomplete: 'off',
      oninput: (e) => { dr.name = e.target.value; } });

    const preview = el('div', { class: 'panel' },
      el('div', { class: 'preview' },
        refs.card,
        el('div', { class: 'kinfo' },
          el('p', { class: 'eyebrow', text: t('forge.knight') }),
          refs.kname, el('div', { class: 'sub' }, refs.ktag),
          el('div', { class: 'actions' },
            el('button', { class: 'btn', type: 'button', html: MB.icons.d20 + '<span>' + t('forge.rollKnight') + '</span>', onclick: rerollKnight }),
            el('button', { class: 'btn ghost', type: 'button', html: MB.icons.swap + '<span>' + t('forge.pick') + '</span>', onclick: pickKnight })),
          el('div', { class: 'tiles', role: 'group', 'aria-label': t('forge.virtues') }, tiles),
          refs.perks)),
      el('div', { class: 'field' }, el('label', { for: 'f-name', text: t('forge.name') }),
        el('div', { class: 'inline' }, refs.name,
          el('button', { class: 'btn', type: 'button', html: MB.icons.shuffle, 'aria-label': t('forge.nameRandom'), title: t('forge.nameRandom'),
            onclick: () => { dr.name = MB.randomName(); refs.name.value = dr.name; } }))),
      el('div', { class: 'actions', style: 'margin-top:1rem' },
        el('button', { class: 'btn', type: 'button', html: MB.icons.d20 + '<span>' + t('forge.rollAll') + '</span>', onclick: rollAll }),
        el('button', { class: 'btn primary', type: 'button', text: t('forge.create'), onclick: create })));

    root.replaceChildren(el('div', { class: 'view' },
      el('div', { class: 'pagehead' }, el('div', {},
        el('p', { class: 'eyebrow', text: 'Mythic Bastionland' }),
        el('h1', { tabindex: '-1', text: t('forge.title') }), el('p', { text: t('forge.lead') }))),
      el('div', { class: 'forge' }, el('section', { class: 'panel', 'aria-labelledby': 'st-h' }, el('h2', { id: 'st-h', text: t('forge.start') }), startBox), preview)));

    /* ----- Atualizações pontuais ----- */
    function paintStart() {
      startBtns.forEach((b) => { const on = b.dataset.start === dr.start; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
    }
    function paintKnight(animate) {
      const kd = MB.kdata(dr.knightId);
      refs.img.src = `assets/knights/${dr.knightId}.webp`;
      if (animate) { refs.card.classList.remove('swap'); void refs.card.offsetWidth; refs.card.classList.add('swap'); }
      refs.kname.textContent = kd.name; refs.ktag.textContent = t('forge.d6d12', kd.d6, kd.d12);
      refs.perks.replaceChildren(
        el('dt', { text: t('sheet.property') }), el('dd', {}, el('ul', {}, kd.property.map((p) => el('li', { text: p })))),
        el('dt', { text: t('sheet.ability') }), el('dd', {}, el('b', { text: kd.ability.name + '. ' }), kd.ability.text),
        el('dt', { text: t('sheet.passion') }), el('dd', {}, el('b', { text: kd.passion.name + '. ' }), kd.passion.text));
    }
    function paintTile(key) { refs[key].val.textContent = dr[key]; }

    function setStart(s) {
      if (s === dr.start) return;
      dr.start = s; paintStart(); rollValues();
    }
    function rollValues() {
      return Promise.all(TILES.map(([key, sides], i) => {
        dr[key] = key === 'gd' ? MB.rollGuard(dr.start) : MB.rollVirtue(dr.start);
        return MB.tumble(refs[key].node, refs[key].val, String(dr[key]), sides, 450 + i * 160);
      }));
    }
    function rerollTile(key) {
      dr[key] = key === 'gd' ? MB.rollGuard(dr.start) : MB.rollVirtue(dr.start);
      MB.tumble(refs[key].node, refs[key].val, String(dr[key]), refs[key].sides, 500);
    }
    function rerollKnight() { dr.knightId = MB.rollKnightId(); paintKnight(true); }
    async function pickKnight() { const id = await MB.pickKnight(dr.knightId); if (id) { dr.knightId = id; paintKnight(true); } }
    function rollAll() { dr.knightId = MB.rollKnightId(); dr.name = MB.randomName(); refs.name.value = dr.name; paintKnight(true); rollValues(); }
    function create() {
      const k = MB.store.create(MB.draftToKnight(dr));
      MB.toast(t('toast.created'), 'ok');
      location.hash = '#/knight/' + k.id;
    }

    refs.name.value = dr.name;
    paintStart(); paintKnight(false); TILES.forEach(([k]) => paintTile(k));
    return { crumb: t('crumb.forge'), title: t('forge.title') };
  };
})();
