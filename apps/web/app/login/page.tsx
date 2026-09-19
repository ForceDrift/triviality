"use client";

import React, { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TrivialityLogo } from "@/components/triviality-logo";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-white text-[#111] lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen bg-[#f4f4f4] p-10 lg:flex lg:flex-col xl:p-16">
        <TrivialityLogo />
        <div className="mt-auto max-w-xl">
          <p className="text-2xl font-medium leading-[1.12] tracking-[-0.04em] xl:text-3xl">
            “Every proof begins as a question. Every question opens a new
            space to explore.”
          </p>
          <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-black/45">
            Triviality · Mathematical discovery system
          </p>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-6 py-16 sm:px-12 lg:px-16 xl:px-24">
        <div className="absolute right-6 top-8 sm:right-12 lg:right-16 xl:right-24">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-black/55">
            Login
          </span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-9">
            <h1 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Sign in to Triviality
            </h1>
            <p className="mt-3 text-sm text-black/50">
              Enter your email below to continue your research.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className="h-12 w-full rounded-md border border-black/15 bg-white px-4 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-md bg-black text-sm font-medium text-white transition-colors hover:bg-black/75"
            >
              Sign in with email
            </button>

            <div className="flex items-center gap-4 py-2 text-sm text-black/45">
              <span className="h-px flex-1 bg-black/10" />
              <span>Or continue with</span>
              <span className="h-px flex-1 bg-black/10" />
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="h-12 w-full rounded-md border border-black/15 bg-white text-sm font-medium transition-colors hover:bg-black hover:text-white"
            >
              ◉&nbsp;&nbsp; GitHub
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-black/45">
            By clicking continue, you agree to our{" "}
            <a href="#terms" className="underline underline-offset-4">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#privacy" className="underline underline-offset-4">
              Privacy Policy
            </a>
            .
          </p>

          <p className="mt-6 text-center text-xs text-black/35">
            Demo login · Any email will work
          </p>
        </div>
      </section>
    </main>
  );
}
