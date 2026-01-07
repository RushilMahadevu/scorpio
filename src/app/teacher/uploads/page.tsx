"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Link as LinkIcon, ExternalLink, Plus } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  url: string;
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
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [adding, setAdding] = useState(false);

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
    if (!title || !url) return;

    setAdding(true);
    try {
      await addDoc(collection(db, "resources"), {
        title,
        url,
        teacherId: user?.uid,
        courseId: selectedCourseId === "all" ? null : selectedCourseId,
        createdAt: new Date(),
      });
      setTitle("");
      setUrl("");
      await fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
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
          <CardDescription>Add a link to a document, video, or website</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddResource} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Chapter 1 Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label>Class (Optional)</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={adding} className="w-full md:w-auto self-end">
              {adding ? (
                 <>Adding...</>
              ) : (
                 <><Plus className="mr-2 h-4 w-4" /> Add Resource</>
              )}
            </Button>

          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource Library</CardTitle>
          <CardDescription>{resources.length} resources available</CardDescription>
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
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
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
