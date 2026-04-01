"use client";

import { useState, useEffect } from "react";
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
  Variable
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <PackageCheck className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Vault Controls</h1>
            <p className="text-muted-foreground font-medium italic">Define formula restrictions and add custom equations</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-64">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="h-11 rounded-xl cursor-pointer">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id} className="cursor-pointer">{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog open={isAddingFormula} onOpenChange={setIsAddingFormula}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-11 px-4 rounded-xl font-bold cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Formula
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Custom Equation</DialogTitle>
                  <DialogDescription>
                    Create a new formula to appear in this class's vault.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="formula-name">Equation Name</Label>
                    <Input 
                      id="formula-name" 
                      placeholder="e.g. Einstein's Energy" 
                      value={newFormula.name}
                      onChange={(e) => setNewFormula({...newFormula, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formula-latex">LaTeX Expression</Label>
                    <Textarea 
                      id="formula-latex" 
                      placeholder="e.g. E = mc^2" 
                      className="font-mono"
                      value={newFormula.latex}
                      onChange={(e) => setNewFormula({...newFormula, latex: e.target.value})}
                    />
                    <div className="bg-muted p-4 rounded-lg flex items-center justify-center min-h-[60px]">
                      {newFormula.latex ? <BlockMath math={newFormula.latex} /> : <span className="text-muted-foreground text-sm italic">Preview will appear here</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formula-category">Category</Label>
                    <Select value={newFormula.category} onValueChange={(v) => setNewFormula({...newFormula, category: v})}>
                      <SelectTrigger id="formula-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddCustomFormula} className="cursor-pointer">Add to Vault</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={handleSave} 
              disabled={saving || !selectedCourseId}
              className="flex-1 sm:flex-none h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-none bg-primary/5 rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Info className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-wider">Management Instructions</CardTitle>
          </div>
          <CardDescription className="text-base font-medium">
            Toggle <Unlock className="inline h-3 w-3 mb-1" /> **Standard Formulas** to hide them from students. You can also create **Custom Equations** specifically for your curriculum. Don't forget to **Save Changes** when finished.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search vault..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl w-full"
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="h-11 rounded-xl cursor-pointer">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFormulas.map(formula => {
          const isRestricted = restrictedIds.includes(formula.id);
          const isCustom = formula.isCustom;
          return (
            <Card 
              key={formula.id} 
              className={`group transition-all duration-300 border-none cursor-pointer rounded-3xl overflow-hidden shadow-md ${
                isRestricted 
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
                    <div className={`p-2 rounded-xl transition-colors ${
                      isRestricted ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" : "bg-primary/10 text-primary"
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
    </div>
  );
}
