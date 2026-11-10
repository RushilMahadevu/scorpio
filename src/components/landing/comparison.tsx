import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Comparison() {
  return (
    <div id="comparison" className="mx-auto grid max-w-6xl scroll-mt-20 gap-6 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-12">
      <div>
        <h2 id="research-heading" className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">What we tested</h2>
        <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
          We gave the same AI model 25 physics questions and varied the tutoring rules it followed.
        </p>
        <Link
          href="/research"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Read the full study <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="font-medium">How often did the AI give away the answer?</h3>
        <dl className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">Without tutoring rules</dt>
            <dd className="order-first text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">100%</dd>
          </div>
          <div className="flex flex-col gap-1 border-l border-border pl-4 sm:pl-6">
            <dt className="text-sm text-muted-foreground">With all Raise rules</dt>
            <dd className="order-first text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">0%</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          These rates cover questions that asked for a worked solution.
        </p>
      </div>
    </div>
  );
}
