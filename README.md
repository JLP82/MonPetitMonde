# mon Petit monde!

**Run it:** extract the whole zip first (do not open `index.html` from inside the zip: the `css/`, `js/` and `assets/` folders would not be loaded and the page stays blank).
Then either double-click `start.bat` (Windows) / run `./start.sh` (Mac/Linux) to serve it at http://localhost:8765/, or open `index.html` from the extracted folder. No build step.

- `js/data.js` — bookshelf hotspots, map landmarks, regions, portfolio sections, `PORTFOLIO_URL`
- `js/router.js` — hash routes: `#/` bookshelf, `#/atlas`, `#/place/<id>`, `#/portfolio`
- `js/bookshelf.js`, `js/atlas.js`, `js/portfolio.js`, `js/destinations.js` — one file per screen
- Phase 3: build each destination in its own file and register it with
  `MPM.registerExperience("<place-id>", function (root, place) { ... })`
- `assets/` — bookshelf, map (webp) and portfolio pages (jpg, rendered from the PDF)
