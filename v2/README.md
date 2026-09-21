# MLB evidence desk / V2

Presentation-only companion to `I-R0N/MLB-Model`'s `src/v2` and `deploy/v2_routes.py`.

The existing `index.html`, `nfl.html` and archives are untouched. The private control server serves these V2 assets at `/report-v2`, after its existing authentication check, and supplies `/api/v2/predictions?date=YYYY-MM-DD` from the separate V2 database. Configure `MLB_V2_ASSETS` to this directory. Do not put tokens, private forecast data or provider credentials into this public repo.

`app.js` has exactly one game-card renderer for current and historical predictions. It consumes contract `mlb.prediction.v2.1`; all prediction, winner, edge, consensus, recommendation and featured-analyst decisions are made in Python. The browser only formats fields and escapes text. Empty states never synthesize forecasts. Missing probabilities display as unavailable. An unsupported contract is rejected.

The primary card shows the system lean, side probability, home-oriented market probability, side-oriented edge, strongest evidence and quality. Expanders reveal component beliefs, evidence provenance, disagreement, risks and every specialist's probability and proper-score performance. No analyst is featured merely for a small winning streak. Narrow screens get a single-column layout and full-width date controls. Operations live at `/admin`; no operational controls are added to the V2 cards.

Run `node --test tests/v2.test.cjs` from the repository root (no npm dependencies required). Six rendering tests pass. Browser visual QA was attempted but the environment's browser download failed, so an actual phone/browser review is still needed. Review the coordinated backend PR's `docs/v2/README.md` for deployment, regression checks, historical data limitations and rollback. Remove this new directory to roll back the presentation; the legacy report is unaffected.
