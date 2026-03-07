"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  url: string;
  author: string;
}

// Simple helper for relative time
function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function GitHubActivity() {
  const [githubData, setGithubData] = useState<{ totalCommits: string; recentCommits: GitHubCommit[] } | null>(null);
  const [isLoadingGithub, setIsLoadingGithub] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/github/stats");
        if (res.ok) {
          const data = await res.json();
          setGithubData(data);
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
      } finally {
        setIsLoadingGithub(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <section id="activity" className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">Recent Development</h2>
              {githubData ? (
                <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/20 font-bold">
                  {githubData.totalCommits} Commits
                </Badge>
              ) : (
                <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
              )}
            </div>
            <p className="text-muted-foreground font-medium text-sm">Real-time telemetry from the Scorpio core repository.</p>
          </div>
          <Link 
            href="https://github.com/RushilMahadevu/scorpio/commits/main" 
            target="_blank"
            className="text-sm font-bold text-primary hover:underline flex items-center"
          >
            View all
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-4">
          {isLoadingGithub ? (
            // Loading Skeletons
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border bg-card/10 flex items-start gap-4 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </div>
            ))
          ) : githubData?.recentCommits.map((commit, i) => (
            <motion.div
              key={commit.sha}
              className="p-5 rounded-2xl border bg-card/10 hover:bg-card/30 transition-all group flex items-start gap-4"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Github className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">{commit.sha.substring(0, 7)}</span>
                  <span className="text-xs text-muted-foreground font-medium">• {getRelativeTime(commit.date)}</span>
                </div>
                <p className="font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
                  {commit.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium italic">
                  By {commit.author}
                </p>
              </div>
              <Link 
                href={commit.url} 
                target="_blank"
                className="opacity-0 group-hover:opacity-100 transition-opacity self-center p-2 rounded-full hover:bg-muted"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
          {!isLoadingGithub && !githubData && (
            <div className="text-center p-10 border border-dashed rounded-2xl">
              <p className="text-sm text-muted-foreground">Unable to load activity. Check <Link href="https://github.com/RushilMahadevu/scorpio" className="underline">GitHub</Link> for latest updates.</p>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
