"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CsvData {
  email: string;
  name: string;
}

export function RosterImport() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CsvData[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv") {
        setError("Please upload a CSV file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseCsv(selectedFile);
    }
  };

  const parseCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].toLowerCase().split(",");
      
      const emailIdx = headers.findIndex(h => h.includes("email"));
      const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("student"));

      if (emailIdx === -1) {
        setError("CSV must have an 'email' column.");
        return;
      }

      const parsed: CsvData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        if (cols.length > emailIdx && cols[emailIdx].trim()) {
          parsed.push({
            email: cols[emailIdx].trim(),
            name: nameIdx !== -1 ? cols[nameIdx].trim() : cols[emailIdx].split("@")[0]
          });
        }
      }
      setData(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!user || data.length === 0) return;
    
    setImporting(true);
    setError(null);
    
    try {
      // Use Firebase JS SDK directly for batches
      const batch = writeBatch(db);
      
      data.forEach((student) => {
        // Generate a standard Firebase-style random ID for the student document
        const studentRef = doc(collection(db, "students"));
        
        batch.set(studentRef, {
          email: student.email,
          displayName: student.name,
          teacherId: user.uid,
          role: "student",
          createdAt: serverTimestamp(),
          status: "pending_invite",
          importedBy: user.uid
        }, { merge: true });
      });

      await batch.commit();
      setSuccess(data.length);
      setData([]);
      setFile(null);
      
      // Close after a brief delay
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
        window.location.reload(); // Refresh to see new students
      }, 2000);

    } catch (err: any) {
      console.error("Import error:", err);
      setError("Failed to import roster. Please check your permissions.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="size-4" />
          Import Roster
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Class Roster</DialogTitle>
          <DialogDescription>
            Upload a .csv file with columns for 'Email' and 'Name'.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!file ? (
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-accent/30">
              <FileText className="size-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{data.length} students found</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setFile(null); setData([]); }}>
                Change
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle2 className="size-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Imported {success} students successfully.</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button 
            disabled={!file || data.length === 0 || importing || !!success} 
            onClick={handleImport}
            className="gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Start Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
