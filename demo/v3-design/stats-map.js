// FR-01: Honest Home impact-card mapping from /api/v1/stats + stats.json.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.LH_mapHomeStats = api.mapHomeStats;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function mapHomeStats(api, t) {
    var labels = (t && t.stats) || [];
    var signs = api && api.signs != null ? String(api.signs) : (labels[0] && labels[0][0]) || '0';
    var phrases = api && api.phrases != null ? String(api.phrases) : (labels[1] && labels[1][0]) || '0';
    var cut = api && api.sentences_cut_midway != null
      ? String(api.sentences_cut_midway)
      : '0';
    var cutLabel = (t && t.statCut) || (labels[2] && labels[2][1]) || '';
    var cutUnit = (t && t.statCutUnit) || '';

    var understood = api && api.codesigner_understood;
    var total = api && api.codesigner_total != null ? api.codesigner_total : 10;
    var fourth;
    if (understood != null && understood !== '') {
      fourth = {
        n: String(understood),
        label: (t && t.statUnderstood) || (labels[3] && labels[3][1]) || '',
        unit: (t && t.of ? (t.of + ' ' + total) : ('/ ' + total)),
        ph: false,
        pad: '0',
        border: '0',
      };
    } else {
      var lines = api && api.lesson_lines != null ? String(api.lesson_lines) : '14';
      fourth = {
        n: lines,
        label: (t && t.statLinesSigned) || 'lesson lines signed by a real interpreter',
        unit: '',
        ph: false,
        pad: '0',
        border: '0',
      };
    }

    return [
      { n: signs, label: (labels[0] && labels[0][1]) || '', unit: '', ph: false, pad: '0', border: '0' },
      { n: phrases, label: (labels[1] && labels[1][1]) || '', unit: '', ph: false, pad: '0', border: '0' },
      { n: cut, label: cutLabel, unit: cutUnit, ph: false, pad: '0', border: '0' },
      fourth,
    ];
  }
  return { mapHomeStats: mapHomeStats };
});
