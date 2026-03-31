"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Sparkles, BrainCircuit, RefreshCw, AlertTriangle,
  Lightbulb, BookOpen, Users, Zap, ArrowRight, Clock,
  TrendingUp, Share2, Network
} from "lucide-react";
import { StudentPortfolio } from "@/lib/types";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ─── Constants ────────────────────────────────────────────────── */

const MASTERY_CONFIG: Record<string, { label: string; color: string; dot: string; bar: string; ring: string }> = {
  Expert: { label: "Expert", color: "text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30", dot: "bg-emerald-500", bar: "bg-emerald-500", ring: "#10b981" },
  Advanced: { label: "Advanced", color: "text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/30", dot: "bg-indigo-500", bar: "bg-indigo-500", ring: "#6366f1" },
  Intermediate: { label: "Intermediate", color: "text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30", dot: "bg-amber-500", bar: "bg-amber-400", ring: "#f59e0b" },
  Beginner: { label: "Beginner", color: "text-zinc-500 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/30", dot: "bg-zinc-400", bar: "bg-zinc-400", ring: "#71717a" },
};

const DIALOG_MASTERY_COLORS: Record<string, string> = {
  Expert: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  Advanced: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  Intermediate: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  Beginner: "bg-zinc-500/10 text-zinc-300 border-zinc-500/30",
};

/* ─── Helpers ──────────────────────────────────────────────────── */

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(d: Date, opts?: Intl.DateTimeFormatOptions) {
  return d.toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric", year: "numeric" });
}

function resolveDate(raw: any): Date | null {
  if (!raw) return null;
  return raw?.seconds ? new Date(raw.seconds * 1000) : new Date(raw);
}

/* ─── Sub-components ──────────────────────────────────────────── */

function AvatarOrb({ name, mastery, size = "md" }: { name: string; mastery?: string; size?: "sm" | "md" | "lg" }) {
  const cfg = MASTERY_CONFIG[mastery ?? "Beginner"] ?? MASTERY_CONFIG.Beginner;
  const sizes = { sm: "w-8 h-8 text-[11px]", md: "w-11 h-11 text-[13px]", lg: "w-14 h-14 text-base" };
  return (
    <div className={cn(
      "relative rounded-full flex items-center justify-center shrink-0",
      "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/60 dark:to-purple-950/60",
      "ring-2 ring-offset-2 ring-offset-background",
      mastery ? "ring-indigo-300/50 dark:ring-indigo-700/50" : "ring-border",
      sizes[size]
    )}>
      <span className={cn("font-black tracking-tighter text-indigo-700 dark:text-indigo-300")}>
        {getInitials(name)}
      </span>
      {mastery && (
        <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background", cfg.dot)} />
      )}
    </div>
  );
}

function MasteryBadge({ level }: { level?: string }) {
  const cfg = MASTERY_CONFIG[level ?? "Beginner"] ?? MASTERY_CONFIG.Beginner;
  return (
    <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border", cfg.color)}>
      {cfg.label}
    </Badge>
  );
}

/* ─── 1. Network Figure (stats banner) ─────────────────────────── */

function NetworkFigure({
  students,
  portfolios,
}: {
  students: any[];
  portfolios: Record<string, StudentPortfolio>;
}) {
  const total = students.length;
  const assessed = students.filter(s => portfolios[s.uid]).length;
  const coveragePct = total > 0 ? Math.round((assessed / total) * 100) : 0;

  // Mastery distribution
  const dist = { Expert: 0, Advanced: 0, Intermediate: 0, Beginner: 0 };
  Object.values(portfolios).forEach(p => {
    const k = p.masteryLevel as keyof typeof dist;
    if (k in dist) dist[k]++;
  });
  const distEntries = Object.entries(dist) as [string, number][];

  // Coverage ring (SVG)
  const R = 28, C = 2 * Math.PI * R;
  const filled = C * (coveragePct / 100);

  return (
    <Card className="border-border/50 overflow-hidden relative">
      {/* Background wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-purple-500/[0.04] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <CardContent className="p-5 relative">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">

          {/* Left: title + coverage ring */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="relative shrink-0">
              <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
                <circle cx="38" cy="38" r={R} fill="none" strokeWidth="5"
                  className="stroke-border/30" />
                <circle cx="38" cy="38" r={R} fill="none" strokeWidth="5"
                  stroke="#6366f1" strokeLinecap="round"
                  strokeDasharray={`${filled} ${C}`}
                  style={{ transition: "stroke-dasharray 0.6s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black tracking-tighter leading-none">{coveragePct}%</span>
                <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">AI</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
                  <Network className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-base font-black tracking-tighter">Network Overview</h3>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug max-w-[200px]">
                AI portfolio coverage across your educator network
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px self-stretch bg-border/30" />

          {/* Center: key stats */}
          <div className="flex items-center gap-4 flex-wrap">
            <StatChip icon={<Users className="h-3.5 w-3.5" />} value={total} label="Students" />
            <StatChip icon={<Zap className="h-3.5 w-3.5 text-indigo-500" />} value={assessed} label="Profiled" accent />
            <StatChip icon={<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />} value={dist.Expert + dist.Advanced} label="High Mastery" />
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px self-stretch bg-border/30" />

          {/* Right: mastery distribution */}
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Mastery Distribution
            </p>
            {distEntries.map(([level, count]) => {
              const cfg = MASTERY_CONFIG[level];
              const pct = assessed > 0 ? Math.round((count / assessed) * 100) : 0;
              return (
                <div key={level} className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground w-20 shrink-0">{level}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-border/30 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", cfg.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold w-5 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatChip({ icon, value, label, accent }: { icon: React.ReactNode; value: number; label: string; accent?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-xl border",
      accent
        ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200/40 dark:border-indigo-800/40"
        : "bg-secondary/40 border-border/40"
    )}>
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <div className={cn("text-sm font-black leading-none", accent ? "text-indigo-700 dark:text-indigo-300" : "")}>{value}</div>
        <div className={cn("text-[9px] uppercase tracking-wider mt-0.5", accent ? "text-indigo-600/60 dark:text-indigo-400/60" : "text-muted-foreground")}>{label}</div>
      </div>
    </div>
  );
}

/* ─── 4. Radar / Spider Chart ──────────────────────────────────── */

function RadarChart({ strengths = [], weaknesses = [] }: { strengths?: string[]; weaknesses?: string[] }) {
  const allItems = [
    ...strengths.slice(0, 4).map(s => ({ label: s, score: 0.75 + Math.random() * 0.25, type: "strength" as const })),
    ...weaknesses.slice(0, 4).map(w => ({ label: w, score: 0.2 + Math.random() * 0.35, type: "weakness" as const })),
  ];

  if (allItems.length < 3) return null;

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
      <div className="flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          Cognitive Radar
        </h4>
      </div>
      <div className="rounded-xl bg-secondary/20 border border-border/30 p-4 w-full flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 220 220" width="220" height="220" className="overflow-visible">
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
            fill="#6366f1" fillOpacity="0.15"
            stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.7" />

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
      {/* Legend */}
      <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />Strength</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />Focus Area</span>
      </div>
    </div>
  );
}

/* ─── 2. Shareable Profile Card ────────────────────────────────── */

function ProfileCardView({ student, portfolio }: { student: any; portfolio: StudentPortfolio }) {
  const name = student.displayName || student.name || "Student";
  const lastUpdated = resolveDate(portfolio.lastUpdated);
  const cfg = MASTERY_CONFIG[portfolio.masteryLevel ?? "Beginner"] ?? MASTERY_CONFIG.Beginner;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${name} · ${portfolio.masteryLevel} Mastery\n\nStrengths:\n${portfolio.strengths?.map(s => `• ${s}`).join("\n") ?? "—"}\n\nFocus Areas:\n${portfolio.weaknesses?.map(w => `• ${w}`).join("\n") ?? "—"}\n\nSummary:\n${portfolio.aiSummary ?? "—"}`
      );
      toast.success("Profile copied to clipboard");
    }
  };

  return (
    <div className="space-y-4">
      {/* The visual card */}
      <div className="relative rounded-2xl overflow-hidden border border-indigo-200/30 dark:border-indigo-800/20 bg-gradient-to-br from-indigo-950/90 via-zinc-900 to-purple-950/80">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-base font-black text-white/90 tracking-tighter backdrop-blur-sm">
                {getInitials(name)}
              </div>
              <div>
                <p className="text-[17px] font-black tracking-tighter text-white leading-none">{name}</p>
                <p className="text-[10px] font-mono text-white/40 mt-0.5">{student.email || student.uid?.slice(0, 12)}</p>
              </div>
            </div>
            <div className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em] rounded-full border px-2.5 py-1",
              DIALOG_MASTERY_COLORS[portfolio.masteryLevel ?? "Beginner"] ?? DIALOG_MASTERY_COLORS.Beginner
            )}>
              {portfolio.masteryLevel} Mastery
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Strengths", value: portfolio.strengths?.length ?? 0, color: "text-emerald-400" },
              { label: "Focus Areas", value: portfolio.weaknesses?.length ?? 0, color: "text-rose-400" },
              { label: "Last Synced", value: lastUpdated ? formatDate(lastUpdated, { month: "short", day: "numeric" }) : "—", color: "text-indigo-300", small: true },
            ].map(stat => (
              <div key={stat.label} className="rounded-lg bg-white/5 border border-white/8 px-3 py-2 text-center">
                <div className={cn("font-black leading-none", stat.small ? "text-sm" : "text-xl", stat.color)}>{stat.value}</div>
                <div className="text-[8px] uppercase tracking-widest text-white/30 font-bold mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Top strengths */}
          {portfolio.strengths && portfolio.strengths.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400/70">Key Strengths</p>
              <div className="flex flex-wrap gap-1.5">
                {portfolio.strengths.slice(0, 4).map((s, i) => (
                  <span key={i} className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 max-w-[200px] truncate">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Watermark */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="h-3 w-3 text-indigo-400/50" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Scorpio AI Network</span>
            </div>
            <span className="text-[8px] font-mono text-white/20">{lastUpdated ? formatDate(lastUpdated, { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
          </div>
        </div>
      </div>

      {/* Share button */}
      <Button
        onClick={handleShare}
        variant="outline"
        size="sm"
        className="w-full h-8 gap-2 text-xs font-semibold cursor-pointer"
      >
        <Share2 className="h-3.5 w-3.5" />
        Copy Profile to Clipboard
      </Button>
    </div>
  );
}

/* ─── Main export ──────────────────────────────────────────────── */

export function NetworkStudents({ organizationId, teacherIds }: { organizationId: string; teacherIds: string[] }) {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<Record<string, StudentPortfolio>>({});
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  useEffect(() => {
    if (teacherIds.length === 0) { setLoading(false); return; }

    async function fetchStudents() {
      try {
        const studentsSnap = await getDocs(query(
          collection(db, "users"),
          where("teacherId", "in", teacherIds),
          where("role", "==", "student")
        ));
        const fetchedStudents = studentsSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
        setStudents(fetchedStudents);

        if (fetchedStudents.length > 0) {
          const studentIds = fetchedStudents.map(s => s.uid);
          const portfoliosSnap = await getDocs(query(
            collection(db, "portfolios"),
            where("organizationId", "==", organizationId)
          ));
          const portsData: Record<string, StudentPortfolio> = {};
          portfoliosSnap.docs.forEach(doc => {
            if (studentIds.includes(doc.id)) portsData[doc.id] = doc.data() as StudentPortfolio;
          });
          setPortfolios(portsData);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [teacherIds, organizationId]);

  const generatePortfolio = async (studentId: string) => {
    if (!user) return;
    setGeneratingFor(studentId);
    try {
      const res = await fetch("/api/teacher/network/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: user.uid, studentId, organizationId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate portfolio");
      setPortfolios(prev => ({ ...prev, [studentId]: data.portfolio }));
      toast.success("AI Portfolio successfully compiled.");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate portfolio");
    } finally {
      setGeneratingFor(null);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
              <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <Loader2 className="absolute -inset-1 h-12 w-12 animate-spin text-indigo-400/40" />
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-semibold">Indexing Network</p>
        </CardContent>
      </Card>
    );
  }

  const assessed = students.filter(s => portfolios[s.uid]);
  const pending = students.filter(s => !portfolios[s.uid]);

  return (
    <div className="space-y-5">
      {/* ① Network Figure Banner */}
      <NetworkFigure students={students} portfolios={portfolios} />

      {/* Empty State */}
      {students.length === 0 && (
        <Card className="border-border/40 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/50 border border-border/40 flex items-center justify-center">
              <Users className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">No students in network</p>
              <p className="text-[12px] text-muted-foreground max-w-xs">
                Share your Teacher ID with students to connect them to this network.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessed grid */}
      {assessed.length > 0 && (
        <div className="space-y-2">
          <SectionDivider color="indigo" label="Profiled" count={assessed.length} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assessed.map(student => (
              <StudentCard key={student.uid} student={student} portfolio={portfolios[student.uid]}
                generatingFor={generatingFor} onGenerate={generatePortfolio} />
            ))}
          </div>
        </div>
      )}

      {/* Pending grid */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <SectionDivider color="zinc" label="Pending Analysis" count={pending.length} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pending.map(student => (
              <StudentCard key={student.uid} student={student} portfolio={undefined}
                generatingFor={generatingFor} onGenerate={generatePortfolio} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Section divider ─────────────────────────────────────────── */

function SectionDivider({ color, label, count }: { color: "indigo" | "zinc"; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className={cn("w-1.5 h-1.5 rounded-full", color === "indigo" ? "bg-indigo-500" : "bg-zinc-400")} />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <div className="flex-1 h-px bg-border/30" />
      <span className="text-[10px] text-muted-foreground">{count}</span>
    </div>
  );
}

/* ─── Student Card ─────────────────────────────────────────────── */

function StudentCard({
  student, portfolio, generatingFor, onGenerate,
}: {
  student: any; portfolio?: StudentPortfolio; generatingFor: string | null; onGenerate: (uid: string) => void;
}) {
  const name = student.displayName || student.name || "Anonymous Student";
  const isGenerating = generatingFor === student.uid;
  const lastUpdated = resolveDate(portfolio?.lastUpdated ?? null);

  return (
    <Card className={cn(
      "group relative overflow-hidden border transition-all duration-200",
      portfolio
        ? "border-indigo-200/40 dark:border-indigo-800/30 hover:border-indigo-300/60 dark:hover:border-indigo-700/50 hover:shadow-lg hover:shadow-indigo-500/5"
        : "border-border/50 hover:border-border hover:shadow-sm"
    )}>
      {portfolio && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />}
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-3">
          <AvatarOrb name={name} mastery={portfolio?.masteryLevel} />
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold truncate">{name}</p>
              {portfolio && <MasteryBadge level={portfolio.masteryLevel} />}
            </div>
            <p className="text-[10px] font-mono text-muted-foreground truncate">
              {student.email || student.uid.slice(0, 12) + "…"}
            </p>
            {lastUpdated && (
              <div className="flex items-center gap-1 pt-0.5">
                <Clock className="h-2.5 w-2.5 text-muted-foreground/50" />
                <span className="text-[9px] text-muted-foreground/60 font-mono">{formatDate(lastUpdated)}</span>
              </div>
            )}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className={cn(
                "h-8 px-3 gap-1.5 text-xs font-semibold shrink-0 rounded-lg transition-all cursor-pointer",
                portfolio
                  ? "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}>
                {portfolio ? (
                  <><Sparkles className="h-3 w-3" />View<ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" /></>
                ) : (
                  <><Sparkles className="h-3 w-3" />Analyze</>
                )}
              </Button>
            </DialogTrigger>
            <PortfolioDialog student={student} portfolio={portfolio} isGenerating={isGenerating} onGenerate={onGenerate} />
          </Dialog>
        </div>
        {portfolio?.strengths && portfolio.strengths.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="flex flex-wrap gap-1.5">
              {portfolio.strengths.slice(0, 3).map((s, i) => (
                <span key={i} className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/30 max-w-[180px] truncate">{s}</span>
              ))}
              {portfolio.strengths.length > 3 && (
                <span className="text-[9px] text-muted-foreground px-1">+{portfolio.strengths.length - 3} more</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Portfolio Dialog ─────────────────────────────────────────── */

function PortfolioDialog({
  student, portfolio, isGenerating, onGenerate,
}: {
  student: any; portfolio?: StudentPortfolio; isGenerating: boolean; onGenerate: (uid: string) => void;
}) {
  const name = student.displayName || student.name || "Student";
  const [tab, setTab] = useState<"insights" | "radar" | "card">("insights");
  const lastUpdated = resolveDate(portfolio?.lastUpdated ?? null);

  return (
    <DialogContent showCloseButton={false} className="sm:max-w-[720px] p-0 overflow-hidden border-border/50 outline-none gap-0">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/90 via-zinc-900 to-purple-950/70 dark:from-indigo-950/60 dark:via-zinc-950 dark:to-purple-950/50 px-6 pt-5 pb-5 border-b border-white/[0.06]">
        <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        {/* Top row */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm shrink-0">
              <span className="text-sm font-black text-white/90 tracking-tighter">{getInitials(name)}</span>
            </div>
            {portfolio && (
              <Badge variant="outline" className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] rounded-full border px-2.5 py-0.5",
                DIALOG_MASTERY_COLORS[portfolio.masteryLevel ?? "Beginner"] ?? DIALOG_MASTERY_COLORS.Beginner
              )}>
                {portfolio.masteryLevel} Mastery
              </Badge>
            )}
          </div>
          <DialogClose asChild>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white/90 shrink-0 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="pointer-events-none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
        </div>

        {/* Title */}
        <div className="relative z-10 space-y-0.5">
          <DialogTitle className="text-[22px] font-black tracking-tighter text-white leading-none">
            {name}'s AI Profile
          </DialogTitle>
          <DialogDescription className="text-white/45 text-xs font-medium mt-1">
            Network-wide cognitive footprint · Derived from AI Tutor sessions
          </DialogDescription>
        </div>

        {/* Tabs (only when portfolio exists) */}
        {portfolio && (
          <div className="relative z-10 flex items-center gap-1 mt-4">
            {(["insights", "radar", "card"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all cursor-pointer",
                  tab === t
                    ? "bg-white/15 text-white border border-white/15"
                    : "text-white/40 hover:text-white/70 hover:bg-white/8"
                )}
              >
                {t === "insights" ? "Insights" : t === "radar" ? "Radar" : "Profile Card"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="bg-background max-h-[55vh] overflow-y-auto px-6 py-5">
        {portfolio ? (
          <>
            {tab === "insights" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InsightPanel icon={<Lightbulb className="h-3.5 w-3.5" />} title="Demonstrated Strengths"
                    color="emerald" items={portfolio.strengths} emptyText="No prominent strengths detected yet." />
                  <InsightPanel icon={<AlertTriangle className="h-3.5 w-3.5" />} title="Focus Areas"
                    color="rose" items={portfolio.weaknesses} emptyText="No pronounced weaknesses detected." />
                </div>
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Cognitive Trajectory</h4>
                  </div>
                  <div className="rounded-xl bg-secondary/30 border border-border/40 px-4 py-3">
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-serif whitespace-pre-wrap">{portfolio.aiSummary}</p>
                  </div>
                </div>
              </div>
            )}
            {tab === "radar" && (
              <RadarChart strengths={portfolio.strengths} weaknesses={portfolio.weaknesses} />
            )}
            {tab === "card" && (
              <ProfileCardView student={student} portfolio={portfolio} />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border/40 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-indigo-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">No portfolio evaluated</p>
              <p className="text-[12px] text-muted-foreground max-w-[280px] leading-relaxed">
                Generate an AI portfolio to evaluate this student's understanding across all Tutor sessions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-6 py-3.5 border-t border-border/40 bg-secondary/20">
        {lastUpdated ? (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground font-mono">
              Synced {lastUpdated.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ) : <span />}
        <Button onClick={() => onGenerate(student.uid)} disabled={isGenerating} size="sm" className={cn(
          "cursor-pointer h-8 px-5 gap-2 text-xs font-bold rounded-lg transition-all shadow-sm",
          portfolio
            ? "bg-secondary border border-border/60 text-foreground hover:bg-secondary/80 hover:border-indigo-300/50 dark:hover:border-indigo-700/50 hover:text-indigo-600 dark:hover:text-indigo-400"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20 shadow-md"
        )}>
          {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {isGenerating ? "Synthesizing…" : portfolio ? "Refresh Synthesis" : "Generate Portfolio"}
        </Button>
      </div>
    </DialogContent>
  );
}

/* ─── Insight Panel ────────────────────────────────────────────── */

function InsightPanel({ icon, title, color, items, emptyText }: {
  icon: React.ReactNode; title: string; color: "emerald" | "rose"; items?: string[]; emptyText: string;
}) {
  const dotColor = color === "emerald" ? "bg-emerald-500" : "bg-rose-500";
  const headingColor = color === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const bgColor = color === "emerald"
    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/30 dark:border-emerald-800/20"
    : "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/30 dark:border-rose-800/20";

  return (
    <div className={cn("rounded-xl border p-4 space-y-3", bgColor)}>
      <div className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em]", headingColor)}>
        {icon}{title}
      </div>
      <ul className="space-y-2">
        {items && items.length > 0 ? items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px]">
            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", dotColor)} />
            <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{item}</span>
          </li>
        )) : (
          <li className="text-[11px] text-muted-foreground italic">{emptyText}</li>
        )}
      </ul>
    </div>
  );
}
