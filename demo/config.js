// FR-01 INT-01: Absolute host for demo snippets — never hardcode a hostname.
// Import HOST/API/MODULE into any demo page that generates embed code.

export const HOST = typeof location !== 'undefined' ? location.origin : '';
export const API = HOST + '/api/v1';
export const MODULE = HOST + '/module/db-player.js';
