"use client";

import { useState, useEffect, useRef } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { db, uploadFilesToStorage } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ExternalLink, Plus, Upload, FileText, Search } from "lucide-react";

import { TeacherPageHeader } from "@/components/teacher/workspace";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [addOpen, setAddOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<string>("link");
  const [file, setFile] = useState<File | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [filterCourseId, setFilterCourseId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

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
    if (adding || !title || (!url && !file) || !user) return;

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
      setAddOpen(false);
      toast.success("Resource added successfully!");
      await fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
      toast.error("Error adding resource. Please check your connection and try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "resources", id));
      setResources(resources.filter((r) => r.id !== id));
      toast.success("Resource deleted!");
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Error deleting resource.");
    }
  }

  const search = searchQuery.trim().toLowerCase();
  const filteredResources = resources.filter((resource) =>
    (filterCourseId === "all" || resource.courseId === filterCourseId)
    && (resource.title.toLowerCase().includes(search) || resource.url.toLowerCase().includes(search))
  );

  return (
    <div className="space-y-6">
      <TeacherPageHeader title="Resource Uploads" description="Share files, videos, and links with your classes.">
        <Dialog open={addOpen} onOpenChange={(open) => { if (!adding) setAddOpen(open); }}>
          <DialogTrigger asChild>
            <Button><Plus /> Add Resource</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add resource</DialogTitle>
              <DialogDescription>Upload a file or link to an online resource.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddResource} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="resource-title">Title</Label>
                <Input id="resource-title" placeholder="e.g. Chapter 1 notes" value={title}
                  onChange={(event) => setTitle(event.target.value)} required disabled={adding} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid min-w-0 gap-2">
                  <Label htmlFor="resource-course">Class</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={adding}>
                    <SelectTrigger id="resource-course" className="w-full cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid min-w-0 gap-2">
                  <Label htmlFor="resource-type">Type</Label>
                  <Select value={type} onValueChange={setType} disabled={adding}>
                    <SelectTrigger id="resource-type" className="w-full cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Website</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resource-url">Link or file</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Input id="resource-url" placeholder="https://…" value={url}
                    className="min-w-32 flex-1" disabled={!!file || adding}
                    onChange={(event) => setUrl(event.target.value)} />
                  <input ref={fileInput} type="file" hidden onChange={(event) => {
                    const selected = event.target.files?.[0];
                    if (!selected) return;
                    setFile(selected);
                    setUrl("");
                    if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ""));
                  }} />
                  <Button type="button" variant="outline" disabled={adding} onClick={() => fileInput.current?.click()}>
                    <Upload /> Choose File
                  </Button>
                </div>
                {file && (
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                    <FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate" title={file.name}>{file.name}</span>
                    <Button type="button" size="sm" variant="ghost" disabled={adding} onClick={() => {
                      setFile(null);
                      if (fileInput.current) fileInput.current.value = "";
                    }}>Remove</Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={adding || !title || (!url && !file)}>
                  {adding ? (file && uploadProgress < 100 ? `Uploading (${Math.round(uploadProgress)}%)…` : "Adding…") : "Add Resource"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </TeacherPageHeader>

      <Card className="min-w-0 gap-0 py-0">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold">Resource archive</h2>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <div className="relative w-full sm:w-48">
              <Search aria-hidden="true" className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input aria-label="Search resources" placeholder="Search resources…" className="pl-8"
                value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </div>
            <Select value={filterCourseId} onValueChange={setFilterCourseId}>
              <SelectTrigger aria-label="Filter resources by class" className="w-full cursor-pointer sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="border-t p-0">
          {loading || filteredResources.length === 0 ? (
            <p role="status" className="px-5 py-10 text-center text-sm text-muted-foreground">
              {loading ? "Loading resources…" : resources.length === 0 ? "No resources yet." : "No resources match these filters."}
            </p>
          ) : (
            <Table aria-label="Resource archive">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-4 sm:pl-5">Resource</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="max-w-72 whitespace-normal py-3 pl-4 sm:pl-5">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-baseline gap-1.5 break-words font-medium hover:text-primary hover:underline"
                        title={resource.url}>
                        {resource.title} <ExternalLink aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
                      </a>
                      <p className="text-xs capitalize text-muted-foreground">
                        {resource.type || "Link"} · {resource.createdAt?.toDate ? resource.createdAt.toDate().toLocaleDateString() : "Recently added"}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-48 whitespace-normal break-words text-muted-foreground">
                      {resource.courseId ? courses.find((course) => course.id === resource.courseId)?.name || "Unknown class" : "All classes"}
                    </TableCell>
                    <TableCell className="pr-3">
                      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${resource.title}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setResourceToDelete(resource.id)}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!resourceToDelete}
        onOpenChange={(open) => !open && setResourceToDelete(null)}
        title="Delete Resource"
        description="Are you sure you want to delete this resource? This action cannot be undone."
        onConfirm={() => resourceToDelete && handleDelete(resourceToDelete)}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
