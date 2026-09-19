# Triviality

## Data layer

The research schema is MongoDB-native. `packages/database` defines typed collections for research state, mathematical knowledge, graph nodes and relationships, raw object-storage artifacts, and paper embeddings. MongoDB Atlas Vector Search indexes `paper_embeddings.embedding`; Redis tracks ingestion jobs.

Start the local MongoDB and Redis services, then run:

```bash
docker compose up -d mongodb redis
cp .env.example .env
pnpm --filter @triviality/database ensure-indexes
pnpm papers:ingest
```

Convenience commands are also available: `pnpm db:up`, `pnpm db:status`, and `pnpm db:down`.

The local database is available at `mongodb://localhost:27017`, database `triviality`. Atlas can be used later by replacing `MONGODB_URI` in `.env`.

The paper ingestion worker ranks mathematics-related OpenAlex works by citation count, stores normalized metadata and raw JSON artifacts, creates paper graph nodes, and writes embeddings when `EMBEDDING_API_KEY` is configured. OpenAlex is used for ranked discovery; arXiv/PDF URLs are retained as source links when supplied by the record.

The default discovery catalog covers 16 areas and requests up to 100 works per area: algebra, analysis, geometry, topology, number theory, combinatorics, probability, statistics, logic, differential equations, numerical analysis, optimization, dynamical systems, mathematical physics, category theory, and representation theory. Results are deduplicated by OpenAlex work ID; per-area rank and provenance are stored in `paper_discoveries`.

## Local research runtime

The research workspace is backed by two additional apps:

- `apps/research-api` — creates research episodes, stores their state in MongoDB, and enqueues work in Redis.
- `apps/research-worker` — retrieves OpenAlex literature, asks OpenAI for competing hypotheses and a small formalization target, runs the Lean checker when `lake` is installed, and writes graph nodes, attempts, results, and artifacts back to MongoDB.

Research jobs use an acknowledged Redis Stream consumer group. A job is acknowledged only after it completes, cancelled jobs are safely skipped, abandoned deliveries are reclaimed after `RESEARCH_JOB_CLAIM_IDLE_MS`, and failures retry up to `RESEARCH_JOB_MAX_ATTEMPTS` before moving to `triviality:research:jobs:dead`. `RESEARCH_WORKER_CONCURRENCY` controls the number of local consumers.

When `DEVIN_API_KEY` is configured, the worker also fans each episode out to three server-side Devin sessions: a literature scout, a cross-domain researcher, and a formal proof critic. The worker waits for completed reports, records their provenance, and supplies successful reports as explicitly unverified context to both hypothesis synthesis and formalization; failed or timed-out reports are retained for diagnostics but excluded from synthesis. The service credential is never sent to the browser. Devin session IDs, reports, terminal states, timeouts, and failures are stored as research attempts. `cog_` credentials use the v3 API; set `DEVIN_ORG_ID` when automatic organization discovery is not permitted. Polling and the maximum wait are controlled by `DEVIN_POLL_INTERVAL_MS` and `DEVIN_TIMEOUT_MS`.

Run the services in separate terminals:

```bash
cp .env.example .env
pnpm db:up
pnpm research:api
pnpm research:worker
pnpm --filter web dev
```

The web app proxies `/api/research/*` to `RESEARCH_API_URL` (default `http://localhost:3010`). A research job is not considered verified because a model says it is: when Lean is unavailable or rejects the generated file, the episode remains a candidate/blocked result and the checker detail is shown in the episode page. To enable independent verification, install `elan`/Lean and point `LEAN_PROJECT_DIR` at the checked Lean project under `external/norththehackers/lean`.
