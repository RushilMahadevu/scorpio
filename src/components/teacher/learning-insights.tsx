"use client";

import { useState } from "react";
import {
  ArrowUpRight, BarChart3, ChevronDown, CircleDot, Lightbulb, Loader2, RefreshCw, Search, Share2, Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StudentPortfolio } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface InsightsStudent {
  id: string;
  name: string;
  email?: string;
}

const masteryLevels = ["Expert", "Advanced", "Intermediate", "Beginner"] as const;

function formatUpdated(value?: StudentPortfolio["lastUpdated"] | string) {
  if (!value) return null;
  const date = typeof value === "object" && "seconds" in value
    ? new Date(value.seconds * 1000)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function LearningInsights({
  students,
  portfolios,
  updatingStudentId,
  onUpdate,
  demo = false,
}: {
  students: InsightsStudent[];
  portfolios: Record<string, StudentPortfolio>;
  updatingStudentId: string | null;
  onUpdate: (id: string) => void;
  demo?: boolean;
}) {
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();
  const profiled = students.filter(({ id }) => portfolios[id]);
  const coverage = students.length ? Math.round(profiled.length / students.length * 100) : 0;
  const visible = students.filter(({ name, email }) =>
    name.toLowerCase().includes(term) || email?.toLowerCase().includes(term)
  );
  const distribution = masteryLevels.map(level => ({
    level,
    count: profiled.filter(({ id }) => portfolios[id].masteryLevel === level).length,
  }));

  return (
    <div className="space-y-4">
      <div className="@container">
        <div className="grid gap-4 @2xl:grid-cols-2">
          <Card className="relative isolate gap-0 overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 via-card to-card p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Users aria-hidden="true" className="size-4" />
              </span>
              <h2 className="text-sm font-semibold">Portfolio coverage</h2>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight tabular-nums">{coverage}%</span>
              <span className="text-xs text-muted-foreground">of students profiled</span>
            </div>
            {students.length > 0 && (
              <progress
                aria-label="Students with a learning profile"
                value={profiled.length}
                max={students.length}
                className="mt-3 h-1.5 w-full appearance-none overflow-hidden rounded-full bg-primary/10 [&::-webkit-progress-bar]:bg-primary/10 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
              />
            )}
            <dl className="mt-4 grid grid-cols-3 divide-x border-t border-primary/15 pt-3">
              {[
                ["Students", students.length],
                ["Profiled", profiled.length],
                ["Pending", students.length - profiled.length],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col-reverse gap-0.5 px-3 first:pl-0 last:pr-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-lg leading-tight font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="gap-0 p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                <BarChart3 aria-hidden="true" className="size-4" />
              </span>
              <h2 className="text-sm font-semibold">Mastery distribution</h2>
            </div>
            {profiled.length > 0 ? (
              <dl className="mt-4 space-y-3">
                {distribution.map(({ level, count }) => (
                  <div key={level} className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 text-xs">
                    <dt className="text-muted-foreground">{level}</dt>
                    <dd className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted" aria-hidden="true">
                        <div className="h-full rounded-full bg-primary/75" style={{ width: `${count / profiled.length * 100}%` }} />
                      </div>
                      <span className="w-6 text-right font-medium tabular-nums">{count}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Mastery levels appear once students have profiles.</p>
            )}
          </Card>
        </div>
      </div>

      <Card className="gap-0 py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
          <h2 className="text-base font-semibold">Student profiles</h2>
          {students.length > 0 && (
            <div className="relative w-full sm:w-56">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" aria-label="Search students" placeholder="Search students" value={search} onChange={event => setSearch(event.target.value)} className="pl-9" />
            </div>
          )}
        </div>
        {visible.length > 0 ? (
          <ul className="divide-y border-t">
            {visible.map(student => (
              <StudentProfileRow
                key={student.id}
                student={student}
                portfolio={portfolios[student.id]}
                updatingStudentId={updatingStudentId}
                onUpdate={onUpdate}
                demo={demo}
              />
            ))}
          </ul>
        ) : (
          <p role="status" className="border-t px-5 py-8 text-center text-sm text-muted-foreground">
            {students.length ? "No students match your search." : "Student profiles will appear here when students join your classes or department network."}
          </p>
        )}
      </Card>
    </div>
  );
}

function StudentProfileRow({
  student, portfolio, updatingStudentId, onUpdate, demo,
}: {
  student: InsightsStudent;
  portfolio?: StudentPortfolio;
  updatingStudentId: string | null;
  onUpdate: (id: string) => void;
  demo: boolean;
}) {
  const updated = formatUpdated(portfolio?.lastUpdated);
  const updating = updatingStudentId === student.id;
  const initials = student.name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-5">
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials}</span>
      <div className="min-w-0 flex-1 basis-24">
        <p className="break-words text-sm font-medium">{student.name}</p>
        {student.email && <p className="truncate text-xs text-muted-foreground">{student.email}</p>}
      </div>
      <Badge variant={portfolio ? "secondary" : "outline"} className="text-xs font-medium">
        {portfolio?.masteryLevel || "Pending"}
      </Badge>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto cursor-pointer text-primary"
            aria-label={`${portfolio ? "View profile for" : "Analyze"} ${student.name}`}
          >
            {portfolio ? "View profile" : "Analyze"} <ArrowUpRight />
          </Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="gap-1.5 px-4 pt-5 pb-4 pr-10 text-left sm:px-6 sm:pr-12">
            <DialogTitle className="break-words leading-tight">{student.name}</DialogTitle>
            <DialogDescription>
              {portfolio ? `${portfolio.masteryLevel} mastery · Learning profile` : "Learning profile pending"}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto border-t p-4 sm:px-6">
            {portfolio ? (
              <Tabs defaultValue="insights" className="gap-4">
                <TabsList className="h-auto max-w-full flex-wrap">
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="radar">Radar</TabsTrigger>
                  <TabsTrigger value="card">Profile card</TabsTrigger>
                </TabsList>
                <TabsContent value="insights" className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InsightTopics title="Strengths" items={portfolio.strengths} kind="strength" />
                    <InsightTopics title="Focus areas" items={portfolio.weaknesses} kind="focus" />
                  </div>
                  {portfolio.aiSummary && (
                    <details className="group rounded-xl border px-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                        AI summary <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground group-open:rotate-180" />
                      </summary>
                      <p className="pb-3 text-sm leading-relaxed whitespace-pre-wrap break-words text-muted-foreground">{portfolio.aiSummary}</p>
                    </details>
                  )}
                </TabsContent>
                <TabsContent value="radar">
                  <RadarChart strengths={portfolio.strengths} weaknesses={portfolio.weaknesses} />
                </TabsContent>
                <TabsContent value="card">
                  <ProfileCard student={student} portfolio={portfolio} />
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-sm text-muted-foreground">
                {demo ? "This demo student has no sample profile." : "Generate a portfolio to summarize this student’s learning activity in Raise."}
              </p>
            )}
          </div>
          {(portfolio || !demo) && (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3 sm:px-6">
              {updated && <p className="mr-auto text-xs text-muted-foreground">Updated {updated}</p>}
              <Button
                size="sm"
                variant={portfolio ? "outline" : "default"}
                className="cursor-pointer"
                disabled={updatingStudentId !== null}
                onClick={() => onUpdate(student.id)}
              >
                {updating ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                {updating ? "Updating…" : portfolio ? "Refresh profile" : "Generate portfolio"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </li>
  );
}

function InsightTopics({ title, items = [], kind }: { title: string; items?: string[]; kind: "strength" | "focus" }) {
  const Icon = kind === "strength" ? Lightbulb : CircleDot;

  return (
    <section className={cn(
      "min-w-0 space-y-2 rounded-xl border p-3.5",
      kind === "strength" ? "border-primary/15 bg-primary/5" : "bg-muted/35",
    )}>
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon aria-hidden="true" className={cn("size-4", kind === "strength" ? "text-primary" : "text-muted-foreground")} />
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="divide-y divide-border/70 text-sm break-words text-muted-foreground">
          {items.map((item, index) => <li key={index} className="py-2 first:pt-0 last:pb-0">{item}</li>)}
        </ul>
      ) : <p className="text-sm text-muted-foreground">None recorded yet.</p>}
    </section>
  );
}

function ProfileCard({ student, portfolio }: { student: InsightsStudent; portfolio: StudentPortfolio }) {
  async function copyProfile() {
    const profile = [
      `${student.name} · ${portfolio.masteryLevel} mastery`,
      `Strengths\n${portfolio.strengths?.join("\n") || "—"}`,
      `Focus areas\n${portfolio.weaknesses?.join("\n") || "—"}`,
      `Summary\n${portfolio.aiSummary || "—"}`,
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(profile);
      toast.success("Profile copied to clipboard.");
    } catch {
      toast.error("Could not copy the profile.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-xl border bg-muted/25 p-4">
        <div>
          <h3 className="break-words font-semibold">{student.name}</h3>
          <p className="text-xs text-muted-foreground">{portfolio.masteryLevel} mastery</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {portfolio.strengths?.length ?? 0} strengths · {portfolio.weaknesses?.length ?? 0} focus areas
        </p>
        {portfolio.strengths?.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {portfolio.strengths.slice(0, 4).map((strength, index) => (
              <li key={index} className="max-w-full break-words rounded-md border bg-background px-2 py-1 text-xs">{strength}</li>
            ))}
          </ul>
        )}
      </div>
      <Button size="sm" variant="outline" className="cursor-pointer" onClick={copyProfile}><Share2 /> Copy profile</Button>
    </div>
  );
}
function RadarChart({ strengths = [], weaknesses = [] }: { strengths?: string[]; weaknesses?: string[] }) {
  const allItems = [
    ...strengths.slice(0, 4).map(s => ({ label: s, score: 0.85, type: "strength" as const })),
    ...weaknesses.slice(0, 4).map(w => ({ label: w, score: 0.4, type: "weakness" as const })),
  ];

  if (allItems.length < 3) {
    return <p className="text-sm text-muted-foreground">At least three topics are needed to show a radar.</p>;
  }

  const cx = 110, cy = 110, maxR = 80;
  const n = allItems.length;
  const angleStep = (2 * Math.PI) / n;

  function polarToXY(i: number, r: number) {
    const angle = i * angleStep - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  // Axis lines + labels
  const axes = allItems.map((item, i) => {
    const outer = polarToXY(i, maxR);
    const labelPos = polarToXY(i, maxR + 22);
    return { ...outer, label: item.label, lx: labelPos.x, ly: labelPos.y };
  });

  // Data polygon
  const dataPoints = allItems.map((item, i) => polarToXY(i, maxR * item.score));
  const polyPoints = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full justify-center overflow-hidden rounded-xl border bg-muted/30 p-5">
        <svg viewBox="0 0 220 220" width="220" height="220" aria-hidden="true" className="max-w-full overflow-visible">
          {/* Grid rings */}
          {rings.map((r, ri) => {
            const pts = Array.from({ length: n }, (_, i) => {
              const p = polarToXY(i, maxR * r);
              return `${p.x},${p.y}`;
            }).join(" ");
            return (
              <polygon key={ri} points={pts} fill="none"
                stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" className="text-foreground" />
            );
          })}

          {/* Axis lines */}
          {axes.map((ax, i) => (
            <line key={i} x1={cx} y1={cy} x2={ax.x} y2={ax.y}
              stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" className="text-foreground" />
          ))}

          {/* Data fill */}
          <polygon points={polyPoints}
            fill="currentColor" className="text-primary" fillOpacity="0.15"
            stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" />

          {/* Data dots */}
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.5"
              fill={allItems[i].type === "strength" ? "#10b981" : "#f43f5e"}
              stroke="white" strokeWidth="1.5" />
          ))}

          {/* Labels */}
          {axes.map((ax, i) => {
            const words = ax.label.split(" ").slice(0, 3);
            const isLeft = ax.lx < cx - 10;
            const anchor = isLeft ? "end" : ax.lx > cx + 10 ? "start" : "middle";
            return (
              <text key={i} x={ax.lx} y={ax.ly} textAnchor={anchor}
                dominantBaseline="middle" fontSize="7.5" fontWeight="600"
                fill="currentColor" fillOpacity="0.6" className="text-foreground font-sans">
                {words.slice(0, 1).join(" ")}
              </text>
            );
          })}
        </svg>
      </div>
      <p className="text-center text-xs text-muted-foreground">This chart shows topic categories. The distance from the center does not represent a score.</p>
      <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />Strength</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />Focus Area</span>
      </div>
    </div>
  );
}
