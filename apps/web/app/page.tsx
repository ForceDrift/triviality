"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ShaderBackground } from "@/components/ui/adisyon-shader";
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
