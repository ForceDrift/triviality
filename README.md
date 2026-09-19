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
