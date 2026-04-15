# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Does

A web app that visualizes GitHub pull request dependencies as an interactive tree diagram. It fetches open PRs from a GitHub repository via GraphQL and renders them as a hierarchical flow graph where nodes represent branches and edges show base-branch relationships.

## Commands

```bash
# Development (runs webpack-dev-server + sails lift in parallel)
npm start

# Production build (webpack in production mode)
yarn run build:prod

# Start production server
yarn run start-app      # NODE_ENV=production node app.js

# Lint (zero-warnings policy)
npm run lint

# Test (lint + custom tests)
npm run test

# Docker
yarn container:start    # builds prod assets and starts app
```

## Architecture

**Stack**: SailsJS 1.5.3 (backend) + React 18 SPA (frontend), bundled with Webpack 5.

### Backend

- `app.js` — SailsJS entry point
- `api/controllers/tree/index.js` — The only custom controller. Fetches the 100 most recent open PRs from GitHub's GraphQL API and caches results for 30 minutes in the `Repo` model.
- `api/models/Config.js` — Key/value store (name, value). Used to persist the GitHub token via the Config page.
- `api/models/Repo.js` — Cache layer for PR data (owner, repo, nodes JSON). 30-minute TTL.
- `config/routes.js` — Custom route: `GET /api/v1/tree/:owner/:repo/:branch?` + the SPA root `/`.
- `config/blueprints.js` — Blueprint REST API enabled at `/api/v1`, providing auto-generated CRUD for Config and Repo models.
- `config/datastores.js` — Uses `sails-disk` (local file DB) in development.

### Frontend

React SPA in `assets/src/`, entry at `assets/src/index.js`, output to `.tmp/public/bundle-[hash].js`.

**Pages** (`assets/src/Pages/`):
- `App.jsx` — Router setup (home, config, tree routes)
- `Tree/Tree.jsx` — Route with React Router v6 data loader; fetches `/api/v1/tree/:owner/:repo/:branch?`
- `Tree/TreeRenderer.jsx` — Renders the graph using `@xyflow/react`
- `Config.jsx` — UI to save/update the GitHub personal access token

**Tree rendering pipeline** (`Tree/helpers/`):
1. `nodeReducer.js` — Transforms raw PR data into `@xyflow/react` nodes and edges. Creates a parent node for `baseRefName` and a child node for `headRefName`. Colors nodes by mergeable status (green/red/yellow).
2. `branchDelimiter.js` — Filters the full tree to show only the ancestors and descendants of a selected branch.
3. `dagreSolver.js` — Computes hierarchical node positions using `@dagrejs/dagre` (300×35px nodes, top-to-bottom layout).

**Components**:
- `PRNode.jsx` — Custom React Flow node: shows PR title, author, links to PR on GitHub and to a branch-filtered tree view.
- `DownloadButton.jsx` — Exports the rendered tree as SVG using `html-to-image`.

### Data Flow

```
User visits /{owner}/{repo}/{branch?}
  → Tree.jsx loader → GET /api/v1/tree/:owner/:repo/:branch?
  → Backend: check Repo cache (30 min TTL) → GitHub GraphQL API
  → nodeReducer builds nodes/edges
  → branchDelimiter filters (if branch param present)
  → dagreSolver calculates positions
  → @xyflow/react renders interactive graph
```

### GitHub Token

The GitHub personal access token must be configured via the `/config` page. It is stored in the `Config` model under the name `github_token` and read by the tree controller at request time.