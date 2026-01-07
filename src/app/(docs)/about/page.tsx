import Link from "next/link";
import { Metadata } from "next";
import { Info } from "lucide-react";

export const metadata: Metadata = {
  title: "About Scorpio | AI-Powered Physics Tutoring Vision",
  description: "Learn about the mission behind Scorpio: replacing traditional LMS frustration with AI-powered Socratic tutoring that helps physics students truly understand.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl w-full">
      <div className="flex items-center gap-4 mb-8 border-b border-border/40 pb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Info size={32} className="text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">About Scorpio</h1>
      </div>

      <div className="text-lg text-muted-foreground space-y-6 leading-relaxed">
        <p>
          <strong>Scorpio</strong> is a next-generation, AI-powered physics learning environment engineered to transform instruction and foster breakthrough understanding.
        </p>
        <hr className="my-6 opacity-20 border-border" />
        <div className="text-left space-y-6">
          <div>
            <span className="font-bold text-foreground text-xl block mb-4">Key Innovations</span>
            <ul className="list-disc pl-6 mt-2 space-y-3">
              <li>
                <span className="font-semibold text-foreground">4-Layer AI Constraint System:</span> Ensures every interaction is grounded in physics, Socratic guidance, and proper notation.
              </li>
              <li>
                <span className="font-semibold text-foreground">Research-Grade AI Tutoring:</span> Context-aware hints, adaptive guidance, and rigorous academic integrity.
              </li>
              <li>
                <span className="font-semibold text-foreground">Advanced Math Tools:</span> KaTeX rendering and a visual math builder for intuitive equation creation.
              </li>
              <li>
                <span className="font-semibold text-foreground">Immersive Space-Themed UI:</span> Parallax depth, glassmorphism, and real-time collaboration.
              </li>
              <li>
                <span className="font-semibold text-foreground">Real-Time Data & Accessibility:</span> Built with Next.js, Firebase, and Google Gemini for speed and inclusivity.
              </li>
            </ul>
          </div>
          <hr className="my-6 opacity-20 border-border" />
          <div>
            <span className="font-bold text-foreground text-xl block mb-4">Why Scorpio?</span>
            <ul className="list-disc pl-6 mt-2 space-y-3">
              <li>Transforms physics from rote memorization to true understanding</li>
              <li>Bridges the gap between traditional LMS and modern cognitive needs</li>
              <li>Supports both students and teachers with research-driven features</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start gap-4 mt-12 pt-8 border-t border-border/40">
        <a
          href="https://github.com/RushilMahadevu/scorpio"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.853 0 1.337-.012 2.419-.012 2.749 0 .267.18.577.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z" /></svg>
          View on GitHub
        </a>
        <Link
          href="https://github.com/RushilMahadevu/scorpio#readme"
          target="_blank"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-input bg-background hover:bg-accent text-foreground font-semibold shadow-sm transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Project README
        </Link>
      </div>
      <div className="mt-8 text-sm text-muted-foreground">
        <span>
          Made by <span className="text-foreground font-semibold">Rushil Mahadevu</span>
        </span>
      </div>
    </div>
  );
}
