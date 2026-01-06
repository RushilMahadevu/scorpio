"use client";

import { SpaceBackground } from "@/components/ui/space-background";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <SpaceBackground />
      
      <div className="relative z-10 container px-4 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Logo size={40} className="text-foreground" />
              <span className="text-2xl font-extrabold tracking-tight">Scorpio</span>
            </Link>
          </div>

          <div className="relative inline-block">
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground/20">
              404
            </h1>
            <motion.div 
               animate={{ 
                 y: [0, -10, 0],
                 rotate: [0, 5, 0]
               }}
               transition={{ 
                 duration: 4,
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
               className="absolute -top-4 -right-8 text-primary shadow-primary/20 hidden md:block"
            >
              <div className="p-3 bg-primary/10 rounded-full backdrop-blur-xs border border-primary/20">
                <div className="w-4 h-4 rounded-full bg-primary animate-ping" />
              </div>
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Lost in Space
            </h2>
            <p className="text-muted-foreground text-lg max-w-[500px] mx-auto leading-relaxed">
              The page you are looking for has drifted beyond our gravitational pull. 
              Let&apos;s navigate you back to safe orbit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Button asChild size="lg" className="h-12 px-8 rounded-full shadow-lg hover:shadow-primary/20 transition-all gap-2 group">
              <Link href="/">
                <Home className="w-4 h-4 transition-transform" />
                Back Home
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 px-8 rounded-full backdrop-blur-sm border-border hover:bg-muted/50 transition-all gap-2 group cursor-pointer"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 transition-transform" />
              Return Previous
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
