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
import { Trash2, Link as LinkIcon, ExternalLink, Plus, Upload, FileText, Video, Link } from "lucide-react";

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

      <Card>
        <CardHeader>
          <CardTitle>Add New Resource</CardTitle>
          <CardDescription>Upload a file or add a link to a document, video, or website</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddResource} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="title">Resource Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Chapter 1 Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label>Class / Course (Optional)</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger className="cursor-pointer">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid w-full gap-1.5">
                <Label>Resource Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link" className="cursor-pointer">Link / Website</SelectItem>
                    <SelectItem value="document" className="cursor-pointer">Document (PDF, Doc)</SelectItem>
                    <SelectItem value="video" className="cursor-pointer">Video (YouTube, Vimeo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-full gap-1.5">
                 <Label htmlFor="resource-input">{file ? "File Selected" : "URL or File"}</Label>
                 <div className="flex gap-2">
                    <Input
                      id="url"
                      placeholder="https://..."
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (e.target.value) setFile(null);
                      }}
                      disabled={!!file}
                      className="flex-1"
                    />
                    <div className="relative">
                      <Input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setFile(f);
                            setUrl("");
                            setTitle(prev => prev || f.name.replace(/\.[^/.]+$/, ""));
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="cursor-pointer"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                 </div>
                 {file && (
                   <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                     Selected: {file.name} 
                     <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="h-auto p-0 text-destructive">Remove</Button>
                   </p>
                 )}
              </div>
            </div>

            {adding && file && uploadProgress > 0 && (
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-primary h-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <Button type="submit" disabled={adding || (!url && !file)} className="w-full md:w-auto self-end cursor-pointer">
              {adding ? (
                 <>{uploadProgress > 0 && uploadProgress < 100 ? `Uploading (${Math.round(uploadProgress)}%)...` : "Adding..."}</>
              ) : (
                 <><Plus className="mr-2 h-4 w-4" /> Add Resource</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Resource Archive</CardTitle>
            <CardDescription>{resources.length} resources available</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterCourseId} onValueChange={setFilterCourseId}>
              <SelectTrigger className="w-[180px] cursor-pointer">
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
            <p className="text-muted-foreground">No resources added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources
                  .filter(r => filterCourseId === "all" || r.courseId === filterCourseId)
                  .map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {resource.type === "video" ? (
                          <Video className="h-4 w-4 text-blue-500" />
                        ) : resource.type === "document" ? (
                          <FileText className="h-4 w-4 text-orange-500" />
                        ) : (
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                        {resource.title}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground mr-2">
                       <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          {resource.url} <ExternalLink className="h-3 w-3" />
                       </a>
                    </TableCell>
                    <TableCell>
                        {resource.courseId ? (
                            <span className="text-xs border px-2 py-1 rounded-full bg-secondary">
                                {courses.find(c => c.id === resource.courseId)?.name || "Unknown Class"}
                            </span>
                        ) : (
                            <span className="text-xs text-muted-foreground italic">All Classes</span>
                        )}
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
