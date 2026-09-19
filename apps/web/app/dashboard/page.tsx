import Link from "next/link";
import { TrivialityLogo } from "@/components/triviality-logo";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-white text-[#111]">
      <nav className="flex items-center justify-between border-b border-black/10 px-6 py-6 sm:px-10 lg:px-14">
        <TrivialityLogo />

        <Link
          href="/"
          className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/55 transition-colors hover:text-black"
        >
          Log out
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="flex flex-col justify-between gap-8 border-b border-black/10 pb-12 md:flex-row md:items-end">
          <div>
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.28em] text-black/45">
              Demo workspace
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold tracking-[-0.07em] sm:text-7xl">
              Your research space.
            </h1>
          </div>
          <p className="max-w-xs text-sm leading-6 text-black/55">
            This is a placeholder protected page. Real sessions and research
            data will connect here later.
          </p>
        </div>

        <div className="grid gap-px bg-black/10 sm:grid-cols-3">
          <DashboardCard label="Active projects" value="00" />
          <DashboardCard label="Open hypotheses" value="00" />
          <DashboardCard label="Verified results" value="00" />
        </div>

        <div className="mt-16 flex min-h-72 flex-col items-center justify-center border border-dashed border-black/20 px-6 text-center">
          <span className="mb-4 text-2xl">∅</span>
          <h2 className="text-lg font-medium tracking-tight">Nothing here yet</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-black/50">
            Start a research episode to begin mapping the space between ideas.
          </p>
          <button
            type="button"
            className="mt-7 rounded-full bg-black px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/75"
          >
            New research episode
          </button>
        </div>
      </section>
    </main>
  );
}

function DashboardCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-7 sm:p-8">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/45">
        {label}
      </p>
      <p className="mt-8 text-4xl font-semibold tracking-[-0.06em]">{value}</p>
    </div>
  );
}
