import Link from "next/link";
import { ArrowRight } from "lucide-react";

const workflowSteps = [
  {
    title: "Post an assignment",
    description: "Write questions with equations and share them with your class.",
  },
  {
    title: "Guide students with Raise",
    description: "Raise gives a hint when a student gets stuck so they can work through the next step.",
  },
  {
    title: "Review class progress",
    description: "See who submitted and which questions need more class time.",
  },
];

export function ClassroomBento() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24" aria-labelledby="features-heading">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
        <div>
          <p className="mb-2 text-sm font-medium text-primary">The classroom workflow</p>
          <h2 id="features-heading" className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">How Scorpio fits into a physics class</h2>
        </div>
        <Link href="/features" className="inline-flex shrink-0 items-center gap-2 rounded-sm text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          Explore platform features <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <ol role="list" className="grid list-none divide-y divide-border border-y border-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {workflowSteps.map(({ title, description }, index) => (
          <li key={title} className="flex items-start gap-3 py-4 lg:p-5">
            <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold leading-7 tracking-tight">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ol>

      <figure id="solution" className="mx-auto mt-6 max-w-3xl scroll-mt-20 overflow-hidden rounded-xl border border-border bg-card sm:mt-8">
        <figcaption id="problem" className="scroll-mt-20 border-b border-border px-4 py-3 text-sm font-medium sm:px-5">
          Raise tutoring session <span aria-hidden="true" className="px-1.5 text-muted-foreground">·</span>{" "}
          <span className="text-muted-foreground">Forces and motion</span>
        </figcaption>
        <div className="space-y-3 p-4 text-sm leading-relaxed sm:p-5">
          <div className="ml-auto w-fit max-w-[92%] rounded-xl rounded-br-sm bg-muted px-3 py-2.5 sm:max-w-[84%]">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Student</p>
            <p>A 12 N force pushes a 2 kg cart to the right. Friction is 4 N. Do I divide 12 by 2?</p>
          </div>
          <div className="w-fit max-w-[95%] rounded-xl rounded-bl-sm border border-primary/20 bg-primary/5 px-3 py-2.5 sm:max-w-[88%]">
            <p className="mb-1 text-xs font-semibold text-primary">Raise</p>
            <p>Start by drawing the two force arrows. Which way does friction point? Use that to find the net force before dividing by the mass.</p>
          </div>
          <div className="ml-auto w-fit max-w-[92%] rounded-xl rounded-br-sm bg-muted px-3 py-2.5 sm:max-w-[84%]">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Student</p>
            <p>Friction points left, so the net force is 8 N to the right. Now I can use F = ma.</p>
          </div>
        </div>
      </figure>
    </section>
  );
}
