import { getCollections, getDatabase } from "./client.js";

export async function ensureIndexes(): Promise<void> {
  const collections = await getCollections();
  await Promise.all([
    collections.papers.createIndex({ externalId: 1 }, { unique: true }),
    collections.sources.createIndex({ provider: 1, externalId: 1 }, { unique: true }),
    collections.paperSources.createIndex({ paperId: 1, sourceId: 1 }, { unique: true }),
    collections.paperEmbeddings.createIndex({ paperId: 1, model: 1 }, { unique: true }),
    collections.paperNodes.createIndex({ "source.paper_id": 1, type: 1 }),
    collections.graphNodes.createIndex({ entityType: 1, entityId: 1 }, { unique: true }),
    collections.graphRelationships.createIndex({ fromNodeId: 1, toNodeId: 1, type: 1 }, { unique: true }),
    collections.papers.createIndex({ citedByCount: -1 }),
  ]);

  try {
    const db = await getDatabase();
    await db.collection("paper_embeddings").createSearchIndex({
      name: "paper_embedding_vector",
      type: "vectorSearch",
      definition: { fields: [{ type: "vector", path: "embedding", numDimensions: 1536, similarity: "cosine" }] },
    } as never);
    await db.collection("paper_nodes").createSearchIndex({
      name: "paper_node_embedding_vector",
      type: "vectorSearch",
      definition: {
        fields: [
          { type: "vector", path: "embeddings.semantic", numDimensions: 1536, similarity: "cosine" },
          { type: "vector", path: "embeddings.structural", numDimensions: 1536, similarity: "cosine" },
          { type: "vector", path: "embeddings.proof", numDimensions: 1536, similarity: "cosine" },
          { type: "vector", path: "embeddings.technique", numDimensions: 1536, similarity: "cosine" },
          { type: "vector", path: "embeddings.domain", numDimensions: 1536, similarity: "cosine" },
        ],
      },
    } as never);
  } catch (error) {
    console.warn("Atlas Vector Search index was not created; create it in Atlas or use a local MongoDB instance without search indexes.", error instanceof Error ? error.message : error);
  }
}

if (process.argv[1]?.endsWith("ensure-indexes.ts")) {
  await ensureIndexes();
  console.log("MongoDB indexes ensured");
}
