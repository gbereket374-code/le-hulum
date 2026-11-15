# Sign sync

Wait for signer on. MAX_LAG is 2.0 s. The lesson holds only at a cue boundary, and only when the predicted wait is at least 0.5 s. The signer keeps signing during a hold. The end-of-lesson wait is not a hold.

| boundary | lesson s | hold s | sign advance s |
|---|---:|---:|---:|
| A01 -> A02 | 2.39 | 3.68 | 3.64 |
| A02 -> A03 | 5.30 | 0.68 | 0.64 |
| A03 -> A04 | 8.40 | 1.00 | 0.96 |
| A05 -> A06 | 14.88 | 1.20 | 1.16 |
| A07 -> A08 | 20.13 | 1.60 | 1.56 |
| A09 -> A10 | 25.89 | 1.40 | 1.36 |
| A10 -> A11 | 29.55 | 0.72 | 0.68 |

Every lesson time is within 0.10 s of that cue boundary. Every hold is at least 0.5 s. The sign video advanced at least 94% of each hold. The waiting pill was visible for every hold.

Mid-lesson holds: 7. The target is 3. These seven sentence ends still had more than 2.5 s of signing left, so the rule held. The other boundaries were under 0.5 s and were left to catch-up.
End-of-lesson wait: 1.16 s. The pill appeared at 0.64 s. `db-player:complete` fired at 46.58 s, when the signer finished. It is not one of the 7.
Mean lag: 0.27 s. Max lag: 2.26 s.
Wall time: 58.5 s.

MAX_LAG stays 2.0 s. Catch-up is 1.10× while the lag is above 0.8 s.

axe: 0 violations in light, dark, and contrast.
