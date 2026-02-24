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
import { Search, Copy, Globe, Users, Lock, Loader2, Sparkles, BookOpen, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LibraryAssignment {
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
}

export default function LibraryPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<LibraryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("global");
  const [topicFilter, setTopicFilter] = useState("all");

  useEffect(() => {
    if (user && !authLoading) {
      fetchLibrary();
    }
  }, [user, authLoading, activeTab, profile?.organizationId, topicFilter]);

  async function fetchLibrary() {
    if (!user || authLoading) return;
    setLoading(true);
    try {
      console.log("Fetching library for tab:", activeTab, "Org:", profile?.organizationId);
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
          console.warn("No organizationId found in profile for network fetch");
          setAssignments([]);
          setLoading(false);
          return;
        }
        
        console.log("Querying assignments for OrgId:", orgId);
        
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
        createdAt: d.data().createdAt?.toDate() || new Date()
      })) as LibraryAssignment[];
      
      setAssignments(docs);
    } catch (e: any) {
      console.error("Library fetch error:", e);
      if (e.message?.includes("index")) {
        toast.error("Database still indexing. This may take 2-3 minutes.");
      } else {
        toast.error("Failed to load library. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleFork = (assignment: LibraryAssignment) => {
    // We'll store the assignment in sessionStorage or pass via ID
    // For simplicity, let's pass it via session storage and redirect
    sessionStorage.setItem("forked_assignment", JSON.stringify(assignment));
    router.push("/teacher/create?fork=true");
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Safety check: Filter out own assignments from common area if desired, 
    // but most importantly ensure they have an Org ID if in network tab
    if (activeTab === "network" && !a.organizationId) return false;
    
    return matchesSearch;
  });

  return (
    <div className="container p-6 mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Physics Library
            </h1>
            <p className="text-muted-foreground italic text-sm">
              {profile?.organizationId ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  Connected to Network: <code className="bg-muted px-1 rounded">{profile.organizationId}</code>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
                  Not connected to a department network.
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search assignments..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="All Topics" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="kinematics">Kinematics</SelectItem>
              <SelectItem value="dynamics">Dynamics</SelectItem>
              <SelectItem value="energy">Energy & Momentum</SelectItem>
              <SelectItem value="thermo">Thermo</SelectItem>
              <SelectItem value="em">E&M</SelectItem>
              <SelectItem value="waves">Waves</SelectItem>
              <SelectItem value="modern">Modern Physics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="global" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="global" className="gap-2">
            <Globe className="h-4 w-4" />
            Physics Global
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Users className="h-4 w-4" />
            My Network
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Browsing the shelves...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No assignments found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                {activeTab === "network" && !profile?.organizationId 
                  ? "You haven't joined a network yet. Go to the Network page to join your department."
                  : "Try adjusting your search or check back later for new shared assignments."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 border-b bg-muted/30">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-background">
                          {assignment.questions?.length || 0} Qs
                        </Badge>
                        {assignment.topic && (
                          <Badge variant="secondary" className="capitalize">
                            {assignment.topic}
                          </Badge>
                        )}
                      </div>
                      {assignment.visibility === "global" ? (
                        <Globe className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Users className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <CardTitle className="line-clamp-1">{assignment.title}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                      {assignment.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-grow">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Shared by a colleague</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/10 p-4">
                    <Button 
                      onClick={() => handleFork(assignment)}
                      className="w-full gap-2 cursor-pointer"
                    >
                      <Copy className="h-4 w-4" />
                      Fork to My Course
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
