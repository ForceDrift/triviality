"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconArrowUpRight, IconBook2 } from "@tabler/icons-react";
import { DashboardSidebar } from "../dashboard-sidebar";
import { DashboardTopbar } from "../dashboard-topbar";
import { getResearchJobs, type ResearchJob, type ResearchLiterature } from "@/lib/research-store";

export default function LiteraturePage() {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  useEffect(() => {
    const refresh = () => getResearchJobs().then((next) => setJobs(next.filter((job) => job.status === "completed"))).catch(() => setJobs([]));
    refresh();
    const interval = window.setInterval(refresh, 1500);
    return () => window.clearInterval(interval);
  }, []);
  const notes = useMemo(() => jobs.flatMap((job) => job.literature.map((paper) => ({ ...paper, job }))), [jobs]);

  return <main className="flex min-h-screen bg-[#f5f5f5] text-[#111]"><DashboardSidebar /><div className="min-w-0 flex-1"><DashboardTopbar page="Literature" /><section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-14 lg:py-14"><Link className="mb-10 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45 hover:text-black" href="/dashboard"><IconArrowLeft size={14} /> Overview</Link><div className="border-b border-black/10 pb-10"><p className="mb-5 text-[10px] font-medium uppercase tracking-[0.28em] text-black/45">Literature</p><h1 className="text-5xl font-semibold tracking-[-0.07em] sm:text-7xl">What the system found.</h1><p className="mt-5 max-w-xl text-sm leading-6 text-black/50">Generated reading notes stay attached to the episode that produced them, with their role in the research direction made explicit.</p></div>{notes.length === 0 ? <EmptyLiterature /> : <div className="grid gap-4 pt-10 md:grid-cols-2">{notes.map(({ job, ...paper }) => <LiteratureCard key={`${job.id}-${paper.id}`} job={job} paper={paper} />)}</div>}</section></div></main>;
}

function LiteratureCard({ job, paper }: { job: ResearchJob; paper: ResearchLiterature }) {
  return <article className="rounded-2xl border border-black/10 p-6 transition hover:border-black/30"><div className="flex items-center justify-between gap-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/40"><span className="flex items-center gap-2"><IconBook2 size={14} /> {paper.source}</span><span>{paper.year}</span></div><h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">{paper.title}</h2><p className="mt-2 text-xs text-black/45">{paper.authors}</p><p className="mt-5 text-sm leading-7 text-black/60">{paper.summary}</p><p className="mt-5 border-t border-black/10 pt-4 text-xs leading-5 text-black/50"><span className="font-semibold text-black/70">Research connection. </span>{paper.relevance}</p><div className="mt-6 flex flex-wrap items-center gap-5"><Link className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45 hover:text-black" href={`/dashboard/research/${job.id}`}>Open episode <IconArrowUpRight size={14} /></Link><Link className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45 hover:text-black" href="/literature/compactness-in-finite-graphs">Read paper <IconArrowUpRight size={14} /></Link></div></article>;
}

function EmptyLiterature() {
  return <div className="py-28 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-black/15"><IconBook2 size={20} /></div><h2 className="mt-6 text-2xl font-semibold tracking-[-0.05em]">No literature yet.</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black/50">Complete a research episode and its generated reading notes will collect here.</p><Link className="mt-7 inline-flex rounded-full bg-black px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white" href="/dashboard#new-episode">Start research</Link></div>;
}
