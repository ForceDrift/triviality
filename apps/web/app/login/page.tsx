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
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12 text-[#111]">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="flex justify-center">
            <TrivialityLogo wordmark={false} className="scale-125" />
          </div>
          <h1 className="mt-10 text-3xl font-semibold tracking-[-0.04em]">
            Sign in to Triviality
          </h1>
          <p className="mt-2 text-sm text-black/55">
            Enter your details to continue.
          </p>
        </div>

        <div className="rounded-xl border border-black/15 bg-white p-10 shadow-sm sm:p-12">
          <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.16em]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              className="h-11 w-full rounded-md border border-black/20 bg-white px-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-[0.16em]">
                Password
              </label>
              <button type="button" className="text-xs text-black/50 hover:text-black">
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="h-11 w-full rounded-md border border-black/20 bg-white px-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black"
            />
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-md bg-black text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-black/75"
          >
            Log in
          </button>

          <div className="flex items-center gap-3 py-2 text-[10px] uppercase tracking-[0.2em] text-black/35">
            <span className="h-px flex-1 bg-black/10" />
            <span>or continue with</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="h-11 w-full rounded-md border border-black/20 bg-white text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:bg-black hover:text-white"
          >
            GitHub
          </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-black/45">
          This is a demo login. Any credentials will work.
        </p>
      </div>
    </main>
  );
}
