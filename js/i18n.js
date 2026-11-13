/* i18n: idioma padrão = idioma do dispositivo; troca por bandeiras. Termos PT seguem o livro em pt-BR. */
(function () {
  const MB = window.MB;
  const D = {
    pt: {
      skip: 'Ir para o conteúdo',
      'crumb.home': 'fichas', 'crumb.forge': 'forja de cavaleiros',
      'home.title': 'Seus Cavaleiros',
      'home.lead': 'Gerencie a sua Companhia: crie, abra, duplique e exporte as fichas dos Cavaleiros do Reino.',
      'home.new': 'Forjar cavaleiro', 'home.quick': 'Sorteio rápido', 'home.import': 'Importar', 'home.exportAll': 'Exportar todos',
      'home.search': 'Buscar cavaleiro…', 'home.count': (n) => (n === 1 ? '1 cavaleiro' : n + ' cavaleiros'),
      'home.empty.title': 'A estrada está vazia',
      'home.empty.body': 'Nenhum Cavaleiro jurou o Juramento ainda. Role os dados e deixe o destino escolher, ou escolha um dos 72 cavaleiros do livro.',
      'home.none': 'Nenhum cavaleiro encontrado.',
      'card.open': 'Abrir ficha', 'card.dup': 'Duplicar', 'card.export': 'Exportar', 'card.del': 'Excluir',
      'card.unnamed': 'Sem nome',
      'del.title': 'Excluir cavaleiro?', 'del.body': (n) => `${n} será removido deste navegador. Exporte antes se quiser guardar a ficha.`,
      'del.ok': 'Excluir', 'del.cancel': 'Cancelar',
      'toast.imported': (n) => (n === 1 ? '1 cavaleiro importado.' : n + ' cavaleiros importados.'),
      'toast.importFail': 'Arquivo inválido: não encontrei cavaleiros nele.',
      'toast.dup': 'Cavaleiro duplicado.', 'toast.deleted': 'Cavaleiro excluído.', 'toast.created': 'Cavaleiro forjado!',
      'toast.storage': 'Não foi possível salvar (armazenamento cheio?). Exporte suas fichas.',
      'toast.imgBig': 'Não consegui usar essa imagem.',
      'rank.0': 'Cavaleiro Andante', 'rank.1': 'Cavaleiro Galante', 'rank.2': 'Cavaleiro Tenente', 'rank.3': 'Cavaleiro Dominante', 'rank.4': 'Cavaleiro Radiante',
      'age.young': 'Jovem', 'age.mature': 'Maduro', 'age.old': 'Velho',
      'start.wanderer': 'Andarilho', 'start.courtier': 'Cortesão', 'start.ruler': 'Governante',
      'start.wanderer.d': 'Jovem Cavaleiro Andante em busca de Glória.',
      'start.courtier.d': 'Cavaleiro Galante Maduro com lugar na Corte.',
      'start.ruler.d': 'Cavaleiro Tenente Maduro que governa um Feudo.',
      'forge.title': 'Forja de Cavaleiros',
      'forge.lead': 'Escolha o Início da sua Companhia e role os dados. Cada valor pode ser rolado de novo, e o Cavaleiro pode ser sorteado ou escolhido entre os 72 do livro.',
      'forge.start': 'Início', 'forge.rollAll': 'Rolar tudo', 'forge.create': 'Criar ficha',
      'forge.knight': 'Cavaleiro', 'forge.rollKnight': 'Rolar d6 e d12', 'forge.pick': 'Escolher da lista',
      'forge.name': 'Nome', 'forge.namePh': 'Como foi nomeado?', 'forge.nameRandom': 'Nome aleatório',
      'forge.virtues': 'Virtudes e Guarda', 'forge.reroll': (x) => `Rolar ${x} de novo`,
      'forge.d6d12': (a, b) => `d6 ${a} · d12 ${b}`,
      'v.vig': 'VIG', 'v.cla': 'CLA', 'v.spi': 'ESP', 'v.gd': 'GD', 'v.gl': 'Glória',
      'vl.vig': ['VIG', 'or'], 'vl.cla': ['CLA', 'reza'], 'vl.spi': ['ESP', 'írito'], 'vl.gd': ['Guarda', ''], 'vl.gl': ['Glória', ''],
      'sheet.title': 'MYTHIC BASTIONLAND',
      'sheet.named': 'Foi nomeado', 'sheet.knownAs': 'Conhecido como o Cavaleiro', 'sheet.knightSuffix': '',
      'sheet.fate': 'Seu destino final foi', 'sheet.namePh': 'nome', 'sheet.fatePh': 'destino',
      'sheet.age': 'Idade', 'sheet.rank': 'Patente',
      'sheet.recovery': 'Recuperação',
      'rec.vig': 'Hospitalidade ou consumir Sustento', 'rec.cla': 'Orientação de um Vidente ou consumir Estimulante',
      'rec.spi': 'Entregar-se à Paixão ou consumir Sacramento', 'rec.gd': 'Um momento de calma e descanso',
      'rec.gdLabel': 'GD/Fadiga',
      'sheet.oath': 'Juramento', 'oath.1': 'Buscar os Mitos', 'oath.2': 'Honrar os Videntes', 'oath.3': 'Proteger o Reino',
      'sheet.property': 'Propriedade', 'sheet.ability': 'Habilidade', 'sheet.passion': 'Paixão',
      'sheet.gear': 'Todo Cavaleiro tem adaga (d6), tochas, corda, rações secas e equipamento de acampamento.',
      'sheet.feats': 'Façanhas', 'sheet.gambits': 'Gambitos',
      'feat.smite': 'GOLPEAR', 'feat.smite.d': '+d12 ou Explosão a um Ataque corpo a corpo.', 'feat.smite.s': 'Salvaguarda de VIG ou fique Fatigado.',
      'feat.focus': 'FOCAR', 'feat.focus.d': 'Realize um Gambito sem gastar um dado.', 'feat.focus.s': 'Salvaguarda de CLA ou fique Fatigado.',
      'feat.deny': 'NEGAR', 'feat.deny.d': 'Descarte um dado de Dano rolado contra você ou um Aliado próximo.', 'feat.deny.s': 'Salvaguarda de ESP ou fique Fatigado.',
      'gam': [['Reforçar', 'o Ataque em +1 de Dano total'], ['Mover', 'após o Ataque'], ['Repelir', 'um inimigo para longe de você'],
        ['Impedir', 'um inimigo de se mover no próximo turno'], ['Prejudicar', 'uma arma no próximo turno dele'],
        ['Prender', 'um escudo até o seu próximo turno'], ['Desmontar', 'um inimigo'], ['Outro efeito', 'de nível de impacto semelhante']],
      'sheet.fatigued': 'Fatigado', 'sheet.notes': 'Anotações', 'sheet.notesPh': 'Cicatrizes, aliados, itens extras, dívidas de honra…',
      'sheet.portrait': 'Trocar retrato', 'sheet.changeKnight': 'Trocar cavaleiro', 'sheet.exportOne': 'Exportar', 'sheet.print': 'Imprimir',
      'sheet.back': 'Voltar', 'sheet.notFound': 'Cavaleiro não encontrado.', 'sheet.saved': 'Salvo neste navegador',
      'sheet.max': 'máximo', 'sheet.cur': 'atual', 'sheet.inc': 'Aumentar', 'sheet.dec': 'Diminuir',
      'sheet.credit': 'Textos e ilustrações de Mythic Bastionland © Chris McDowall / Bastionland Press; arte de Alec Sorensen. Ferramenta não oficial de fã.',
      'rolls.title': 'Rolagens', 'rolls.save': (v) => `Salvaguarda de ${v}`, 'rolls.free': 'Dados livres', 'rolls.log': 'Histórico',
      'rolls.pass': 'Sucesso', 'rolls.fail': 'Falha', 'rolls.hint': 'Role d20 igual ou abaixo da Virtude atual.', 'rolls.empty': 'Nenhuma rolagem ainda.',
      'rolls.saveRes': (v, r, n, ok) => `Salvaguarda de ${v}: d20 = ${r} (Virtude ${n}) — ${ok ? 'Sucesso' : 'Falha'}`,
      'img.title': 'Retrato do cavaleiro', 'img.upload': 'Enviar imagem', 'img.url': 'Ou use um link de imagem', 'img.apply': 'Usar link',
      'img.reset': 'Voltar à arte do livro', 'img.close': 'Fechar', 'img.hint': 'A arte do livro é o retrato padrão. Sua imagem fica só neste navegador.',
      'pick.title': 'Escolha um Cavaleiro', 'pick.search': 'Buscar pelo nome…', 'pick.close': 'Fechar',
      'file.exportAll': 'cavaleiros-mythic-bastionland.json',
    },
    en: {
      skip: 'Skip to content',
      'crumb.home': 'sheets', 'crumb.forge': 'knight forge',
      'home.title': 'Your Knights',
      'home.lead': 'Manage your Company: create, open, duplicate and export the sheets of the Realm’s Knights.',
      'home.new': 'Forge a knight', 'home.quick': 'Quick roll', 'home.import': 'Import', 'home.exportAll': 'Export all',
      'home.search': 'Search knights…', 'home.count': (n) => (n === 1 ? '1 knight' : n + ' knights'),
      'home.empty.title': 'The road is empty',
      'home.empty.body': 'No Knight has sworn the Oath yet. Roll the dice and let fate choose, or pick one of the 72 knights from the book.',
      'home.none': 'No knights found.',
      'card.open': 'Open sheet', 'card.dup': 'Duplicate', 'card.export': 'Export', 'card.del': 'Delete',
      'card.unnamed': 'Unnamed',
      'del.title': 'Delete knight?', 'del.body': (n) => `${n} will be removed from this browser. Export first if you want to keep the sheet.`,
      'del.ok': 'Delete', 'del.cancel': 'Cancel',
      'toast.imported': (n) => (n === 1 ? '1 knight imported.' : n + ' knights imported.'),
      'toast.importFail': 'Invalid file: no knights found in it.',
      'toast.dup': 'Knight duplicated.', 'toast.deleted': 'Knight deleted.', 'toast.created': 'Knight forged!',
      'toast.storage': 'Could not save (storage full?). Export your sheets.',
      'toast.imgBig': 'I couldn’t use that image.',
      'rank.0': 'Knight-Errant', 'rank.1': 'Knight-Gallant', 'rank.2': 'Knight-Tenant', 'rank.3': 'Knight-Dominant', 'rank.4': 'Knight-Radiant',
      'age.young': 'Young', 'age.mature': 'Mature', 'age.old': 'Old',
      'start.wanderer': 'Wanderer', 'start.courtier': 'Courtier', 'start.ruler': 'Ruler',
      'start.wanderer.d': 'Young Knight-Errant seeking Glory.',
      'start.courtier.d': 'Mature Knight-Gallant with a place in Court.',
      'start.ruler.d': 'Mature Knight-Tenant who rules a Holding.',
      'forge.title': 'Knight Forge',
      'forge.lead': 'Pick your Company’s Start and roll the dice. Every value can be rerolled, and the Knight can be rolled or chosen from the book’s 72.',
      'forge.start': 'Start', 'forge.rollAll': 'Roll everything', 'forge.create': 'Create sheet',
      'forge.knight': 'Knight', 'forge.rollKnight': 'Roll d6 and d12', 'forge.pick': 'Choose from list',
      'forge.name': 'Name', 'forge.namePh': 'What were they named?', 'forge.nameRandom': 'Random name',
      'forge.virtues': 'Virtues & Guard', 'forge.reroll': (x) => `Reroll ${x}`,
      'forge.d6d12': (a, b) => `d6 ${a} · d12 ${b}`,
      'v.vig': 'VIG', 'v.cla': 'CLA', 'v.spi': 'SPI', 'v.gd': 'GD', 'v.gl': 'Glory',
      'vl.vig': ['VIG', 'our'], 'vl.cla': ['CLA', 'rity'], 'vl.spi': ['SPI', 'rit'], 'vl.gd': ['Guard', ''], 'vl.gl': ['Glory', ''],
      'sheet.title': 'MYTHIC BASTIONLAND',
      'sheet.named': 'They were named', 'sheet.knownAs': 'Known as the', 'sheet.knightSuffix': 'Knight',
      'sheet.fate': 'Their ultimate fate was', 'sheet.namePh': 'name', 'sheet.fatePh': 'fate',
      'sheet.age': 'Age', 'sheet.rank': 'Rank',
      'sheet.recovery': 'Recovery',
      'rec.vig': 'Hospitality or consume Sustenance', 'rec.cla': 'Seer’s guidance or consume Stimulant',
      'rec.spi': 'Indulge passion or consume Sacrament', 'rec.gd': 'A moment’s calm and rest',
      'rec.gdLabel': 'Gd/Fatigue',
      'sheet.oath': 'Oath', 'oath.1': 'Seek the Myths', 'oath.2': 'Honour the Seers', 'oath.3': 'Protect the Realm',
      'sheet.property': 'Property', 'sheet.ability': 'Ability', 'sheet.passion': 'Passion',
      'sheet.gear': 'Every Knight has a dagger (d6), torches, rope, dry rations, and camping gear.',
      'sheet.feats': 'Feats', 'sheet.gambits': 'Gambits',
      'feat.smite': 'SMITE', 'feat.smite.d': '+d12 or Blast to a melee attack.', 'feat.smite.s': 'VIG Save or become Fatigued.',
      'feat.focus': 'FOCUS', 'feat.focus.d': 'Perform a Gambit without using a die.', 'feat.focus.s': 'CLA Save or become Fatigued.',
      'feat.deny': 'DENY', 'feat.deny.d': 'Discard a damage die rolled against you or a nearby Ally.', 'feat.deny.s': 'SPI Save or become Fatigued.',
      'gam': [['Bolster', 'the attack for +1 total damage'], ['Move', 'after the attack'], ['Repel', 'a foe away from you'],
        ['Stop', 'a foe from moving next turn'], ['Impair', 'a weapon on their next turn'],
        ['Trap', 'a shield until your next turn'], ['Dismount', 'a foe'], ['Other effect', 'of a similar level of impact']],
      'sheet.fatigued': 'Fatigued', 'sheet.notes': 'Notes', 'sheet.notesPh': 'Scars, allies, extra items, debts of honour…',
      'sheet.portrait': 'Change portrait', 'sheet.changeKnight': 'Change knight', 'sheet.exportOne': 'Export', 'sheet.print': 'Print',
      'sheet.back': 'Back', 'sheet.notFound': 'Knight not found.', 'sheet.saved': 'Saved in this browser',
      'sheet.max': 'max', 'sheet.cur': 'current', 'sheet.inc': 'Increase', 'sheet.dec': 'Decrease',
      'sheet.credit': 'Text and art from Mythic Bastionland © Chris McDowall / Bastionland Press; art by Alec Sorensen. Unofficial fan tool.',
      'rolls.title': 'Rolls', 'rolls.save': (v) => `${v} Save`, 'rolls.free': 'Free dice', 'rolls.log': 'History',
      'rolls.pass': 'Pass', 'rolls.fail': 'Fail', 'rolls.hint': 'Roll a d20 equal to or below the current Virtue.', 'rolls.empty': 'No rolls yet.',
      'rolls.saveRes': (v, r, n, ok) => `${v} Save: d20 = ${r} (Virtue ${n}) — ${ok ? 'Pass' : 'Fail'}`,
      'img.title': 'Knight portrait', 'img.upload': 'Upload image', 'img.url': 'Or use an image link', 'img.apply': 'Use link',
      'img.reset': 'Back to the book’s art', 'img.close': 'Close', 'img.hint': 'The book’s art is the default portrait. Your image stays only in this browser.',
      'pick.title': 'Choose a Knight', 'pick.search': 'Search by name…', 'pick.close': 'Close',
      'file.exportAll': 'mythic-bastionland-knights.json',
    },
  };

  MB.i18nAdd = (pt, en) => { Object.assign(D.pt, pt); Object.assign(D.en, en); };

  const KEY = 'mb.lang';
  const detect = () => ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase().startsWith('pt') ? 'pt' : 'en';
  let lang;
  try { lang = localStorage.getItem(KEY); } catch (e) { lang = null; }
  if (lang !== 'pt' && lang !== 'en') lang = detect();

  MB.lang = () => lang;
  MB.t = (k, ...a) => {
    const v = (D[lang] && D[lang][k]) ?? D.en[k] ?? k;
    return typeof v === 'function' ? v(...a) : v;
  };

  function applyStatic() {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = MB.t(n.dataset.i18n); });
    MB.$('#langs').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }
  MB.setLang = (l) => {
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
    applyStatic();
    window.dispatchEvent(new Event('langchange'));
  };
  MB.initLangSwitch = () => {
    const box = MB.$('#langs');
    [['pt', 'Português'], ['en', 'English']].forEach(([l, label]) => {
      box.append(MB.el('button', { class: 'flag', type: 'button', 'data-lang': l, 'aria-label': label, title: label, html: MB.flags[l], onclick: () => MB.setLang(l) }));
    });
    applyStatic();
  };

  /** Dados do cavaleiro no idioma atual. */
  MB.kdata = (id) => {
    const k = MB.KNIGHT_BY_ID[id] || MB.KNIGHTS[0];
    return { id: k.id, d6: k.d6, d12: k.d12, name: k.name[lang], ...k[lang] };
  };
  /** "The True Knight" → "True"; "O Cavaleiro da Cilada" → "da Cilada". */
  MB.epithet = (id) => {
    const n = (MB.KNIGHT_BY_ID[id] || MB.KNIGHTS[0]).name[lang];
    return lang === 'pt' ? n.replace(/^O Cavaleiro\s+/, '') : n.replace(/^The\s+/, '').replace(/\s+Knight$/, '');
  };
})();
