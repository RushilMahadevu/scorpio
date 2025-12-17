"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SpaceBackground } from "@/components/ui/space-background";


export default function AboutPage() {
  const router = useRouter();
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <SpaceBackground />
      <div className="relative z-10 max-w-2xl w-full bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 mt-16 mb-16 border border-primary/30 ring-1 ring-primary/10">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
        <img src="/favicon.svg" alt="Scorpio Logo" className="w-12 h-12 mx-auto mb-6 drop-shadow-lg" />
        <h1 className="text-4xl font-extrabold text-center mb-6 text-foreground">About Scorpio</h1>
        <div className="text-lg text-center mb-6 text-muted-foreground space-y-4 leading-relaxed">
          <p>
            <strong>Scorpio</strong> is a modern, space-inspired physics learning platform designed to help students and teachers <em>collaborate, assign, and grade assignments with ease.</em>
          </p>
          <p>
            Built with <strong>
              <a
                href="https://github.com/RushilMahadevu/scorpio?tab=readme-ov-file#ai-tutoring-system"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                research-grade AI tutoring capabilities
              </a>
            </strong>, it enables systematic testing of educational AI design patterns.
          </p>
          <p>
            Explore the <em>cosmos of knowledge</em> with interactive tools, real-time feedback, and a stellar user experience.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <a
            href="https://github.com/RushilMahadevu/scorpio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.853 0 1.337-.012 2.419-.012 2.749 0 .267.18.577.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z" /></svg>
            View on GitHub
          </a>
          <Link
            href="https://github.com/RushilMahadevu/scorpio#readme"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Project README
          </Link>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <span>
            Made by <span className="text-foreground font-semibold">Rushil Mahadevu</span>
          </span>
        </div>
      </div>
    </div>
  );
}
