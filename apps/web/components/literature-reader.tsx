"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { IconArrowUpRight, IconBook2, IconCopy, IconCheck } from "@tabler/icons-react";
import { TrivialityLogo } from "@/components/triviality-logo";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import type { LiteraturePaper } from "@/lib/literature";

export function LiteratureReader({ paper }: { paper: LiteraturePaper }) {
  const [activeSection, setActiveSection] = useState(paper.sections[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

  const sectionIds = useMemo(() => paper.sections.map((section) => section.id), [paper.sections]);

  useEffect(() => {
    const headings = sectionIds
      .map((id) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-12% 0px -72% 0px", threshold: [0, 1] },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [sectionIds]);

  const copyPage = async () => {
    const text = [paper.title, paper.subtitle, ...paper.sections.map((section) => `${section.title}\n${section.markdown}`)].join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="min-h-screen bg-white text-[#171717]">
      <ReaderNav />

      <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-12 sm:px-10 lg:px-16 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16 xl:grid-cols-[220px_minmax(0,1fr)_220px] xl:gap-16">
          <BlogSidebar paper={paper} />
          <article className="min-w-0">
            <header className="mx-auto max-w-[920px] text-center">
              <div className="flex items-center justify-center gap-3 text-sm font-medium text-black/60 sm:text-base">
                <time dateTime="2026-09-19">{paper.date}</time>
                <span className="text-black/20">·</span>
                <span>{paper.category}</span>
              </div>
              <h1 className="mt-7 text-4xl font-semibold leading-[1.04] tracking-[-0.06em] sm:text-6xl lg:text-[72px]">{paper.title}</h1>
              <div className="mx-auto mt-5 max-w-3xl text-xs leading-5 text-black/50 sm:text-sm sm:leading-6"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: ({ children }) => <p className="m-0">{children}</p> }}>{paper.subtitle}</ReactMarkdown></div>
              <p className="mt-5 text-xs text-black/55">Author: <span className="text-black/75">{paper.authors}</span></p>
            </header>

            <PaperHero />

            <div className="mx-auto mt-12 max-w-[820px] text-left">
              {paper.sections.map((section) => (
                <section className="literature-section scroll-mt-28" id={section.id} key={section.id}>
                  <h2 className="sr-only">{section.title}</h2>
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      h1: ({ children }) => <h2 className="mt-14 text-2xl font-semibold tracking-[-0.05em] first:mt-0 sm:text-3xl">{children}</h2>,
                      h2: ({ children }) => <h2 className="mt-14 text-2xl font-semibold tracking-[-0.05em] first:mt-0 sm:text-3xl">{children}</h2>,
                      h3: ({ children }) => <h3 className="mt-9 text-xl font-semibold tracking-[-0.04em]">{children}</h3>,
                      p: ({ children }) => <p className="mt-5 text-[15px] leading-7 text-black/75 sm:text-base sm:leading-8">{children}</p>,
                      blockquote: ({ children }) => <blockquote className="mt-7 border-l-2 border-black/20 pl-5 text-[15px] leading-7 text-black/65 sm:text-base sm:leading-8">{children}</blockquote>,
                      strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
                      a: ({ children, href }) => <a className="underline decoration-black/25 underline-offset-4 hover:decoration-black" href={href}>{children}</a>,
                      ul: ({ children }) => <ul className="mt-5 list-disc space-y-2 pl-6 text-[15px] leading-7 text-black/75 sm:text-base sm:leading-8">{children}</ul>,
                      ol: ({ children }) => <ol className="mt-5 list-decimal space-y-2 pl-6 text-[15px] leading-7 text-black/75 sm:text-base sm:leading-8">{children}</ol>,
                      code: ({ children }) => <code className="rounded bg-black/[.05] px-1.5 py-0.5 font-mono text-[0.86em]">{children}</code>,
                    }}
                  >{`## ${section.title}\n\n${section.markdown}`}</ReactMarkdown>
                </section>
              ))}
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-28 border-l-2 border-black/10 pl-7">
              <p className="text-sm font-medium text-black/70">On this page</p>
              <nav className="mt-5 grid gap-4">
                {paper.sections.map((section) => (
                  <a className={`text-sm transition ${activeSection === section.id ? "font-medium text-black" : "text-black/40 hover:text-black/75"}`} href={`#${section.id}`} key={section.id}>{section.title}</a>
                ))}
              </nav>
              <button className="mt-8 inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-2.5 text-sm font-medium transition hover:border-black/35 hover:bg-black/[.025]" onClick={copyPage} type="button">
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                {copied ? "Copied" : "Copy page"}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 hidden rounded-full bg-black px-5 py-3 text-sm font-medium text-white shadow-lg sm:block">Ask AI</div>
    </main>
  );
}

function ReaderNav() {
  return (
    <nav className="border-b border-black/[.07] bg-white" aria-label="Literature navigation">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-10 lg:px-16">
        <TrivialityLogo className="scale-[0.92] origin-left" />
        <div className="hidden items-center gap-8 text-[15px] text-black/75 md:flex">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Research</Link>
          <Link className="text-black" href="/literature">Literature</Link>
          <Link href="/dashboard/graph">Graph</Link>
        </div>
        <div className="flex items-center gap-3">
          <HoverBorderGradient as={Link} href="/dashboard" containerClassName="rounded-full" className="flex items-center gap-1 rounded-[inherit] bg-black px-5 py-2.5 text-sm font-medium text-white" duration={1.2}>Open workspace <IconArrowUpRight size={15} /></HoverBorderGradient>
        </div>
      </div>
    </nav>
  );
}

function BlogSidebar({ paper }: { paper: LiteraturePaper }) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-28 pr-5 text-[15px] leading-6 text-black/75">
        <p className="font-medium text-black">All posts</p>
        <p className="mt-12 font-semibold text-black">Recent</p>
        <nav className="mt-4 grid gap-1" aria-label="Recent literature">
          <Link className="rounded-xl bg-black/[.07] px-3 py-3 font-medium text-black" href={paper.href ?? `/literature/${paper.id}`}>{paper.title}</Link>
          <Link className="rounded-xl px-3 py-3 transition hover:bg-black/[.04]" href="/literature/compactness-in-finite-graphs">Structural invariants in graph transformations</Link>
          <Link className="rounded-xl px-3 py-3 transition hover:bg-black/[.04]" href="/literature/compactness-in-finite-graphs">Proof search and finite witnesses</Link>
          <Link className="rounded-xl px-3 py-3 transition hover:bg-black/[.04]" href="/literature/compactness-in-finite-graphs">Formalizing research notes</Link>
        </nav>
        <p className="mt-12 font-semibold text-black">Topics</p>
        <nav className="mt-4 grid gap-1" aria-label="Literature topics">
          {['Research runtime', 'Proof systems', 'Combinatorics', 'Formal methods', 'Lean'].map((topic) => <Link className="rounded-xl px-3 py-2 transition hover:bg-black/[.04]" href="/literature" key={topic}>{topic}</Link>)}
        </nav>
      </div>
    </aside>
  );
}

function PaperHero() {
  return (
    <div className="relative mx-auto mt-14 flex aspect-[2.6/1] max-w-[1100px] items-center justify-center overflow-hidden rounded-2xl bg-[#2377ee]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_5%,rgba(255,187,160,.9),transparent_22%),radial-gradient(circle_at_58%_25%,rgba(255,255,255,.5),transparent_25%),radial-gradient(circle_at_92%_80%,rgba(244,182,220,.65),transparent_34%),linear-gradient(125deg,#2374e7,#4b9cf4_53%,#3175e7)]" />
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:10px_10px]" />
      <div className="absolute h-[76%] w-[38%] rounded-full border border-white/25" />
      <div className="relative flex h-36 w-48 items-center justify-center rounded-2xl border border-white/60 bg-white/15 shadow-[0_24px_80px_rgba(0,34,120,.28)] backdrop-blur-sm sm:h-48 sm:w-64">
        <div className="absolute -top-5 rounded-full border border-white/70 bg-white/15 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm"><IconBook2 className="mr-2 inline" size={17} />Reading notes</div>
        <div className="grid gap-3 opacity-80">
          <span className="h-1.5 w-28 rounded-full bg-white/80 sm:w-40" />
          <span className="h-1.5 w-36 rounded-full bg-white/65 sm:w-48" />
          <span className="h-1.5 w-24 rounded-full bg-white/80 sm:w-32" />
          <span className="h-1.5 w-32 rounded-full bg-white/65 sm:w-44" />
          <span className="h-1.5 w-20 rounded-full bg-white/80 sm:w-28" />
        </div>
        <span className="absolute -bottom-3 rounded-full border border-white/60 bg-white/80 px-4 py-1.5 text-xs font-medium tracking-[0.12em] text-black/60">FORMAL NOTE</span>
      </div>
    </div>
  );
}
