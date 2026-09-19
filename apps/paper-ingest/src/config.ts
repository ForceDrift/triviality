import "dotenv/config";

function numberEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

export const config = {
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017",
  mongodbDatabase: process.env.MONGODB_DATABASE ?? "triviality",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  openAlexEmail: process.env.OPENALEX_EMAIL,
  openAlexFilter: process.env.OPENALEX_WORKS_FILTER ?? "default.search:mathematics,type:article",
  openAlexPerPage: numberEnv("OPENALEX_PER_PAGE", 25),
  embeddingApiUrl: process.env.EMBEDDING_API_URL ?? "https://api.openai.com/v1/embeddings",
  embeddingApiKey: process.env.EMBEDDING_API_KEY,
  embeddingModel: process.env.EMBEDDING_MODEL ?? "text-embedding-3-small",
  artifactRoot: process.env.ARTIFACT_ROOT ?? ".data/object-storage",
  intervalMinutes: numberEnv("INGEST_INTERVAL_MINUTES", 1440),
  runOnStart: process.env.RUN_ON_START !== "false",
};
