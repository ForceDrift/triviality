"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconArrowUpRight } from "@tabler/icons-react";
import { DashboardSidebar } from "../dashboard-sidebar";
import { DashboardTopbar } from "../dashboard-topbar";
import { ResearchGraph } from "@/components/research-graph";
import { getResearchJobs, type ResearchJob } from "@/lib/research-store";

export default function ResearchGraphPage() {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);

  useEffect(() => {
    const refresh = () => {
      getResearchJobs().then(setJobs).catch(() => setJobs([]));
    };
    refresh();
    const interval = window.setInterval(refresh, 900);
    return () => window.clearInterval(interval);
  }, []);

  const graphJobs = jobs.filter((job) => job.nodes.length > 0);

  return <main className="flex min-h-screen bg-[#f5f5f5] text-[#111]"><DashboardSidebar /><div className="min-w-0 flex-1"><DashboardTopbar page="Research graph" /><section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-14 lg:py-14"><Link className="mb-10 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45 hover:text-black" href="/dashboard"><IconArrowLeft size={14} /> Overview</Link><div className="border-b border-black/10 pb-10"><p className="mb-5 text-[10px] font-medium uppercase tracking-[0.28em] text-black/45">Research graph</p><h1 className="text-5xl font-semibold tracking-[-0.07em] sm:text-7xl">The living map.</h1><p className="mt-5 max-w-xl text-sm leading-6 text-black/50">Every episode contributes problems, hypotheses, literature, lemmas, proofs, and results to the research memory.</p></div>{graphJobs.length === 0 ? <EmptyGraph /> : <div className="space-y-10 pt-10">{graphJobs.map((job) => <section key={job.id}><div className="mb-4 flex items-end justify-between gap-5"><div><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40">{job.area} · {job.id.slice(-8)}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{job.title}</h2></div><Link className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45 hover:text-black" href={`/dashboard/research/${job.id}`}>Open episode <IconArrowUpRight size={14} /></Link></div><ResearchGraph job={job} compact /></section>)}</div>}</section></div></main>;
}

function EmptyGraph() {
  return <div className="py-28 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-black/15 font-mono text-sm">∅</div><h2 className="mt-6 text-2xl font-semibold tracking-[-0.05em]">The graph is waiting.</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black/50">Create a research episode in Overview. Its area and research space will generate the first graph.</p><Link className="mt-7 inline-flex rounded-full bg-black px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white" href="/dashboard">Start an episode</Link></div>;
}
