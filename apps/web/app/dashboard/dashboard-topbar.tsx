"use client";

import { IconCreditCard, IconUserCircle } from "@tabler/icons-react";

export function DashboardTopbar({ page }: { page: string }) {
  return (
    <nav className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-black/10 bg-white px-6 backdrop-blur sm:px-10 lg:px-14" aria-label="Dashboard navigation">
      <span className="text-sm font-semibold tracking-[-0.02em]">{page}</span>
      <div className="flex items-center gap-5">
        <button aria-label="Open account" className="text-black/45 transition hover:text-black" type="button"><IconUserCircle size={22} stroke={1.5} /></button>
        <button className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/55 transition hover:text-black" type="button"><IconCreditCard size={15} stroke={1.7} /> Manage credits</button>
      </div>
    </nav>
  );
}
