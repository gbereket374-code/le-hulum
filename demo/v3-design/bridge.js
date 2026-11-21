// FR-SL-08 FR-01 INT-01: Real API bridge for the design SPA (no mock lexicon path).
(function (g) {
  var CFG = g.LH_CONFIG || {};
  var API = CFG.API || ((typeof location !== 'undefined' ? location.origin : '') + '/api/v1');
  var DATA = CFG.DATA || ((typeof location !== 'undefined' ? location.origin : '') + '/demo/data');

  function isAm(s) { return /[\u1200-\u137F]/.test(String(s || '')); }

  function absMedia(src) {
    if (!src) return '';
    if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
    return DATA.replace(/\/?$/, '/') + src.replace(/^\//, '');
  }

  async function getJSON(url, opts) {
    var r = await fetch(url, opts);
    if (!r.ok) {
      var err = {};
      try { err = await r.json(); } catch (e) {}
      throw new Error((err && err.error) || ('http ' + r.status));
    }
    return r.json();
  }

  async function ask(text, lang) {
    var body = { text: String(text || '').trim() };
    if (lang && lang !== 'auto') body.lang = lang;
    return getJSON(API + '/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async function translate(text, lang, extra) {
    var body = Object.assign({ text: String(text || '').trim() }, extra || {});
    if (lang && lang !== 'auto') body.lang = lang;
    return getJSON(API + '/sign/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async function review(payload) {
    return getJSON(API + '/sign/review', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function stats() {
    return getJSON(API + '/stats');
  }

  async function lexicon() {
    return getJSON(API + '/lexicon');
  }

  async function glossary() {
    return getJSON(API + '/glossary');
  }

  function faceFrom(nonmanual) {
    var nm = nonmanual || [];
    if (nm.indexOf('q-wh') >= 0 || nm.indexOf('q-yn') >= 0) return 'eyebrows';
    if (nm.indexOf('neg') >= 0) return 'shake';
    return '';
  }

  function chipsFrom(result) {
    return (result.gloss || []).filter(function (g) {
      return g.kind !== 'pause' && g.gloss !== '|' && g.gloss !== '‖';
    }).map(function (g) {
      var type = 'sign';
      if (g.kind === 'missing') type = 'none';
      else if (g.kind === 'fingerspell') type = 'finger';
      else if (g.gloss === 'NOT') type = 'neg';
      else if (/^WHAT|WHERE|WHEN|HOW|WHY|WHO$/.test(g.gloss)) type = 'wh';
      return { type: type, label: g.gloss, clip: g.clip, from: g.from, to: g.to };
    });
  }

  function toCard(result, input) {
    var chips = chipsFrom(result);
    var signed = chips.filter(function (c) { return c.type === 'sign' || c.type === 'neg' || c.type === 'wh'; }).length;
    var layer = result.layer || 'none';
    var single = false;
    var entry = null;
    // One content gloss with a clip → dictionary-style sign card
    var content = (result.gloss || []).filter(function (g) { return g.kind === 'sign' || g.kind === 'missing' || g.kind === 'fingerspell'; });
    if (content.length === 1 && content[0].kind === 'sign') {
      single = true;
      entry = {
        gloss: content[0].gloss,
        am: result.text && isAm(result.text) ? result.text : (isAm(input) ? input : ''),
        en: result.text_en || (!isAm(input) ? input : '') || content[0].gloss,
        topic: 'tech',
        example: { en: input, am: input },
        related: [],
        clip: content[0].clip,
        from: content[0].from,
        to: content[0].to,
      };
    }
    var lm = result.lesson_match || null;
    return {
      input: input,
      single: single,
      entry: entry,
      chips: chips,
      source: layer === 'memory' ? 'recorded' : (layer === 'auto' || layer === 'none' ? 'automatic' : layer),
      face: faceFrom(result.nonmanual),
      confidence: Math.round((result.confidence || 0) * 100),
      signed: signed,
      total: chips.length || content.length,
      line: lm ? lm.cue : null,
      lesson_match: lm,
      playlist: (result.playlist || []).map(function (p) {
        return { src: absMedia(p.src), from: p.from, to: p.to, pause: p.pause };
      }),
      coverage: result.coverage,
      credits: result.credits || [],
      raw: result,
    };
  }

  function playPlaylist(videoEl, list, onDone) {
    var items = (list || []).filter(function (p) { return p && p.src; });
    var i = 0;
    function next() {
      if (i >= items.length) { if (onDone) onDone(); return; }
      var clip = items[i++];
      videoEl.src = clip.src;
      var start = Number(clip.from) || 0;
      var end = Number(clip.to);
      videoEl.onloadeddata = function () {
        try { videoEl.currentTime = start; } catch (e) {}
        videoEl.play().catch(function () {});
      };
      videoEl.ontimeupdate = function () {
        if (end && videoEl.currentTime >= end - 0.05) {
          videoEl.pause();
          videoEl.ontimeupdate = null;
          var wait = (Number(clip.pause) || 0) * 1000;
          setTimeout(next, wait);
        }
      };
      videoEl.onended = function () { videoEl.onended = null; next(); };
      videoEl.load();
    }
    if (!items.length) { if (onDone) onDone(); return; }
    next();
  }

  function prefsKey() { return 'db-player:prefs'; }
  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(prefsKey()) || '{}'); } catch (e) { return {}; }
  }
  function savePrefs(p) {
    try { localStorage.setItem(prefsKey(), JSON.stringify(p)); } catch (e) {}
  }

  g.LH_BRIDGE = {
    API: API, DATA: DATA, HOST: CFG.HOST || '',
    isAm: isAm, absMedia: absMedia,
    ask: ask, translate: translate, review: review, stats: stats, lexicon: lexicon, glossary: glossary,
    toCard: toCard, chipsFrom: chipsFrom, playPlaylist: playPlaylist,
    loadPrefs: loadPrefs, savePrefs: savePrefs,
  };
})(typeof window !== 'undefined' ? window : globalThis);
