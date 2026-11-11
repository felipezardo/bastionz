/* Página inicial: lista, busca e gerenciamento dos cavaleiros. */
(function () {
  const MB = window.MB; const { el, t } = MB;
  MB.views = MB.views || {};

  MB.views.home = function (root) {
    const all = MB.store.all();
    let query = '';

    const head = el('div', { class: 'pagehead' },
      el('div', {},
        el('p', { class: 'eyebrow', text: 'Mythic Bastionland' }),
        el('h1', { tabindex: '-1', text: t('home.title') }),
        el('p', { text: t('home.lead') })),
      el('div', { class: 'actions' },
        el('a', { class: 'btn primary', href: '#/forge', html: MB.icons.plus + '<span>' + t('home.new') + '</span>' }),
        el('button', { class: 'btn', type: 'button', html: MB.icons.d20 + '<span>' + t('home.quick') + '</span>', onclick: quick }),
        el('button', { class: 'btn ghost', type: 'button', html: MB.icons.upload + '<span>' + t('home.import') + '</span>', onclick: importFile }),
        all.length ? el('button', { class: 'btn ghost', type: 'button', html: MB.icons.download + '<span>' + t('home.exportAll') + '</span>',
          onclick: () => MB.download(t('file.exportAll'), MB.store.exportJSON()) }) : null));

    const listBox = el('div', {});
    const wrap = el('div', { class: 'view' }, head, listBox);
    root.replaceChildren(wrap);

    function quick() {
      const dr = MB.generate('wanderer'); // Início padrão do livro: Andarilho
      const k = MB.store.create(MB.draftToKnight(dr));
      MB.toast(t('toast.created'), 'ok');
      location.hash = '#/knight/' + k.id;
    }
    async function importFile() {
      const f = await MB.pickFile('application/json,.json'); if (!f) return;
      const n = MB.store.importJSON(await f.text());
      if (n) { MB.toast(t('toast.imported', n), 'ok'); render(); } else MB.toast(t('toast.importFail'), 'bad');
    }

    function card(k, i) {
      const kd = MB.kdata(k.knightId);
      const name = k.name || t('card.unnamed');
      return el('li', { class: 'card', style: `--i:${Math.min(i, 12)}` },
        el('a', { class: 'open', href: '#/knight/' + k.id, 'aria-label': `${t('card.open')}: ${name}` },
          el('div', { class: 'thumb' }, el('img', { src: MB.portrait(k), alt: '', loading: 'lazy', width: 360, height: 600 })),
          el('span', { class: 'rankpip', text: t('rank.' + MB.rankIndex(k.glory)) }),
          el('div', { class: 'meta' },
            el('div', { class: 'cname', text: name }),
            el('div', { class: 'ctitle', text: kd.name }),
            el('div', { class: 'stats' },
              el('span', {}, t('v.vig') + ' ', el('b', { text: k.virtues.vig.cur })),
              el('span', {}, t('v.cla') + ' ', el('b', { text: k.virtues.cla.cur })),
              el('span', {}, t('v.spi') + ' ', el('b', { text: k.virtues.spi.cur })),
              el('span', {}, t('v.gd') + ' ', el('b', { text: k.guard.cur }))))),
        el('div', { class: 'tools' },
          el('button', { class: 'btn sm icon-btn', type: 'button', title: t('card.dup'), 'aria-label': `${t('card.dup')}: ${name}`, html: MB.icons.copy,
            onclick: () => { MB.store.duplicate(k.id); MB.toast(t('toast.dup'), 'ok'); render(); } }),
          el('button', { class: 'btn sm icon-btn', type: 'button', title: t('card.export'), 'aria-label': `${t('card.export')}: ${name}`, html: MB.icons.download,
            onclick: () => MB.download((k.name || 'knight').replace(/[^\w-]+/g, '_') + '.mb.json', MB.store.exportJSON([k.id])) }),
          el('button', { class: 'btn sm icon-btn danger', type: 'button', title: t('card.del'), 'aria-label': `${t('card.del')}: ${name}`, html: MB.icons.trash,
            onclick: async () => {
              if (await MB.confirm(t('del.title'), t('del.body', name), t('del.ok'), t('del.cancel'))) {
                MB.store.remove(k.id); MB.toast(t('toast.deleted')); render();
              }
            } })));
    }

    function render() {
      const list = MB.store.all();
      if (!list.length) {
        const art = MB.KNIGHTS[MB.d(72) - 1].id;
        listBox.replaceChildren(el('div', { class: 'empty' },
          el('img', { src: `assets/knights/${art}.webp`, alt: '', width: 140, height: 233 }),
          el('h2', { text: t('home.empty.title') }), el('p', { text: t('home.empty.body') }),
          el('div', { class: 'actions', style: 'justify-content:center' },
            el('a', { class: 'btn primary', href: '#/forge', text: t('home.new') }),
            el('button', { class: 'btn', type: 'button', text: t('home.quick'), onclick: quick }))));
        return;
      }
      const q = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const shown = list.filter((k) => !q || (k.name + ' ' + MB.kdata(k.knightId).name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q));
      const grid = el('ul', { class: 'grid' }, shown.map(card));
      listBox.replaceChildren(
        el('div', { class: 'pagehead', style: 'margin-bottom:1.2rem' },
          el('span', { class: 'eyebrow', 'aria-live': 'polite', text: t('home.count', list.length) }),
          list.length > 5 ? el('input', { type: 'search', style: 'max-width:280px', placeholder: t('home.search'), 'aria-label': t('home.search'), value: query,
            oninput: MB.debounce((e) => { query = e.target.value; renderGridOnly(); }, 120) }) : null),
        shown.length ? grid : el('p', { text: t('home.none') }));
      function renderGridOnly() { render(); const i = listBox.querySelector('input[type=search]'); if (i) { i.focus(); i.setSelectionRange(query.length, query.length); } }
    }
    render();
    return { crumb: t('crumb.home'), title: t('home.title') };
  };
})();
