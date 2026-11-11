/* Roteador por hash (#/, #/forge, #/knight/:id) e inicialização. */
(function () {
  const MB = window.MB;
  const root = MB.$('#app'); const crumb = MB.$('#crumb');
  let lastRoute = null;

  function parse() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
    if (parts[0] === 'forge') return { name: 'forge' };
    if (parts[0] === 'knight' && parts[1]) return { name: 'sheet', id: decodeURIComponent(parts[1]) };
    return { name: 'home' };
  }

  function route(keepScroll) {
    const r = parse();
    const meta = MB.views[r.name](root, r.id) || {};
    crumb.textContent = meta.crumb || '';
    document.title = meta.title ? meta.title + ' · Mythic Bastionland' : 'Mythic Bastionland';
    if (!keepScroll) {
      window.scrollTo(0, 0);
      const h = root.querySelector('h1'); if (h) h.focus({ preventScroll: true }); // acessibilidade: foco no novo título
    }
    lastRoute = location.hash;
  }
  MB.refresh = () => route(true);

  window.addEventListener('hashchange', () => route(false));
  window.addEventListener('langchange', () => route(true));
  MB.initLangSwitch();
  route(false);
})();
