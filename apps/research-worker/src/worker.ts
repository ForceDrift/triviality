import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { Redis } from "ioredis";
import OpenAI from "openai";
import { getCollections, getDatabase, getMongoClient } from "@triviality/database";
import { config } from "./config.js";
import { spawnDevinResearchAgents } from "./devin.js";

const execFileAsync = promisify(execFile);
const redis = new Redis(config.redisUrl, { maxRetriesPerRequest: null });
const openai = config.openAiKey ? new OpenAI({ apiKey: config.openAiKey }) : null;

type OpenAlexWork = {
  id: string;
  title?: string | null;
  publication_year?: number | null;
  publication_date?: string | null;
  cited_by_count?: number;
  authorships?: Array<{ author?: { display_name?: string | null } | null }>;
  abstract_inverted_index?: Record<string, number[]> | null;
  primary_location?: { landing_page_url?: string | null; pdf_url?: string | null } | null;
  open_access?: { oa_url?: string | null } | null;
};

function id(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

function metadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function abstractFromIndex(index: OpenAlexWork["abstract_inverted_index"]): string | null {
  if (!index) return null;
  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) for (const position of positions) words[position] = word;
  return words.filter(Boolean).join(" ") || null;
}

async function emit(episodeId: string, type: string, payload: Record<string, unknown>): Promise<void> {
  const database = await getDatabase();
  const events = database.collection<{ _id: string; episodeId: string; type: string; payload: Record<string, unknown>; createdAt: Date }>("research_events");
  await events.insertOne({ _id: id("event"), episodeId, type, payload, createdAt: new Date() });
}

async function updateStage(episodeId: string, stage: string, progress: number): Promise<void> {
  const collections = await getCollections();
  await collections.researchEpisodes.updateOne({ _id: episodeId }, { $set: { stage, progress, updatedAt: new Date() } });
  await emit(episodeId, "research.stage.updated", { stage, progress });
}

async function addGraphNode(episodeId: string, entityId: string, entityType: string, label: string, detail: string, x: number, y: number, status: string): Promise<void> {
  const collections = await getCollections();
  await collections.graphNodes.updateOne(
    { entityType: entityType as never, entityId },
    { $set: { label, metadata: { episodeId, type: entityType.toLowerCase().replace("research_", ""), detail, x, y, status }, updatedAt: new Date() }, $setOnInsert: { _id: id("graph"), createdAt: new Date() } },
    { upsert: true },
  );
}

async function addGraphEdge(episodeId: string, source: string, target: string, type: string, label: string): Promise<void> {
  const collections = await getCollections();
  await collections.graphRelationships.updateOne(
    { fromNodeId: source, toNodeId: target, type: type as never },
    { $set: { confidence: 0.8, rationale: label, metadata: { episodeId, label }, updatedAt: new Date() }, $setOnInsert: { _id: id("edge"), createdAt: new Date() } },
    { upsert: true },
  );
}

async function fetchLiterature(title: string, statement: string): Promise<OpenAlexWork[]> {
  const query = `${title} ${statement}`.replace(/[?*]/g, " ").slice(0, 450);
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", query);
  url.searchParams.set("sort", "relevance_score:desc");
  url.searchParams.set("per-page", "5");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`OpenAlex request failed: ${response.status} ${response.statusText}`);
  const payload = await response.json() as { results?: OpenAlexWork[] };
  return (payload.results ?? []).filter((work) => work.title);
}

async function synthesizeHypotheses(title: string, statement: string, literature: OpenAlexWork[]) {
  if (!openai) throw new Error("OPENAI_API_KEY is required for hypothesis generation");
  const sources = literature.map((work, index) => `${index + 1}. ${work.title} (${work.publication_year ?? "n.d."})`).join("\n");
  const response = await openai.chat.completions.create({
    model: config.openAiModel,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are a mathematical research director. Generate competing, falsifiable directions. Do not claim the target is solved. Return JSON only: {\"hypotheses\":[{\"title\":string,\"statement\":string,\"approach\":string,\"rationale\":string,\"plausibility\":number}]}" },
      { role: "user", content: `Target: ${title}\nProblem: ${statement}\nRelevant literature:\n${sources || "No sources were retrieved."}\nGenerate 2 to 4 materially different hypotheses. Each must identify a mechanism and a concrete proof or counterexample direction.` },
    ],
  });
  const content = response.choices[0]?.message.content ?? "{}";
  const parsed = JSON.parse(content) as { hypotheses?: unknown[] };
  const output = (parsed.hypotheses ?? []).filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object").slice(0, 4);
  if (!output.length) throw new Error("The research model returned no hypotheses");
  return output.map((item) => ({
    title: String(item.title ?? "Untitled hypothesis"),
    statement: String(item.statement ?? ""),
    approach: String(item.approach ?? "Unspecified approach"),
    rationale: String(item.rationale ?? "Model-generated research direction"),
    plausibility: Math.max(0, Math.min(1, Number(item.plausibility ?? 0.5))),
  })).filter((item) => item.statement.length > 0);
}

async function synthesizeProof(title: string, statement: string, hypothesis: string) {
  if (!openai) throw new Error("OPENAI_API_KEY is required for proof artifact generation");
  const response = await openai.chat.completions.create({
    model: config.openAiModel,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are a Lean 4 proof engineer. Produce a small faithful lemma related to the research target, not a fabricated proof of the full problem. Return JSON only: {\"theorem_name\":string,\"statement\":string,\"lean\":string,\"latex\":string}. The Lean file must import Mathlib, contain exactly one theorem, and use no sorry, axiom, unsafe, native_decide, or set_option." },
      { role: "user", content: `Research target: ${title}\nProblem: ${statement}\nPromising direction: ${hypothesis}\nProduce the smallest meaningful formalizable lemma you can support. The checker will decide whether the code is valid.` },
    ],
  });
  const content = response.choices[0]?.message.content ?? "{}";
  const parsed = JSON.parse(content) as Record<string, unknown>;
  const lean = String(parsed.lean ?? "");
  if (!lean.includes("theorem") && !lean.includes("lemma")) throw new Error("The research model returned no Lean declaration");
  return { theoremName: String(parsed.theorem_name ?? "research_lemma"), statement: String(parsed.statement ?? ""), lean, latex: String(parsed.latex ?? "") };
}

async function checkLean(source: string, theoremName: string): Promise<{ verified: boolean; checker: string; axioms: string[]; log: string }> {
  const forbidden = [/\bsorry\b/, /^\s*axiom\b/m, /\bunsafe\b/, /native_decide/, /implemented_by/, /^\s*set_option\b/m];
  const blocked = forbidden.find((pattern) => pattern.test(source));
  if (blocked) return { verified: false, checker: `Rejected by static policy: ${blocked}`, axioms: [], log: "" };
  const projectDir = resolve(config.leanProjectDir);
  const checkDir = await mkdtemp(join(tmpdir(), "triviality-lean-"));
  const checkFile = join(checkDir, "Check.lean");
  await writeFile(checkFile, `${source.trim()}\n\n#print axioms ${theoremName}\n`, "utf8");
  try {
    const result = await execFileAsync("lake", ["env", "lean", checkFile], { cwd: projectDir, timeout: config.leanTimeoutMs, maxBuffer: 1024 * 1024 });
    const log = `${result.stdout}\n${result.stderr}`;
    const match = log.match(/depends on axioms: \[([^\]]*)\]/);
    const axioms = match?.[1]?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
    const allowed = new Set(["propext", "Classical.choice", "Quot.sound"]);
    const disallowed = axioms.filter((axiom) => !allowed.has(axiom));
    return { verified: disallowed.length === 0, checker: disallowed.length ? `Disallowed axioms: ${disallowed.join(", ")}` : "Lean 4 checker passed with no disallowed axioms", axioms, log };
  } catch (error) {
    const detail = error as { stdout?: string; stderr?: string; message?: string };
    return { verified: false, checker: `Lean checker unavailable or rejected the artifact: ${detail.message ?? "unknown error"}`, axioms: [], log: `${detail.stdout ?? ""}\n${detail.stderr ?? ""}` };
  } finally {
    await rm(checkDir, { recursive: true, force: true });
  }
}

async function runEpisode(episodeId: string): Promise<void> {
  const collections = await getCollections();
  const episode = await collections.researchEpisodes.findOne({ _id: episodeId });
  const problem = await collections.researchProblems.findOne({ episodeId });
  if (!episode || !problem || episode.status !== "ACTIVE") return;
  try {
    await addGraphNode(episodeId, problem._id, "RESEARCH_PROBLEM", "Target problem", episode.title, 50, 13, "active");
    await updateStage(episodeId, "Scanning OpenAlex literature", 18);
    const works = await fetchLiterature(episode.title, problem.statement);
    const paperGraphNodeIds: string[] = [];
    for (const work of works) {
      const paperId = `paper_${createHash("sha1").update(work.id).digest("hex").slice(0, 16)}`;
      const episodePaperId = `episode_paper_${createHash("sha1").update(`${episodeId}:${paperId}`).digest("hex").slice(0, 16)}`;
      paperGraphNodeIds.push(episodePaperId);
      const now = new Date();
      await collections.papers.updateOne(
        { _id: paperId },
        {
          $set: { externalId: work.id, title: work.title ?? "Untitled paper", abstract: abstractFromIndex(work.abstract_inverted_index) ?? undefined, authors: (work.authorships ?? []).map((author) => author.author?.display_name ?? "").filter(Boolean), citedByCount: work.cited_by_count ?? 0, publishedAt: work.publication_date ? new Date(work.publication_date) : undefined, landingUrl: work.primary_location?.landing_page_url ?? undefined, openAccessUrl: work.open_access?.oa_url ?? work.primary_location?.pdf_url ?? undefined, updatedAt: now },
          $addToSet: { subjects: episode.area ?? "mathematics" },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      );
      await collections.researchEpisodePapers.updateOne(
        { _id: episodePaperId },
        {
          $set: { episodeId, paperId, source: "OpenAlex", relevance: "Retrieved by semantic query over the research target.", rank: paperGraphNodeIds.length, updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      );
      await addGraphNode(episodeId, episodePaperId, "PAPER", `Literature ${paperGraphNodeIds.length}`, work.title ?? "Untitled paper", 12 + paperGraphNodeIds.length * 15, 63, "candidate");
    }
    await emit(episodeId, "research.literature.completed", { count: works.length });

    if (config.devinApiKey) {
      await updateStage(episodeId, "Spawning Devin research agents", 30);
      try {
        await spawnDevinResearchAgents(episodeId, episode.title, problem.statement, works.map((work) => `${work.title ?? "Untitled"} (${work.publication_year ?? "n.d."})`));
        await emit(episodeId, "research.devin.fanout.completed", { roles: 3 });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Devin fanout unavailable";
        await emit(episodeId, "research.devin.unavailable", { error: message });
        console.warn(`Devin fanout skipped for ${episodeId}: ${message}`);
      }
    }

    await updateStage(episodeId, "Generating competing hypotheses", 45);
    if (!config.openAiKey) throw new Error("OPENAI_API_KEY is not configured; literature was retrieved but synthesis cannot continue");
    const hypotheses = await synthesizeHypotheses(episode.title, problem.statement, works);
    const hypothesisIds: string[] = [];
    for (let index = 0; index < hypotheses.length; index += 1) {
      const hypothesis = hypotheses[index];
      const hypothesisId = id("hypothesis");
      hypothesisIds.push(hypothesisId);
      const now = new Date();
      await collections.researchHypotheses.insertOne({ _id: hypothesisId, episodeId, problemId: problem._id, statement: hypothesis.statement, rationale: hypothesis.title, assumptions: "", expectedConsequences: { approach: hypothesis.approach, rationale: hypothesis.rationale }, noveltyEstimate: 0.5, plausibilityEstimate: hypothesis.plausibility, formalizability: 0.6, status: "PROMISING", createdAt: now, updatedAt: now });
      await addGraphNode(episodeId, hypothesisId, "RESEARCH_HYPOTHESIS", `H${index + 1} · ${hypothesis.title}`, hypothesis.approach, 22 + index * 25, 35, "active");
      await addGraphEdge(episodeId, problem._id, hypothesisId, "PRODUCES", "explores");
      if (paperGraphNodeIds[index]) await addGraphEdge(episodeId, hypothesisId, paperGraphNodeIds[index], "USES", "informed by");
    }

    const attemptId = id("attempt");
    await collections.researchAttempts.insertOne({ _id: attemptId, episodeId, hypothesisId: hypothesisIds[0] ?? "", strategy: "diverse hypothesis portfolio", status: "SUCCEEDED", input: { role: "hypothesis_generator", mode: episode.mode }, proofState: `${hypotheses.length} competing hypotheses retained`, createdAt: new Date(), updatedAt: new Date(), startedAt: new Date(), completedAt: new Date() });
    await emit(episodeId, "research.hypotheses.completed", { count: hypotheses.length });

    await updateStage(episodeId, "Formalizing the strongest smaller claim", 72);
    const proofArtifact = await synthesizeProof(episode.title, problem.statement, hypotheses[0]?.statement ?? "");
    const leanCheck = await checkLean(proofArtifact.lean, proofArtifact.theoremName);
    const formalizationId = id("formalization");
    await collections.formalizations.insertOne({ _id: formalizationId, episodeId, attemptId, system: "Lean", systemVersion: "4 + Mathlib", verified: leanCheck.verified, verificationLog: leanCheck.log.slice(-12000), theoremName: proofArtifact.theoremName, statement: proofArtifact.statement, leanSource: proofArtifact.lean, latexSource: proofArtifact.latex, checker: leanCheck.checker, axioms: leanCheck.axioms, createdAt: new Date(), updatedAt: new Date() });
    const lemmaId = id("lemma");
    await collections.lemmas.insertOne({ _id: lemmaId, name: proofArtifact.theoremName, statement: proofArtifact.statement, createdAt: new Date(), updatedAt: new Date() });
    await addGraphNode(episodeId, lemmaId, "LEMMA", "Bridge lemma", proofArtifact.theoremName, 75, 63, leanCheck.verified ? "verified" : "candidate");
    await addGraphEdge(episodeId, hypothesisIds[0] ?? problem._id, lemmaId, "DEPENDS_ON", "formalized as");
    await emit(episodeId, "research.formalization.completed", { verified: leanCheck.verified, checker: leanCheck.checker });

    const resultId = id("result");
    await collections.researchResults.insertOne({ _id: resultId, episodeId, hypothesisId: hypothesisIds[0], attemptId, title: leanCheck.verified ? "Verified supporting lemma" : "Formalization candidate", summary: leanCheck.verified ? "The strongest smaller claim compiled in the independent Lean checker." : "The worker produced a candidate artifact, but independent verification did not certify it.", status: leanCheck.verified ? "VERIFIED" : "CANDIDATE", evidence: { formalizationId, checker: leanCheck.checker }, createdAt: new Date(), updatedAt: new Date() });
    await addGraphNode(episodeId, resultId, "RESEARCH_RESULT", "Research result", leanCheck.verified ? "Lean verified" : "Candidate result", 45, 86, leanCheck.verified ? "verified" : "candidate");
    await addGraphEdge(episodeId, lemmaId, resultId, "PRODUCES", "supports");

    await collections.researchEpisodes.updateOne({ _id: episodeId }, { $set: { status: leanCheck.verified ? "VERIFIED" : "PROMISING", stage: "Research episode complete", progress: 100, summary: `${works.length} literature sources, ${hypotheses.length} competing hypotheses, and one formal artifact were recorded.`, completedAt: new Date(), updatedAt: new Date() } });
    await emit(episodeId, "research.job.completed", { verified: leanCheck.verified });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research worker failed";
    await collections.researchEpisodes.updateOne({ _id: episodeId }, { $set: { status: "ABANDONED", stage: "Research worker blocked", error: message, updatedAt: new Date() } });
    await emit(episodeId, "research.job.failed", { error: message });
    console.error(`Research episode ${episodeId} failed:`, error);
  }
}

async function main(): Promise<void> {
  await redis.ping();
  console.log("Research worker listening on triviality:research:jobs");
  while (true) {
    const item = await redis.brpop("triviality:research:jobs", 0);
    if (!item?.[1]) continue;
    const payload = JSON.parse(item[1]) as { episodeId?: string };
    if (payload.episodeId) await runEpisode(payload.episodeId);
  }
}

main().catch(async (error) => {
  console.error(error);
  await redis.quit();
  await (await getMongoClient()).close();
  process.exitCode = 1;
});
