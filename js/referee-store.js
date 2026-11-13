/* Armazenamento simples (localStorage) para as ferramentas do Mestre. */
(function () {
  const MB = window.MB;
  MB.uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
  MB.rstore = {
    load(key) { try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : []; } catch (e) { return []; } },
    save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { MB.toast(MB.t('toast.storage'), 'bad'); return false; } },
  };
})();
