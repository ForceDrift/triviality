import { DashboardSidebar } from "./dashboard-sidebar";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen bg-white text-[#111]">
      <DashboardSidebar />

      <div className="min-w-0 flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
          <div className="flex flex-col justify-between gap-8 border-b border-black/10 pb-12 md:flex-row md:items-end">
            <div>
              <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.28em] text-black/45">
                Overview
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
            <DashboardCard label="Active projects" value="01" />
            <DashboardCard label="Open hypotheses" value="04" />
            <DashboardCard label="Verified results" value="00" />
          </div>

          <section className="mt-16 overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col justify-between gap-4 border-b border-black/10 bg-[#fafafa] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
              <div>
                <p className="text-sm font-semibold">Research environments</p>
                <p className="mt-1 text-xs text-black/45">
                  Run and monitor your active research episodes.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex w-fit items-center gap-2 rounded-md bg-[#5b32b5] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#48268f]"
              >
                <span className="text-base leading-none">+</span>
                Deploy research
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-black/10 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-black/40">
                  <span>Name</span>
                  <span>Utilization</span>
                  <span>Memory</span>
                  <span>Status</span>
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-6 py-6 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <p className="font-medium">compactness_explorer</p>
                      <p className="mt-1 font-mono text-[10px] text-black/40">
                        episode_01JXYZ
                      </p>
                    </div>
                  </div>
                  <Metric value="12%" label="search" />
                  <Metric value="08%" label="memory" />
                  <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                    Running
                  </span>
                </div>
              </div>
            </div>
          </section>

          <p className="mt-5 text-xs text-black/40">
            Dummy environment for the protected workspace preview.
          </p>
        </section>
      </div>
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

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono text-sm font-medium">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/35">
        {label}
      </p>
    </div>
  );
}
