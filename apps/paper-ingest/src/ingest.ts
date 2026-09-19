import { randomUUID } from "node:crypto";
import { getCollections, type PaperDocument } from "@triviality/database";
import { config } from "./config.js";
import { OpenAIEmbeddingProvider } from "./embedding.js";
import { JobState } from "./job-state.js";
import { abstractFromInvertedIndex, fetchTopMathPapers, paperSourceUrl } from "./openalex.js";
import { storeRawMetadata } from "./storage.js";

const embeddingProvider = new OpenAIEmbeddingProvider();

export async function ingestTopMathPapers(): Promise<{ runId: string; discovered: number; embedded: number }> {
  const runId = randomUUID();
  const state = new JobState();
  await state.start(runId);
  let embedded = 0;

  try {
    const works = await fetchTopMathPapers();
    const collections = await getCollections();
    for (const work of works) {
      const externalId = work.id;
      const title = work.title?.trim() || "Untitled mathematical work";
      const abstract = abstractFromInvertedIndex(work.abstract_inverted_index);
      const landingUrl = paperSourceUrl(work);
      const rawArtifact = await storeRawMetadata(externalId, work);

      const sourceId = (await collections.sources.findOne({ provider: "OPENALEX", externalId }))?._id ?? randomUUID();
      await collections.sources.updateOne({ provider: "OPENALEX", externalId }, { $set: { canonicalUrl: landingUrl, metadata: work, updatedAt: new Date() }, $setOnInsert: { _id: sourceId, createdAt: new Date() } }, { upsert: true });

      const paperId = (await collections.papers.findOne({ externalId }))?._id ?? randomUUID();
      const paper: PaperDocument = { _id: paperId, createdAt: new Date(), updatedAt: new Date(), externalId, title, abstract: abstract ?? undefined, doi: work.doi ?? undefined, authors: work.authorships?.map((item) => item.author?.display_name).filter((value): value is string => Boolean(value)), subjects: (work.topics ?? []).map((topic) => topic.display_name).filter((value): value is string => Boolean(value)), publishedAt: work.publication_date ? new Date(work.publication_date) : undefined, citedByCount: work.cited_by_count ?? 0, landingUrl, openAccessUrl: work.open_access?.oa_url ?? work.primary_location?.pdf_url ?? undefined, rawMetadata: work };
      const { _id: _paperId, createdAt: _createdAt, ...paperFields } = paper;
      await collections.papers.updateOne({ externalId }, { $set: { ...paperFields, updatedAt: new Date() }, $setOnInsert: { _id: paperId, createdAt: paper.createdAt } }, { upsert: true });

      await collections.paperSources.updateOne({ paperId, sourceId }, { $set: { retrievedAt: new Date() }, $setOnInsert: { _id: randomUUID(), paperId, sourceId, createdAt: new Date() } }, { upsert: true });
      await collections.objectArtifacts.updateOne({ storageKey: rawArtifact.key }, { $set: { checksum: rawArtifact.checksum, byteSize: rawArtifact.bytes, updatedAt: new Date() }, $setOnInsert: { _id: randomUUID(), bucket: rawArtifact.bucket, storageKey: rawArtifact.key, kind: "RAW_METADATA", mimeType: "application/json", paperId, createdAt: new Date() } }, { upsert: true });
      await collections.graphNodes.updateOne({ entityType: "PAPER", entityId: paperId }, { $set: { label: title, metadata: { externalId, source: "openalex" }, updatedAt: new Date() }, $setOnInsert: { _id: randomUUID(), entityType: "PAPER", entityId: paperId, createdAt: new Date() } }, { upsert: true });

      const vector = await embeddingProvider.embed(`${title}\n${abstract ?? ""}`);
      if (vector) {
        await collections.paperEmbeddings.updateOne({ paperId, model: embeddingProvider.model }, { $set: { dimensions: vector.length, embedding: vector, updatedAt: new Date() }, $setOnInsert: { _id: randomUUID(), paperId, model: embeddingProvider.model, createdAt: new Date() } }, { upsert: true });
        embedded += 1;
      }
    }
    await state.complete(runId, { discovered: works.length, embedded });
    return { runId, discovered: works.length, embedded };
  } catch (error) {
    await state.fail(runId, error);
    throw error;
  }
}

export function startScheduler(): NodeJS.Timeout {
  const interval = config.intervalMinutes * 60 * 1000;
  return setInterval(() => void ingestTopMathPapers().catch((error) => console.error("paper ingestion failed", error)), interval);
}
