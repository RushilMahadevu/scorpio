"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronDown, Mail, Github, BookOpen } from "lucide-react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    index: "01",
    question: "What is Scorpio?",
    answer:
      "Scorpio is a platform for physics classes. Teachers can post and grade assignments, and students can ask Raise for a hint when they get stuck.",
  },
  {
    index: "02",
    question: "How does Raise decide what hint to give?",
    answer:
      "Raise checks what the student is asking for and applies rules to keep the reply focused on the next step. The research page explains how we tested those rules.",
  },
  {
    index: "03",
    question: "Can students bypass the AI and get direct answers?",
    answer:
      "Raise is designed to give hints. In our 125-response study, the version with all four checks gave no direct answers.",
  },
  {
    index: "04",
    question: "What physics topics and grade levels are supported?",
    answer:
      "Scorpio supports A-Level, AP Physics, and introductory college physics. It covers topics such as mechanics, electromagnetism, thermodynamics, waves, and introductory quantum physics. Teachers can use Waypoints to focus hints on the material their class is studying.",
  },
  {
    index: "05",
    question: "What are Waypoints?",
    answer:
      "Waypoints are modules teachers can attach to assignments. They tell Raise which topic to stay on, what notation to use, and how much help to give.",
  },
  {
    index: "06",
    question: "How is pricing structured?",
    answer:
      "Scorpio charges a subscription for platform access and passes through AI usage charges at the provider’s rate. You can see usage costs in your dashboard.",
  },
  {
    index: "07",
    question: "Does Scorpio integrate with existing LMS platforms?",
    answer:
      "You can use Scorpio alongside your current LMS without connecting the two. If your school needs a Canvas or Blackboard integration, ask us about the Enterprise plan.",
  },
  {
    index: "08",
    question: "How is student data protected?",
    answer:
      "All student data is stored on FERPA-ready infrastructure with role-based access controls enforced at the database level. Teachers only see aggregated analytics for their own cohorts. No student data is used for model training.",
  },
];

const contactLinks = [
  { icon: Mail, label: "Email", href: "/contact" },
  { icon: Github, label: "GitHub", href: "https://github.com/RushilMahadevu/scorpio", external: true },
  { icon: BookOpen, label: "Research", href: "/research" },
];

export function LandingFAQ({ minimal = false }: { minimal?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

  if (minimal) {
    return (
      <section id="faq" aria-labelledby="faq-heading" className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_2fr] lg:gap-12">
        <div>
          <h2 id="faq-heading" className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Common questions</h2>
          <p className="mt-3 max-w-xs leading-relaxed text-muted-foreground">
            Using Scorpio in class, working with Raise, and getting your school set up.
          </p>
          <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            Contact us <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <Accordion type="single" collapsible className="min-w-0 border-y border-border motion-reduce:[&_[data-slot=accordion-content]]:animate-none">
          {faqs.map(({ index, question, answer }) => (
            <AccordionItem key={index} value={index}>
              <AccordionTrigger className="cursor-pointer items-center rounded-md px-1 py-4 text-base leading-snug transition-colors hover:text-primary hover:no-underline data-[state=open]:text-primary motion-reduce:transition-none sm:px-2 [&>svg]:size-5 [&>svg]:translate-y-0 motion-reduce:[&>svg]:transition-none">
                {question}
              </AccordionTrigger>
              <AccordionContent className="max-w-prose px-1 pr-8 leading-relaxed text-muted-foreground sm:pl-2">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    );
  }

  return (
    <section id="faq" className="container mx-auto px-6 py-32 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/4 rounded-full blur-[140px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto"
      >
        {/* Outer card */}
        <div className="rounded-[2.5rem] border border-border/50 bg-card/60 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-[420px_1fr]">

            {/* ── Left: Header + contact ── */}
            <div className="relative flex flex-col justify-between p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-border/40 overflow-hidden">
              {/* Watermark */}
              <span
                aria-hidden
                className="pointer-events-none select-none absolute -bottom-6 -left-4 text-[11rem] lg:text-[13rem] font-black text-foreground opacity-[0.03] leading-none tracking-tighter"
              >
                FAQ
              </span>

              <div className="relative z-10 space-y-6">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                  Support
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground">
                  Frequently<br />
                  Asked<br />
                  <span className="text-primary italic">Questions.</span>
                </h2>
                <p className="text-muted-foreground text-base font-medium leading-relaxed max-w-xs">
                  Common questions about using Scorpio in a physics class. Can&rsquo;t find your answer?
                </p>
              </div>

              {/* Contact icons */}
              <div className="relative z-10 mt-12 lg:mt-0">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Get in touch
                </p>
                <div className="flex items-center gap-3">
                  {contactLinks.map(({ icon: Icon, label, href, external }) => (
                    <Button key={label} asChild variant="outline" size="icon-lg" className="rounded-full text-muted-foreground">
                      <Link
                        href={href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        title={label}
                      >
                        <Icon />
                        <span className="sr-only">{label}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Accordion ── */}
            <div className="p-8 lg:p-12 space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <motion.div
                    key={faq.index}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={`
                      group rounded-2xl border transition-all duration-300
                      bg-card
                      ${isOpen
                        ? "border-primary/40 shadow-md shadow-primary/5"
                        : "border-border/40 hover:border-border/80 hover:shadow-sm"
                      }
                    `}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer rounded-2xl hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-xs font-black tabular-nums text-muted-foreground/50 shrink-0">
                          {faq.index}
                        </span>
                        <span className="text-sm font-bold text-foreground leading-snug">
                          {faq.question}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-border/50 bg-muted/40 transition-transform duration-300 ${isOpen ? "rotate-180 border-primary/40 bg-primary/5" : "group-hover:border-border"}`}
                      >
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </button>

                    {/* Smooth reveal */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-6 pb-6 pt-0 text-sm text-muted-foreground leading-relaxed font-medium pl-16">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </motion.div>
    </section>
  );
}
