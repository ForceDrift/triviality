export type ResearchJobStatus = "running" | "completed" | "failed";
export type ResearchProvider = "openai" | "devin" | "huawei" | "baseten";

export type ResearchNodeType = "problem" | "hypothesis" | "paper" | "lemma" | "proof" | "result";

export interface ResearchNode {
  id: string;
  type: ResearchNodeType;
  label: string;
  detail: string;
  x: number;
  y: number;
  status: "active" | "verified" | "candidate";
}

export interface ResearchEdge {
  source: string;
  target: string;
  label: string;
}

export interface ResearchLiterature {
  id: string;
  title: string;
  authors: string;
  source: string;
  year: string;
  summary: string;
  relevance: string;
  url: string;
}

export interface ResearchHypothesis {
  id: string;
  title: string;
  statement: string;
  approach: string;
  status: "promising" | "candidate" | "disproved";
  score: number;
}

export interface ResearchAttempt {
  id: string;
  role: string;
  strategy: string;
  status: "completed" | "running" | "failed";
  result: string;
}

export interface ResearchProof {
  status: "verified" | "candidate";
  theoremName: string;
  statement: string;
  lean: string;
  latex: string;
  checker: string;
  axioms: string[];
}

export interface ResearchJob {
  id: string;
  title: string;
  statement: string;
  area: string;
  provider: ResearchProvider;
  mode: string;
  budget: number;
  status: ResearchJobStatus;
  stage: string;
  progress: number;
  createdAt: string;
  completedAt?: string;
  summary: string;
  error?: string;
  nodes: ResearchNode[];
  edges: ResearchEdge[];
  literature: ResearchLiterature[];
  hypotheses: ResearchHypothesis[];
  attempts: ResearchAttempt[];
  proof?: ResearchProof;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/research/jobs${path}`, { ...init, cache: "no-store", headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(body.error ?? `Research API returned ${response.status}`));
  return body as T;
}

export function getResearchJobs(): Promise<ResearchJob[]> {
  return request<ResearchJob[]>("");
}

export function getResearchJob(id: string): Promise<ResearchJob> {
  return request<ResearchJob>(`/${encodeURIComponent(id)}`);
}

export function createResearchJob(input: { title: string; statement: string; area: string; provider: ResearchProvider; mode: string; budget: number }): Promise<ResearchJob> {
  return request<ResearchJob>("", { method: "POST", body: JSON.stringify(input) });
}

export function getResearchStats(jobs: ResearchJob[]): { total: number; running: number; verified: number; literature: number } {
  return {
    total: jobs.length,
    running: jobs.filter((job) => job.status === "running").length,
    verified: jobs.filter((job) => job.proof?.status === "verified").length,
    literature: jobs.reduce((count, job) => count + job.literature.length, 0),
  };
}
