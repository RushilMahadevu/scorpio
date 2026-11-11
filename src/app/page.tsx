import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ClassroomBento } from "@/components/landing/classroom-bento";
import Image from "next/image";
import Link from "next/link";
import { Comparison } from "@/components/landing/comparison";
import { HomeChatbot, HomeHeader, HomeScrollReveal } from "@/components/landing/home-interactions";
import reveal from "@/components/landing/home-reveal.module.css";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFAQ } from "@/components/landing-faq";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { SpaceBackground } from "@/components/ui/space-background";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Research", href: "/research" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Request access", href: "/request-access" },
  { label: "Contact", href: "/contact" },
];

export default function Home() {
  return (
    <div id="home-page" className={`${reveal.scope} relative isolate min-h-screen`}>
      <LoadingScreen />
      <SpaceBackground />
      <HomeHeader />

      <main className="overflow-x-clip [&>section]:scroll-mt-20">
        <HomeScrollReveal />
        <LandingHero />

        <section id="partners" className="mx-auto max-w-6xl px-5 sm:px-8" aria-labelledby="partners-heading">
          <div data-scroll-reveal className="flex flex-col items-start gap-5 border-y border-border py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-12 sm:py-9">
            <div>
              <p className="text-sm text-muted-foreground">School partner</p>
              <h2 id="partners-heading" className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Sage Ridge School</h2>
              <p className="mt-2 max-w-md text-pretty leading-relaxed text-muted-foreground">
                We’re working with Sage Ridge to bring guided tutoring into the physics classroom.
              </p>
            </div>
            <Link
              href="https://www.sageridge.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <Image
                src="/school-logos/SageRidgeSchool.svg"
                alt="Visit Sage Ridge School"
                width={244}
                height={130}
                className="h-auto w-28 dark:brightness-0 dark:invert sm:w-36"
              />
            </Link>
          </div>
        </section>

        <ClassroomBento />

        <section id="efficacy" data-scroll-reveal aria-labelledby="research-heading">
          <Comparison />
        </section>

        <section id="pricing-teaser" className="mx-auto max-w-6xl px-5 sm:px-8">
          <div data-scroll-reveal className="flex flex-col gap-4 border-y border-border py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">One subscription for all your students</h2>
              <p className="mt-2 text-muted-foreground">Compare plans and see how AI usage is billed.</p>
            </div>
            <Link href="/pricing" className="inline-flex w-fit shrink-0 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline">
              See pricing <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </section>

        <LandingFAQ minimal />

        <section id="cta" aria-labelledby="cta-heading" className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-20">
          <div data-scroll-reveal className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-12 text-center sm:px-10 sm:py-16 lg:py-20">
            <h2 id="cta-heading" className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl lg:text-6xl">Try Scorpio with your class</h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              Start with an assignment you already teach. Scorpio works alongside your existing LMS.
            </p>
            <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
              <Button asChild className="group h-12 rounded-lg px-6 text-base motion-reduce:transition-none sm:h-14">
                <Link href="/signup" prefetch={false}>
                  Get faculty access
                  <ArrowRight aria-hidden="true" className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-focus-visible:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-lg px-5 text-base motion-reduce:transition-none sm:h-14 sm:px-6">
                <Link href="/contact">Request a department demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div data-scroll-reveal className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Logo size={18} aria-hidden="true" /> Scorpio
          </span>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {footerLinks.map(({ label, href }) => (
              <Link key={href} href={href} className="transition-colors hover:text-foreground">{label}</Link>
            ))}
            <Link href="https://github.com/RushilMahadevu/scorpio" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
              GitHub <ArrowUpRight aria-hidden="true" className="size-3" />
            </Link>
          </nav>
          <p className="text-xs leading-relaxed text-muted-foreground">
            © {new Date().getFullYear()} Scorpio<br />Built by Rushil Mahadevu
          </p>
        </div>
      </footer>

      <HomeChatbot />
    </div>
  );
}
