"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IconArrowLeft, IconCheck, IconCode, IconFileDescription, IconLoader2 } from "@tabler/icons-react";
import { DashboardSidebar } from "../../dashboard-sidebar";
import { DashboardTopbar } from "../../dashboard-topbar";
import { ResearchGraph } from "@/components/research-graph";
import { ResearchLiteratureTabs } from "@/components/research-literature-tabs";
import { getResearchJob, modelCatalog, type ResearchJob } from "@/lib/research-store";

type ArtifactTab = "literature" | "lean" | "latex";

export default function ResearchEpisodePage() {
  const params = useParams<{ jobId: string }>();
  const [job, setJob] = useState<ResearchJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ArtifactTab>("literature");

  useEffect(() => {
    const refresh = () => getResearchJob(params.jobId).then(setJob).catch((reason: Error) => setError(reason.message));
    void refresh();
    const interval = window.setInterval(refresh, 650);
    return () => window.clearInterval(interval);
  }, [params.jobId]);

  if (!job) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-sm text-black/55">{error ?? "Loading research…"}</main>;
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f5] text-[#111] md:flex-row">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">
        <DashboardTopbar page="Research" />
        <section className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-14">
          <Link className="mb-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45 hover:text-black" href="/dashboard"><IconArrowLeft size={14} /> Overview</Link>

          <div className="flex flex-col justify-between gap-8 border-b border-black/10 pb-10 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-black/45"><span className="rounded-full bg-black px-2.5 py-1 text-white">{job.status}</span></div>
              <h1 className="max-w-4xl text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{job.title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-black/55">{job.statement}</p>
            </div>
            <div className="w-full max-w-xs shrink-0"><div className="mb-2 flex justify-between text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40"><span>{job.stage}</span><span>{job.progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-black/8"><div className="h-full rounded-full bg-black transition-all duration-500" style={{ width: `${job.progress}%` }} /></div></div>
          </div>

          {job.roleModels && <section className="mt-6 rounded-xl border border-black/10 bg-white p-5"><h2 className="text-sm font-semibold">Models</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{modelCatalog.roles.map((role) => <div key={role.id}><dt className="text-xs text-black/45">{role.label}</dt><dd className="mt-1 text-sm">{modelCatalog.models.find((model) => model.id === job.roleModels?.[role.id])?.label ?? job.roleModels?.[role.id]}</dd></div>)}</dl></section>}
          {job.status === "running" ? <RunningEpisode /> : job.status === "failed" ? <FailedEpisode job={job} /> : <CompletedEpisode job={job} tab={tab} setTab={setTab} />}
          {(job.orchestrator === "workswarm" || job.provider === "huawei") && <TeamTrace job={job} />}
        </section>
      </div>
    </main>
  );
}

function TeamTrace({ job }: { job: ResearchJob }) {
  const decisions = (job.events ?? []).flatMap((event) => {
    const progress = event.payload.event as { kind?: string; message?: string } | undefined;
    if (event.type !== "research.swarm.event" || progress?.kind !== "log" || !progress.message?.startsWith("TRIVIALITY_EVENT ")) return [];
    try { return [{ id: event.id, ...JSON.parse(progress.message.slice(17)) } as { id: string; kind: string; feedback?: string; summary?: string; reason?: string }]; }
    catch { return []; }
  }).filter((event) => ["replan", "repair", "reassignment", "delivery"].includes(event.kind));
  return <section className="mt-10 rounded-2xl border border-black/10 bg-white p-6"><SectionLabel>Team activity</SectionLabel><div className="mt-5 grid gap-3 sm:grid-cols-2">{job.attempts.map((attempt) => <article key={attempt.id} className="rounded-xl border border-black/10 p-4"><div className="flex justify-between gap-3 text-sm"><strong>{attempt.role}</strong><span className="text-black/50">{attempt.status}</span></div><p className="mt-2 text-xs text-black/45">{attempt.strategy}</p><details className="mt-3 text-xs"><summary className="cursor-pointer">Details</summary><pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-black/60">{attempt.result}</pre></details></article>)}</div>{decisions.map((event) => <p key={event.id} className="mt-3 border-l-2 border-black/30 pl-3 text-xs leading-6 text-black/65"><strong>{event.kind}: </strong>{event.feedback ?? event.summary ?? event.reason}</p>)}</section>;
}

function RunningEpisode() {
  return <div role="status" className="flex items-center gap-3 py-12 text-sm text-black/55"><IconLoader2 className="animate-spin" size={20} />Research in progress…</div>;
}

function FailedEpisode({ job }: { job: ResearchJob }) {
  return <div className="mx-auto max-w-2xl py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-900/20 text-red-900">!</div><p className="mt-6 text-2xl font-semibold tracking-[-0.05em]">Research failed.</p><div className="mt-8 rounded-xl border border-red-900/15 bg-red-50 p-5 text-left text-sm leading-6 text-red-950">{job.error ?? job.stage}</div><Link className="mt-8 inline-flex rounded-full bg-black px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white" href="/dashboard">Return to overview</Link></div>;
}

function CompletedEpisode({ job, tab, setTab }: { job: ResearchJob; tab: ArtifactTab; setTab: (tab: ArtifactTab) => void }) {
  return <div className="space-y-14 pt-10">
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.45fr)] lg:items-start">
      <ResearchGraph job={job} />
      <div className="rounded-2xl border border-black/10 p-6"><p className="mb-4 text-[10px] font-medium uppercase tracking-[0.24em] text-black/45">Result</p><p className="text-sm leading-7 text-black/65">{job.summary}</p><div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-black/10 bg-black/10"><Metric label="hypotheses" value={String(job.hypotheses.length)} /><Metric label="attempts" value={String(job.attempts.length)} /><Metric label="literature" value={String(job.literature.length)} /><Metric label="proofs" value={job.proof?.status === "verified" ? "1" : "0"} /></div></div>
    </div>

    <section><SectionLabel>Hypotheses</SectionLabel><div className="grid gap-3 md:grid-cols-2">{job.hypotheses.map((hypothesis) => <div key={hypothesis.id} className="rounded-2xl border border-black/10 p-6"><div className="flex items-center justify-between gap-4"><p className="text-lg font-semibold tracking-[-0.04em]">{hypothesis.title}</p>{hypothesis.score !== undefined && <span className="font-mono text-xs text-black/45">{Math.round(hypothesis.score * 100)}%</span>}</div><p className="mt-3 text-sm leading-6 text-black/55">{hypothesis.statement}</p><div className="mt-5 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.16em] text-black/40"><span>{hypothesis.approach}</span><span>{hypothesis.status}</span></div></div>)}</div></section>

    <section><div className="mb-6 flex flex-col justify-between gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end"><h2 className="text-xl font-semibold tracking-[-0.04em]">Literature and proofs</h2><div className="flex gap-1 rounded-full border border-black/10 p-1">{(["literature", "lean", "latex"] as ArtifactTab[]).map((item) => <button key={item} className={`rounded-full px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] transition ${tab === item ? "bg-black text-white" : "text-black/45 hover:text-black"}`} onClick={() => setTab(item)}>{item === "lean" ? "Lean 4" : item}</button>)}</div></div>{tab === "literature" ? <ResearchLiteratureTabs jobId={job.id} papers={job.literature} /> : <ProofArtifact job={job} tab={tab} />}</section>

    <section><SectionLabel>Attempts</SectionLabel><div className="mt-4 overflow-hidden rounded-2xl border border-black/10">{job.attempts.map((attempt, index) => <div key={attempt.id} className="grid gap-2 border-b border-black/10 p-5 last:border-b-0 sm:grid-cols-[1.1fr_1fr_1.5fr] sm:items-center"><div className="flex items-center gap-3"><span className="font-mono text-[10px] text-black/35">0{index + 1}</span><span className="text-sm font-semibold">{attempt.role}</span></div><span className="text-xs text-black/45">{attempt.strategy}</span><span className="flex items-center gap-2 text-xs text-black/55"><IconCheck size={14} /> {attempt.result}</span></div>)}</div></section>
  </div>;
}

function ProofArtifact({ job, tab }: { job: ResearchJob; tab: "lean" | "latex" }) {
  if (!job.proof) return <div className="rounded-2xl border border-dashed border-black/15 p-8 text-sm text-black/45">No proof available.</div>;
  const isLean = tab === "lean";
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]"><div className="overflow-hidden rounded-2xl border border-black/10 bg-[#101010] text-white"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-[9px] uppercase tracking-[0.18em] text-white/45"><span className="flex items-center gap-2">{isLean ? <IconCode size={14} /> : <IconFileDescription size={14} />}{isLean ? "proof.lean" : "result.tex"}</span><span>{isLean ? "Lean 4" : "LaTeX"}</span></div><pre className="overflow-x-auto p-6 text-sm leading-7 text-white/80"><code>{isLean ? job.proof.lean : job.proof.latex}</code></pre></div><div className="rounded-2xl border border-black/10 p-6"><div className="flex items-center gap-2 text-sm font-semibold"><IconCheck size={16} /> {job.proof.status === "verified" ? "Lean verified" : "Candidate"}</div><p className="mt-5 text-xs leading-6 text-black/55">{job.proof.checker}</p><p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/35">Axioms</p><ul className="mt-3 space-y-2 text-xs text-black/55">{job.proof.axioms.map((axiom) => <li key={axiom} className="border-b border-black/8 pb-2">{axiom}</li>)}</ul></div></div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-black/45">{children}</p>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="bg-white p-4"><p className="text-[9px] uppercase tracking-[0.14em] text-black/40">{label}</p><p className="mt-2 text-xl font-semibold tracking-[-0.04em]">{value}</p></div>;
}
