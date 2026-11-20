// FR-01 INT-01: Hosted origin for the design SPA — never hardcode a hostname.
(function (g) {
  var HOST = (typeof location !== 'undefined' && location.origin) ? location.origin : '';
  g.LH_CONFIG = {
    HOST: HOST,
    API: HOST + '/api/v1',
    MODULE: HOST + '/module/db-player.js',
    DATA: HOST + '/demo/data',
  };
})(typeof window !== 'undefined' ? window : globalThis);
