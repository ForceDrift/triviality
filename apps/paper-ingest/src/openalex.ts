import { config } from "./config.js";
import type { OpenAlexResponse, OpenAlexWork } from "./types.js";

export async function fetchTopMathPapers(): Promise<OpenAlexWork[]> {
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("filter", config.openAlexFilter);
  url.searchParams.set("sort", "cited_by_count:desc");
  url.searchParams.set("per-page", String(config.openAlexPerPage));
  url.searchParams.set("mailto", config.openAlexEmail ?? "");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenAlex request failed: ${response.status} ${response.statusText}`);
  }
  const payload = (await response.json()) as OpenAlexResponse;
  return payload.results;
}

export function abstractFromInvertedIndex(index: OpenAlexWork["abstract_inverted_index"]): string | null {
  if (!index) return null;
  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) words[position] = word;
  }
  return words.filter(Boolean).join(" ") || null;
}

export function paperSourceUrl(work: OpenAlexWork): string {
  return work.primary_location?.landing_page_url ?? `https://openalex.org/${work.id.split("/").pop()}`;
}
