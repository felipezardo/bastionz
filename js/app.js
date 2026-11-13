/* Roteador por hash (#/, #/forge, #/knight/:id) e inicialização. */
(function () {
  const MB = window.MB;
  const root = MB.$('#app'); const crumb = MB.$('#crumb');
  let lastName = null;

  function parse() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
    if (parts[0] === 'forge') return { name: 'forge' };
    if (parts[0] === 'referee') return { name: 'referee', id: parts[1] };
    if (parts[0] === 'knight' && parts[1]) return { name: 'sheet', id: decodeURIComponent(parts[1]) };
    return { name: 'home' };
  }

  function route(keepScroll) {
    const r = parse();
    const meta = MB.views[r.name](root, r.id) || {};
    crumb.textContent = meta.crumb || '';
    document.title = meta.title ? meta.title + ' · Mythic Bastionland' : 'Mythic Bastionland';
    document.querySelectorAll('.mainnav a').forEach((a) => { if (a.dataset.nav === (r.name === 'referee' ? 'referee' : 'home')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (r.name === 'referee' && lastName === 'referee') keepScroll = true; // trocar de aba não rola a página
    if (!keepScroll) {
      window.scrollTo(0, 0);
      const h = root.querySelector('h1'); if (h) h.focus({ preventScroll: true }); // acessibilidade: foco no novo título
    }
    lastName = r.name;
  }
  MB.refresh = () => route(true);

  window.addEventListener('hashchange', () => route(false));
  window.addEventListener('langchange', () => route(true));
  /* Alternador de tema (sol / lua), com preferência do sistema como padrão */
  function applyTheme(th, persist) {
    document.documentElement.dataset.theme = th;
    if (persist) { try { localStorage.setItem('mb.theme', th); } catch (e) { /* ignore */ } }
    document.querySelector('meta[name=theme-color]').content = th === 'light' ? '#e8e5d8' : '#0f1a1f';
    document.querySelectorAll('#theme button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === th)));
  }
  function initTheme() {
    const box = MB.$('#theme');
    ['light', 'dark'].forEach((th) => box.append(MB.el('button', { class: 'tbtn', type: 'button', 'data-theme': th, html: MB.icons[th === 'light' ? 'sun' : 'moon'], onclick: () => applyTheme(th, true) })));
    const label = () => box.querySelectorAll('button').forEach((b) => { b.title = b.ariaLabel = MB.t('theme.' + b.dataset.theme); b.setAttribute('aria-label', MB.t('theme.' + b.dataset.theme)); });
    window.addEventListener('langchange', label); label();
    applyTheme(document.documentElement.dataset.theme, false);
  }
  MB.initLangSwitch();
  initTheme();
  route(false);
})();
