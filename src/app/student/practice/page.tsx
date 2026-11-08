"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceHeader, WorkspaceSummary } from "@/components/ui/workspace";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";

interface PracticeEntry {
  id: string;
  topic: string;
  difficulty: string;
  correct: boolean;
  timestamp?: { seconds: number };
}

export default function Practice() {
  const { user } = useAuth();
  const studentId = user?.uid;
  const [history, setHistory] = useState<PracticeEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    let current = true;

    getDocs(query(collection(db, "practice_history"), where("studentId", "==", studentId)))
      .then((snapshot) => {
        if (!current) return;
        const entries = snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id }) as PracticeEntry);
        setHistory(entries.sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0)));
      })
      .catch((error) => {
        if (!current) return;
        console.error("Error loading practice history:", error);
        setLoadError(true);
      });

    return () => { current = false; };
  }, [studentId]);

  const correct = history?.filter((entry) => entry.correct).length ?? 0;
  const firstMiss = history?.findIndex((entry) => !entry.correct) ?? -1;
  const streak = firstMiss === -1 ? history?.length ?? 0 : firstMiss;

  return (
    <div className="space-y-6">
      <WorkspaceHeader title="Practice" description="Review past physics practice attempts." />

      <section className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5" aria-labelledby="practice-status">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="practice-status" className="text-base font-semibold">New practice is paused</h2>
          <Badge variant="secondary">Offline</Badge>
        </div>
        <p className="text-sm text-muted-foreground">AI problem generation is paused for students and teachers to reduce token use.</p>
        <Button asChild variant="outline" size="sm"><Link href="/student/resources">Browse class resources</Link></Button>
      </section>

      {history && history.length > 0 && (
        <WorkspaceSummary label="Practice summary" items={[
          { label: "Attempts", value: history.length },
          { label: "Accuracy", value: `${Math.round(correct / history.length * 100)}%` },
          { label: "Current streak", value: streak },
        ]} />
      )}

      <section className="space-y-3" aria-labelledby="practice-history">
        <h2 id="practice-history" className="text-lg font-semibold">Recent attempts</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {loadError ? (
            <p role="status" className="p-4 text-sm text-muted-foreground">Practice history couldn’t load. Refresh to try again.</p>
          ) : !history ? (
            <p role="status" className="p-4 text-sm text-muted-foreground">Loading practice history…</p>
          ) : history.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No practice attempts yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {history.slice(0, 5).map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium">{entry.topic}</p>
                    <p className="text-xs capitalize text-muted-foreground">{entry.difficulty}</p>
                  </div>
                  <Badge variant={entry.correct ? "secondary" : "outline"}>{entry.correct ? "Correct" : "Incorrect"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
