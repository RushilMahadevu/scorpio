"use client";
import { getTeacherAssignment } from "@/lib/authenticated-fetch";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Copy, Globe, Users, Lock, Loader2, Sparkles, Waypoints, Filter, ArrowUpRight, Clock, Star, MapPinned } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useDepartmentPlan } from "@/hooks/use-department-plan";
import { DepartmentUpgradeDialog } from "@/components/teacher/department-upgrade-dialog";

interface WaypointQuestion {
  id?: string;
  type?: string;
  text?: string;
  options?: string[];
  correctAnswer?: string;
  answer?: string;
  expectedAnswer?: string;
  points?: number;
  [key: string]: unknown;
}

interface Waypoint {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName?: string;
  organizationId?: string;
  visibility: "private" | "network" | "global";
  questions: WaypointQuestion[];
  createdAt: Date;
  topic?: string;
  forkCount?: number;
}

export default function WaypointsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { isDepartmentPlan, isFreePlan, hasNoOrg } = useDepartmentPlan();

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [starterIds, setStarterIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("global");
  const [topicFilter, setTopicFilter] = useState("all");

  // Upgrade modal state
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<"waypoints" | "network-share">("waypoints");

  useEffect(() => {
    if (user && !authLoading) {
      fetchWaypoints();
    }
  }, [user, authLoading, activeTab, profile?.organizationId, topicFilter]);

  async function fetchWaypoints() {
    if (!user || authLoading) return;
    setLoading(true);
    try {
      let q;
      if (activeTab === "global") {
        if (topicFilter !== "all") {
          q = query(
            collection(db, "assignments"), 
            where("visibility", "==", "global"),
            where("topic", "==", topicFilter)
          );
        } else {
          q = query(collection(db, "assignments"), where("visibility", "==", "global"));
        }
      } else if (activeTab === "network") {
        const orgId = profile?.organizationId;
        if (!orgId) {
          setWaypoints([]);
          setLoading(false);
          return;
        }
        
        if (topicFilter !== "all") {
          q = query(
            collection(db, "assignments"), 
            where("visibility", "==", "network"),
            where("organizationId", "==", orgId),
            where("topic", "==", topicFilter)
          );
        } else {
          q = query(
            collection(db, "assignments"), 
            where("visibility", "==", "network"),
            where("organizationId", "==", orgId)
          );
        }
      } else {
        q = query(collection(db, "assignments"), where("teacherId", "==", user?.uid));
      }

      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
        forkCount: d.data().forkCount || 0
      })) as Waypoint[];
      
      setWaypoints(docs);

      // Track the first 3 global templates as starter waypoints for Free plan
      if (activeTab === "global" && (starterIds.length === 0 || topicFilter === "all")) {
        setStarterIds(prev => prev.length === 0 ? docs.slice(0, 3).map(d => d.id) : prev);
      }
    } catch (e: unknown) {
      console.error("Waypoints fetch error:", e);
      const errMsg = e instanceof Error ? e.message : "";
      if (errMsg.includes("index")) {
        toast.error("Database still indexing. This may take 2-3 minutes.");
      } else {
        toast.error("Failed to load waypoints.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isWaypointLocked = (waypoint: Waypoint, index: number): boolean => {
    if (!isFreePlan) return false;
    if (activeTab === "network") return true;
    if (starterIds.length > 0) {
      return !starterIds.includes(waypoint.id);
    }
    return index >= 3;
  };

  const handleFork = async (waypoint: Waypoint, index: number) => {
    if (isWaypointLocked(waypoint, index)) {
      setUpgradeFeature("waypoints");
      setIsUpgradeOpen(true);
      return;
    }

    try {
      const full = await getTeacherAssignment(waypoint.id);
      const fullData = full.data();
      const mergedQuestions = (fullData.questions || waypoint.questions || []).map((q: WaypointQuestion) => ({
        ...q,
        correctAnswer: q.correctAnswer || q.answer || q.expectedAnswer || ""
      }));

      sessionStorage.setItem(
        "forked_assignment",
        JSON.stringify({
          ...waypoint,
          ...fullData,
          questions: mergedQuestions
        })
      );
      router.push("/teacher/create?fork=true");
    } catch {
      // Fallback using waypoint questions directly
      const fallbackQuestions = (waypoint.questions || []).map((q: WaypointQuestion) => ({
        ...q,
        correctAnswer: q.correctAnswer || q.answer || q.expectedAnswer || ""
      }));
      sessionStorage.setItem(
        "forked_assignment",
        JSON.stringify({ ...waypoint, questions: fallbackQuestions })
      );
      router.push("/teacher/create?fork=true");
    }
  };

  const filteredWaypoints = waypoints.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "network" && !a.organizationId) return false;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Free Plan Waypoints Limit Banner */}
      {isFreePlan && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-foreground">Free Plan:</span>
              <span className="text-muted-foreground ml-1.5">
                You have access to 3 starter waypoints. Upgrade to a Department License to unlock all 20+ verified templates and department sharing.
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 font-bold"
            asChild
          >
            <Link href={hasNoOrg ? "/teacher/network" : "/teacher/network/billing"}>
              View Department Plan
            </Link>
          </Button>
        </div>
      )}

      {/* Dynamic Header */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-5 md:p-6 shadow-sm">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-32 w-32 rounded-full bg-gray-500/5 blur-[40px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/20 dark:border-primary/30 uppercase tracking-widest"
            >
              <Sparkles className="h-3 w-3" />
              Template library
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-semibold tracking-tight text-foreground"
            >
              Waypoints
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm leading-relaxed"
            >
              Find a shared assignment and copy it into your class.
            </motion.p>
            
            {isDepartmentPlan ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" />
                Department License Active
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-500" />
                Free Plan (3 Starter Waypoints)
              </motion.div>
            )}
          </div>
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="hidden lg:block"
          >
            <div className="h-24 w-24 rounded-full border-2 border-dashed border-border flex items-center justify-center relative bg-background/50 backdrop-blur-sm">
              <Waypoints className="h-10 w-10 text-muted-foreground" />
              <div className="absolute inset-0 border-t-2 border-primary/40 rounded-full animate-spin [animation-duration:10s]" />
              <div className="absolute inset-4 border-b-2 border-primary/20 rounded-full animate-spin [animation-duration:15s]" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="relative w-full lg:min-w-48 lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            aria-label="Search templates"
            placeholder="Search templates…"
            className="pl-11 h-12 bg-background dark:bg-background border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="h-auto w-full">
            <TabsTrigger value="global" className="min-h-9 gap-2 px-3">
              <Globe className="h-4 w-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="network" className="min-h-9 gap-2 px-3">
              <Users className="h-4 w-4" />
              Department
              {isFreePlan && <Lock className="h-3 w-3 text-purple-500 ml-1" />}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger aria-label="Topic" className="cursor-pointer w-full sm:w-44 data-[size=default]:h-12 bg-background dark:bg-background border-border">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="All Topics" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Topics</SelectItem>
            <SelectItem value="kinematics" className="cursor-pointer">Kinematics</SelectItem>
            <SelectItem value="dynamics" className="cursor-pointer">Dynamics</SelectItem>
            <SelectItem value="rotation" className="cursor-pointer">Rotational Physics</SelectItem>
            <SelectItem value="thermodynamics" className="cursor-pointer">Thermodynamics</SelectItem>
            <SelectItem value="em" className="cursor-pointer">Electromagnetism</SelectItem>
            <SelectItem value="waves" className="cursor-pointer">Waves & Optics</SelectItem>
            <SelectItem value="modern" className="cursor-pointer">Modern Physics</SelectItem>
            <SelectItem value="fluids" className="cursor-pointer">Fluid Mechanics</SelectItem>
            <SelectItem value="oscillations" className="cursor-pointer">Oscillations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
             <div className="relative">
               <Loader2 className="h-12 w-12 animate-spin text-primary" />
               <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
             </div>
             <p className="text-muted-foreground font-medium animate-pulse">Loading templates…</p>
          </div>
        ) : activeTab === "network" && isFreePlan ? (
          /* Locked Department Network Tab for Free Plan */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed border-purple-500/30 rounded-3xl bg-purple-500/5 max-w-xl mx-auto space-y-4"
          >
            <div className="bg-purple-500/15 w-16 h-16 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-500/20">
                <Lock className="h-3 w-3" />
                Department Feature
              </div>
              <h3 className="text-xl font-bold text-foreground">Department Template Sharing</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Collaborate with physics teachers across your school to share assignments, curriculum templates, and standardized rubrics.
              </p>
            </div>
            <Button
              onClick={() => {
                setUpgradeFeature("network-share");
                setIsUpgradeOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 cursor-pointer mt-2"
            >
              <Sparkles className="h-4 w-4" />
              {hasNoOrg ? "Join Department Network" : "Upgrade to Department License"}
            </Button>
          </motion.div>
        ) : filteredWaypoints.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30"
          >
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-border">
              <MapPinned className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No templates found</h3>
            <p className="text-muted-foreground max-w-sm px-4">
              {activeTab === "network" && !profile?.organizationId 
                ? "Switch to the Global tab or join a department network to see shared waypoints."
                : "Try another search or topic."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredWaypoints.map((waypoint, idx) => {
                const locked = isWaypointLocked(waypoint, idx);
                return (
                  <motion.div
                    key={waypoint.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <Card className={`group relative h-full flex flex-col overflow-hidden bg-card border transition-all duration-300 shadow-sm hover:shadow-md ${
                      locked ? "border-purple-500/30 dark:border-purple-500/20" : "border-border hover:border-primary/40"
                    }`}>
                      <div className={`absolute top-0 right-0 h-24 w-24 rounded-bl-full blur-2xl transition-colors ${
                        locked ? "bg-purple-500/10" : "bg-primary/5 group-hover:bg-primary/10"
                      }`} />
                      
                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {waypoint.questions?.length || 0} Components
                            </Badge>
                            {waypoint.topic && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 capitalize font-mono text-[10px]">
                                {waypoint.topic}
                              </Badge>
                            )}
                            {isFreePlan && !locked && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                                Starter Template
                              </Badge>
                            )}
                            {locked && (
                              <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                                <Lock className="h-2.5 w-2.5 mr-1" />
                                Department
                              </Badge>
                            )}
                          </div>
                          {waypoint.visibility === "global" ? (
                            <div title="Publicly Available" className="p-1.5 bg-blue-500/10 rounded-lg shrink-0">
                              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          ) : (
                            <div title="Department Shared" className="p-1.5 bg-orange-500/10 rounded-lg shrink-0">
                              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {waypoint.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground line-clamp-3 min-h-[4.5rem] mt-2 leading-relaxed">
                          {waypoint.description || "No description provided."}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0 flex-grow relative z-10">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-2 rounded-xl">
                          <span className="flex items-center gap-2">
                             <Star className="h-3 w-3 text-primary" />
                             {waypoint.forkCount || 0} Active Fork{(waypoint.forkCount || 0) !== 1 ? 's' : ''}
                          </span>
                          <span>v1</span>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-2 pb-6 px-6 relative z-10 mt-auto">
                        {locked ? (
                          <Button 
                            onClick={() => {
                              setUpgradeFeature("waypoints");
                              setIsUpgradeOpen(true);
                            }}
                            className="w-full h-11 font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                          >
                            <Lock className="h-4 w-4 mr-1.5" />
                            Unlock with Department
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleFork(waypoint, idx)}
                            className="w-full h-11 font-bold active:scale-[0.98] cursor-pointer"
                          >
                            <Copy className="h-4 w-4 mr-1.5" />
                            Acquire Template
                            <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all ml-1" />
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <DepartmentUpgradeDialog
        open={isUpgradeOpen}
        onOpenChange={setIsUpgradeOpen}
        feature={upgradeFeature}
        hasNoOrg={hasNoOrg}
      />
    </div>
  );
}
