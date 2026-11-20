// LE HULUM demo engine: EthSL lexicon, recorded phrases, lesson data, text -> gloss translation.
(function () {
  const L = [
    // id, en, am, topic, gloss, type
    ['variable','variable','ተለዋዋጭ','computing','VARIABLE'],
    ['code','code','ኮድ','computing','CODE'],
    ['computer','computer','ኮምፒውተር','computing','COMPUTER'],
    ['program','program','ፕሮግራም','computing','PROGRAM'],
    ['error','error','ስህተት','computing','ERROR'],
    ['print','print','አትም','computing','PRINT'],
    ['value','value','እሴት','computing','VALUE',null,['እሴቱ']],
    ['number','number','ቁጥር','computing','NUMBER'],
    ['name','name','ስም','computing','NAME'],
    ['box','box','ሳጥን','computing','BOX'],
    ['screen','screen','ስክሪን','computing','SCREEN'],
    ['equals','equals','እኩል','computing','EQUALS'],
    ['internet','internet','ኢንተርኔት','computing','INTERNET'],
    ['phone','phone','ስልክ','computing','PHONE'],
    ['python','python','ፓይተን','computing','P-Y-T-H-O-N','finger'],
    ['learn','learn','መማር','learning','LEARN'],
    ['teacher','teacher','መምህር','learning','TEACHER'],
    ['student','student','ተማሪ','learning','STUDENT'],
    ['lesson','lesson','ትምህርት','learning','LESSON'],
    ['question','question','ጥያቄ','learning','QUESTION'],
    ['answer','answer','መልስ','learning','ANSWER'],
    ['understand','understand','መረዳት','learning','UNDERSTAND'],
    ['example','example','ምሳሌ','learning','EXAMPLE'],
    ['book','book','መጽሐፍ','learning','BOOK'],
    ['work','work','ሰራ','actions','WORK'],
    ['check','check','አረጋግጥ','actions','CHECK'],
    ['write','write','ጻፍ','actions','WRITE'],
    ['read','read','አንብብ','actions','READ'],
    ['save','save','አስቀምጥ','actions','SAVE',null,['store','stores','keep','ስቀምጥ']],
    ['put','put','አስገባ','actions','PUT'],
    ['use','use','ተጠቀም','actions','USE',null,['uses','used']],
    ['line','line','መስመር','computing','LINE'],
    ['left','left','ግራ','grammar','LEFT'],
    ['right','right','ቀኝ','grammar','RIGHT'],
    ['later','later','ኋላ','time','LATER'],
    ['change','change','መቀየር','actions','CHANGE'],
    ['remember','remember','ማስታወስ','actions','REMEMBER'],
    ['start','start','ጀምር','actions','START'],
    ['stop','stop','አቁም','actions','STOP'],
    ['help','help','እርዳ','actions','HELP'],
    ['make','make','ፍጠር','actions','MAKE'],
    ['today','today','ዛሬ','time','TODAY'],
    ['tomorrow','tomorrow','ነገ','time','TOMORROW'],
    ['now','now','አሁን','time','NOW'],
    ['first','first','መጀመሪያ','time','FIRST'],
    ['again','again','እንደገና','time','AGAIN'],
    ['minute','minute','ደቂቃ','time','MINUTE'],
    ['what','what','ምን','questions','WHAT'],
    ['how','how','እንዴት','questions','HOW'],
    ['why','why','ለምን','questions','WHY'],
    ['where','where','የት','questions','WHERE'],
    ['who','who','ማን','questions','WHO'],
    ['when','when','መቼ','questions','WHEN'],
    ['not','not','አይ','grammar','NOT'],
    ['yes','yes','አዎ','grammar','YES'],
    ['if','if','ከሆነ','grammar','IF'],
    ['this','this','ይህ','grammar','IX-THIS','point'],
    ['you','you','እርስዎ','grammar','IX-YOU','point'],
    ['me','I','እኔ','grammar','IX-ME','point'],
    ['job','job','የሥራ ዕድል','career','JOB'],
    ['skill','skill','ክህሎት','career','SKILL'],
    ['company','company','ድርጅት','career','COMPANY'],
    ['certificate','certificate','ሰርተፊኬት','career','CERTIFICATE'],
    ['interview','interview','ቃለ መጠይቅ','career','INTERVIEW'],
  ].map(([id, en, am, topic, gloss, type, alias]) => ({ id, en, am, topic, gloss, type: type || 'sign', alias: alias || [] }));

  const examples = {
    variable: { en: 'A variable is a name that stores a value.', am: 'ተለዋዋጭ እሴትን የሚያስቀምጥ ስም ነው።' },
    error: { en: 'If the code does not work, check the error.', am: 'ኮዱ ካልሰራ፣ ስህተቱን አረጋግጡ።' },
    print: { en: 'Write print(name).', am: 'print(name) ይጻፉ።' },
  };
  const related = {
    variable: ['value', 'name', 'box'], code: ['program', 'error', 'computer'], error: ['code', 'check', 'not'],
    value: ['variable', 'number', 'equals'], print: ['screen', 'value', 'write'], what: ['how', 'why', 'question'],
  };
  L.forEach(e => {
    e.example = examples[e.id] || { en: `This lesson uses the word "${e.en}".`, am: `ይህ ትምህርት «${e.am}» የሚለውን ቃል ይጠቀማል።` };
    e.related = related[e.id] || L.filter(x => x.topic === e.topic && x.id !== e.id).slice(0, 3).map(x => x.id);
  });
  const byId = Object.fromEntries(L.map(e => [e.id, e]));

  const topics = [
    { id: 'computing', en: 'Computing', am: 'ኮምፒውቲንግ' }, { id: 'learning', en: 'Learning', am: 'ትምህርት' },
    { id: 'actions', en: 'Actions', am: 'ድርጊቶች' }, { id: 'time', en: 'Time', am: 'ጊዜ' },
    { id: 'questions', en: 'Questions', am: 'ጥያቄዎች' }, { id: 'grammar', en: 'Grammar', am: 'ሰዋስው' },
    { id: 'career', en: 'Career', am: 'ሙያ' },
  ];

  const norm = s => (s || '').toLowerCase().replace(/[?!.,;:።፣፤፥፦¿"'«»()]/g, ' ').replace(/\s+/g, ' ').trim();

  const S = (id, label) => ({ type: 'sign', id, label: label || byId[id].gloss });
  const phrases = [
    { keys: ['what is a variable', 'ተለዋዋጭ ምንድን ነው', 'ተለዋዋጭ ምንድነው'], chips: [S('variable'), S('what')], face: 'eyebrows', line: 0 },
    { keys: ['if the code does not work check the error', 'if the code doesn t work check the error', 'ኮዱ ካልሰራ ስህተቱን አረጋግጡ'], chips: [S('code'), S('work'), S('not'), { type: 'pause', label: 'PAUSE' }, S('error'), S('check')], face: 'shake', line: 11 },
    { keys: ['welcome', 'እንኳን ደህና መጡ', 'እንኳን ወደ ለሁሉም በደህና መጡ'], chips: [{ type: 'sign', id: null, label: 'WELCOME' }], face: null, line: null },
    { keys: ['ሰላም እንኳን ደህና መጣችሁ', 'hello welcome', 'hello and welcome'], chips: [{ type: 'sign', id: null, label: 'HELLO' }, { type: 'pause', label: 'PAUSE' }, { type: 'sign', id: null, label: 'WELCOME' }], face: null, line: null },
    { keys: ['names cannot start with a number', 'ስሞች በቁጥር መጀመር አይችሉም'], chips: [S('name'), S('number'), S('start'), S('not')], face: 'shake', line: 9 },
    { keys: ['let s print the value', 'እሴቱን እናትም'], chips: [S('value'), S('print')], face: null, line: 12 },
  ];

  const stop = new Set(['is', 'a', 'an', 'the', 'are', 'to', 'of', 'do', 'does', 'i', 'it', 'in', 'on', 'that', 'can', 'ነው', 'ናቸው', 'ላይ', 'ውስጥ', 'ወደ', 'ይችላሉ', 'ይችላል']);
  const neg = new Set(['not', 'don t', 'doesn', 'dont', 'doesnt', 'cannot', 'can t', 'never', 'no']);
  const qWords = new Set(['what', 'how', 'why', 'where', 'who', 'when']);
  const amNegPrefix = /^(አል|ካል|አይ|አት|አን)/;

  function lookup(tok) {
    const t = tok.toLowerCase();
    let e = L.find(x => x.en.toLowerCase() === t || x.am === tok);
    if (e) return e;
    e = L.find(x => t.length > 3 && (t === x.en + 's' || t === x.en + 'ed' || t === x.en + 'ing' || t.replace(/e?s$/, '') === x.en));
    if (e) return e;
    e = L.find(x => x.alias.some(a => a === t || (/[\u1200-\u137F]/.test(a) && tok.includes(a))));
    if (e) return e;
    // Amharic stem match (prefix/suffix morphology)
    e = L.filter(x => x.am.length >= 2 && tok.includes(x.am.replace(/^መ/, ''))).sort((a, b) => b.am.length - a.am.length)[0];
    return e || null;
  }

  function translate(text) {
    const raw = (text || '').trim();
    if (!raw) return null;
    const n = norm(raw);
    const isAm = /[\u1200-\u137F]/.test(raw);
    const words = n.split(' ').filter(Boolean);
    const ph = phrases.find(p => p.keys.includes(n));
    if (ph) {
      const signed = ph.chips.filter(c => c.type !== 'pause').length;
      return { input: raw, isAm, single: false, source: 'recorded', confidence: 100, chips: ph.chips, signed, total: signed, face: ph.face, line: ph.line };
    }
    if (words.length === 1) {
      const e = lookup(raw.replace(/[?!.,።፣]/g, ''));
      return { input: raw, isAm, single: true, entry: e };
    }
    const chips = []; let face = null; const q = [];
    const tokens = raw.replace(/[,፣]/g, ' , ').split(/\s+/).filter(Boolean);
    for (const tk of tokens) {
      if (tk === ',') { chips.push({ type: 'pause', label: 'PAUSE' }); continue; }
      const clean = tk.replace(/[?!.;:።፤"'«»()]/g, '');
      const low = clean.toLowerCase().replace(/’/g, "'");
      if (!clean || stop.has(low)) continue;
      if (neg.has(low) || /n't$/.test(low)) { if (/n't$/.test(low) && low !== "don't" && low !== "doesn't" && low !== "can't") { } chips.push(S('not')); face = 'shake'; continue; }
      if (isAm && amNegPrefix.test(clean) && lookup(clean.replace(amNegPrefix, ''))) {
        const e = lookup(clean.replace(amNegPrefix, '')); chips.push(S(e.id)); chips.push(S('not')); face = 'shake'; continue;
      }
      const e = lookup(clean);
      if (e) {
        if (e.topic === 'questions') { q.push({ type: 'sign', id: e.id, label: e.gloss }); face = face || 'eyebrows'; continue; }
        chips.push({ type: e.type, id: e.id, label: e.gloss });
      } else if (/^[A-Z][a-z]+$/.test(clean) || /^[A-Za-z]{2,}$/.test(clean) && /[A-Z]/.test(clean)) {
        chips.push({ type: 'finger', id: null, label: clean.toUpperCase().split('').join('-') });
      } else {
        chips.push({ type: 'none', id: null, label: clean, word: clean });
      }
    }
    chips.push(...q); // EthSL: question words at the end
    if (/[?]$/.test(raw) && !face) face = 'eyebrows';
    const total = chips.filter(c => c.type !== 'pause').length;
    const signed = chips.filter(c => c.type !== 'pause' && c.type !== 'none').length;
    return { input: raw, isAm, single: false, source: signed === 0 ? 'none' : 'automatic', confidence: total ? Math.round(signed / total * 90) : 0, chips, signed, total, face, line: null };
  }

  const lesson = {
    duration: 46,
    chapters: [{ t: 0, en: 'What is a variable?', am: 'ተለዋዋጭ ምንድን ነው?' }, { t: 18, en: 'Your first variable', am: 'የመጀመሪያ ተለዋዋጭዎ' }, { t: 42, en: 'Printing the value', am: 'እሴቱን ማተም' }],
    lines: [
      [0, 3, 'What is a variable?', 'ተለዋዋጭ ምንድን ነው?', true, 'eyebrows', ['VARIABLE', 'WHAT']],
      [3, 7, 'A variable is a name that stores a value.', 'ተለዋዋጭ እሴትን የሚያስቀምጥ ስም ነው።', true, null, ['VARIABLE', 'NAME', 'VALUE', 'SAVE']],
      [7, 10, 'Think of it as a labelled box.', 'ስም እንደተለጠፈበት ሳጥን አስቡት።', false, null, []],
      [10, 14, 'You can change what is inside the box.', 'በሳጥኑ ውስጥ ያለውን መቀየር ትችላላችሁ።', false, null, []],
      [14, 18, 'That is why we call it a variable.', 'ለዚህ ነው ተለዋዋጭ የምንለው።', false, null, []],
      [18, 21, "Let's make your first variable.", 'የመጀመሪያ ተለዋዋጭዎን እንፍጠር።', true, null, ['FIRST', 'VARIABLE', 'MAKE']],
      [21, 25, 'Write: name equals "Abebe".', 'ይጻፉ፦ name = "Abebe"።', false, null, []],
      [25, 29, 'The name is on the left, the value on the right.', 'ስሙ በግራ፣ እሴቱ በቀኝ ነው።', false, null, []],
      [29, 32, 'The equals sign puts the value into the box.', 'የእኩል ምልክቱ እሴቱን ወደ ሳጥኑ ያስገባል።', false, null, []],
      [32, 36, 'Names cannot start with a number.', 'ስሞች በቁጥር መጀመር አይችሉም።', true, 'shake', ['NAME', 'NUMBER', 'START', 'NOT']],
      [36, 39, 'Now the computer remembers it.', 'አሁን ኮምፒውተሩ ያስታውሰዋል።', false, null, []],
      [39, 42, 'If the code does not work, check the error.', 'ኮዱ ካልሰራ፣ ስህተቱን አረጋግጡ።', true, 'shake', ['CODE', 'WORK', 'NOT', 'ERROR', 'CHECK']],
      [42, 44.5, 'Write: print(name).', 'ይጻፉ፦ print(name)።', true, null, ['WRITE', 'PRINT', 'NAME']],
      [44.5, 46, 'Abebe appears on the screen.', 'Abebe በስክሪኑ ላይ ይታያል።', false, null, []],
    ].map(([s, e, en, am, auto, face, gloss], i) => ({ i, s, e, en, am, auto, face, gloss })),
    words: [
      { id: 'variable', lines: [1, 2, 5, 6] }, { id: 'value', lines: [2, 8, 9] }, { id: 'name', lines: [2, 7, 8, 10] },
      { id: 'box', lines: [3, 4, 9] }, { id: 'number', lines: [10] }, { id: 'computer', lines: [11] },
      { id: 'error', lines: [12] }, { id: 'print', lines: [13] },
    ],
  };

  window.LH = { lexicon: L, byId, topics, translate, lesson, norm };
})();
