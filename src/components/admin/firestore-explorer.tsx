"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Database, ChevronLeft, ChevronRight, RefreshCw, FileJson } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FirestoreExplorerProps {
  adminSecret: string;
}

export function FirestoreExplorer({ adminSecret }: FirestoreExplorerProps) {
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [history, setHistory] = useState<(string | null)[]>([null]); // history of page cursors

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch("/api/admin/firestore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": adminSecret,
          },
          body: JSON.stringify({ action: "listCollections" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to list collections");
        setCollections(data.collections);
        if (data.collections.length > 0) {
          setSelectedCollection(data.collections[0]);
        }
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchCollections();
  }, [adminSecret]);

  const loadDocuments = async (cursor: string | null = null, direction: "next" | "prev" | "refresh" = "refresh") => {
    if (!selectedCollection) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/firestore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          action: "queryCollection",
          collectionName: selectedCollection,
          limit: 20,
          lastDocId: cursor,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load documents");

      setDocuments(data.docs);
      setHasMore(data.hasMore);

      if (direction === "next" && data.lastDocId) {
        setHistory((prev) => [...prev, data.lastDocId]);
        setLastDocId(data.lastDocId);
      } else if (direction === "prev") {
        setHistory((prev) => prev.slice(0, -1));
        setLastDocId(history[history.length - 3] || null); // previous cursor is conceptually history[-2], the one before that is history[-3]
      } else if (direction === "refresh") {
        if (cursor === null) {
          setHistory([null]);
          setLastDocId(data.lastDocId || null);
        } else {
          setLastDocId(data.lastDocId || null);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCollection) {
      loadDocuments(null, "refresh");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollection]);

  const handleNextPage = () => {
    loadDocuments(lastDocId, "next");
  };

  const handlePrevPage = () => {
    const prevCursor = history[history.length - 2];
    loadDocuments(prevCursor, "prev");
  };

  return (
    <Card className="flex flex-col h-full bg-background/60 backdrop-blur-xl border-border/40 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Firestore Explorer</CardTitle>
            <CardDescription>Read-only view of platform collections</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedCollection}
            onValueChange={(val) => {
              setSelectedCollection(val);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => loadDocuments(history[history.length - 1], "refresh")} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive border-b border-destructive/20 text-sm">
            {error}
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-4">
            {loading && documents.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileJson className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium">No documents found</p>
                <p className="text-sm text-muted-foreground">This collection is currently empty.</p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full space-y-2">
                <AnimatePresence>
                  {documents.map((doc, idx) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                    >
                      <AccordionItem
                        value={doc.id}
                        className="border border-border/40 bg-card/50 rounded-lg shadow-sm px-4 overflow-hidden"
                      >
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center justify-between w-full pr-4 text-left">
                            <span className="font-mono text-sm font-semibold truncate flex-1 text-primary">
                              {doc.id}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                              {Object.keys(doc).length - 1} Fields
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="bg-background/80 rounded-md p-4 overflow-x-auto text-xs font-mono text-muted-foreground border border-border/50">
                            <pre>
                              <code>{JSON.stringify(doc, null, 2)}</code>
                            </pre>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Accordion>
            )}
          </div>
        </ScrollArea>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border/40 bg-background/40 whitespace-nowrap">
          <p className="text-sm text-muted-foreground">
            Showing {documents.length} document{documents.length !== 1 && "s"} (Limit 20)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={loading || history.length <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={loading || !hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
