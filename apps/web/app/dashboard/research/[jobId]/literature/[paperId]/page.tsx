"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LiteratureReader } from "@/components/literature-reader";
import type { LiteraturePaper } from "@/lib/literature";
import { getResearchJob, type ResearchJob } from "@/lib/research-store";

export default function ResearchLiteraturePage() {
  const params = useParams<{ jobId: string; paperId: string }>();
  const [job, setJob] = useState<ResearchJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getResearchJob(params.jobId).then(setJob).catch((reason: Error) => setError(reason.message));
  }, [params.jobId]);

  if (!job) {
    return <main className="flex min-h-screen items-center justify-center bg-white text-sm text-black/55">{error ?? "Loading paper…"}</main>;
  }

  const paper = job.literature.find((item) => item.id === decodeURIComponent(params.paperId));

  if (!paper) {
    return <main className="flex min-h-screen items-center justify-center bg-white text-sm text-black/55">This paper is not attached to the episode.</main>;
  }

  const blogPaper: LiteraturePaper = {
    id: paper.id,
    href: `/dashboard/research/${encodeURIComponent(job.id)}`,
    date: paper.year,
    category: `${job.area} · ${paper.discovery === "expanded" ? "Expanded graph" : "Seed literature"}`,
    title: paper.title,
    subtitle: paper.summary,
    authors: paper.authors,
    source: paper.source,
    sections: [
      {
        id: "abstract",
        title: "Abstract",
        markdown: paper.summary,
      },
      {
        id: "research-connection",
        title: "Research connection",
        markdown: `${paper.relevance}\n\nThis paper was selected for the research space **${job.title}** in **${job.area}**.`,
      },
      {
        id: "episode-role",
        title: "Role in this episode",
        markdown: `This is **${paper.discovery === "expanded" ? "expanded graph" : "seed literature"}**. Its claims and techniques are attached to the episode graph so future hypotheses can use this paper as evidence.\n\n[Open the original source paper](${paper.url})`,
      },
    ],
  };

  return <LiteratureReader paper={blogPaper} />;
}
