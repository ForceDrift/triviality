"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
} from "@radix-ui/react-icons";
import { ShaderBackground } from "@/components/ui/adisyon-shader";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { CloudShader } from "@/components/ui/cloud-shader";
import { TrivialityLogo } from "@/components/triviality-logo";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";

const MESSAGES: string[] = [
  "PROOF IS A\nCONSTRUCTION",
  "FIND THE\nINVARIANT",
  "LEMMA BECOMES\nTHEOREM",
  "EXPLORE THE\nUNKNOWN",
  "STRUCTURE\nBEATS SCALE",
  "CONJECTURE\nBECOMES\nTHEOREM",
];

const MESSAGE_INTERVAL = 10000;

const features = [
  {
    Icon: FileTextIcon,
    name: "Research graph",
    description: "Map theorems, techniques, assumptions, and ideas as one living system.",
    href: "#research",
    cta: "Explore graph",
    background: <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,0,0,0.14),transparent_35%),linear-gradient(135deg,transparent_45%,rgba(0,0,0,0.05)_45%,rgba(0,0,0,0.05)_46%,transparent_46%)]" />,
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-4",
  },
  {
    Icon: InputIcon,
    name: "Hypothesis engine",
    description: "Generate competing directions and keep every failed attempt as research data.",
    href: "#research",
    cta: "Start exploring",
    background: <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(0,0,0,0.1),transparent_36%)]" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: GlobeIcon,
    name: "Cross-domain transfer",
    description: "Find structural connections between distant regions of mathematics.",
    href: "#research",
    cta: "Find connections",
    background: <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.06),transparent_55%)]" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: CalendarIcon,
    name: "Research episodes",
    description: "Return to an open problem with its history, memory, and frontier intact.",
    href: "/login",
    cta: "Open workspace",
    background: <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(0,0,0,0.1),transparent_42%)]" />,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: BellIcon,
    name: "Formal verification",
    description: "Move promising ideas from candidate argument to checked mathematical result.",
    href: "/login",
    cta: "Enter triviality",
    background: <div className="absolute inset-0 bg-[linear-gradient(145deg,transparent_35%,rgba(0,0,0,0.07)_35%,rgba(0,0,0,0.07)_36%,transparent_36%)]" />,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4",
  },
];

export default function Home() {
  const [msgIdx, setMsgIdx] = useState(0);

  const next = useCallback(
    () => setMsgIdx((index) => (index + 1) % MESSAGES.length),
    [],
  );

  useEffect(() => {
    const id = window.setInterval(next, MESSAGE_INTERVAL);
    return () => window.clearInterval(id);
  }, [next]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#111]">
      <CloudShader
        className="pointer-events-none absolute inset-0 h-full w-full"
        cloudColor="#ffffff"
        skyTopColor="#ffffff"
        skyBottomColor="#f3f3ef"
      />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
        <TrivialityLogo />

        <div className="flex items-center gap-6 text-[10px] font-medium uppercase tracking-[0.2em] sm:gap-9">
          <a className="transition-opacity hover:opacity-50" href="#about">
            About
          </a>
          <a className="transition-opacity hover:opacity-50" href="#research">
            Research
          </a>
          <Link
            className="border-b border-black pb-1 transition-opacity hover:opacity-50"
            href="/login"
          >
            Login
          </Link>
        </div>
      </nav>

      <section className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-6 pb-20 pt-8 sm:px-10">
        <div className="w-full max-w-5xl">
          <TextFlippingBoard
            text={MESSAGES[msgIdx]}
            className="!mx-auto !max-w-5xl rounded-none bg-white p-0 shadow-none"
          />
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-black/45">
          <span>scroll to wander</span>
          <span className="h-8 w-px bg-black/35" />
        </div>
      </section>

      <section id="explore" className="relative z-10 bg-white px-6 py-24 sm:px-10 lg:px-14 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-xl">
            <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.3em] text-black/45">
              Explore triviality
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.07em] sm:text-6xl">
              A map for the unknown.
            </h2>
          </div>
          <BentoGrid className="lg:grid-rows-3">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </section>

      <div
        aria-hidden="true"
        className="relative z-20 -mb-28 h-28 bg-gradient-to-b from-white via-white/80 to-transparent"
      />

      <section id="research" className="relative z-0 -mt-28 min-h-screen bg-black">
        <ShaderBackground className="h-screen w-full" />
      </section>
    </main>
  );
}
