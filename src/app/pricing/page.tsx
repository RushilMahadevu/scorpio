"use client";

import { SpaceBackground } from "@/components/ui/space-background";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Sparkles, Menu, Github, Info, BookOpen, Mail, Shield, FileText,
  CheckCircle2, Zap, ShieldCheck, Globe, Lock
} from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import dynamic from "next/dynamic";
import { LandingChatbot } from "@/components/landing-chatbot";
import { LandingFAQ } from "@/components/landing-faq";

const CostComparisonChart = dynamic(() => import("@/components/admin/cost-comparison-chart"), {
  ssr: false,
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-muted/10 rounded-2xl animate-pulse" />,
});

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function PricingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen relative font-medium">
      <SpaceBackground />

      {/* Header */}
      <motion.header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
        initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
        <div className="flex items-center justify-between px-6 py-3.5 max-w-[1400px] mx-auto w-full">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0 !font-inter">
            <Logo size={20} className="text-foreground" />
            <span className="text-sm font-inter font-black tracking-tighter">Scorpio</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            {navLinks.map(({ label, href }) => (
              <Link key={label} href={href}>
                <button className={`h-8 px-4 text-sm font-semibold rounded-full transition-colors cursor-pointer ${href === "/pricing" ? "text-foreground bg-muted/40" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>{label}</button>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              {menuOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} />}
              <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm h-full flex flex-col z-50 p-0 bg-background shadow-2xl lg:hidden" hideClose>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <span className="font-extrabold text-lg">Menu</span>
                  <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} className="rounded-full hover:bg-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
                <nav className="flex flex-col space-y-1 px-6 py-8 flex-1 overflow-y-auto">
                  {navLinks.map(({ label, href }) => (
                    <Link key={label} href={href} onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" className="justify-start font-semibold text-muted-foreground text-base px-2 py-3 rounded-xl w-full">{label}</Button>
                    </Link>
                  ))}
                </nav>
                <div className="px-6 pb-6 pt-4 border-t bg-muted/5">
                  <div className="flex flex-col gap-2">
                    <Link href="/login"><Button variant="outline" size="lg" className="w-full">Login</Button></Link>
                    <Link href="/signup"><Button size="lg" className="w-full">Sign up</Button></Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <ModeToggle />
            <div className="h-5 w-px bg-border/40 hidden lg:block" />
            <Link href="/login" className="hidden lg:block">
              <Button variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-foreground hover:bg-transparent cursor-pointer">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="font-semibold px-5 rounded-full cursor-pointer shadow-none hover:opacity-90">Sign up</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-6 py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[150px] pointer-events-none -z-10" />
          <div className="max-w-6xl mx-auto space-y-20">

            {/* Section Header */}
            <div className="text-center space-y-5">
              <motion.div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-[0.2em] uppercase text-primary"
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                <Sparkles className="h-3.5 w-3.5" /><span>Transparent Pricing</span>
              </motion.div>
              <motion.h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                AI-powered physics<br /><span className="text-primary italic">for less than a textbook.</span>
              </motion.h2>
              <motion.p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                One flat subscription. Unlimited students. Zero markup on AI. While competitors charge{" "}
                <span className="text-foreground font-bold">$5\u201312 per student per month</span>, Scorpio charges{" "}
                <span className="text-emerald-500 font-bold">$4.99 total</span>.
              </motion.p>
            </div>

            {/* Social Proof Strip */}
            <motion.div className="flex flex-wrap items-center justify-between gap-6 px-8 py-5 rounded-2xl border border-border/40 bg-muted/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              {[
                { value: "98%",   label: "cheaper than industry average at scale" },
                { value: "$0.08", label: "effective per-student cost at 250 students" },
                { value: "\u221E",      label: "students on one flat subscription" },
                { value: "0\u00D7",    label: "markup on Google DeepMind AI costs" },
              ].map((stat, i) => (
                <div key={i} className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black tracking-tighter text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground max-w-[140px] leading-tight">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Pricing Cards */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>

              {/* Monthly */}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="relative p-8 border border-border bg-card/30 backdrop-blur-sm rounded-2xl flex flex-col gap-6 hover:border-primary/30 transition-all duration-300 hover:shadow-xl shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/50 rounded-full px-2.5 py-0.5 mb-4">Monthly</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter">$4.99</span>
                    <span className="text-muted-foreground text-base font-medium">/mo</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Flexible access, cancel anytime.</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {["Teacher AI Dashboard", "Network Waypoints", "Real-time Mastery Views", "Priority Support"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-foreground/80 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="cursor-pointer w-full bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:opacity-90 font-black py-6 text-base rounded-xl shadow-md">
                    Get Started <ArrowRight className="h-4 w-4 ml-2 opacity-50 inline" />
                  </Button>
                </Link>
              </motion.div>

              {/* Yearly */}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="relative p-8 border-2 border-primary bg-primary/[0.02] rounded-2xl flex flex-col gap-6 overflow-hidden transition-all hover:scale-[1.01] duration-300 shadow-lg shadow-primary/5">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] px-4 py-1.5 font-black uppercase tracking-widest rounded-bl-xl">Best Value</div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 bg-primary/5 rounded-full px-2.5 py-0.5 mb-4">Yearly</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter">$29.88</span>
                    <span className="text-muted-foreground text-base font-medium">/yr</span>
                  </div>
                  <p className="text-sm text-primary font-bold mt-2 flex items-center gap-1.5">
                    <Zap className="h-4 w-4" /> $2.49/mo \u2014 save $30 a year
                  </p>
                </div>
                <ul className="space-y-3 flex-1">
                  {["Everything in Monthly", "Priority AI Processing", "Extended Usage History", "Dept-wide Discount"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm font-bold text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="cursor-pointer w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-6 text-base rounded-xl shadow-xl shadow-primary/20">
                    Claim Annual Plan <ArrowRight className="h-4 w-4 ml-2 inline" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Info Strip */}
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="p-6 rounded-2xl border border-border/50 bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <h4 className="font-black text-sm">What You Unlock</h4>
                </div>
                {[
                  { title: "Always-on AI Tutor", desc: "No throttling during finals, midterms, or late-night study sessions." },
                  { title: "Department Waypoints", desc: "One curriculum, synchronized instantly across every teacher in your network." },
                  { title: "Mastery Analytics", desc: "See exactly who\u2019s falling behind before it becomes a grade problem." },
                  { title: "Hard Spend Caps", desc: "Set monthly AI cost ceilings so you never get a surprise bill." },
                ].map((item, i) => (
                  <div key={i} className="space-y-0.5">
                    <h5 className="font-bold text-xs text-foreground">{item.title}</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl border border-border/50 bg-zinc-100/50 dark:bg-zinc-900/50 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <h4 className="font-black text-sm">Zero Markup. Seriously.</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Most EdTech companies mark up API costs 300\u2013500%. We charge you exactly what Google charges us \u2014 every dollar goes directly to your students\u2019 learning.
                </p>
                <div className="flex gap-6 pt-1">
                  <div>
                    <p className="text-2xl font-black font-mono tracking-tighter text-primary">$0.15</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5 tracking-widest">1M Input</p>
                  </div>
                  <div className="w-px bg-border self-stretch" />
                  <div>
                    <p className="text-2xl font-black font-mono tracking-tighter text-primary">$0.60</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5 tracking-widest">1M Output</p>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Google DeepMind Gemini 2.5 Flash rates</p>
              </div>

              <div className="p-6 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl text-white space-y-4 overflow-hidden relative group">
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-500" />
                    <h4 className="font-black text-foreground text-sm">Scaling Beyond One School?</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">District-wide deployment, custom SSO, dedicated infrastructure, and volume pricing for 10+ networks.</p>
                  <Link href="/contact">
                    <Button variant="outline" className="cursor-pointer w-full bg-transparent border-white/20 text-white hover:bg-white hover:text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-xl mt-2">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Cost Comparison Chart */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <CostComparisonChart />
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <LandingFAQ />

        {/* CTA */}
        <section className="container mx-auto px-6 py-24">
          <motion.div className="max-w-4xl mx-auto rounded-[3rem] p-12 md:p-20 border border-border/60 bg-gradient-to-br from-card/30 to-background/50 backdrop-blur-xl relative overflow-hidden text-center shadow-xl"
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none">Ready to get started?</h2>
              <p className="text-muted-foreground text-lg font-medium max-w-xl mx-auto leading-relaxed">No LMS integration required. Deploy in one afternoon.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup"><Button size="lg" className="h-14 px-10 rounded-full text-lg font-black cursor-pointer">Get Faculty Access <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
                <Link href="/contact"><Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg cursor-pointer font-black border-2 bg-background/50">Request Demo</Button></Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 bg-background/50 backdrop-blur-sm border-t border-border/50">
        <div className="container mx-auto px-6 py-12">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-center space-x-3 justify-center md:justify-start mb-6 md:mb-0 !font-inter">
              <Logo size={24} className="text-foreground" /><span className="text-md font-inter font-black tracking-tighter">Scorpio</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-6 md:mb-0">
              {[
                { href: "https://github.com/RushilMahadevu/scorpio", icon: Github, label: "GitHub", external: true },
                { href: "/about", icon: Info, label: "About" },
                { href: "/research", icon: BookOpen, label: "Research" },
                { href: "/privacy", icon: Shield, label: "Privacy" },
                { href: "/terms", icon: FileText, label: "Terms" },
                { href: "/contact", icon: Mail, label: "Contact" },
              ].map(({ href, icon: Icon, label, external }) => (
                <Link key={label} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Icon className="h-5 w-5" /><span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>
            <div className="text-center md:text-right space-y-2">
              <div className="text-sm text-muted-foreground font-medium">Built by <span className="text-foreground font-semibold">Rushil Mahadevu</span></div>
              <div className="text-xs text-muted-foreground">{`\u00A9 ${new Date().getFullYear()} Scorpio. All rights reserved.`}</div>
            </div>
          </div>
        </div>
      </footer>
      </div>
      <LandingChatbot />
    </>
  );
}
