"use client";

import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowUpRight, IconCheck, IconChevronDown, IconChevronRight, IconChevronUp, IconLayoutGrid, IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { createResearchJob, getResearchJobs, type ResearchJob, type ResearchProvider } from "@/lib/research-store";

const providers: Array<{ id: ResearchProvider; name: string; description: string; logo: string }> = [
  { id: "openai", name: "OpenAI", description: "Hypotheses, synthesis, and formalization.", logo: "https://models.dev/logos/openai.svg" },
  { id: "devin", name: "Devin", description: "Autonomous research agents and critique.", logo: "https://devin.ai/favicon.ico" },
  { id: "huawei", name: "Huawei", description: "Huawei model and infrastructure research route.", logo: "https://www.huawei.com/favicon.ico" },
];

type ResearchForm = {
  title: string;
  statement: string;
  area: string;
  provider: ResearchProvider;
  mode: string;
  budget: number;
};

const initialForm: ResearchForm = {
  title: "",
  statement: "",
  area: "Combinatorics",
  provider: "openai",
  mode: "Diverse portfolio",
  budget: 6,
};

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ResearchForm>(initialForm);
  const [providerQuery, setProviderQuery] = useState("");
  const [creating, setCreating] = useState(false);

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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.statement.trim()) return;

    setCreating(true);
    createResearchJob(form)
      .then((job) => router.push(`/dashboard/research/${job.id}`))
      .catch((reason: Error) => {
        setError(reason.message);
        setCreating(false);
      });
  };

  return (
    <main className="flex min-h-screen bg-[#f5f5f5] text-[#111]">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">
        <DashboardTopbar page="Overview" />
        <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="flex flex-col justify-between gap-8 border-b border-black/10 pb-10 lg:flex-row lg:items-end">
            <div>
              <HoverBorderGradient containerClassName="rounded-md" className="flex items-center gap-2 rounded-[inherit] bg-black px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white" duration={1.2} onClick={() => setModalOpen(true)}><IconPlus size={14} /> Deploy research</HoverBorderGradient>
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
        {modalOpen && <ResearchDeployModal form={form} setForm={setForm} providerQuery={providerQuery} setProviderQuery={setProviderQuery} creating={creating} onClose={() => setModalOpen(false)} onSubmit={submit} />}
      </div>
    </main>
  );
}

function ResearchDeployModal({
  form,
  setForm,
  providerQuery,
  setProviderQuery,
  creating,
  onClose,
  onSubmit,
}: {
  form: ResearchForm;
  setForm: Dispatch<SetStateAction<ResearchForm>>;
  providerQuery: string;
  setProviderQuery: (value: string) => void;
  creating: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const visibleProviders = providers.filter((provider) => `${provider.name} ${provider.description}`.toLowerCase().includes(providerQuery.trim().toLowerCase()));
  const selectedProvider = providerFor(form.provider);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-3 backdrop-blur-[2px] sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="deploy-research-title">
      <motion.form className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-2xl sm:max-h-[calc(100vh-2.5rem)]" initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} onSubmit={onSubmit}>
        <div className="flex items-start justify-between border-b border-black/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/45">Research</p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.05em]" id="deploy-research-title">Explore a research space</h2>
          </div>
          <button aria-label="Close deploy research dialog" className="rounded-md p-1.5 text-black/45 transition hover:bg-black/5 hover:text-black" onClick={onClose} type="button"><IconX size={18} /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <section className="border-b border-black/10 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-[-0.04em]">Workload</h3>
              <IconChevronUp size={19} />
            </div>

            <div className="mt-4 flex flex-col gap-2.5 lg:flex-row">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search model providers</span>
                <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/70" size={18} />
                <input className="h-11 w-full rounded-md border border-black/12 bg-white pl-10 pr-4 text-sm outline-none placeholder:text-black/35 focus:border-black/35" placeholder="Search model providers" value={providerQuery} onChange={(event) => setProviderQuery(event.target.value)} />
              </label>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-violet-200 px-4 text-sm font-medium transition hover:bg-violet-50" type="button"><IconLayoutGrid size={18} /> Explore all</button>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-violet-200 px-4 text-sm font-medium transition hover:bg-violet-50" type="button"><IconPlus size={18} /> Create new</button>
            </div>

            <div className="mt-4 grid gap-2">
              {visibleProviders.map((provider, index) => {
                const selected = provider.id === form.provider;
                return <motion.button className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left transition ${selected ? "border-black ring-1 ring-black" : "border-black/12 hover:border-black/35"}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: index * 0.06 }} key={provider.id} onClick={() => setForm((current) => ({ ...current, provider: provider.id }))} type="button">
                  <span className="flex min-w-0 items-center gap-3">
                    <ProviderMark provider={provider.id} />
                    <span className="min-w-0"><span className="block text-base font-medium tracking-[-0.03em]">{provider.name}</span><span className="mt-0.5 block truncate text-xs text-black/55">{provider.description}</span></span>
                  </span>
                  {selected && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white"><IconCheck size={15} /></span>}
                </motion.button>;
              })}
              {visibleProviders.length === 0 && <p className="rounded-md border border-dashed border-black/15 px-5 py-6 text-center text-sm text-black/50">No model providers match your search.</p>}
            </div>
          </section>

          <section className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium">Research space name<input required className="h-11 rounded-md border border-black/12 bg-white px-3.5 text-sm font-normal outline-none transition focus:border-black/45" placeholder="e.g. Compactness methods in finite graph theory" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></label>
              <label className="grid gap-1.5 text-sm font-medium">Research space<textarea required className="min-h-24 resize-y rounded-md border border-black/12 bg-white px-3.5 py-2.5 text-sm font-normal leading-6 outline-none transition focus:border-black/45" placeholder="Describe the mathematical space agents should explore and connect." value={form.statement} onChange={(event) => setForm((current) => ({ ...current, statement: event.target.value }))} /><span className="text-xs font-normal leading-5 text-black/45">Agents will scan the space, generate competing ideas, and test promising directions.</span></label>
            </div>
            <div className="grid content-start gap-4">
              <FieldSelect label="Model provider" value={form.provider} onChange={(value) => setForm((current) => ({ ...current, provider: value as ResearchProvider }))} options={providers.map((provider) => provider.id)} displayOptions={providers.map((provider) => ({ value: provider.id, label: provider.name }))} />
              <FieldSelect label="Area" value={form.area} onChange={(value) => setForm((current) => ({ ...current, area: value }))} options={["Algebra", "Analysis", "Combinatorics", "Geometry", "Logic", "Number theory", "Topology"]} />
              <FieldSelect label="Search mode" value={form.mode} onChange={(value) => setForm((current) => ({ ...current, mode: value }))} options={["Diverse portfolio", "Proof first", "Counterexample hunt", "Cross-domain transfer"]} />
              <label className="grid gap-1.5 text-sm font-medium">Attempt budget<input className="h-11 rounded-md border border-black/12 bg-white px-3.5 text-sm font-normal outline-none" min={1} max={30} type="number" value={form.budget} onChange={(event) => setForm((current) => ({ ...current, budget: Number(event.target.value) }))} /></label>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-black/10 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-black/45">{selectedProvider.name} will explore the space and generate ideas.</p>
          <div className="flex justify-end gap-3">
            <button className="h-10 rounded-md border border-black/12 px-4 text-sm font-medium transition hover:bg-black/5" onClick={onClose} type="button">Cancel</button>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white transition hover:bg-black/75 disabled:cursor-wait disabled:opacity-50" disabled={creating} type="submit"><IconPlus size={16} />{creating ? "Starting exploration" : "Start exploration"}</button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}

function FieldSelect({ label, value, onChange, options, displayOptions }: { label: string; value: string; onChange: (value: string) => void; options: string[]; displayOptions?: Array<{ value: string; label: string }> }) {
  const values = displayOptions ?? options.map((option) => ({ value: option, label: option }));
  return <label className="grid gap-1.5 text-sm font-medium">{label}<span className="relative"><select className="h-11 w-full appearance-none rounded-md border border-black/12 bg-white px-3.5 pr-9 text-sm font-normal outline-none focus:border-black/45" value={value} onChange={(event) => onChange(event.target.value)}>{values.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><IconChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/50" size={16} /></span></label>;
}

function providerFor(provider: ResearchProvider) {
  return providers.find((item) => item.id === provider) ?? providers[0];
}

function ProviderMark({ provider }: { provider: ResearchProvider }) {
  const providerInfo = providerFor(provider);
  return (
    <span aria-label={`${providerInfo.name} provider`} className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/10 bg-white">
      {/* External provider marks are intentional: these are brand assets, not app content. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="h-6 w-6 object-contain" src={providerInfo.logo} onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling?.classList.remove("hidden"); }} />
      <span className="hidden text-sm font-semibold text-black">{providerInfo.name.slice(0, 1)}</span>
    </span>
  );
}

function EpisodeRow({ job }: { job: ResearchJob }) {
  return <Link className="block overflow-hidden rounded-sm border border-black/10 bg-white" href={`/dashboard/research/${job.id}`}><div className="grid grid-cols-[minmax(0,1fr)_7rem_6rem_1.5rem] gap-3 border-b border-black/10 bg-[#fafafa] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40 sm:grid-cols-[minmax(16rem,1fr)_12rem_10rem_2.5rem]"><span>Name</span><span>Provider</span><span>Status</span><span /></div><div className="grid gap-3 px-4 py-3.5 sm:grid-cols-[minmax(16rem,1fr)_12rem_10rem_2.5rem] sm:items-center"><div className="min-w-0"><p className="truncate text-sm font-semibold tracking-[-0.02em]">{job.title}</p><p className="mt-1 truncate text-[11px] text-black/45">{job.statement}</p></div><div className="flex items-center gap-2.5"><ProviderMark provider={job.provider} /><span className="text-xs">{providerFor(job.provider).name}</span></div><div><span className={`inline-flex rounded-md px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${job.status === "completed" ? "bg-black text-white" : job.status === "failed" ? "bg-red-50 text-red-900" : "bg-black/7 text-black/55"}`}>{job.status}</span><p className="mt-1.5 text-[10px] text-black/40">{job.status === "running" ? `${job.progress}% · ${job.stage}` : job.area}</p></div><IconChevronRight className="text-black/30" size={16} /></div></Link>;
}
