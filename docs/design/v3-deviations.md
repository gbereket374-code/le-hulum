# v3 design deviations (WCAG / product only)

Exact UI is served from `demo/v3-design/LE HULUM.dc.html` (design SPA).
Brand mark uses the existing A-logo SVG (not the design two-bar sketch).

| Area | Deviation | Why |
|------|-----------|-----|
| Logo | Existing A-mark SVG with accent→gold gradient | Product requirement: use existing logo |
| Fonts | Self-hosted OFL via `demo/tokens.css` | No Google CDN; privacy / offline |
| `lesson-video.html` | Real `<db-player>` kept at this URL | Sync measure + EthSL engine tests; nav "Signed lesson" uses design `#lesson` |
| Contact mailto | `hello@` + `location.hostname` | Design had literal `HOST` placeholder |
