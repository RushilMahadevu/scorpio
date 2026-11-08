"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { WorkspaceHeader } from "@/components/ui/workspace";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, FileText, Search, Video, Globe } from "lucide-react";
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
      <WorkspaceHeader title="Resources" description="Study materials shared by your teacher." />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-48 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources…"
            aria-label="Search resources"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger aria-label="Resource type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
            <SelectItem value="video" className="cursor-pointer">Videos</SelectItem>
            <SelectItem value="document" className="cursor-pointer">Documents</SelectItem>
            <SelectItem value="link" className="cursor-pointer">Websites</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <p role="status" className="p-6 text-sm text-muted-foreground">Loading resources…</p>
        ) : filteredResources.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            {resources.length ? "No resources match your filters." : "Your teacher hasn’t shared any resources yet."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filteredResources.map((resource) => {
              const Icon = resource.type === "video" || /youtube|vimeo/.test(resource.url)
                ? Video
                : resource.type === "document" || /\.pdf|\.doc/.test(resource.url) ? FileText : Globe;
              return (
                <li key={resource.id}>
                  <Link href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-4 hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5">
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-sm font-medium">{resource.title}</h2>
                      <p className="text-xs capitalize text-muted-foreground">
                        {resource.type || "Link"}
                        {resource.createdAt?.toDate && ` · ${resource.createdAt.toDate().toLocaleDateString()}`}
                      </p>
                    </div>
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
