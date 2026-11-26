# AGENTS.md

Repository context and guidance for AI agents working with this codebase.

## What This Project Does

A web app that visualizes GitHub pull request dependencies as an interactive graph. Nodes represent branches/PRs and edges represent base-branch relationships. Users can browse owners and repositories, inspect branch dependencies, filter loaded PRs, refresh GitHub data, and export SVG diagrams.

## Commands

```bash
npm run start:dev   # Vite (9000) + Sails (1337), in parallel
npm start           # Build assets, then start production server
npm run build       # Vite production build (build:prod is also available)
npm run start-app   # NODE_ENV=production node app.js
npm run lint        # ESLint, zero warnings
npm test            # ESLint + Node built-in graph/filter tests
```

`custom-tests` runs `node --test test/*.test.mjs` (filtering and Dagre compatibility). ESLint 10 uses `eslint.config.mjs`, including JS, JSX, and Vite configuration. JSX unused-variable checking is disabled because core ESLint does not track component usages. Use Node 26.x (`.nvmrc`, package engines, Docker) and npm only.

Docker configuration lives in `Dockerfile`, `docker-compose.yml`, and `docker-entrypoint.sh`. Build with `docker build -t gh-pr-tree .` or `docker compose build`; run with `docker compose up -d`. The Node 26 image builds assets once and starts `node app.js` in production; Compose binds localhost:1337 and persists SQLite at `/data/app.sqlite` in the `data` volume. Old `tmp` volume databases require manual migration. SPA entry routes (`/`, `/config`, `/tree`, `/tree/*`) serve the Vite index through `config/routes.js`. There is no `container:start` package script. Docker uses `npm ci` with `package-lock.json`, matching local npm dependency updates. Yarn lockfiles/configuration and the obsolete Yarn-only NeDB override were removed. `package-lock.json` is the only dependency lockfile; use `npm ci` for reproducible installs.

## Architecture

**Stack:** SailsJS ^1.5.18, React 19, React Router 7, Vite 8, React Flow 13 (`@xyflow/react`), Dagre 3, SCSS/Bootstrap, SQLite (`sails-sqlite`). Check `package.json` for current dependency declarations.

### Backend

- `app.js` — Sails entry point.
- `api/controllers/tree/index.js` — GitHub GraphQL PR query, token setup, and cache helpers shared with refresh. Requests open PRs with `last: 100` and descending creation order; do not assume this selects the most recent 100 without verifying pagination semantics.
- `api/controllers/tree/refresh.js` — Explicit refresh action.
- `api/controllers/owners/list.js` — Authenticated GitHub user and organizations.
- `api/controllers/owners/repos.js` — Paginated repository browsing.
- `api/models/Config.js` — Key/value configuration, including `github_token`.
- `api/models/Repo.js` — Cached repository PR payload; 30-minute TTL enforced in the tree controller.
- `config/routes.js` — API routes:
  - `GET /api/v1/tree` — Owners.
  - `GET /api/v1/tree/:owner` — Repositories.
  - `GET /api/v1/tree/:owner/:repo` — PR data.
  - `POST /api/v1/tree/:owner/:repo/refresh` — Refresh PR data.
- `config/blueprints.js` — REST blueprints enabled under `/api/v1`, including Config and Repo model CRUD.
- `config/policies.js` — No explicit access-control policies configured.
- `config/datastores.js` — SQLite at `.tmp/db.sqlite`.
- `config/bootstrap.js` + `lib/initialize-sqlite.js` — Create missing SQLite tables transactionally on startup, including with production `migrate: 'safe'`. Existing tables/data are preserved; future schema changes need explicit migrations.
- `config/env/production.js` — Production SQLite path supports `SQLITE_PATH`.

The token is configured through `/config` and persisted in Config as `github_token`. Never print or commit tokens, database files, or private repository payloads. Do not assume this application is safe to expose publicly without access-control hardening.

### Frontend

- `assets/src/Theme.jsx` — Shared System/Light/Dark preference, persisted in localStorage. Synchronizes Bootstrap `data-bs-theme` and React Flow 13's `forceColorMode`. Theme selector lives in Navigation. PR status backgrounds remain pastel with explicit dark text in both modes; SVG exports stay light and independent of the UI theme.

- `vite.config.mjs` — Frontend root `assets/src`, build output `.tmp/public`, `components` alias to `assets/src`, development `/api` proxy to Sails.
- `assets/src/Pages/App.jsx` — React root and routing/layout setup.
- `assets/src/Pages/Tree/Tree.jsx` — Tree routes and data loaders; branch selection is frontend-side.
- `assets/src/Pages/Tree/OwnersList.jsx`, `OwnerRepos.jsx` — Browsing screens.
- `assets/src/Pages/Config.jsx` — Token configuration UI.
- `assets/src/Pages/Tree/TreeRenderer.jsx` — React Flow graph, query state, filter UI, suggestions, and match count.
- `assets/src/Pages/Tree/PRNode.jsx` — Title, author, PR link, and branch-focused navigation.
- `assets/src/Pages/Tree/RefreshButton.jsx` — Explicit data refresh.
- `assets/src/Pages/Tree/DownloadButton.jsx` — Custom SVG generation from React Flow nodes and edges in graph coordinates, independent of viewport clipping; exports the full filtered graph. Not an html-to-image export.

### Graph and filtering pipeline

Helpers live in `assets/src/Pages/Tree/helpers/`:

1. `nodeReducer.js` builds branch-keyed nodes and dependency edges. PR backgrounds reflect mergeability.
2. `branchDelimiter.js` selects a branch's ancestors and descendants, when requested.
3. `prFilters.js` filters nodes and edges, retaining ancestors as dimmed context and highlighting matching PRs.
4. `dagreSolver.js` computes a compact layout for the visible graph using a fresh Dagre instance each time. `GraphViewport.jsx` updates after filtering (debounced), centering the full diagram at zoom 1. The visible canvas fills the window below the header. Finite navigation bounds use the maximum of viewport size and diagram size plus margins on each axis. Nodes cannot be dragged outside those bounds. SVG export uses graph coordinates at native scale, independent of live pan/zoom.

The live query supports title text plus `author:`, `label:`, `base:`, `draft:`, `review:`, and `conflicts:`. Terms combine with AND; uppercase `OR` separates alternative AND groups (AND takes precedence). Quoted `"OR"` remains literal text; empty OR groups are ignored while typing and never match by themselves. Parentheses are not supported. Quoted values support spaces (e.g. `label:"needs review"`). Review values are `approved`, `changes_requested`, and `review_required`. Boolean values are `true`/`false`. Suggestions use a native datalist and loaded repository values.

Filtering is local to loaded open PRs (currently at most 100), within the branch-delimited graph. It is not the full GitHub search language. `base:` selects direct targets, unlike branch-focused navigation which includes ancestors and descendants. Unknown qualifiers currently yield no matches.

## Pending Work / Backlog

These are observed gaps and proposed follow-ups, not implemented capabilities or authorization to expand an unrelated task.

### High priority — security and correctness

- [ ] Protect Config/token APIs and refresh endpoints with appropriate authentication/authorization before public deployment. Audit blueprint exposure (REST, actions, shortcuts), token responses/storage, and access to private cached repository data.
- [ ] Fix/verify GitHub PR ordering (`last: 100` with descending order), add cursor pagination, and expose truncation/loaded totals clearly. Labels are also limited to the first 10 per PR; organization listing requests only the first 100.
- [ ] Extend existing graph/filter tests with branch delimiting, cache expiry, refresh, and GitHub error coverage.
- [ ] Address graph identity collisions: branch-only keys can conflate PRs from forks; replacing dots with underscores can also collide. Define stable identities and dependency resolution.
- [ ] Guard graph traversal against cycles. Filtering has a visited set, but branch delimiter recursion and ancestor traversal do not.
- [ ] Handle SVG export with zero visible nodes (bounds currently remain infinite), and preserve filter dimming/highlights in exported SVGs.

### Medium priority — filtering and usability

- [ ] Validate unsupported qualifiers, invalid values, and unfinished quotes rather than showing an unexplained empty result.
- [ ] Test datalist behavior across browsers, keyboard navigation, screen readers, and mobile. Consider a dedicated accessible combobox for caret-aware suggestions and larger value lists (currently capped at 50).
- [ ] Persist queries in URL search parameters for shareable views and navigation; define reset behavior when switching repositories/branches.
- [ ] Add requested-reviewer/assignee filters if needed; fetch their metadata first. Closed/merged states require backend query changes.
- [ ] Distinguish unknown mergeability from genuinely conflict-free PRs (`conflicts:false` currently includes UNKNOWN).
- [ ] Review viewport behavior for sparse matches, long titles, small screens, and filter/action panel overlap. Verify filtering together with refresh and SVG download in a browser.

### Maintenance and deployment

- [ ] Add React-aware unused-variable/hooks rules to JSX lint coverage; preserve the zero-warnings policy.
- [x] Standardize on npm, one lockfile, npm test scripts, and Node 26.
- [ ] Add CI checks for lint, real tests, and production builds.
- [ ] Refresh README setup/development/deployment documentation and review remaining legacy Grunt tooling and unused dependencies before removal.
- [ ] Review production bundle splitting: current build reports a JavaScript chunk larger than 500 kB.
- [ ] Verify Docker production workflow, persistent SQLite volume/backups, and configuration. Database data defaults to `.tmp`; `npm run clean` now deletes only `.tmp/public`, preserving the database.
- [ ] Review GitHub client initialization (asynchronous module-level imports), rate-limit/error handling, concurrent refreshes, and cache invalidation when credentials change.

## Working Guidelines

- Keep changes scoped; preserve unrelated work in the working tree.
- Update this document when architecture, commands, filter semantics, or known limitations change.
- Run `npm run lint` and `npm run build` for code changes. Report test/build limitations honestly; the unit suite does not replace browser/API integration testing.
- For UI changes, manually check filtering, branch navigation, refresh, empty states, export, and narrow-screen behavior when a browser is available.
- Preserve dependency context when filtering; do not silently remove ancestors or claim local search covers all GitHub PRs.
