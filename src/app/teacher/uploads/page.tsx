"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { db, uploadFilesToStorage } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Link as LinkIcon, ExternalLink, Plus, Upload, FileText, Video, Link, Search } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  url: string;
  type?: "video" | "document" | "link";
  courseId?: string;
  createdAt: any;
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<string>("link");
  const [file, setFile] = useState<File | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [filterCourseId, setFilterCourseId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchResources();
      fetchCourses();
    }
  }, [user]);

  async function fetchCourses() {
    if (!user) return;
    try {
      const q = query(collection(db, "courses"), where("teacherId", "==", user.uid));
      const snap = await getDocs(q);
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  }

  async function fetchResources() {
    if (!user) return;
    try {
      const q = query(
        collection(db, "resources"), 
        where("teacherId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const resourceList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Resource[];
      setResources(resourceList);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddResource(e: React.FormEvent) {
    e.preventDefault();
    if (!title || (!url && !file) || !user) return;

    setAdding(true);
    try {
      let finalUrl = url;
      let finalType = type;

      if (file) {
        setUploadProgress(10);
        const uploadedFiles = await uploadFilesToStorage([file], user.uid, (_, progress) => {
          setUploadProgress(progress);
        });
        if (uploadedFiles.length > 0) {
          finalUrl = uploadedFiles[0].url;
          // Auto-assign type if it's a file
          if (file.type.startsWith("video/")) finalType = "video";
          else finalType = "document";
        }
      } else if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com")) {
        finalType = "video";
      }

      await addDoc(collection(db, "resources"), {
        title,
        url: finalUrl,
        type: finalType,
        teacherId: user.uid,
        courseId: selectedCourseId === "all" ? null : selectedCourseId,
        createdAt: new Date(),
      });
      setTitle("");
      setUrl("");
      setFile(null);
      setType("link");
      setUploadProgress(0);
      await fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
      alert("Error adding resource. Please check your connection and try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteDoc(doc(db, "resources", id));
      setResources(resources.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resource Uploads</h1>
        <p className="text-muted-foreground">Manage external learning resources for your students</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle>Add New Resource</CardTitle>
          <CardDescription>Upload a file or add a link to a document, video, or website</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAddResource} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="grid w-full gap-2">
                <Label htmlFor="title" className="text-sm font-semibold">Resource Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Chapter 1 Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background-secondary border-none ring-1 ring-input focus-visible:ring-primary shadow-none"
                  required
                />
              </div>
              <div className="grid w-full gap-2">
                <Label className="text-sm font-semibold">Assign to Class</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger className="cursor-pointer bg-background-secondary border-none ring-1 ring-input focus-visible:ring-primary shadow-none">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">All Classes (General)</SelectItem>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id} className="cursor-pointer">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full gap-2">
                <Label className="text-sm font-semibold">Resource Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="cursor-pointer bg-background-secondary border-none ring-1 ring-input focus-visible:ring-primary shadow-none">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link" className="cursor-pointer">External Website</SelectItem>
                    <SelectItem value="document" className="cursor-pointer">Document (PDF/Word)</SelectItem>
                    <SelectItem value="video" className="cursor-pointer">Video (YouTube/Direct)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid w-full gap-2">
                 <Label htmlFor="resource-input" className="text-sm font-semibold">{file ? "File Selected" : "Upload File or Enter URL"}</Label>
                 <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Input
                        id="url"
                        placeholder="https://..."
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          if (e.target.value) setFile(null);
                        }}
                        disabled={!!file}
                        className="bg-background-secondary border-none ring-1 ring-input focus-visible:ring-primary shadow-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded bg-muted uppercase tracking-wider">or</span>
                      <Input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setFile(f);
                            setUrl("");
                            // Only set title if blank
                            if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="cursor-pointer whitespace-nowrap min-w-[120px]"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                 </div>
                 {file && (
                   <div className="mt-2 p-3 bg-secondary/30 rounded-lg flex items-center justify-between animate-in slide-in-from-top-1 duration-200">
                     <div className="flex items-center gap-2 overflow-hidden">
                       <FileText className="h-4 w-4 shrink-0 text-primary" />
                       <span className="text-sm font-medium truncate">{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                     </div>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => setFile(null)} 
                       className="h-7 px-2 text-destructive hover:bg-destructive/10"
                     >
                       Cancel
                     </Button>
                   </div>
                 )}
              </div>
            </div>

            {adding && file && uploadProgress > 0 && (
              <div className="w-full bg-secondary h-3 rounded-full overflow-hidden mt-4 shadow-inner">
                <div 
                  className="bg-primary h-full transition-all duration-300 relative" 
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={adding || (!url && !file)} className="w-full sm:w-auto px-10 cursor-pointer text-base py-6">
                {adding ? (
                   <>{uploadProgress > 0 && uploadProgress < 100 ? `Uploading (${Math.round(uploadProgress)}%)...` : "Adding..."}</>
                ) : (
                   <><Plus className="mr-2 h-5 w-5" /> Add Resource</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-4">
          <div>
            <CardTitle>Resource Archive</CardTitle>
            <CardDescription>{resources.length} resources available</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search archive..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCourseId} onValueChange={setFilterCourseId}>
              <SelectTrigger className="w-full sm:w-[180px] cursor-pointer">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">All Classes</SelectItem>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id} className="cursor-pointer">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : resources.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No resources added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Link / File</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources
              .filter(r => (filterCourseId === "all" || r.courseId === filterCourseId) && 
                (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 r.url.toLowerCase().includes(searchQuery.toLowerCase())))
              .map((resource) => (
              <TableRow key={resource.id} className="group">
                <TableCell>
                  <div className="flex items-center">
                    {resource.type === "video" ? (
                      <div className="p-2 rounded-md bg-blue-50 text-blue-500">
                        <Video className="h-4 w-4" />
                      </div>
                    ) : resource.type === "document" ? (
                      <div className="p-2 rounded-md bg-orange-50 text-orange-500">
                        <FileText className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-md bg-slate-50 text-slate-500">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {resource.title}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                   <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1.5 transition-colors">
                      {resource.url.length > 30 ? resource.url.substring(0, 30) + "..." : resource.url} 
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </a>
                </TableCell>
                <TableCell>
                    {resource.courseId ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {courses.find(c => c.id === resource.courseId)?.name || "Unknown Class"}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground italic bg-muted px-2 py-0.5 rounded-full">All Classes</span>
                    )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {resource.createdAt?.toDate ? resource.createdAt.toDate().toLocaleDateString() : 'Recently'}
                </TableCell>
                <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => handleDelete(resource.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
