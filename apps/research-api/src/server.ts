import "dotenv/config";
import { randomUUID } from "node:crypto";
import Fastify, { type FastifyRequest } from "fastify";
import { Redis } from "ioredis";
import { getCollections, getDatabase, getMongoClient } from "@triviality/database";
import { config } from "./config.js";

type CreateJobBody = {
  title?: string;
  statement?: string;
  area?: string;
  provider?: string;
  mode?: string;
  budget?: number;
};

const app = Fastify({ logger: true });
const redis = new Redis(config.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
const researchJobStream = "triviality:research:jobs:v2";

function id(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

function publicStatus(status: string): "running" | "completed" | "failed" | "cancelled" {
  if (status === "ACTIVE" || status === "UNEXPLORED") return "running";
  if (status === "CANCELLED") return "cancelled";
  if (status === "ABANDONED" || status === "DISPROVED") return "failed";
  return "completed";
}

function metadataOf(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

async function emit(episodeId: string, type: string, payload: Record<string, unknown>): Promise<void> {
  const database = await getDatabase();
  const events = database.collection<{ _id: string; episodeId: string; type: string; payload: Record<string, unknown>; createdAt: Date }>("research_events");
  await events.insertOne({
    _id: id("event"),
    episodeId,
    type,
    payload,
    createdAt: new Date(),
  });
}

async function serializeJob(episodeId: string) {
  const collections = await getCollections();
  const episode = await collections.researchEpisodes.findOne({ _id: episodeId });
  if (!episode) return null;

  const [problem, hypotheses, attempts, results, paperReferences, formalization, graphNodes, graphEdges] = await Promise.all([
    collections.researchProblems.findOne({ episodeId }),
    collections.researchHypotheses.find({ episodeId }).sort({ createdAt: 1 }).toArray(),
    collections.researchAttempts.find({ episodeId }).sort({ createdAt: 1 }).toArray(),
    collections.researchResults.find({ episodeId }).sort({ createdAt: 1 }).toArray(),
    collections.researchEpisodePapers.find({ episodeId }).sort({ rank: 1 }).toArray(),
    collections.formalizations.findOne({ episodeId }),
    collections.graphNodes.find({ "metadata.episodeId": episodeId }).sort({ createdAt: 1 }).toArray(),
    collections.graphRelationships.find({ "metadata.episodeId": episodeId }).sort({ createdAt: 1 }).toArray(),
  ]);
  const paperIds = paperReferences.map((reference) => reference.paperId);
  const papers = paperIds.length ? await collections.papers.find({ _id: { $in: paperIds } }).toArray() : [];
  const papersById = new Map(papers.map((paper) => [paper._id, paper]));

  const graph = graphNodes.map((node) => {
    const metadata = metadataOf(node.metadata);
    return {
      id: node.entityId,
      type: String(metadata.type ?? node.entityType.toLowerCase().replace("research_", "")),
      label: node.label,
      detail: String(metadata.detail ?? ""),
      x: Number(metadata.x ?? 50),
      y: Number(metadata.y ?? 50),
      status: String(metadata.status ?? "candidate"),
    };
  });

  const proof = formalization ? {
    status: formalization.verified ? "verified" : "candidate",
    theoremName: formalization.theoremName ?? "research_result",
    statement: formalization.statement ?? "",
    lean: formalization.leanSource ?? "",
    latex: formalization.latexSource ?? "",
    checker: formalization.checker ?? formalization.verificationLog ?? "No independent checker result recorded.",
    axioms: formalization.axioms ?? [],
  } : undefined;

  return {
    id: episode._id,
    title: episode.title,
    statement: problem?.statement ?? episode.objective,
    area: episode.area ?? "Mathematics",
    mode: episode.mode ?? "Diverse portfolio",
    provider: episode.modelProvider ?? "openai",
    budget: episode.budget ?? 0,
    status: publicStatus(episode.status),
    stage: episode.stage ?? "Research queued",
    progress: episode.progress ?? 0,
    createdAt: episode.createdAt.toISOString(),
    completedAt: episode.completedAt?.toISOString(),
    summary: episode.summary ?? "",
    error: episode.error,
    nodes: graph,
    edges: graphEdges.map((edge) => ({
      source: edge.fromNodeId,
      target: edge.toNodeId,
      label: String(metadataOf(edge.metadata).label ?? edge.type.toLowerCase()),
    })),
    literature: paperReferences.flatMap((reference) => {
      const paper = papersById.get(reference.paperId);
      return paper ? [{
        id: paper._id,
        title: paper.title,
        authors: (paper.authors ?? []).join(", "),
        source: reference.source,
        year: String(paper.publishedAt?.getFullYear() ?? "n.d."),
        summary: paper.abstract ?? "No abstract was available for this source.",
        relevance: reference.relevance,
        url: paper.landingUrl ?? paper.openAccessUrl ?? "#",
      }] : [];
    }),
    hypotheses: hypotheses.map((hypothesis) => ({
      id: hypothesis._id,
      title: hypothesis.rationale.slice(0, 72) || "Research hypothesis",
      statement: hypothesis.statement,
      approach: String((hypothesis.expectedConsequences as { approach?: string } | undefined)?.approach ?? "Candidate direction"),
      status: hypothesis.status === "DISPROVED" ? "disproved" : hypothesis.status === "PROMISING" ? "promising" : "candidate",
      score: hypothesis.plausibilityEstimate ?? 0,
    })),
    attempts: attempts.map((attempt) => ({
      id: attempt._id,
      role: String((attempt.input as { role?: string } | undefined)?.role ?? "research worker"),
      strategy: attempt.strategy,
      status: attempt.status === "SUCCEEDED" ? "completed" : attempt.status === "FAILED" ? "failed" : "running",
      result: attempt.proofState ?? attempt.error ?? "Attempt recorded.",
    })),
    proof,
    results: results.map((result) => ({ id: result._id, title: result.title, summary: result.summary, status: result.status })),
  };
}

app.get("/health", async (_request, reply) => {
  try {
    const database = await getDatabase();
    await database.command({ ping: 1 });
    if (redis.status === "wait") await redis.connect();
    await redis.ping();
    return { status: "ok", service: "research-api", mongo: "ok", redis: "ok" };
  } catch (error) {
    return reply.code(503).send({ status: "degraded", error: error instanceof Error ? error.message : "dependency unavailable" });
  }
});

app.post("/research/jobs", async (request: FastifyRequest<{ Body: CreateJobBody }>, reply) => {
  const body = request.body ?? {};
  const title = body.title?.trim();
  const statement = body.statement?.trim();
  if (!title || !statement) return reply.code(400).send({ error: "title and statement are required" });

  const now = new Date();
  const projectId = id("project");
  const episodeId = id("episode");
  const problemId = id("problem");
  const collections = await getCollections();
  await collections.researchProjects.insertOne({ _id: projectId, name: title, description: statement, status: "ACTIVE", createdAt: now, updatedAt: now });
  await collections.researchEpisodes.insertOne({ _id: episodeId, projectId, title, objective: statement, status: "ACTIVE", area: body.area ?? "Mathematics", modelProvider: body.provider ?? "openai", mode: body.mode ?? "Diverse portfolio", budget: Math.max(1, Math.min(30, Number(body.budget ?? 6))), stage: "Queued for research worker", progress: 2, createdAt: now, updatedAt: now });
  await collections.researchProblems.insertOne({ _id: problemId, episodeId, title, statement, assumptions: "", status: "ACTIVE", createdAt: now, updatedAt: now });

  try {
    if (redis.status === "wait") await redis.connect();
    await redis.xadd(researchJobStream, "MAXLEN", "~", 10_000, "*", "episodeId", episodeId, "attempt", "0", "enqueuedAt", now.toISOString());
    await emit(episodeId, "research.job.created", { title, area: body.area ?? "Mathematics" });
  } catch (error) {
    await collections.researchEpisodes.updateOne({ _id: episodeId }, { $set: { status: "ABANDONED", stage: "Queue unavailable", error: error instanceof Error ? error.message : "Redis unavailable", updatedAt: new Date() } });
    return reply.code(503).send({ error: "Research queue unavailable. Start Redis and retry." });
  }

  return reply.code(202).send(await serializeJob(episodeId));
});

app.get("/research/jobs", async () => {
  const collections = await getCollections();
  const episodes = await collections.researchEpisodes.find({}).sort({ createdAt: -1 }).toArray();
  return (await Promise.all(episodes.map((episode) => serializeJob(episode._id)))).filter(Boolean);
});

app.get("/research/jobs/:jobId", async (request: FastifyRequest<{ Params: { jobId: string } }>, reply) => {
  const job = await serializeJob(request.params.jobId);
  return job ? job : reply.code(404).send({ error: "Research job not found" });
});

app.delete("/research/jobs/:jobId", async (request: FastifyRequest<{ Params: { jobId: string } }>, reply) => {
  const collections = await getCollections();
  const episode = await collections.researchEpisodes.findOne({ _id: request.params.jobId });
  if (!episode) return reply.code(404).send({ error: "Research job not found" });
  if (episode.status === "ACTIVE" || episode.status === "UNEXPLORED") {
    const now = new Date();
    const cancelled = await collections.researchEpisodes.updateOne(
      { _id: episode._id, status: { $in: ["ACTIVE", "UNEXPLORED"] } },
      { $set: { status: "CANCELLED", stage: "Cancelled by user", completedAt: now, updatedAt: now }, $unset: { error: "" } },
    );
    if (cancelled.modifiedCount) await emit(episode._id, "research.job.cancelled", {});
  }
  return serializeJob(episode._id);
});

app.get("/research/jobs/:jobId/events", async (request: FastifyRequest<{ Params: { jobId: string } }>) => {
  const database = await getDatabase();
  return database.collection("research_events").find({ episodeId: request.params.jobId }).sort({ createdAt: 1 }).toArray();
});

app.addHook("onClose", async () => {
  await redis.quit();
  await (await getMongoClient()).close();
});

await app.listen({ port: config.port, host: "0.0.0.0" });
console.log(`Research API listening on http://localhost:${config.port}`);
