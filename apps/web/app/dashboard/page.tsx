"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconArrowUpRight, IconChevronRight, IconPlus, IconSearch } from "@tabler/icons-react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { getResearchJobs, type ResearchJob, type ResearchProvider } from "@/lib/research-store";

const providers: Array<{ id: ResearchProvider; name: string; description: string }> = [
  { id: "openai", name: "OpenAI", description: "Hypotheses, synthesis, and formalization." },
  { id: "devin", name: "Devin", description: "Autonomous research agents and critique." },
  { id: "hawewi", name: "Hawewi", description: "A lightweight experimental research route." },
];

export default function DashboardPage() {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const refresh = () => getResearchJobs().then(setJobs).catch((reason: Error) => setError(reason.message));
    refresh();
    const interval = window.setInterval(refresh, 1500);
    return () => window.clearInterval(interval);
  }, []);

  const filteredJobs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return jobs;
    return jobs.filter((job) => `${job.title} ${job.statement} ${job.area} ${job.provider}`.toLowerCase().includes(normalized));
  }, [jobs, query]);

  return (
    <main className="flex min-h-screen bg-[#f5f5f5] text-[#111]">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">
        <DashboardTopbar page="Overview" />
        <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="flex flex-col justify-between gap-8 border-b border-black/10 pb-10 lg:flex-row lg:items-end">
            <div>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/75" type="button"><IconPlus size={15} /> Deploy research</button>
            </div>
            <label className="relative block w-full sm:w-72 lg:ml-auto"><IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35" size={16} /><input className="h-11 w-full rounded-xl border border-black/12 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-black/35 focus:border-black/40" placeholder="Search research jobs" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          </div>

          {error && <div className="mt-5 rounded-xl border border-red-900/15 bg-red-50 px-4 py-3 text-sm text-red-900">Research runtime unavailable: {error}. Start MongoDB, Redis, the research API, and the worker.</div>}

          {/*
          <section id="new-episode" className="mt-10 scroll-mt-8 overflow-hidden rounded-2xl border border-black/10 bg-[#f7f7f7]">
            <div className="flex flex-col justify-between gap-4 border-b border-black/10 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
              <div><p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-black/45">Research</p><h2 className="text-2xl font-semibold tracking-[-0.05em]">Deploy a research episode</h2></div>
              <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/45">local runtime</span>
            </div>

            <form className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_21rem]" onSubmit={submit}>
              <div className="grid gap-5 p-6 sm:p-8">
                <label className="grid gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/55">Research name<input required className="h-12 rounded-xl border border-black/12 bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none transition focus:border-black/45" placeholder="e.g. A compactness principle for finite graphs" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
                <label className="grid gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/55">Research problem<textarea required className="min-h-32 resize-y rounded-xl border border-black/12 bg-white px-4 py-3 text-sm font-normal normal-case leading-6 tracking-normal outline-none transition focus:border-black/45" placeholder="What should the research system investigate?" value={form.statement} onChange={(event) => setForm({ ...form, statement: event.target.value })} /></label>
                <div className="grid gap-5 sm:grid-cols-3">
                  <FieldSelect label="Area" value={form.area} onChange={(value) => setForm({ ...form, area: value })} options={["Algebra", "Analysis", "Combinatorics", "Geometry", "Logic", "Number theory", "Topology"]} />
                  <FieldSelect label="Search mode" value={form.mode} onChange={(value) => setForm({ ...form, mode: value })} options={["Diverse portfolio", "Proof first", "Counterexample hunt", "Cross-domain transfer"]} />
                  <label className="grid gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/55">Attempt budget<input className="h-12 rounded-xl border border-black/12 bg-white px-4 text-sm font-normal normal-case tracking-normal outline-none" min={1} max={30} type="number" value={form.budget} onChange={(event) => setForm({ ...form, budget: Number(event.target.value) })} /></label>
                </div>
                <button className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-black/75 disabled:cursor-wait disabled:opacity-50 sm:w-fit sm:px-7" disabled={creating} type="submit"><IconPlus size={16} />{creating ? "Deploying research" : "Deploy research"}</button>
              </div>

              <aside className="border-t border-black/10 bg-white p-6 lg:border-l lg:border-t-0 sm:p-8">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/45">Model provider</p>
                <label className="grid gap-2"><span className="sr-only">Choose model provider</span><select className="h-12 w-full appearance-none rounded-xl border border-black/12 bg-white px-4 text-sm outline-none" value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value as ResearchProvider })}>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select></label>
                <div className="mt-5 rounded-2xl border border-black/10 bg-[#fafafa] p-5"><ProviderMark provider={form.provider} /><p className="mt-5 text-lg font-semibold tracking-[-0.04em]">{providerFor(form.provider).name}</p><p className="mt-2 text-xs leading-5 text-black/50">{providerFor(form.provider).description}</p></div>
                <div className="mt-6 border-t border-black/10 pt-5"><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/35">Runtime stages</p><p className="mt-3 text-sm leading-6 text-black/55">Literature scan, competing hypotheses, formal artifact, and persistent research memory.</p></div>
              </aside>
            </form>
          </section>
          */}

          <section className="mt-14" id="jobs">
            <div className="mb-5 flex items-end justify-between gap-6"><div><p className="mb-3 text-[10px] font-medium uppercase tracking-[0.25em] text-black/45">Research jobs</p><h2 className="text-2xl font-semibold tracking-[-0.05em]">Your episodes</h2></div><Link className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45 hover:text-black" href="/dashboard/graph">Research graph <IconArrowUpRight size={14} /></Link></div>
            {filteredJobs.length === 0 ? <div className="rounded-lg border border-dashed border-black/15 px-6 py-14 text-center text-sm text-black/45">{jobs.length === 0 ? "No research jobs yet. Deploy one above." : "No research jobs match your search."}</div> : <div className="grid gap-3">{filteredJobs.map((job) => <EpisodeRow key={job.id} job={job} />)}</div>}
          </section>
        </section>
      </div>
    </main>
  );
}

function providerFor(provider: ResearchProvider) {
  return providers.find((item) => item.id === provider) ?? providers[0];
}

function ProviderMark({ provider }: { provider: ResearchProvider }) {
  const mark = provider === "openai" ? "✳" : provider === "devin" ? "D" : "H";
  return <span aria-label={`${providerFor(provider).name} provider`} className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold ${provider === "openai" ? "bg-black text-white" : "border border-black/15 bg-white text-black"}`}>{mark}</span>;
}

function EpisodeRow({ job }: { job: ResearchJob }) {
  return <Link className="block overflow-hidden rounded-sm border border-black/10 bg-white" href={`/dashboard/research/${job.id}`}><div className="grid grid-cols-[minmax(0,1fr)_7rem_6rem_1.5rem] gap-3 border-b border-black/10 bg-[#fafafa] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40 sm:grid-cols-[minmax(16rem,1fr)_12rem_10rem_2.5rem]"><span>Name</span><span>Provider</span><span>Status</span><span /></div><div className="grid gap-3 px-4 py-3.5 sm:grid-cols-[minmax(16rem,1fr)_12rem_10rem_2.5rem] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-semibold tracking-[-0.02em]">{job.title}</p><p className="mt-1 truncate text-[11px] text-black/45">{job.statement}</p></div><div className="flex items-center gap-2.5"><ProviderMark provider={job.provider} /><span className="text-xs">{providerFor(job.provider).name}</span></div><div><span className={`inline-flex rounded-md px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${job.status === "completed" ? "bg-black text-white" : job.status === "failed" ? "bg-red-50 text-red-900" : "bg-black/7 text-black/55"}`}>{job.status}</span><p className="mt-1.5 text-[10px] text-black/40">{job.status === "running" ? `${job.progress}% · ${job.stage}` : job.area}</p></div><IconChevronRight className="text-black/30" size={16} /></div></Link>;
}
