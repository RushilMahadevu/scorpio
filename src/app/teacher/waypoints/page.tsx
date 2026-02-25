"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Copy, Globe, Users, Lock, Loader2, Sparkles, Waypoints, Filter, ArrowUpRight, Clock, Star, MapPinned } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface Waypoint {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName?: string;
  organizationId?: string;
  visibility: "private" | "network" | "global";
  questions: any[];
  createdAt: any;
  topic?: string;
  forkCount?: number;
}

export default function WaypointsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("global");
  const [topicFilter, setTopicFilter] = useState("all");

  useEffect(() => {
    if (user && !authLoading) {
      fetchWaypoints();
    }
  }, [user, authLoading, activeTab, profile?.organizationId, topicFilter]);

  async function fetchWaypoints() {
    if (!user || authLoading) return;
    setLoading(true);
    try {
      console.log("Fetching waypoints for tab:", activeTab, "Org:", profile?.organizationId);
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
        forkCount: Math.floor(Math.random() * 20) // Simulated for visual interest
      })) as Waypoint[];
      
      setWaypoints(docs);
    } catch (e: any) {
      console.error("Waypoints fetch error:", e);
      if (e.message?.includes("index")) {
        toast.error("Database still indexing. This may take 2-3 minutes.");
      } else {
        toast.error("Failed to load waypoints.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleFork = (waypoint: Waypoint) => {
    sessionStorage.setItem("forked_assignment", JSON.stringify(waypoint));
    router.push("/teacher/create?fork=true");
  };

  const filteredWaypoints = waypoints.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "network" && !a.organizationId) return false;
    
    return matchesSearch;
  });

  return (
    <div className="container p-6 mx-auto space-y-8">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-white/5 p-5 md:p-6 shadow-sm">
        {/* Animated Background Elements */}
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
              Shared Reference System
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white"
            >
              Waypoints
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-600 dark:text-neutral-400 text-sm leading-relaxed"
            >
              A high-precision catalog of scientific assignments and benchmarks. 
              Search, explore, and integrate modules into your curriculum.
            </motion.p>
            
            {profile?.organizationId ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400/80 bg-emerald-500/10 dark:bg-emerald-500/5 w-fit px-2 py-0.5 rounded-md border border-emerald-500/20 dark:border-emerald-500/10"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse" />
                Network Node: {profile.organizationId}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400/80 bg-amber-500/10 dark:bg-amber-500/5 w-fit px-2 py-0.5 rounded-md border border-amber-500/20 dark:border-amber-500/10"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-500" />
                Stand-alone Instance
              </motion.div>
            )}
          </div>
          
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="hidden lg:block"
          >
            <div className="h-24 w-24 rounded-full border-2 border-dashed border-zinc-200 dark:border-white/10 flex items-center justify-center relative bg-white/50 dark:bg-transparent backdrop-blur-sm">
              <Waypoints className="h-10 w-10 text-zinc-400 dark:text-white/20" />
              {/* Spinning Ring */}
              <div className="absolute inset-0 border-t-2 border-primary/40 rounded-full animate-spin [animation-duration:10s]" />
              <div className="absolute inset-4 border-b-2 border-primary/20 rounded-full animate-spin [animation-duration:15s]" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-100 dark:bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-zinc-200 dark:border-white/10">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-neutral-500" />
          <Input 
            placeholder="Scan for waypoints (e.g. projectile motion, waves)..." 
            className="pl-11 h-12 bg-white dark:bg-neutral-900/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="global" onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-zinc-200 dark:bg-neutral-900 border border-zinc-200 dark:border-white/5 p-1 h-12">
            <TabsTrigger value="global" className="cursor-pointer gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Globe className="h-4 w-4" />
              Cosmos
            </TabsTrigger>
            <TabsTrigger value="network" className="cursor-pointer gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              Department
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger className="w-full md:w-[180px] h-12 bg-white dark:bg-neutral-900 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
            <div className="cursor-pointer flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="All Topics" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-neutral-900 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
            <SelectItem value="all">All Topics</SelectItem>
            <SelectItem value="kinematics">Kinematics</SelectItem>
            <SelectItem value="dynamics">Dynamics</SelectItem>
            <SelectItem value="energy">Energy & Momentum</SelectItem>
            <SelectItem value="thermo">Thermodynamics</SelectItem>
            <SelectItem value="em">Electromagnetism</SelectItem>
            <SelectItem value="waves">Waves & Optics</SelectItem>
            <SelectItem value="modern">Modern Physics</SelectItem>
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
             <p className="text-zinc-500 dark:text-neutral-400 font-medium animate-pulse">Syncing with orbit...</p>
          </div>
        ) : filteredWaypoints.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-3xl bg-zinc-50 dark:bg-transparent"
          >
            <div className="bg-zinc-100 dark:bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-zinc-200 dark:border-white/10">
              <MapPinned className="h-10 w-10 text-zinc-400 dark:text-neutral-500" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Waypoints Found</h3>
            <p className="text-zinc-500 dark:text-neutral-400 max-w-sm px-4">
              {activeTab === "network" && !profile?.organizationId 
                ? "Switch to the Cosmos tab or join a department network to see shared waypoints."
                : "No active waypoints match your scan parameters. Try broadening your topic filter."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredWaypoints.map((waypoint, idx) => (
                <motion.div
                  key={waypoint.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card className="group relative h-full flex flex-col overflow-hidden bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-white/5 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-bl-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                    
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-neutral-400 border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors">
                            <Clock className="h-3 w-3 mr-1" />
                            {waypoint.questions?.length || 0} Components
                          </Badge>
                          {waypoint.topic && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 capitalize font-mono text-[10px]">
                              {waypoint.topic}
                            </Badge>
                          )}
                        </div>
                        {waypoint.visibility === "global" ? (
                          <div title="Publicly Available" className="p-1.5 bg-blue-500/10 rounded-lg">
                            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        ) : (
                          <div title="Department Shared" className="p-1.5 bg-orange-500/10 rounded-lg">
                            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {waypoint.title}
                      </CardTitle>
                      <CardDescription className="text-zinc-600 dark:text-neutral-400 line-clamp-3 min-h-[4.5rem] mt-2 leading-relaxed">
                        {waypoint.description || "No transmission description provided."}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0 flex-grow relative z-10">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-neutral-500 bg-zinc-100 dark:bg-white/5 px-3 py-2 rounded-xl">
                        <span className="flex items-center gap-2">
                           <Star className="h-3 w-3 text-primary" />
                           {waypoint.forkCount} Active Fork{waypoint.forkCount !== 1 ? 's' : ''}
                        </span>
                        <span>v1.2.0</span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-2 pb-6 px-6 relative z-10 mt-auto">
                      <Button 
                        onClick={() => handleFork(waypoint)}
                        className="cursor-pointer w-full h-11 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-bold transition-all transform group-active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Acquire Template
                        <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
