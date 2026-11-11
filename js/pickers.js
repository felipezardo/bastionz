/* Diálogos compartilhados: seletor dos 72 cavaleiros e troca de retrato. */
(function () {
  const MB = window.MB; const { el } = MB;

  const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  /** Abre o seletor; resolve com o id escolhido ou null. */
  MB.pickKnight = function (currentId) {
    return new Promise((resolve) => {
      let chosen = null;
      const grid = el('div', { class: 'pick', role: 'list' });
      const items = MB.KNIGHTS.map((k) => {
        const kd = MB.kdata(k.id);
        const b = el('button', { type: 'button', role: 'listitem', 'aria-current': k.id === currentId ? 'true' : null, onclick: () => { chosen = k.id; dlg.close(); } },
          el('img', { src: `assets/knights/${k.id}.webp`, alt: '', loading: 'lazy', width: 120, height: 200 }),
          el('span', {}, kd.name, el('small', { text: MB.t('forge.d6d12', k.d6, k.d12) })));
        b.dataset.q = fold(kd.name);
        return b;
      });
      grid.append(...items);
      const search = el('input', {
        type: 'search', 'aria-label': MB.t('pick.search'), placeholder: MB.t('pick.search'),
        oninput: () => { const q = fold(search.value.trim()); items.forEach((b) => { b.hidden = q && !b.dataset.q.includes(q); }); },
      });
      const dlg = MB.openDialog(el('div', { class: 'dlg' },
        el('header', {}, el('h2', { id: 'pk-t', text: MB.t('pick.title') }),
          el('button', { class: 'btn icon-btn ghost', type: 'button', 'aria-label': MB.t('pick.close'), html: MB.icons.close, onclick: () => dlg.close() })),
        search, grid), 'pk-t');
      dlg.addEventListener('close', () => resolve(chosen));
      const cur = items.find((b) => b.getAttribute('aria-current')); if (cur) cur.scrollIntoView({ block: 'center' });
    });
  };

  /** Diálogo de retrato: mostra a arte atual, permite enviar arquivo, usar link ou voltar ao padrão. */
  MB.portraitDialog = function (knight, onChange) {
    const img = el('img', { src: MB.portrait(knight), alt: '' });
    const card = el('div', { class: 'portrait-card' }, img);
    const apply = (value) => { onChange(value); img.src = value || `assets/knights/${knight.knightId}.webp`; card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap'); };
    const url = el('input', { type: 'url', id: 'im-url', placeholder: 'https://…', inputmode: 'url' });
    const dlg = MB.openDialog(el('div', { class: 'dlg' },
      el('header', {}, el('h2', { id: 'im-t', text: MB.t('img.title') }),
        el('button', { class: 'btn icon-btn ghost', type: 'button', 'aria-label': MB.t('img.close'), html: MB.icons.close, onclick: () => dlg.close() })),
      el('div', { class: 'imgdlg' }, card,
        el('div', {},
          el('p', { text: MB.t('img.hint') }),
          el('div', { class: 'actions' },
            el('button', { class: 'btn primary', type: 'button', html: MB.icons.upload + '<span></span>', onclick: async () => {
              const f = await MB.pickFile('image/*'); if (!f) return;
              try { apply(await MB.resizeImage(f)); } catch (e) { MB.toast(MB.t('toast.imgBig'), 'bad'); }
            } }),
            el('button', { class: 'btn', type: 'button', text: MB.t('img.reset'), onclick: () => apply(null) })),
          el('div', { class: 'field' }, el('label', { for: 'im-url', text: MB.t('img.url') }),
            el('div', { class: 'inline' }, url,
              el('button', { class: 'btn', type: 'button', text: MB.t('img.apply'), onclick: () => {
                try { const u = new URL(url.value.trim()); if (!/^https?:$/.test(u.protocol)) throw 0; apply(u.href); }
                catch (e) { MB.toast(MB.t('toast.imgBig'), 'bad'); }
              } })))))), 'im-t');
    dlg.querySelector('.btn.primary span').textContent = MB.t('img.upload');
    return dlg;
  };
})();
