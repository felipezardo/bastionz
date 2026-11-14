/* Planejador de aventuras: mitos com presságios, cenas, anotações e diário de sessão. */
(function () {
  const MB = window.MB; const { el, t } = MB; const KEY = 'mb.adventures.v1';
  let list = null; let currentId = null;
  const load = () => (list = list || MB.rstore.load(KEY));
  const save = () => MB.rstore.save(KEY, list);
  const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
  const mythById = (id) => window.MB_MYTHS.find((m) => m.id === id);

  MB.advStore = {
    all: () => load(),
    create(title) {
      load(); const a = { id: MB.uid(), title: title || '', season: 'spring', notes: '', myths: [], scenes: [], log: [] };
      list.push(a); save(); return a;
    },
    addMyth(advId, mythId) {
      const a = load().find((x) => x.id === advId); if (!a) return;
      if (!a.myths.some((m) => m.id === mythId)) a.myths.push({ id: mythId, revealed: [false, false, false, false, false, false] });
      save(); currentId = advId;
    },
  };

  /** Escolher aventura (ou criar nova) para receber um Mito. */
  MB.addMythToAdventure = function (mythId) {
    const L = MB.lang(); const myth = mythById(mythId);
    const done = (a) => { MB.advStore.addMyth(a.id, mythId); dlg.close(); MB.toast(t('adv.added'), 'ok'); };
    const items = load().map((a) => el('button', { class: 'btn', type: 'button', text: a.title || t('adv.untitled'), onclick: () => done(a) }));
    const dlg = MB.openDialog(el('div', { class: 'dlg' },
      el('header', {}, el('h2', { id: 'am-t', text: t('adv.choose') }),
        el('button', { class: 'btn icon-btn ghost', type: 'button', 'aria-label': t('pick.close'), html: MB.icons.close, onclick: () => dlg.close() })),
      el('div', { class: 'actions' }, ...items,
        el('button', { class: 'btn primary', type: 'button', html: MB.icons.plus + '<span>' + t('adv.createFrom') + '</span>', onclick: () => done(MB.advStore.create(myth.name[L])) }))), 'am-t');
  };

  MB.renderAdventures = function (box) {
    load();
    const persist = MB.debounce(save, 250);
    const side = el('div', { class: 'stack' }); const main = el('div', {});
    box.replaceChildren(el('div', { class: 'two adv' }, side, main));

    function drawSide() {
      side.replaceChildren(el('div', { class: 'panel' }, el('h2', { text: t('adv.list') }),
        el('button', { class: 'btn primary', type: 'button', html: MB.icons.plus + '<span>' + t('adv.new') + '</span>', onclick: () => { currentId = MB.advStore.create('').id; drawSide(); drawMain(); } }),
        el('ul', { class: 'results adv-list' }, list.map((a) => el('li', {},
          el('button', { class: 'linkbtn', type: 'button', 'aria-current': a.id === currentId ? 'true' : null, text: a.title || t('adv.untitled'),
            onclick: () => { currentId = a.id; drawSide(); drawMain(); } }))))));
    }

    function drawMain() {
      const a = list.find((x) => x.id === currentId);
      if (!a) { main.replaceChildren(el('p', { class: 'muted', text: t('adv.empty') })); return; }
      const L = MB.lang();
      const title = el('input', { type: 'text', class: 'ename big', value: a.title, maxlength: 100, placeholder: t('adv.untitled'), 'aria-label': t('adv.title'),
        oninput: (e) => { a.title = e.target.value; persist(); } });
      const season = el('select', { 'aria-label': t('adv.season'), onchange: (e) => { a.season = e.target.value; persist(); } },
        SEASONS.map((s) => el('option', { value: s, selected: a.season === s, text: t('adv.season.' + s) })));
      const notes = el('textarea', { rows: 5, maxlength: 6000, placeholder: t('adv.notesPh'), 'aria-label': t('adv.notes'), oninput: (e) => { a.notes = e.target.value; persist(); } });
      notes.value = a.notes;

      const mythsBox = el('div', {}); const scenesBox = el('ul', { class: 'scenes' }); const logBox = el('ul', { class: 'log' });
      const drawMyths = () => mythsBox.replaceChildren(...(a.myths.length ? a.myths.map((mm) => {
        const m = mythById(mm.id);
        return el('div', { class: 'rcard' },
          el('div', { class: 'enemy-head' }, el('h3', { text: m.name[L] }), el('span', { class: 'spacer' }),
            el('button', { class: 'btn sm icon-btn ghost danger', type: 'button', title: t('adv.removeMyth'), 'aria-label': `${t('adv.removeMyth')}: ${m.name[L]}`, html: MB.icons.trash,
              onclick: () => { a.myths = a.myths.filter((x) => x !== mm); save(); drawMyths(); } })),
          el('img', { class: 'mythart sm', src: `assets/myths/${m.id}.webp`, alt: '', loading: 'lazy', width: 800, height: 418 }),
          el('ol', { class: 'omens' }, m.omens[L].map((o, i) => el('li', {},
            el('label', {}, el('input', { type: 'checkbox', checked: !!mm.revealed[i], onchange: (e) => { mm.revealed[i] = e.target.checked; persist(); } }),
              el('span', { text: o }))))));
      }) : [el('p', { class: 'muted', text: t('adv.noMyths') })]));
      const drawScenes = () => scenesBox.replaceChildren(...a.scenes.map((s, i) => el('li', {},
        el('input', { type: 'checkbox', checked: s.done, 'aria-label': t('adv.done'), onchange: (e) => { s.done = e.target.checked; persist(); } }),
        el('input', { type: 'text', value: s.text, maxlength: 200, 'aria-label': t('adv.scene'), oninput: (e) => { s.text = e.target.value; persist(); } }),
        el('button', { class: 'btn sm icon-btn ghost', type: 'button', 'aria-label': 'Up', html: MB.icons.up, disabled: i === 0, onclick: () => { a.scenes.splice(i - 1, 0, a.scenes.splice(i, 1)[0]); save(); drawScenes(); } }),
        el('button', { class: 'btn sm icon-btn ghost danger', type: 'button', 'aria-label': t('en.remove'), html: MB.icons.trash, onclick: () => { a.scenes.splice(i, 1); save(); drawScenes(); } }))));
      const drawLog = () => logBox.replaceChildren(...a.log.map((l) => el('li', {}, el('span', { text: l.text }),
        el('button', { class: 'btn sm icon-btn ghost danger', type: 'button', 'aria-label': t('en.remove'), html: MB.icons.close, onclick: () => { a.log = a.log.filter((x) => x !== l); save(); drawLog(); } }))));

      const sceneIn = el('input', { type: 'text', maxlength: 200, placeholder: t('adv.scenePh'), 'aria-label': t('adv.scenePh'),
        onkeydown: (e) => { if (e.key === 'Enter') addScene(); } });
      const addScene = () => { if (!sceneIn.value.trim()) return; a.scenes.push({ id: MB.uid(), text: sceneIn.value.trim(), done: false }); sceneIn.value = ''; save(); drawScenes(); };
      const logIn = el('textarea', { rows: 2, maxlength: 600, placeholder: t('adv.logPh'), 'aria-label': t('adv.logPh') });
      const addLog = () => { if (!logIn.value.trim()) return; a.log.unshift({ id: MB.uid(), text: logIn.value.trim() }); logIn.value = ''; save(); drawLog(); };

      main.replaceChildren(el('div', { class: 'stack' },
        el('div', { class: 'panel' }, title, el('div', { class: 'field' }, el('label', { text: t('adv.season') }), season),
          el('div', { class: 'actions', style: 'margin-top:.8rem' },
            el('button', { class: 'btn sm', type: 'button', html: MB.icons.download + '<span>' + t('card.export') + '</span>',
              onclick: () => MB.download((a.title || 'adventure').replace(/[^\w-]+/g, '_') + '.adventure.json', JSON.stringify(a, null, 2)) }),
            el('button', { class: 'btn sm danger', type: 'button', html: MB.icons.trash + '<span>' + t('card.del') + '</span>', onclick: async () => {
              if (await MB.confirm(t('adv.deleteTitle'), t('adv.deleteBody'), t('del.ok'), t('del.cancel'))) { list = list.filter((x) => x !== a); currentId = null; save(); drawSide(); drawMain(); } } }))),
        el('div', { class: 'panel' }, el('h2', { text: t('adv.myths') }), el('p', { class: 'muted', text: t('adv.mythHint') }), mythsBox),
        el('div', { class: 'panel' }, el('h2', { text: t('adv.scenes') }), scenesBox,
          el('div', { class: 'inline' }, sceneIn, el('button', { class: 'btn', type: 'button', text: t('adv.addScene'), onclick: addScene }))),
        el('div', { class: 'panel' }, el('h2', { text: t('adv.notes') }), notes),
        el('div', { class: 'panel' }, el('h2', { text: t('adv.log') }), logIn,
          el('button', { class: 'btn', type: 'button', style: 'margin:.6rem 0', text: t('adv.addLog'), onclick: addLog }), logBox)));
      drawMyths(); drawScenes(); drawLog();
    }
    if (!currentId || !list.some((a) => a.id === currentId)) currentId = list.length ? list[0].id : null;
    drawSide(); drawMain();
  };
})();
