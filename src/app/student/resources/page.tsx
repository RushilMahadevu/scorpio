"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, FileText, Search, Video, File } from "lucide-react";
import Link from "next/link";

interface Resource {
  id: string;
  title: string;
  url: string;
  createdAt: any;
  type?: "video" | "document" | "link";
  courseId?: string;
}

export default function StudentResourcesPage() {
  const { user, profile } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function fetchResources() {
      if (!user) return;
      try {
        // Fetch student profile to get teacherId and courseId (Unified first)
        let teacherId = profile?.teacherId;
        let studentCourseId = profile?.courseId;

        if (!teacherId || !studentCourseId) {
          try {
            const studentDoc = await getDoc(doc(db, "students", user.uid));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              teacherId = teacherId || studentData.teacherId;
              studentCourseId = studentCourseId || studentData.courseId;
            }
          } catch (e) { console.error("Could not fetch legacy student profile", e); }
        }

        // --- LEGACY RESOLUTION START ---
        if (teacherId && !studentCourseId) {
           const codeMatch = await getDocs(query(collection(db, "courses"), where("code", "==", teacherId.trim())));
           if (!codeMatch.empty) {
              const courseDoc = codeMatch.docs[0];
              const courseData = courseDoc.data();
              studentCourseId = courseDoc.id;
              teacherId = courseData.teacherId;
           }
        }
        // --- LEGACY RESOLUTION END ---
        
        if (!teacherId) {
             setResources([]);
             setLoading(false);
             return;
        }

        // Fetch all resources for this teacher
        // Note: Filtering by course is done client-side so "All Classes" (null) resources are visible
        const q = query(
          collection(db, "resources"), 
          where("teacherId", "==", teacherId), 
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const resourceList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Resource[];
        
        // Filter: include resources for specific course OR for all classes (null)
        const finalResources = resourceList.filter(r => 
          !r.courseId || r.courseId === studentCourseId
        );
        
        setResources(finalResources);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, [user, profile]);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || 
      (resource.type === activeTab) || 
      (activeTab === "video" && (resource.url.includes("youtube") || resource.url.includes("vimeo"))) ||
      (activeTab === "document" && (resource.url.includes(".pdf") || resource.url.includes(".doc")));
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Resources</h1>
          <p className="text-muted-foreground">Access study materials and external links</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center space-y-2 md:space-y-0">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-[180px] cursor-pointer">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
            <SelectItem value="video" className="cursor-pointer">Videos</SelectItem>
            <SelectItem value="document" className="cursor-pointer">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50" />
              <CardContent className="h-12 bg-muted/30 mt-4" />
            </Card>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No resources found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="line-clamp-2 text-lg">{resource.title}</CardTitle>
                  {resource.type === 'video' || resource.url.includes('youtube') ? (
                    <Video className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <File className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </div>
                <CardDescription>
                  Added {resource.createdAt?.toDate ? resource.createdAt.toDate().toLocaleDateString() : 'Recently'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full cursor-pointer" variant="outline">
                  <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Resource
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
