"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RaiseLogo } from "@/components/ui/raise-logo";
import { WorkspacePreview } from "@/components/landing/workspace-preview";

export function LandingHero() {
  return (
    <section id="home" className="pb-16 pt-28 sm:pb-24 sm:pt-36">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <h1 className="mx-auto max-w-[20ch] text-balance text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.06em]">
          The workspace for physics teachers
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
          Post assignments, see where your class gets stuck, and give students hints they can work through on their own.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-4">
          <Button
            asChild
            className="group relative isolate h-12 gap-2 rounded-xl pl-4 pr-1.5 shadow-sm shadow-primary/20 hover:bg-primary dark:bg-primary/80 dark:hover:bg-primary/80 motion-safe:active:scale-[0.98] motion-reduce:transition-none"
          >
            <Link href="/request-access">
              {/* The beUI-style accent expands behind the label without moving it. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-1.5 right-1.5 -z-10 w-9 rounded-lg bg-black/12 transition-[width] duration-300 ease-out group-hover:w-[calc(100%-0.75rem)] group-focus-visible:w-[calc(100%-0.75rem)] motion-reduce:transition-none"
              />
              Request classroom access
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center">
                <svg
                  viewBox="0 0 24 20"
                  className="size-5 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:translate-x-0.5 motion-reduce:transition-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="0.01 4.2"
                >
                  <path
                    d="m4 4 6 6-6 6"
                    className="opacity-35 transition-opacity group-hover:opacity-65 group-focus-visible:opacity-65 motion-reduce:transition-none"
                  />
                  <path d="m12 4 6 6-6 6" />
                </svg>
              </span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="group h-12 rounded-xl pl-2 pr-4 motion-safe:active:scale-[0.98] motion-reduce:transition-none"
          >
            <Link href="/ai">
              <div
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 group-focus-visible:bg-primary/20 motion-reduce:transition-none"
              >
                <RaiseLogo size={16} />
              </div>
              Try a physics hint
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative isolate mx-auto mt-12 max-w-[86rem] px-4 sm:mt-16 sm:px-8 lg:mt-20 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-12 -bottom-14 top-1/3 -z-10 bg-[radial-gradient(ellipse_56%_24%_at_50%_76%,var(--color-muted-foreground),transparent)] opacity-15 sm:-bottom-20 dark:opacity-30"
        />
        <WorkspacePreview />
      </div>
    </section>
  );
}
