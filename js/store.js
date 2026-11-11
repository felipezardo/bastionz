/* Persistência em localStorage (somente neste navegador) + importação/exportação JSON. */
(function () {
  const MB = window.MB;
  const KEY = 'mb.knights.v1';
  let cache = null;

  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
  const num = (v, min, max, fb) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fb; };

  /** Normaliza qualquer objeto vindo de arquivo/armazenamento em uma ficha válida. */
  function sanitize(o) {
    if (!o || typeof o !== 'object') return null;
    const kid = MB.KNIGHT_BY_ID[o.knightId] ? o.knightId : null;
    if (!kid) return null;
    const v = o.virtues || {};
    const pair = (p, fb, max) => ({ cur: num(p && p.cur, 0, max, fb), max: num(p && p.max, 0, max, fb) });
    const img = typeof o.image === 'string' && (o.image.startsWith('data:image/') || /^https?:\/\//i.test(o.image)) ? o.image : null;
    return {
      id: typeof o.id === 'string' && o.id ? o.id : uid(),
      name: String(o.name || '').slice(0, 80), fate: String(o.fate || '').slice(0, 120),
      knightId: kid, start: MB.STARTS[o.start] ? o.start : 'wanderer',
      age: ['young', 'mature', 'old'].includes(o.age) ? o.age : 'young',
      glory: num(o.glory, 0, 99, 0),
      virtues: { vig: pair(v.vig, 10, 19), cla: pair(v.cla, 10, 19), spi: pair(v.spi, 10, 19) },
      guard: pair(o.guard, 3, 99), fatigued: !!o.fatigued,
      notes: String(o.notes || '').slice(0, 4000), image: img,
      created: num(o.created, 0, 9e15, Date.now()), updated: num(o.updated, 0, 9e15, Date.now()),
    };
  }

  function load() {
    if (cache) return cache;
    try { cache = (JSON.parse(localStorage.getItem(KEY)) || []).map(sanitize).filter(Boolean); } catch (e) { cache = []; }
    return cache;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(cache)); return true; }
    catch (e) { MB.toast(MB.t('toast.storage'), 'bad'); return false; }
  }

  MB.store = {
    all: () => load().slice().sort((a, b) => b.updated - a.updated),
    get: (id) => load().find((k) => k.id === id) || null,
    /** Cria ou atualiza; devolve a ficha salva. */
    save(k) {
      load();
      const rec = sanitize({ ...k, updated: Date.now(), created: k.created || Date.now() });
      const i = cache.findIndex((x) => x.id === rec.id);
      if (i >= 0) cache[i] = rec; else cache.push(rec);
      persist();
      return rec;
    },
    create(fields) { return this.save({ ...fields, id: uid() }); },
    remove(id) { load(); cache = cache.filter((k) => k.id !== id); persist(); },
    duplicate(id) {
      const k = this.get(id); if (!k) return null;
      return this.create({ ...JSON.parse(JSON.stringify(k)), name: k.name ? k.name + ' (2)' : '' });
    },
    exportJSON(ids) {
      const list = load().filter((k) => !ids || ids.includes(k.id));
      return JSON.stringify({ app: 'mythic-bastionland-fichas', version: 1, knights: list }, null, 2);
    },
    /** Importa um arquivo exportado (ou um único cavaleiro). Sempre gera novos ids. */
    importJSON(text) {
      let data; try { data = JSON.parse(text); } catch (e) { return 0; }
      const arr = Array.isArray(data) ? data : Array.isArray(data && data.knights) ? data.knights : data && data.knightId ? [data] : [];
      let n = 0;
      for (const o of arr) { const s = sanitize({ ...o, id: null }); if (s) { this.create(s); n++; } }
      return n;
    },
  };

  /** Reduz uma imagem enviada para caber no armazenamento local. */
  MB.resizeImage = function (file, maxW = 480, maxH = 800) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) return reject(new Error('type'));
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => {
        const r = Math.min(1, maxW / img.width, maxH / img.height);
        const c = document.createElement('canvas'); c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  };

  MB.portrait = (k) => k.image || `assets/knights/${k.knightId}.webp`;
})();
