"use client";

import { motion } from "framer-motion";
import { Presentation, Maximize2, FileText, Brain, ChartColumnIncreasing, Activity, GraduationCap, SquareFunction, Orbit, ShieldCheck, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

export function Workflow() {
  return (
    <section id="workflow" className="container mx-auto px-6 py-40 relative">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]">
         <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[180px]" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[140px]" />
      </div>
      
      <motion.div
        className="text-center mb-24 space-y-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Two Interfaces. One System.</div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Classroom. Reimagined.</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">You control the AI constraints. Students experience the Socratic method. Both sides get exactly what they need — without compromise.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-20 max-w-7xl mx-auto relative px-4">
        {/* Center Connector (Hidden on mobile) */}
        <div className="absolute left-1/2 top-40 bottom-40 w-px bg-border hidden lg:block -translate-x-1/2 border-dashed border-l" />

        {/* Teacher Path */}
        <motion.div
          className="space-y-12 relative"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="flex items-center gap-6 mb-10 group">
            <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-primary/40 transition-all duration-500 shadow-sm">
              <Presentation className="h-7 w-7 text-primary" />
            </div>
            <div>
               <h3 className="text-2xl font-extrabold tracking-tight">Instructional Design</h3>
               <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Faculty Interface</p>
            </div>
          </div>

          {/* Teacher Image Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <motion.div 
                className="relative rounded-2xl overflow-hidden border border-border shadow-2xl mb-12 group cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-background/20 backdrop-blur-md p-3 rounded-full border border-white/20">
                      <Maximize2 className="h-6 w-6 text-white" />
                   </div>
                </div>
                <Image 
                  src="/demos/teacher-editor.png" 
                  alt="Scorpio Question Editor" 
                  width={800} 
                  height={600} 
                  className="w-full h-[300px] object-cover object-top"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20">
                   <p className="text-xs font-bold text-white uppercase tracking-widest">View Faculty Question Editor Interface</p>
                </div>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none flex items-center justify-center">
              <DialogTitle className="sr-only">Instructional Design Interface</DialogTitle>
              <Image 
                src="/demos/teacher-editor.png" 
                alt="Scorpio Question Editor Full View" 
                width={1920} 
                height={1080} 
                className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain"
              />
            </DialogContent>
          </Dialog>

          <div className="space-y-10 pl-5 border-l border-border/60">
            {[
              { title: "Rigorous Content Integration", desc: "Construct multi-modal assignments with full LaTeX support and resource linking.", icon: <FileText className="h-3.5 w-3.5" /> },
              { title: "Pedagogical Constraint Logic", desc: "Define AI-tutoring parameters to enforce specific problem-solving pathways.", icon: <Brain className="h-3.5 w-3.5" /> },
              { title: "Facilitated Assessment", desc: "Review conceptual feedback loops and validate student derivations with AI assistance.", icon: <ChartColumnIncreasing className="h-3.5 w-3.5" /> },
              { title: "Real-Time Telemetry", desc: "Monitor class-wide conceptual bottlenecks via dynamic statistical dashboards.", icon: <Activity className="h-3.5 w-3.5" /> }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative group "
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-border group-hover:bg-primary transition-colors duration-500" />
                <div className="space-y-2">
                   <h4 className="font-bold text-lg leading-none flex items-center gap-2">
                      {item.title}
                   </h4>
                   <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Student Path */}
        <motion.div
          className="space-y-12 relative"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="flex items-center gap-6 mb-10 lg:flex-row-reverse group">
            <div className="h-14 w-14 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-secondary/40 transition-all duration-500 shadow-sm">
              <GraduationCap className="h-7 w-7 text-secondary-foreground" />
            </div>
            <div className="lg:text-right">
               <h3 className="text-2xl font-extrabold tracking-tight">Conceptual Discovery</h3>
               <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Student Interface</p>
            </div>
          </div>

          {/* Student Image Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <motion.div 
                className="relative rounded-2xl overflow-hidden border border-border shadow-2xl mb-12 group cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-background/20 backdrop-blur-md p-3 rounded-full border border-white/20">
                      <Maximize2 className="h-6 w-6 text-white" />
                   </div>
                </div>
                <Image 
                  src="/demos/ai-tutor.png" 
                  alt="Scorpio AI Tutor Chat" 
                  width={800} 
                  height={600} 
                  className="w-full h-[300px] object-cover object-top"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20 lg:text-right">
                   <p className="text-xs font-bold text-white uppercase tracking-widest">View AI Tutor Interface</p>
                </div>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:outline-none flex items-center justify-center">
              <DialogTitle className="sr-only">Conceptual Discovery Interface</DialogTitle>
              <Image 
                src="/demos/ai-tutor.png" 
                alt="Scorpio AI Tutor Full View" 
                width={1920} 
                height={1080} 
                className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain"
              />
            </DialogContent>
          </Dialog>

          <div className="space-y-10 lg:text-right lg:pr-5 lg:border-r lg:border-l-0 border-l border-border/60 pl-5 lg:pl-0">
            {[
              { title: "Adaptive Socratic Guidance", desc: "Engage with a constraint-led AI specialized in guiding derivations.", icon: <SquareFunction className="h-3.5 w-3.5" /> },
              { title: "Immersive Problem Solving", desc: "Interact with physics challenges through high-fidelity math rendering.", icon: <Orbit className="h-3.5 w-3.5" /> },
              { title: "Continuous Feedback Loop", desc: "Receive immediate sanity checks for unit consistency and physical logic.", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
              { title: "Synthesized Learning Path", desc: "Access a collection of Waypoints tailored to current coursework.", icon: <MessageCircle className="h-3.5 w-3.5" /> }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="absolute lg:-right-[25px] -left-[25px] lg:left-auto top-1.5 h-2 w-2 rounded-full bg-border group-hover:bg-secondary transition-colors duration-500" />
                <div className="space-y-2">
                   <h4 className="font-bold text-lg leading-none flex items-center gap-2 lg:flex-row-reverse">
                      {item.title}
                   </h4>
                   <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm lg:ml-auto">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
