"use client";

import type { ResearchJob, ResearchNode, ResearchNodeType } from "@/lib/research-store";

const nodeStyles: Record<ResearchNodeType, { dot: string; badge: string }> = {
  problem: { dot: "bg-black", badge: "bg-black text-white" },
  hypothesis: { dot: "bg-white", badge: "bg-white text-black border border-black/15" },
  paper: { dot: "bg-[#d8d8d8]", badge: "bg-[#f2f2f2] text-black/65" },
  lemma: { dot: "bg-white ring-2 ring-black/60", badge: "bg-white text-black border border-black/25" },
  proof: { dot: "bg-black", badge: "bg-black text-white" },
  formalization: { dot: "bg-black", badge: "bg-black text-white" },
  result: { dot: "bg-white ring-2 ring-black/30", badge: "bg-white text-black/70 border border-black/15" },
};

function nodeAt(job: ResearchJob, id: string): ResearchNode | undefined {
  return job.nodes.find((node) => node.id === id);
}

export function ResearchGraph({ job, compact = false }: { job: ResearchJob; compact?: boolean }) {
  const markerId = `research-arrow-${job.id.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-black/10 bg-[#fafafa] ${compact ? "min-h-[360px]" : "min-h-[520px]"}`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="relative z-10 flex items-center justify-end border-b border-black/10 px-5 py-3 text-xs text-black/45">
        <span>{job.nodes.length} nodes · {job.edges.length} relations</span>
      </div>

      <div className="relative min-h-[460px]">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <marker id={markerId} markerHeight="5" markerWidth="5" orient="auto" refX="4" refY="2.5" viewBox="0 0 5 5">
              <path d="M0,0 L5,2.5 L0,5" fill="none" stroke="currentColor" strokeWidth="1" />
            </marker>
          </defs>
          {job.edges.map((edge) => {
            const source = nodeAt(job, edge.source);
            const target = nodeAt(job, edge.target);
            if (!source || !target) return null;
            const bend = Math.abs(source.x - target.x) > 30 ? 2 : 0;
            return (
              <path
                key={`${edge.source}-${edge.target}`}
                d={`M ${source.x} ${source.y} Q ${(source.x + target.x) / 2} ${((source.y + target.y) / 2) - bend} ${target.x} ${target.y}`}
                fill="none"
                markerEnd={`url(#${markerId})`}
                stroke="currentColor"
                strokeOpacity="0.22"
                strokeWidth="0.45"
              />
            );
          })}
        </svg>

        {job.nodes.map((node) => {
          const style = nodeStyles[node.type];
          return (
            <div
              key={node.id}
              className="absolute w-[8.4rem] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className={`rounded-xl border border-black/10 px-3 py-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.07)] ${style.badge}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                  <span className="truncate font-mono text-[9px] font-semibold uppercase tracking-[0.08em]">{node.label}</span>
                </div>
                <p className="mt-1 truncate text-[9px] opacity-55">{node.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
