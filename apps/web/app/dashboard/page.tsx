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
