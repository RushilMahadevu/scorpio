"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, User, BrainCircuit, RefreshCw, AlertTriangle, Lightbulb, Target, BookOpen } from "lucide-react";
import { StudentPortfolio } from "@/lib/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function NetworkStudents({ organizationId, teacherIds }: { organizationId: string, teacherIds: string[] }) {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<Record<string, StudentPortfolio>>({});
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  useEffect(() => {
    if (teacherIds.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchStudents() {
      try {
        const studentsSnap = await getDocs(query(
          collection(db, "users"),
          where("teacherId", "in", teacherIds),
          where("role", "==", "student")
        ));
        const fetchedStudents = studentsSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
        setStudents(fetchedStudents);

        // Fetch their portfolios
        if (fetchedStudents.length > 0) {
          const studentIds = fetchedStudents.map(s => s.uid);
          // Firestore 'in' query supports up to 10 elements. If we have >10 students, we need chunking.
          // For simplicity and scaling, we can just fetch all portfolios in the organization or listen to them.
          const portfoliosSnap = await getDocs(query(
            collection(db, "portfolios"),
            where("organizationId", "==", organizationId)
          ));

          const portsData: Record<string, StudentPortfolio> = {};
          portfoliosSnap.docs.forEach(doc => {
            if (studentIds.includes(doc.id)) {
              portsData[doc.id] = doc.data() as StudentPortfolio;
            }
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
        body: JSON.stringify({
          teacherId: user.uid,
          studentId,
          organizationId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate portfolio");

      setPortfolios(prev => ({
        ...prev,
        [studentId]: data.portfolio
      }));
      toast.success("AI Portfolio successfully compiled.");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate portfolio");
    } finally {
      setGeneratingFor(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Network Students & AI Portfolios
        </CardTitle>
        <CardDescription>
          View all students connected to your network educators and generate AI-driven summaries of their cognitive progress, strengths, and weaknesses from Tutor chats.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Student</TableHead>
              <TableHead>Teacher ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Insights</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No students have joined this network yet. Connect students by sharing your Teacher ID.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const portfolio = portfolios[student.uid];

                return (
                  <TableRow key={student.uid}>
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs">
                          {(student.displayName || student.name || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            {student.displayName || student.name || "Anonymous Student"}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {student.email || student.uid.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] font-mono text-muted-foreground">{student.teacherId?.slice(0, 8) || "--"}</span>
                    </TableCell>
                    <TableCell>
                      {portfolio ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            portfolio.masteryLevel === "Expert" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              portfolio.masteryLevel === "Advanced" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                portfolio.masteryLevel === "Intermediate" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  "bg-gray-100 text-gray-700 border-gray-200"
                          )}>
                            {portfolio.masteryLevel || "Assessed"}
                          </Badge>
                          <span className="hidden lg:inline text-[9px] text-muted-foreground">
                            Last built: {
                              (portfolio.lastUpdated as any)?.seconds
                                ? new Date((portfolio.lastUpdated as any).seconds * 1000).toLocaleDateString()
                                : new Date(portfolio.lastUpdated as any).toLocaleDateString()}
                          </span>

                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] font-normal opacity-60">Pending Analysis</Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant={portfolio ? "default" : "outline"}
                            size="sm"
                            className={cn("h-8 gap-2 cursor-pointer transition-all", portfolio ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "")}
                          >
                            <Sparkles className={cn("h-3.5 w-3.5", portfolio ? "text-indigo-200" : "text-muted-foreground")} />
                            {portfolio ? "View Portfolio" : "Analyze"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] border-indigo-100 dark:border-indigo-900/40 outline-none p-0 overflow-hidden">
                          <DialogHeader className="p-6 bg-zinc-50 dark:bg-zinc-900 border-b relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="flex justify-between items-start relative z-10 w-full mb-2">
                              <div>
                                <DialogTitle className="text-2xl font-black text-foreground">
                                  {student.displayName || student.name || "Student"}'s AI Profile
                                </DialogTitle>
                                <DialogDescription className="mt-1">
                                  Network-wide cognitive footprint mapped from AI Tutor sessions.
                                </DialogDescription>
                              </div>
                              {portfolio && (
                                <Badge variant="outline" className={cn(
                                  "text-[10px] font-black uppercase tracking-[0.2em] border-indigo-200 bg-indigo-50 text-indigo-700 self-start mt-1",
                                  portfolio.masteryLevel === "Expert" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    portfolio.masteryLevel === "Advanced" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                      portfolio.masteryLevel === "Intermediate" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                        ""
                                )}>
                                  {portfolio.masteryLevel || "Beginner"} Mastery
                                </Badge>
                              )}
                            </div>
                          </DialogHeader>

                          <div className="p-8 max-h-[60vh] overflow-y-auto w-full bg-white dark:bg-zinc-950">
                            {portfolio ? (
                              <div className="space-y-8 w-full">
                                {/* Insights Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                  <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                      <Lightbulb className="h-4 w-4" /> Demonstrated Strengths
                                    </h4>
                                    <ul className="space-y-2">
                                      {portfolio.strengths?.length > 0 ? portfolio.strengths.map((str, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                          <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{str}</span>
                                        </li>
                                      )) : (
                                        <li className="text-xs text-muted-foreground italic">No prominent strengths detected yet.</li>
                                      )}
                                    </ul>
                                  </div>
                                  <div className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-600">
                                      <AlertTriangle className="h-4 w-4" /> Focus Areas
                                    </h4>
                                    <ul className="space-y-2">
                                      {portfolio.weaknesses?.length > 0 ? portfolio.weaknesses.map((wk, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                          <span className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{wk}</span>
                                        </li>
                                      )) : (
                                        <li className="text-xs text-muted-foreground italic">No pronounced weaknesses detected.</li>
                                      )}
                                    </ul>
                                  </div>
                                </div>

                                {/* Summary Narrative */}
                                <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                  <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                                    <BrainCircuit className="h-4 w-4" /> Cognitive Trajectory Overview
                                  </h4>
                                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-serif whitespace-pre-wrap">
                                    {portfolio.aiSummary}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                  <BookOpen className="h-8 w-8 text-muted-foreground/60" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">No Portfolio Evaluated</h3>
                                <p className="text-muted-foreground text-sm max-w-[300px] mb-6">
                                  Generate a new portfolio to instantly evaluate this student's understanding by analyzing their recent AI Tutor chats.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Footer Actions */}
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t flex justify-between items-center w-full relative z-10">
                            {portfolio ? (
                              <span className="text-[10px] text-muted-foreground">
                                Last sync: {
                                  (portfolio.lastUpdated as any)?.seconds
                                    ? new Date((portfolio.lastUpdated as any).seconds * 1000).toLocaleString()
                                    : new Date(portfolio.lastUpdated as any).toLocaleString()
                                }
                              </span>

                            ) : <span />}
                            <Button
                              onClick={() => generatePortfolio(student.uid)}
                              disabled={generatingFor === student.uid}
                              className={cn("cursor-pointer h-9 px-6 font-bold shadow-sm transition-all", portfolio ? "bg-white border text-black hover:bg-zinc-100 hover:text-indigo-600" : "bg-indigo-600 text-white hover:bg-indigo-700")}
                            >
                              {generatingFor === student.uid ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <RefreshCw className={cn("h-3.5 w-3.5 mr-2", portfolio ? "text-indigo-600" : "text-indigo-200")} />
                              )}
                              {generatingFor === student.uid ? "Synthesizing..." : portfolio ? "Refresh Synthesis" : "Generate Portfolio"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
