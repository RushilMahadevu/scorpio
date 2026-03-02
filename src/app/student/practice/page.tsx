"use client";

import { useState, useEffect } from "react";
import { 
  BowArrow, 
  Zap, 
  BrainCircuit, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ArrowRight,
  Lock,
  Trophy,
  History,
  Sparkles,
  HelpCircle,
  Copy,
  Check
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/auth-context";
import { doc, getDoc, updateDoc, increment, collection, addDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Search } from "lucide-react";

// Re-using categories from Equation Vault
const TOPICS = [
  { id: "kinematics", name: "Kinematics" },
  { id: "dynamics", name: "Dynamics" },
  { id: "energy", name: "Energy & Momentum" },
  { id: "electricity", name: "Electricity" },
  { id: "thermo", name: "Thermodynamics" },
  { id: "optics", name: "Waves & Optics" },
];

const DIFFICULTIES = [
  { id: "novice", name: "Novice", level: 1, color: "bg-emerald-500" },
  { id: "adept", name: "Adept", level: 2, color: "bg-amber-500" },
  { id: "master", name: "Master", level: 3, color: "bg-rose-500" },
];

interface GeneratedProblem {
  id: string;
  problem: string;
  latex: string;
  correctAnswer: string;
  explanation: string;
  hints: string[];
  unit: string;
}

export default function Practice() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("novice");
  const [sessionQuantity, setSessionQuantity] = useState(1);
  const [problem, setProblem] = useState<GeneratedProblem | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string; points: number } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [practiceStatus, setPracticeStatus] = useState({ used: 0, limit: 0, remaining: 0, perMember: 0, connected: false });
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ 
    accuracy: 0, 
    totalSolves: 0, 
    correctSolves: 0, 
    streak: 0,
    topicMastery: {} as Record<string, { correct: number, total: number }>
  });
  const [isInSession, setIsInSession] = useState(false);
  const [problemsInCurrentSession, setProblemsInCurrentSession] = useState(0);

  // Fetch practice limit and history
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      // We don't return if profile is missing, we try to resolve locally first
      let orgId = profile?.organizationId;

      // Deep Resolution for Organization ID
      try {
        if (!orgId) {
          // If we have teacherId directly (from current profile)
          const effectiveTeacherId = profile?.teacherId;
          if (effectiveTeacherId) {
            const tDoc = await getDoc(doc(db, "users", effectiveTeacherId));
            if (tDoc.exists()) orgId = tDoc.data().organizationId;
          }
          
          // Re-check: If still no orgId, try falling back to the student's primary record
          if (!orgId) {
            const sDoc = await getDoc(doc(db, "students", user.uid));
            if (sDoc.exists()) {
              const sData = sDoc.data();
              if (sData.teacherId) {
                const tDoc = await getDoc(doc(db, "users", sData.teacherId));
                if (tDoc.exists()) orgId = tDoc.data().organizationId;
              }
            }
          }
        }
      } catch (e) {
        console.error("Internal Provisioning Error:", e);
      }

      if (!orgId) {
        setPracticeStatus(prev => ({ ...prev, limit: 0, connected: false }));
        return;
      }

      // Fetch Network/Organization Practice Limit
      const orgDoc = await getDoc(doc(db, "organizations", orgId));
      if (orgDoc.exists()) {
        const data = orgDoc.data();
        const limit = data.practiceLimit || 0;
        const used = data.practiceUsageCurrent || 0;
        const perMember = data.practiceLimitPerStudent || 0;
        setPracticeStatus({ used, limit, remaining: Math.max(0, limit - used), perMember, connected: true });
        
        // Auto-Provision Profile
        if (profile && !profile.organizationId) {
          updateDoc(doc(db, "users", user.uid), { organizationId: orgId }).catch(() => {});
        }
      } else {
        setPracticeStatus(prev => ({ ...prev, connected: false }));
      }

      // Fetch Student History & Calculate Stats
      const historySnap = await getDocs(
        query(
          collection(db, "practice_history"),
          where("studentId", "==", user.uid)
        )
      );
      
      const historyData: any[] = historySnap.docs
        .map(d => ({
          id: d.id,
          ...d.data()
        }))
        .sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      
      setHistory(historyData.slice(0, 5)); // Only show last 5 in UI list

      // Calculate Practice Stats
      if (historyData.length > 0) {
        const total = historyData.length;
        const correct = historyData.filter(h => h.correct === true).length;
        
        // Calculate Streak
        let currentStreak = 0;
        for (const entry of historyData) {
          if (entry.correct === true) currentStreak++;
          else if (currentStreak > 0) break; // Break on first failure if we already found a streak
          // If the most recent one is false, streak is 0 and we continue checking (or break if newest is false)
        }

        // Calculate Topic Mastery
        const mastery: Record<string, { correct: number, total: number }> = {};
        historyData.forEach(h => {
          if (!mastery[h.topic]) mastery[h.topic] = { correct: 0, total: 0 };
          mastery[h.topic].total++;
          if (h.correct === true) mastery[h.topic].correct++;
        });

        const calculatedAccuracy = Math.round((correct / total) * 100);

        setStats({
          accuracy: calculatedAccuracy,
          totalSolves: total,
          correctSolves: correct,
          streak: currentStreak,
          topicMastery: mastery
        });
      }
    }
    fetchData();
  }, [user, profile?.organizationId]);

  const generateProblem = async () => {
    const topicToUse = customTopic || selectedTopic;
    if (!topicToUse || practiceStatus.remaining <= 0) {
      if (!topicToUse) {
        toast.error("Please identify a research target first.");
      } else if (practiceStatus.remaining <= 0) {
         toast.error("Your class has reached its monthly practice limit for this period.");
      }
      return;
    }

    // Reset session context if starting fresh OR resetting completed session
    if (!problem || problemsInCurrentSession >= sessionQuantity - 1) {
      setIsInSession(true);
      setProblemsInCurrentSession(0);
    } else {
      // Progress to the next simulation unit
      setProblemsInCurrentSession(prev => prev + 1);
    }

    setLoading(true);
    setProblem(null);
    setFeedback(null);
    setAnswer("");
    setShowExplanation(false);
    setCurrentHintIndex(-1);

    let retryCount = 0;
    const maxRetries = 2;

    const performGeneration = async () => {
      try {
        const response = await fetch("/api/practice/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            topic: topicToUse,
            difficulty: selectedDifficulty,
            studentId: user?.uid,
            courseId: profile?.courseId,
            progress: problemsInCurrentSession
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          // If it's a structural "unstable result" error, allow retry
          if (err.error?.includes("unstable result") && retryCount < maxRetries) {
            retryCount++;
            return performGeneration();
          }
          throw new Error(err.error || "Failed to generate problem.");
        }

        const parsed = await response.json();
        setProblem({ ...parsed, id: Date.now().toString() });

        setPracticeStatus(prev => ({ 
          ...prev, 
          used: prev.used + 1, 
          remaining: Math.max(0, prev.remaining - 1) 
        }));
      } catch (error: any) {
        console.error("Generation error:", error);
        toast.error(error?.message || "Failed to calibrate the engine. Retrying...");
      } finally {
        setLoading(false);
      }
    };

    await performGeneration();
  };

  const checkAnswer = async () => {
    if (!problem || !answer) return;
    setSubmitting(true);

    try {
      // Numerical proximity check (allows 2% error)
      const cleanInput = (val: string) => val.replace(/[^\d.eE-]/g, '');
      const userVal = parseFloat(cleanInput(answer));
      const correctVal = parseFloat(cleanInput(problem.correctAnswer));
      
      if (isNaN(userVal) || isNaN(correctVal)) {
        throw new Error("Invalid numerical values detected. Matrix requires digits.");
      }

      const diff = Math.abs(userVal - correctVal);
      const margin = Math.abs(correctVal * 0.02);
      
      const isCorrect = diff <= margin;
      
      setFeedback({
        correct: isCorrect,
        message: isCorrect ? "Precise calculation! You've mastered this concept." : "Variance detected. Review the internal logic below.",
        points: isCorrect ? (selectedDifficulty === "master" ? 50 : selectedDifficulty === "adept" ? 30 : 15) : 0
      });

      // Log success in history via server API (bypasses direct Firestore permission issues)
      if (user) {
        await fetch("/api/practice/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            studentId: user.uid,
            topic: customTopic || selectedTopic,
            difficulty: selectedDifficulty,
            correct: isCorrect
          }),
        });
      }
    } catch (error: any) {
      console.error("Evaluation error:", error);
      toast.error(error.message || "Evaluation error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-200 dark:border-zinc-800 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="bg-primary/10 p-3 rounded-2xl">
                <BowArrow className="h-8 w-8 text-primary" />
             </div>
             <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary px-3 py-1">Simulation Mode</Badge>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">
             Practice
          </h1>
          <p className="text-muted-foreground font-medium text-lg mt-2 max-w-md leading-snug">
             High-fidelity physics practice environment for curriculum mastery.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Internal Analytics Pill */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm self-end">
            <div className="flex items-center gap-1.5 border-r border-zinc-200 dark:border-zinc-700 pr-3 mr-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[10px] font-black font-mono">{stats.accuracy}%</span>
            </div>
            <div className="flex items-center gap-1.5 border-r border-zinc-200 dark:border-zinc-700 pr-3 mr-1">
              <Trophy className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-[10px] font-black font-mono">{stats.streak}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[10px] font-black font-mono">{stats.totalSolves}</span>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border ring-1 ring-zinc-100 dark:ring-zinc-800 shadow-sm min-w-[300px]">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 underline decoration-dotted decoration-primary/30" title="Total problems remaining for your entire school network.">Network Fuel</span>
                <span className="text-xs font-black font-mono text-primary flex items-center gap-2">
                   {practiceStatus.connected && practiceStatus.limit > 0 ? (
                     <>
                       {practiceStatus.remaining} <span className="opacity-20">/</span> {practiceStatus.limit}
                     </>
                   ) : (
                     <span className="text-zinc-500 italic text-[10px]">{!practiceStatus.connected ? "Network Disconnected" : "Limit Not Set"}</span>
                   )}
                </span>
             </div>
             
             {practiceStatus.perMember > 0 && (
               <div className="flex justify-between items-center mb-3">
                 <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Allowance per student</span>
                 <span className="text-[10px] font-black font-mono">{practiceStatus.perMember}</span>
               </div>
             )}

             <Progress value={practiceStatus.limit > 0 ? (practiceStatus.remaining / practiceStatus.limit) * 100 : 0} className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
             <p className="text-[9px] text-muted-foreground mt-3 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className={`h-1 w-1 rounded-full ${practiceStatus.connected ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`} />
                {practiceStatus.connected ? "Dynamic Network Capacity" : "Provisioning Status: Standby"}
             </p>
          </div>
        </div>
      </div>

      {!isInSession ? (
        <div className="grid gap-10 md:grid-cols-12 max-w-5xl">
          {/* Main Controls */}
          <div className="md:col-span-8 space-y-10">
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">01. Practice Target</h3>
                   <span className="text-[10px] font-bold text-primary/60 uppercase">Select or Search</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {TOPICS.map(topic => (
                     <button
                       key={topic.id}
                       onClick={() => {
                         setSelectedTopic(topic.id);
                         setCustomTopic("");
                       }}
                       className={`cursor-pointer h-24 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center gap-2 px-4 text-center ring-1 ${selectedTopic === topic.id ? 'bg-primary text-primary-foreground ring-primary shadow-xl shadow-primary/10' : 'bg-white dark:bg-zinc-900 ring-zinc-100 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700'}`}
                     >
                        <span className={`text-[11px] font-black uppercase tracking-tight leading-tight ${selectedTopic === topic.id ? 'text-primary-foreground' : 'text-zinc-600 dark:text-zinc-400'}`}>{topic.name}</span>
                     </button>
                   ))}
                </div>
                
                <div className="relative group">
                   <Input 
                     placeholder="Deploy custom research topic..."
                     value={customTopic}
                     onChange={(e) => {
                       setCustomTopic(e.target.value);
                       setSelectedTopic(null);
                     }}
                     className="h-16 rounded-3xl pl-14 bg-zinc-50 dark:bg-zinc-900/50 border-none shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                   />
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-4">
              <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">02. Simulation Intensity</h3>
                  <div className="flex gap-3">
                     {DIFFICULTIES.map(diff => (
                       <button
                         key={diff.id}
                         onClick={() => setSelectedDifficulty(diff.id)}
                         className={`cursor-pointer flex-1 py-4 rounded-2xl border-2 transition-all text-center ${selectedDifficulty === diff.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}`}
                       >
                          <span className={`text-[10px] font-black uppercase block ${selectedDifficulty === diff.id ? 'text-primary' : 'text-muted-foreground opacity-60'}`}>{diff.name}</span>
                          <span className="text-[8px] font-mono opacity-40 mt-1 block">
                             {diff.id === 'novice' ? '15pts' : diff.id === 'adept' ? '30pts' : '50pts'}
                          </span>
                       </button>
                     ))}
                  </div>
              </section>

              <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">03. Unit Count</h3>
                    <Badge variant="outline" className="font-mono text-[10px] px-2 py-0 border-primary/20 text-primary">
                       {sessionQuantity} UNITS
                    </Badge>
                  </div>
                  <div className="pt-2 px-2">
                    <Slider 
                      defaultValue={[sessionQuantity]} 
                      max={10} 
                      min={1} 
                      step={1} 
                      onValueChange={(vals) => setSessionQuantity(vals[0])}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between mt-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                       <span>Quick</span>
                       <span>Deep Study</span>
                    </div>
                  </div>
              </section>
            </div>

            <Button 
                onClick={generateProblem} 
                disabled={loading || (!selectedTopic && !customTopic) || practiceStatus.remaining <= 0}
                className="cursor-pointer w-full h-20 rounded-[2rem] text-xl font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-primary/10 disabled:opacity-40 mt-10"
            >
                {loading ? (
                  <div className="flex items-center gap-3">
                     <RefreshCw className="h-6 w-6 animate-spin opacity-50" />
                     Developing a Customized Practice...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                     <Zap className="h-6 w-6 fill-current" />
                     Generate Simulation
                  </div>
                )}
            </Button>
          </div>

          {/* Side History */}
          <div className="md:col-span-4 space-y-10">
             <div className="space-y-6">
                <div className="flex items-center gap-3 text-zinc-400">
                   <History className="h-4 w-4" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Previous Logs</h3>
                </div>
                <div className="space-y-3">
                   {history.length > 0 ? history.map((h, i) => (
                     <div key={i} className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl ring-1 ring-zinc-100 dark:ring-zinc-800 transition-hover hover:scale-[1.02]">
                        <div className="flex flex-col gap-1">
                           <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[120px]">{h.topic}</span>
                           <span className="text-[9px] font-mono opacity-40">INTENSITY_{h.difficulty.toUpperCase()}</span>
                        </div>
                        {h.correct ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500 opacity-60" />}
                     </div>
                   )) : (
                     <p className="text-xs text-muted-foreground font-medium italic opacity-40 px-2 leading-relaxed">System logs empty. Run experiment to initialize data stream.</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      ) : !problem ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-12 animate-in fade-in duration-1000">
           <div className="relative">
              <div className="h-32 w-32 rounded-full border-[6px] border-primary/10 border-t-primary animate-[spin_1.5s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Zap className="h-10 w-10 text-primary animate-pulse" />
              </div>
           </div>
           <div className="text-center space-y-3 max-w-sm mx-auto">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Initializing Unit 0{problemsInCurrentSession + 1}</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              </div>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Synchronizing Physics Matrix</p>
           </div>
        </div>
      ) : (
        <div className="grid gap-12 md:grid-cols-12 max-w-6xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="md:col-span-8 space-y-8">
             {/* The Problem Card */}
             <div className="bg-white dark:bg-zinc-950 rounded-[3rem] overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8">
                   <Button variant="ghost" size="sm" onClick={() => { setProblem(null); setIsInSession(false); }} className="cursor-pointer h-10 rounded-2xl opacity-40 hover:opacity-100 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest px-4 border">
                      Terminate Session
                   </Button>
                </div>
                
                <div className="p-10 pt-16 md:p-14 md:pt-20 space-y-10">
                   <div className="space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-[0.1em] px-4 py-1.5 rounded-full text-[10px]">
                           {customTopic || TOPICS.find(t => t.id === selectedTopic)?.name || selectedTopic}
                        </Badge>
                        <Badge variant="outline" className="font-black uppercase tracking-[0.1em] px-4 py-1.5 rounded-full text-[10px] border-zinc-200 dark:border-zinc-800 text-muted-foreground">
                           {selectedDifficulty.toUpperCase()}
                        </Badge>
                        {sessionQuantity > 1 && (
                          <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-zinc-400">
                             Unit 0{problemsInCurrentSession + 1} <span className="opacity-20 mx-1">/</span> 0{sessionQuantity}
                          </div>
                        )}
                      </div>
                      <MarkdownRenderer 
                        noProse 
                        className="text-2xl md:text-3xl font-black leading-tight tracking-tight text-zinc-900 dark:text-zinc-100"
                      >
                         {problem.problem}
                      </MarkdownRenderer>
                   </div>

                   <div className="bg-zinc-50 dark:bg-zinc-900/50 p-12 md:p-16 rounded-[2.5rem] text-center ring-1 ring-zinc-100 dark:ring-zinc-800/50 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-grid-zinc-900/[0.02] dark:bg-grid-white/[0.02]" />
                      <div className="text-3xl md:text-4xl transition-all group-hover:scale-105 duration-500 relative z-10">
                         <BlockMath math={problem.latex.replace(/^\$\$?|\$\$?$/g, "").trim()} />
                      </div>
                   </div>

                   <div className="space-y-6 pt-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                           <Input 
                             placeholder="Awaiting numerical input..." 
                             value={answer}
                             onChange={(e) => setAnswer(e.target.value)}
                             className="h-20 rounded-[2rem] text-2xl font-black pl-8 border-none ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-primary shadow-lg bg-zinc-50 dark:bg-zinc-900/30"
                             disabled={!!feedback}
                             onKeyDown={(e) => { if (e.key === 'Enter' && answer && !feedback) checkAnswer(); }}
                           />
                           <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-primary/40 uppercase tracking-widest text-xs pointer-events-none">
                              {problem.unit}
                           </span>
                        </div>
                        <Button 
                           onClick={checkAnswer} 
                           disabled={submitting || !answer || !!feedback}
                           className="cursor-pointer h-20 px-12 rounded-[2rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-lg shadow-2xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-40"
                        >
                           {submitting ? <RefreshCw className="h-6 w-6 animate-spin" /> : "Verify Logic"}
                        </Button>
                      </div>

                      {/* Feedback Message */}
                      {feedback && (
                        <div className={`p-8 rounded-[2rem] flex items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 ${feedback.correct ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/20'}`}>
                           <div className="flex items-center gap-6">
                             {feedback.correct ? <CheckCircle2 className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                             <div className="flex-1">
                                <p className="font-black text-lg uppercase tracking-tighter leading-none">{feedback.message}</p>
                                {feedback.correct && <p className="text-[11px] font-black opacity-60 mt-2 uppercase tracking-widest">+{feedback.points} Conceptual Credits Synchronized</p>}
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-3">
                              {!feedback.correct && !showExplanation && (
                                <Button variant="ghost" size="sm" onClick={() => setShowExplanation(true)} className="cursor-pointer font-black text-[11px] uppercase tracking-widest underline decoration-2 underline-offset-4">Logic Pathway</Button>
                              )}
                              {feedback.correct && problemsInCurrentSession < sessionQuantity - 1 && (
                                <Button size="lg" onClick={generateProblem} className="cursor-pointer bg-emerald-600 dark:bg-emerald-500 text-white font-black text-sm uppercase rounded-[1.25rem] px-8 py-6 h-auto shadow-xl">Continue Experiment</Button>
                              )}
                              {feedback.correct && problemsInCurrentSession >= sessionQuantity - 1 && (
                                 <div className="flex items-center gap-4 bg-zinc-900 text-white rounded-[1.25rem] pl-6 pr-2 py-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Complete</span>
                                    <Button onClick={() => { setProblem(null); setIsInSession(false); }} className="cursor-pointer bg-white text-zinc-900 font-black text-[10px] uppercase rounded-xl h-10 hover:bg-zinc-100 flex items-center gap-2">
                                      Return to Hub
                                      <ArrowRight className="h-3 w-3" />
                                    </Button>
                                 </div>
                              )}
                           </div>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Detailed Explanation */}
             {showExplanation && (
                <div className="bg-zinc-900 text-white rounded-[3rem] p-12 md:p-16 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="bg-background p-3 rounded-2xl">
                         <BrainCircuit className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-black italic tracking-tighter">Analytical Resolution</h3>
                   </div>
                   <MarkdownRenderer className="prose-p:text-zinc-400 prose-p:text-lg prose-strong:text-white prose-p:leading-relaxed prose-p:font-medium">
                     {problem.explanation}
                   </MarkdownRenderer>
                   <div className="mt-12 pt-12 border-t border-white/5 flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">End of Logical Stream</p>
                      <Button onClick={generateProblem} className="cursor-pointer rounded-2xl font-black uppercase text-xs h-14 px-10 bg-white text-zinc-900 hover:bg-zinc-200 transition-all">
                         {problemsInCurrentSession < sessionQuantity - 1 ? "Next Simulation Unit" : "Reset Research"}
                      </Button>
                   </div>
                </div>
             )}
          </div>

          <div className="md:col-span-4 space-y-10">
             <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] p-10 ring-1 ring-zinc-100 dark:ring-zinc-800/80">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-10 flex items-center gap-2">
                   <HelpCircle className="h-3.5 w-3.5 text-primary" />
                   Hints
                </h3>
                <div className="space-y-6">
                   {problem.hints.map((hint, i) => (
                     <div key={i} className="group relative">
                        {currentHintIndex >= i ? (
                          <div className="p-6 bg-white dark:bg-zinc-950 rounded-[1.5rem] text-xs font-medium border-l-4 border-primary shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-900 transition-all duration-500 animate-in slide-in-from-right-2">
                             {hint}
                          </div>
                        ) : (
                          <button 
                             onClick={() => setCurrentHintIndex(i)}
                             disabled={currentHintIndex < i - 1 && i > 0}
                             className={`cursor-pointer w-full p-6 rounded-[1.5rem] border-2 border-dashed flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-widest transition-all ${currentHintIndex === i - 1 || i === 0 ? 'border-primary/20 text-primary hover:border-primary/40 hover:bg-primary/5' : 'border-zinc-200 dark:border-zinc-800 opacity-20 cursor-not-allowed'}`}
                          >
                             <span>Hint {i + 1}</span>
                             <Lock className="h-3 w-3" />
                          </button>
                        )}
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-primary/5 p-10 rounded-[2.5rem] ring-1 ring-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Zap className="h-20 w-20" />
                </div>
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Core Protocol</h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic opacity-80">
                   "Numerical accuracy in simulations reflects the precision required in high-energy physics. Even a 2% variance is critical."
                </p>
             </div>

             <Button 
                onClick={generateProblem} 
                variant="outline" 
                className="cursor-pointer w-full h-20 rounded-[2rem] border-2 border-zinc-100 dark:border-zinc-800 font-black text-xs uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
             >
                Relaunch Simulation
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
