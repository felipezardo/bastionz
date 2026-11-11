/* Regras de criação de Mythic Bastionland (livro, pp. 6-7).
   Início → idade, patente inicial, dados das Virtudes e da Guarda. */
(function () {
  const MB = window.MB;
  MB.KNIGHTS = window.MB_KNIGHTS;
  MB.KNIGHT_BY_ID = Object.fromEntries(MB.KNIGHTS.map((k) => [k.id, k]));
  MB.NAMES = window.MB_NAMES || [];

  const rand = (n) => {
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1); crypto.getRandomValues(a); return Math.floor((a[0] / 4294967296) * n) + 1;
    }
    return Math.floor(Math.random() * n) + 1;
  };
  MB.d = rand;

  /** Rola uma fórmula como "d12+d6", "2d6", "d6+6". */
  MB.rollFormula = function (formula) {
    const dice = []; let total = 0;
    for (const term of formula.split('+')) {
      const m = term.trim().match(/^(\d*)d(\d+)$/);
      if (m) { const n = +(m[1] || 1); for (let i = 0; i < n; i++) { const r = rand(+m[2]); dice.push(r); total += r; } }
      else { total += +term; }
    }
    return { total, dice };
  };

  MB.STARTS = {
    wanderer: { age: 'young', glory: 0, virtue: 'd12+d6', guard: 'd6' },
    courtier: { age: 'mature', glory: 3, virtue: 'd12+6', guard: '2d6' },
    ruler: { age: 'mature', glory: 6, virtue: 'd12+6', guard: 'd6+6' },
  };
  MB.RANK_AT = [0, 3, 6, 9, 12];
  MB.rankIndex = (glory) => MB.RANK_AT.reduce((acc, min, i) => (glory >= min ? i : acc), 0);

  const clampVirtue = (n) => Math.max(0, Math.min(19, n));
  MB.rollVirtue = (start) => clampVirtue(MB.rollFormula(MB.STARTS[start].virtue).total);
  MB.rollGuard = (start) => MB.rollFormula(MB.STARTS[start].guard).total;
  MB.rollKnightId = () => `${rand(6)}-${rand(12)}`;
  MB.randomName = () => MB.NAMES[rand(MB.NAMES.length) - 1] || '';

  /** Gera um rascunho completo de cavaleiro. */
  MB.generate = function (start) {
    return {
      start,
      knightId: MB.rollKnightId(),
      vig: MB.rollVirtue(start), cla: MB.rollVirtue(start), spi: MB.rollVirtue(start),
      gd: MB.rollGuard(start),
      name: MB.randomName(),
    };
  };

  /** Converte um rascunho no registro persistido. */
  MB.draftToKnight = function (dr) {
    const s = MB.STARTS[dr.start];
    return {
      name: dr.name || '', fate: '', knightId: dr.knightId, start: dr.start, age: s.age, glory: s.glory,
      virtues: { vig: { cur: dr.vig, max: dr.vig }, cla: { cur: dr.cla, max: dr.cla }, spi: { cur: dr.spi, max: dr.spi } },
      guard: { cur: dr.gd, max: dr.gd }, fatigued: false, notes: '', image: null,
    };
  };
})();
