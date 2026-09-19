import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), "../../.env") });

function integerSetting(value: string | undefined, fallback: number, minimum: number, maximum: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, Math.floor(parsed))) : fallback;
}

export const config = {
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017",
  mongodbDatabase: process.env.MONGODB_DATABASE ?? "triviality",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  workerConcurrency: integerSetting(process.env.RESEARCH_WORKER_CONCURRENCY, 2, 1, 32),
  jobMaxAttempts: integerSetting(process.env.RESEARCH_JOB_MAX_ATTEMPTS, 3, 1, 10),
  jobClaimIdleMs: integerSetting(process.env.RESEARCH_JOB_CLAIM_IDLE_MS, 300_000, 30_000, 86_400_000),
  openAiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  devinApiKey: process.env.DEVIN_API_KEY,
  devinOrgId: process.env.DEVIN_ORG_ID,
  devinBaseUrl: process.env.DEVIN_BASE_URL ?? "https://api.devin.ai",
  devinMaxAcu: Number(process.env.DEVIN_MAX_ACU ?? 2),
  devinPollIntervalMs: integerSetting(process.env.DEVIN_POLL_INTERVAL_MS, 20_000, 250, 60_000),
  devinTimeoutMs: integerSetting(process.env.DEVIN_TIMEOUT_MS, 1_800_000, 1_000, 7_200_000),
  trivialityUrl: process.env.TRIVIALITY_URL ?? "http://localhost:3000",
  leanProjectDir: process.env.LEAN_PROJECT_DIR ?? resolve(process.cwd(), "../../external/norththehackers/lean"),
  leanTimeoutMs: Number(process.env.LEAN_TIMEOUT_MS ?? 120000),
};
