"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  PackageOpen,
  Check,
  ChevronRight,
  Shield,
  Lock,
  Unlock,
  Filter,
  Info,
  Plus,
  PackageCheck,
  Trash2,
  Variable,
  RotateCcw,
  AlertTriangle,
  HelpCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Base categories
const CATEGORIES = [
  { id: "all", name: "All Vaults" },
  { id: "kinematics", name: "Kinematics" },
  { id: "dynamics", name: "Dynamics" },
  { id: "energy", name: "Energy & Momentum" },
  { id: "optics", name: "Waves & Optics" },
  { id: "thermo", name: "Thermodynamics" },
  { id: "electricity", name: "Electricity" },
  { id: "nuclear", name: "Nuclear & Atomic" },
  { id: "custom", name: "Custom Equations" },
];

interface Formula {
  id: string;
  name: string;
  latex: string;
  category: string;
  description?: string;
  isCustom?: boolean;
}

const DEFAULT_FORMULAS: Formula[] = [
  // Kinematics
  { id: "k1", name: "Final Velocity", latex: "v = u + at", category: "kinematics", isCustom: false },
  { id: "k2", name: "Displacement", latex: "s = ut + \\frac{1}{2}at^2", category: "kinematics", isCustom: false },
  { id: "k3", name: "Velocity Squared", latex: "v^2 = u^2 + 2as", category: "kinematics", isCustom: false },
  { id: "k4", name: "Average Velocity", latex: "v_{avg} = \\frac{u + v}{2}", category: "kinematics", isCustom: false },
  // Dynamics
  { id: "d1", name: "Newton's Second Law", latex: "F = ma", category: "dynamics", isCustom: false },
  { id: "d2", name: "Friction Force", latex: "f = \\mu N", category: "dynamics", isCustom: false },
  { id: "d3", name: "Centripetal Force", latex: "F_c = \\frac{mv^2}{r}", category: "dynamics", isCustom: false },
  { id: "d4", name: "Gravitational Force", latex: "F = G \\frac{m_1 m_2}{r^2}", category: "dynamics", isCustom: false },
  // Energy
  { id: "e1", name: "Kinetic Energy", latex: "K.E. = \\frac{1}{2}mv^2", category: "energy", isCustom: false },
  { id: "e3", name: "Gravitational PE", latex: "P.E. = mgh", category: "energy", isCustom: false },
  { id: "e4", name: "Momentum", latex: "p = mv", category: "energy", isCustom: false },
  { id: "e5", name: "Elastic Potential Energy", latex: "U_s = \\frac{1}{2}kx^2", category: "energy", isCustom: false },
  // Thermodynamics
  { id: "t1", name: "First Law of Thermo", latex: "\\Delta U = Q - W", category: "thermo", isCustom: false },
  { id: "t2", name: "Ideal Gas Law", latex: "PV = nRT", category: "thermo", isCustom: false },
  { id: "t3", name: "Specific Heat", latex: "Q = mc\\Delta T", category: "thermo", isCustom: false },
  // Waves & Optics
  { id: "w1", name: "Wave Speed", latex: "v = f\\lambda", category: "optics", isCustom: false },
  { id: "w2", name: "Snell's Law", latex: "n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2", category: "optics", isCustom: false },
  { id: "w3", name: "Lens Equation", latex: "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}", category: "optics", isCustom: false },
  // Electricity
  { id: "el1", name: "Ohm's Law", latex: "V = IR", category: "electricity", isCustom: false },
  { id: "el2", name: "Electrical Power", latex: "P = IV = I^2 R = \\frac{V^2}{R}", category: "electricity", isCustom: false },
  { id: "el3", name: "Coulomb's Law", latex: "F = k_e \\frac{q_1 q_2}{r^2}", category: "electricity", isCustom: false },
  // Nuclear
  { id: "n1", name: "Mass-Energy", latex: "E = mc^2", category: "nuclear", isCustom: false },
  { id: "n2", name: "Photon Energy", latex: "E = hf = \\frac{hc}{\\lambda}", category: "nuclear", isCustom: false },
  { id: "n3", name: "Radioactive Decay", latex: "N(t) = N_0 e^{-\\lambda t}", category: "nuclear", isCustom: false }
];

interface Course {
  id: string;
  name: string;
  code: string;
  restrictedFormulaIds?: string[];
  customFormulas?: Formula[];
}

export default function TeacherVault() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [restrictedIds, setRestrictedIds] = useState<string[]>([]);
  const [customFormulas, setCustomFormulas] = useState<Formula[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // New Formula State
  const [isAddingFormula, setIsAddingFormula] = useState(false);
  const [newFormula, setNewFormula] = useState({
    name: "",
    latex: "",
    category: "custom",
    description: ""
  });
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null);
  const router = useRouter();

  // Unsaved Changes Detection Logic
  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const hasUnsavedChanges = selectedCourse ? (
    JSON.stringify([...restrictedIds].sort()) !== JSON.stringify([...(selectedCourse.restrictedFormulaIds || [])].sort()) ||
    JSON.stringify(customFormulas) !== JSON.stringify(selectedCourse.customFormulas || [])
  ) : false;

  // 1. Handle Browser Close/Refresh (standard beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 2. Handle Internal Navigation (intercepting link clicks)
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.href && !anchor.target) {
        const url = new URL(anchor.href);
        const isExternal = url.origin !== window.location.origin;
        const isDifferentPath = url.pathname !== window.location.pathname;

        if (isExternal || isDifferentPath) {
          // If it's a link that leaves this page, intercept it
          e.preventDefault();
          e.stopPropagation();
          setPendingNavUrl(anchor.href);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, true);
    return () => document.removeEventListener('click', handleAnchorClick, true);
  }, [hasUnsavedChanges]);

  const confirmNavigation = () => {
    if (pendingNavUrl) {
      const url = new URL(pendingNavUrl);
      if (url.origin !== window.location.origin) {
        window.location.href = pendingNavUrl;
      } else {
        router.push(url.pathname + url.search + url.hash);
      }
      setPendingNavUrl(null);
    }
  };

  useEffect(() => {
    async function fetchCourses() {
      if (!user) return;
      try {
        const q = query(collection(db, "courses"), where("teacherId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const coursesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(coursesList);
        if (coursesList.length > 0) {
          setSelectedCourseId(coursesList[0].id);
          setRestrictedIds(coursesList[0].restrictedFormulaIds || []);
          setCustomFormulas(coursesList[0].customFormulas || []);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load classes");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [user]);

  useEffect(() => {
    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    if (selectedCourse) {
      setRestrictedIds(selectedCourse.restrictedFormulaIds || []);
      setCustomFormulas(selectedCourse.customFormulas || []);
    }
  }, [selectedCourseId, courses]);

  const toggleFormula = (id: string) => {
    setRestrictedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDiscard = () => {
    if (selectedCourse) {
      setRestrictedIds(selectedCourse.restrictedFormulaIds || []);
      setCustomFormulas(selectedCourse.customFormulas || []);
      toast.info("Changes discarded");
    }
  };

  const onCourseSelectAttempt = (id: string) => {
    if (hasUnsavedChanges) {
      setPendingCourseId(id);
    } else {
      setSelectedCourseId(id);
    }
  };

  const confirmCourseSwitch = () => {
    if (pendingCourseId) {
      setSelectedCourseId(pendingCourseId);
      setPendingCourseId(null);
    }
  };

  const handleSave = async () => {
    if (!selectedCourseId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "courses", selectedCourseId), {
        restrictedFormulaIds: restrictedIds,
        customFormulas: customFormulas
      });

      // Update local courses state
      setCourses(prev => prev.map(c =>
        c.id === selectedCourseId ? { ...c, restrictedFormulaIds: restrictedIds, customFormulas: customFormulas } : c
      ));

      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving vault data:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomFormula = async () => {
    if (!newFormula.name || !newFormula.latex) {
      toast.error("Name and LaTeX formula are required");
      return;
    }

    const formulaToAdd: Formula = {
      ...newFormula,
      id: `custom-${Date.now()}`,
      isCustom: true
    };

    setCustomFormulas(prev => [...prev, formulaToAdd]);
    setIsAddingFormula(false);
    setNewFormula({ name: "", latex: "", category: "custom", description: "" });
    toast.success("Custom formula added to list. Remember to save changes!");
  };

  const removeCustomFormula = (id: string) => {
    setCustomFormulas(prev => prev.filter(f => f.id !== id));
    setRestrictedIds(prev => prev.filter(i => i !== id));
  };

  const allFormulas = [...DEFAULT_FORMULAS, ...customFormulas];

  const filteredFormulas = allFormulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(search.toLowerCase()) ||
      formula.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || formula.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20 shrink-0">
              <PackageCheck className="h-10 w-10" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-5xl font-black tracking-tighter">Vault Controls</h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 cursor-help transition-colors">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80 rounded-2xl p-5 shadow-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-foreground" side="right" align="start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                          <Info className="h-4 w-4" />
                          Management Guide
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                          Toggle <Unlock className="inline h-3 w-3 mb-0.5" /> **Standard Formulas** to hide them from students. Create **Custom Equations** for your class. Changes are stored in the bottom **Save Bar**.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-muted-foreground font-medium italic mt-1">Manage class-specific formula accessibility and custom content</p>
            </div>
          </div>

          <Dialog open={isAddingFormula} onOpenChange={setIsAddingFormula}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-14 px-8 rounded-2xl font-black bg-white dark:bg-white text-zinc-950 hover:bg-zinc-100 border-none shadow-xl shadow-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Plus className="h-5 w-5 mr-3" />
                Add Formula
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Add Custom Equation</DialogTitle>
                <DialogDescription className="font-medium">
                  Create a new formula to appear in this class's vault.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="formula-name" className="font-bold ml-1">Equation Name</Label>
                  <Input
                    id="formula-name"
                    placeholder="e.g. Einstein's Energy"
                    className="h-11 rounded-xl"
                    value={newFormula.name}
                    onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formula-latex" className="font-bold ml-1">LaTeX Expression</Label>
                  <Textarea
                    id="formula-latex"
                    placeholder="e.g. E = mc^2"
                    className="font-mono rounded-xl min-h-[100px]"
                    value={newFormula.latex}
                    onChange={(e) => setNewFormula({ ...newFormula, latex: e.target.value })}
                  />
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex items-center justify-center min-h-[80px] shadow-inner">
                    {newFormula.latex ? <BlockMath math={newFormula.latex} /> : <span className="text-muted-foreground text-sm italic">Live preview</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formula-category" className="font-bold ml-1">Category</Label>
                  <Select value={newFormula.category} onValueChange={(v) => setNewFormula({ ...newFormula, category: v })}>
                    <SelectTrigger id="formula-category" className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="rounded-lg">{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button onClick={handleAddCustomFormula} className="w-full h-12 rounded-xl font-bold cursor-pointer">Add to Vault</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-zinc-100/50 dark:bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row items-center gap-2 mb-4">
          <div className="w-full lg:w-72">
            <Select value={selectedCourseId} onValueChange={onCourseSelectAttempt}>
              <SelectTrigger className="h-12 rounded-2xl border-none bg-white dark:bg-zinc-900 shadow-sm font-bold px-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Select Class" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id} className="rounded-xl cursor-pointer py-3">{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all vaults..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 rounded-2xl border-none bg-white dark:bg-zinc-900 shadow-sm"
            />
          </div>

          <div className="w-full lg:w-64">
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="h-12 rounded-2xl border-none bg-white dark:bg-zinc-900 shadow-sm font-bold px-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Filter Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id} className="rounded-xl cursor-pointer py-3">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 50, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 50, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-8 left-1/2 z-50"
          >
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 min-w-[400px]">
              <div className="flex items-center gap-3 border-r pr-8 border-zinc-200 dark:border-zinc-800">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-black uppercase tracking-widest text-zinc-500">Unsaved Changes</span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDiscard}
                  className="text-zinc-500 hover:text-destructive hover:bg-destructive/5 font-bold rounded-xl h-10"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 rounded-xl h-10 font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>





      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFormulas.map(formula => {
          const isRestricted = restrictedIds.includes(formula.id);
          const isCustom = formula.isCustom;
          return (
            <Card
              key={formula.id}
              className={`group transition-all duration-300 border-none cursor-pointer rounded-3xl overflow-hidden shadow-md ${isRestricted
                ? "bg-red-50 dark:bg-red-950/20 ring-1 ring-red-200 dark:ring-red-900/50"
                : isCustom
                  ? "bg-primary/5 ring-1 ring-primary/20"
                  : "bg-zinc-50 dark:bg-zinc-900/50 hover:ring-2 hover:ring-primary/50"
                }`}
              onClick={() => toggleFormula(formula.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-black truncate">{formula.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md">
                        {formula.category}
                      </Badge>
                      {isCustom && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {isCustom && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomFormula(formula.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className={`p-2 rounded-xl transition-colors ${isRestricted ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" : "bg-primary/10 text-primary"
                      }`}>
                      {isRestricted ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center justify-center min-h-[100px]">
                  <BlockMath math={formula.latex} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFormulas.length === 0 && (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border-4 border-dashed border-muted/50">
          <PackageOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-xl font-bold text-muted-foreground">No formulas found.</p>
        </div>
      )}
      <ConfirmDialog
        open={!!pendingCourseId}
        onOpenChange={(open: boolean) => !open && setPendingCourseId(null)}
        title="Discard Changes?"
        description="You have unsaved changes in the current vault. Switching classes will discard these changes forever. Continue?"
        onConfirm={confirmCourseSwitch}
        confirmText="Yes, Discard Changes"
        cancelText="Cancel"
      />

      <ConfirmDialog
        open={!!pendingNavUrl}
        onOpenChange={(open: boolean) => !open && setPendingNavUrl(null)}
        title="Unsaved Progress"
        description="It looks like you're trying to leave the Vault Controls. Your unsaved changes will be lost. Are you sure you want to leave?"
        onConfirm={confirmNavigation}
        confirmText="Leave Page"
        cancelText="Stay Here"
      />
    </>
  );
}
