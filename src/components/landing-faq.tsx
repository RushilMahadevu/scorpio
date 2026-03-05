"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail, Github, BookOpen, MessageCircle } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    index: "01",
    question: "What exactly is Scorpio?",
    answer:
      "Scorpio is the world's first verifiable AI Physics LMS — a learning-management system built around Socratic scaffolding rather than answer delivery. It enforces a 4-layer constraint architecture at inference-time, making it structurally impossible for the AI to bypass the learning process, regardless of how a student phrases their prompt.",
  },
  {
    index: "02",
    question: "How does the Socratic architecture work?",
    answer:
      "Every AI response passes through four sequential constraint layers: intent classification, schema enforcement, Socratic gate validation, and pedagogical output generation. No fine-tuning or black-box retraining is involved — all behaviour is observable and auditable at inference-time.",
  },
  {
    index: "03",
    question: "Can students bypass the AI and get direct answers?",
    answer:
      "No. The constraint architecture makes this structurally impossible — not policy-based. Our Ph.D.-validated audit records a 0% direct answer rate across 125-response ablation studies. Rephrasing, jailbreak attempts, and leading questions are all caught at the schema-enforcement layer.",
  },
  {
    index: "04",
    question: "What physics topics and grade levels are supported?",
    answer:
      "Scorpio supports A-Level, AP Physics, and undergraduate introductory physics. Topics span mechanics, electromagnetism, thermodynamics, waves, quantum foundations, and more. Teachers can further scope the AI to specific modules using configurable Waypoint constraints.",
  },
  {
    index: "05",
    question: "What are Waypoints?",
    answer:
      "Waypoints are high-precision, peer-validated physics modules — essentially curriculum anchors that teachers can attach to assignments. They lock the AI to specific topic domains, notation conventions, and pedagogical depth levels, ensuring the tutoring stays on-syllabus.",
  },
  {
    index: "06",
    question: "How is pricing structured?",
    answer:
      "Scorpio operates on a zero-markup pass-through model for AI usage costs. You pay exactly what the underlying model provider charges — no hidden AI surcharges. Platform access is billed per institution seat, with full cost transparency provided in your dashboard.",
  },
  {
    index: "07",
    question: "Does Scorpio integrate with existing LMS platforms?",
    answer:
      "Scorpio is a standalone platform designed for rapid deployment — no LMS integration is required. Setup takes under an afternoon. For institutions requiring deep LMS integration (Canvas, Blackboard, etc.), contact us about our Enterprise tier.",
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

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

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
        <div className="rounded-[2.5rem] border border-border/50 bg-muted/30 dark:bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl">
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
                  Everything you need to know about deploying Scorpio in your physics department. Can&rsquo;t find an answer?
                </p>
              </div>

              {/* Contact icons */}
              <div className="relative z-10 mt-12 lg:mt-0">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Get in touch
                </p>
                <div className="flex items-center gap-3">
                  {contactLinks.map(({ icon: Icon, label, href, external }) => (
                    <Link
                      key={label}
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      title={label}
                      className="group flex items-center justify-center w-10 h-10 rounded-full border border-border/60 bg-background/60 dark:bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 hover:scale-110"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{label}</span>
                    </Link>
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
                      bg-background dark:bg-card/70
                      ${isOpen
                        ? "border-primary/40 shadow-md shadow-primary/5"
                        : "border-border/40 hover:border-border/80 hover:shadow-sm"
                      }
                    `}
                  >
                    <button
                      onClick={() => toggle(i)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
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
