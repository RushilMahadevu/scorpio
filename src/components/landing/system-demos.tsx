"use client";

import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MonitorPlay, PlayCircle, Presentation } from "lucide-react";
import dynamic from "next/dynamic";

const DemoCarousel = dynamic(() => import("@/components/demo-carousel").then(mod => mod.DemoCarousel), {
  ssr: false,
});

export function SystemDemos() {
  return (
    <section id="demos" className="container mx-auto px-6 py-32 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
           <motion.div 
             className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold tracking-[0.2em] uppercase text-primary"
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
           >
             <MonitorPlay className="h-3.5 w-3.5" />
             <span>Instructional Showcases</span>
           </motion.div>
           <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">System Demonstrations.</h2>
        </div>

        <Tabs defaultValue="overview" className="w-full">
           <div className="flex justify-center mb-16">
             <TabsList className="bg-background/20 backdrop-blur-md border border-border/50 p-1 h-auto rounded-full flex flex-wrap justify-center">
                <TabsTrigger value="overview" className="rounded-full px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all gap-2 cursor-pointer">
                   <PlayCircle className="h-4 w-4" />
                   Full Platform Walkthrough
                </TabsTrigger>
                <TabsTrigger value="capabilities" className="rounded-full px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold transition-all gap-2 cursor-pointer">
                   <Presentation className="h-4 w-4" />
                   Core Capability Demos
                </TabsTrigger>
             </TabsList>
           </div>

           <TabsContent value="overview" className="mt-4 focus-visible:outline-none" forceMount>
              <motion.div 
                className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-border/60 bg-black/40 shadow-3xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                 <video 
                   src="/demos/scorpio-demo.mp4" 
                   controls 
                   className="w-full h-auto aspect-video cursor-pointer"
                 />
              </motion.div>
              <div className="mt-10 text-center max-w-3xl mx-auto space-y-4">
                 <p className="text-muted-foreground text-lg font-medium leading-relaxed italic">
                    "A comprehensive 5-minute deep-dive into the architectural nuances and pedagogical advantages of the Scorpio framework."
                 </p>
              </div>
           </TabsContent>

           <TabsContent value="capabilities" className="mt-8 focus-visible:outline-none" forceMount>
              <div className="flex justify-center">
                <DemoCarousel />
              </div>
              <div className="mt-10 text-center max-w-3xl mx-auto">
                 <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.25em] opacity-60">
                    Modular Breakdowns of Primary Instructional Workflows
                 </p>
              </div>
           </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
