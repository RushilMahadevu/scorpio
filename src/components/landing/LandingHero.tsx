import { DoorOpen } from "lucide-react";
import Link from "next/link";
import { TeacherDemoLink } from "@/components/landing/teacher-demo-link";
import { Button } from "@/components/ui/button";
import reveal from "./home-reveal.module.css";

export function LandingHero() {
  return (
    <section id="home" className="pb-16 pt-28 sm:pb-24 sm:pt-36">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <h1 className={`${reveal.enter} mx-auto max-w-[20ch] text-balance text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.06em]`}>
          The workspace for physics teachers
        </h1>
        <p className={`${reveal.enter} ${reveal.description} mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg`}>
          Post assignments, see where your class gets stuck, and give students hints they can work through on their own.
        </p>
        <div className={`${reveal.enter} ${reveal.actions} mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-4`}>
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
            <TeacherDemoLink>
              <div
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 group-focus-visible:bg-primary/20 motion-reduce:transition-none"
              >
                <DoorOpen className="size-4" />
              </div>
              Open sample workspace
            </TeacherDemoLink>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[86rem] px-4 sm:mt-16 sm:px-8 lg:mt-20 lg:px-12">
        <TeacherDemoLink
          id="dashboard-preview"
          aria-label="Explore the sample teacher dashboard"
          className={`${reveal.preview} mx-auto block aspect-[358/590] max-w-md scroll-mt-20 rounded-xl border border-border bg-card bg-[url('/demos/teacher-dashboard-mobile-light.webp')] bg-cover bg-center transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none dark:bg-[url('/demos/teacher-dashboard-mobile-dark.webp')] md:aspect-[16/9] md:max-w-none md:bg-[url('/demos/teacher-dashboard-light.webp')] dark:md:bg-[url('/demos/teacher-dashboard-dark.webp')]`}
        />
      </div>
    </section>
  );
}
