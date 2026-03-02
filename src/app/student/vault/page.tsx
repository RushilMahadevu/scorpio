"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Calculator,
  Zap,
  Waves,
  Flame,
  Magnet,
  Atom,
  ChevronRight,
  PackageOpen,
  Copy,
  Check,
  Thermometer,
  CloudLightning,
  Sun,
  Rabbit,
  BatteryFull
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { toast } from "sonner";

interface Formula {
  id: string;
  name: string;
  formula: string;
  latex: string;
  description: string;
  category: string;
  variables: { [key: string]: string };
}

const CATEGORIES = [
  { id: "all", name: "All Vaults" },
  { id: "kinematics", name: "Kinematics" },
  { id: "dynamics", name: "Dynamics" },
  { id: "energy", name: "Energy & Momentum" },
  { id: "optics", name: "Waves & Optics" },
  { id: "thermo", name: "Thermodynamics" },
  { id: "electricity", name: "Electricity" },
  { id: "nuclear", name: "Nuclear & Atomic" },
];

const FORMULAS: Formula[] = [
  // Kinematics
  {
    id: "k1",
    name: "Final Velocity",
    formula: "v = u + at",
    latex: "v = u + at",
    description: "Calculates final velocity with constant acceleration.",
    category: "kinematics",
    variables: { v: "Final Velocity", u: "Initial Velocity", a: "Acceleration", t: "Time" }
  },
  {
    id: "k2",
    name: "Displacement",
    formula: "s = ut + ½at²",
    latex: "s = ut + \\frac{1}{2}at^2",
    description: "Calculates displacement over time with constant acceleration.",
    category: "kinematics",
    variables: { s: "Displacement", u: "Initial Velocity", t: "Time", a: "Acceleration" }
  },
  {
    id: "k3",
    name: "Velocity Squared",
    formula: "v² = u² + 2as",
    latex: "v^2 = u^2 + 2as",
    description: "Relates velocity, acceleration, and displacement without time.",
    category: "kinematics",
    variables: { v: "Final Velocity", u: "Initial Velocity", a: "Acceleration", s: "Displacement" }
  },
  {
    id: "k4",
    name: "Average Velocity",
    formula: "v_avg = (u + v)/2",
    latex: "v_{avg} = \\frac{u + v}{2}",
    description: "Mean velocity during constant acceleration.",
    category: "kinematics",
    variables: { v_avg: "Average Velocity", u: "Initial Velocity", v: "Final Velocity" }
  },
  // Dynamics
  {
    id: "d1",
    name: "Newton's Second Law",
    formula: "F = ma",
    latex: "F = ma",
    description: "The force on an object is equal to its mass times its acceleration.",
    category: "dynamics",
    variables: { F: "Net Force", m: "Mass", a: "Acceleration" }
  },
  {
    id: "d2",
    name: "Friction Force",
    formula: "f = μN",
    latex: "f = \\mu N",
    description: "Resistance force acting between two surfaces.",
    category: "dynamics",
    variables: { f: "Friction Force", μ: "Coefficient of Friction", N: "Normal Force" }
  },
  {
    id: "d3",
    name: "Centripetal Force",
    formula: "Fc = mv²/r",
    latex: "F_c = \\frac{mv^2}{r}",
    description: "Force required to keep an object moving in a circular path.",
    category: "dynamics",
    variables: { Fc: "Centripetal Force", m: "Mass", v: "Velocity", r: "Radius" }
  },
  {
    id: "d4",
    name: "Gravitational Force",
    formula: "F = G(m1m2)/r²",
    latex: "F = G \\frac{m_1 m_2}{r^2}",
    description: "Universal law of gravitation between two masses.",
    category: "dynamics",
    variables: { F: "Force", G: "Gravitational Constant", m1: "Mass 1", m2: "Mass 2", r: "Distance" }
  },
  // Energy
  {
    id: "e1",
    name: "Kinetic Energy",
    formula: "KE = ½mv²",
    latex: "K.E. = \\frac{1}{2}mv^2",
    description: "Energy possessed by an object due to its motion.",
    category: "energy",
    variables: { KE: "Kinetic Energy", m: "Mass", v: "Velocity" }
  },
  {
    id: "e3",
    name: "Gravitational PE",
    formula: "PE = mgh",
    latex: "P.E. = mgh",
    description: "Potential energy due to height in a gravity field.",
    category: "energy",
    variables: { PE: "Potential Energy", m: "Mass", g: "Gravity (9.81)", h: "Height" }
  },
  {
    id: "e4",
    name: "Momentum",
    formula: "p = mv",
    latex: "p = mv",
    description: "The quantity of motion of a moving body.",
    category: "energy",
    variables: { p: "Momentum", m: "Mass", v: "Velocity" }
  },
  {
    id: "e5",
    name: "Elastic Potential Energy",
    formula: "PE = ½kx²",
    latex: "U_s = \\frac{1}{2}kx^2",
    description: "Potential energy stored in a spring.",
    category: "energy",
    variables: { Us: "Potential Energy", k: "Spring Constant", x: "Compression" }
  },
  // Thermodynamics
  {
    id: "t1",
    name: "First Law of Thermo",
    formula: "ΔU = Q - W",
    latex: "\\Delta U = Q - W",
    description: "Conservation of energy in thermal processes.",
    category: "thermo",
    variables: { U: "Internal Energy", Q: "Heat Added", W: "Work Done" }
  },
  {
    id: "t2",
    name: "Ideal Gas Law",
    formula: "PV = nRT",
    latex: "PV = nRT",
    description: "Equation of state for a hypothetical ideal gas.",
    category: "thermo",
    variables: { P: "Pressure", V: "Volume", n: "Moles", R: "Gas Constant", T: "Temperature" }
  },
  {
    id: "t3",
    name: "Specific Heat",
    formula: "Q = mcΔT",
    latex: "Q = mc\\Delta T",
    description: "Heat required to change temperature of a mass.",
    category: "thermo",
    variables: { Q: "Heat Transfer", m: "Mass", c: "Specific Heat", T: "Temp Change" }
  },
  // Waves & Optics
  {
    id: "w1",
    name: "Wave Speed",
    formula: "v = fλ",
    latex: "v = f\\lambda",
    description: "Relationship between speed, frequency, and wavelength.",
    category: "optics",
    variables: { v: "Wave Speed", f: "Frequency", λ: "Wavelength" }
  },
  {
    id: "w2",
    name: "Snell's Law",
    formula: "n1 sin θ1 = n2 sin θ2",
    latex: "n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2",
    description: "Calculates the refraction of light through mediums.",
    category: "optics",
    variables: { n: "Refractive Index", θ: "Angle of Incidence" }
  },
  {
    id: "w3",
    name: "Lens Equation",
    formula: "1/f = 1/do + 1/di",
    latex: "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}",
    description: "Calculates image distance vs object distance.",
    category: "optics",
    variables: { f: "Focal Length", do: "Object Distance", di: "Image Distance" }
  },
  // Electricity
  {
    id: "el1",
    name: "Ohm's Law",
    formula: "V = IR",
    latex: "V = IR",
    description: "Relationship between voltage, current, and resistance.",
    category: "electricity",
    variables: { V: "Voltage", I: "Current", R: "Resistance" }
  },
  {
    id: "el2",
    name: "Electrical Power",
    formula: "P = IV",
    latex: "P = IV = I^2 R = \\frac{V^2}{R}",
    description: "Rate of electrical energy transfer.",
    category: "electricity",
    variables: { P: "Power", I: "Current", V: "Voltage", R: "Resistance" }
  },
  {
    id: "el3",
    name: "Coulomb's Law",
    formula: "F = kq1q2/r^2",
    latex: "F = k_e \\frac{q_1 q_2}{r^2}",
    description: "Force between two static electric charges.",
    category: "electricity",
    variables: { F: "Force", k: "Coulomb Constant", q: "Charge", r: "Separation" }
  },
  // Nuclear
  {
    id: "n1",
    name: "Mass-Energy",
    formula: "E = mc²",
    latex: "E = mc^2",
    description: "Equivalence of mass and energy.",
    category: "nuclear",
    variables: { E: "Energy", m: "Mass", c: "Speed of Light" }
  },
  {
    id: "n2",
    name: "Photon Energy",
    formula: "E = hf",
    latex: "E = hf = \\frac{hc}{\\lambda}",
    description: "Energy of a photon based on frequency.",
    category: "nuclear",
    variables: { E: "Energy", h: "Planck's Constant", f: "Frequency", λ: "Wavelength" }
  },
  {
    id: "n3",
    name: "Radioactive Decay",
    formula: "N = N0 e^(-λt)",
    latex: "N(t) = N_0 e^{-\\lambda t}",
    description: "Exponential decay of radioactive substances.",
    category: "nuclear",
    variables: { N: "Remaining nuclei", N0: "Initial nuclei", λ: "Decay constant", t: "Time" }
  }
];

export default function Vault() {
  const { profile } = useAuth();
  const [courseName, setCourseName] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      if (profile?.courseId) {
        const courseDoc = await getDoc(doc(db, "courses", profile.courseId));
        if (courseDoc.exists()) {
          setCourseName(courseDoc.data().name);
        }
      }
    }
    fetchCourse();
  }, [profile?.courseId]);

  const handleCopy = (formula: Formula) => {
    navigator.clipboard.writeText(formula.formula);
    setCopiedId(formula.id);
    toast.success(`${formula.name} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFormulas = FORMULAS.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(search.toLowerCase()) || 
                         formula.formula.toLowerCase().includes(search.toLowerCase()) ||
                         formula.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || formula.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <PackageOpen className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Equation Vault</h1>
            <p className="text-muted-foreground font-medium italic">Master the laws of {courseName || "Physics"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search vault..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 rounded-xl"
            />
          </div>
          <div className="flex items-center border rounded-xl p-1 bg-muted/50">
             <Button 
               variant={viewMode === "grid" ? "secondary" : "ghost"} 
               size="icon" 
               className="cursor-pointer h-9 w-9 px-0 rounded-lg"
               onClick={() => setViewMode("grid")}
             >
                <LayoutGrid className="h-4 w-4" />
             </Button>
             <Button 
               variant={viewMode === "list" ? "secondary" : "ghost"} 
               size="icon" 
               className="cursor-pointer h-9 w-9 px-0 rounded-lg"
               onClick={() => setViewMode("list")}
             >
                <List className="h-4 w-4" />
             </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {CATEGORIES.map(cat => {
          return (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              className={`cursor-pointer rounded-full shrink-0 border-none px-6 font-bold h-10 shadow-sm transition-all ${activeCategory === cat.id ? 'bg-primary' : 'bg-white dark:bg-zinc-800'}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </Button>
          );
        })}
      </div>

      {filteredFormulas.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border-4 border-dashed border-muted/50">
          <PackageOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-xl font-bold text-muted-foreground">Nothing found in the vault.</p>
          <p className="text-sm text-muted-foreground/60">Try searching for a different keyword.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFormulas.map(formula => (
            <Card 
              key={formula.id} 
              className="group hover:ring-2 hover:ring-primary/50 transition-all duration-300 border-none bg-zinc-50 dark:bg-zinc-900/50 shadow-md cursor-pointer rounded-3xl overflow-hidden"
              onClick={() => handleCopy(formula)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                   <CardTitle className="text-xl font-black">{formula.name}</CardTitle>
                   <div className="flex items-center gap-2">
                     <Badge variant="secondary" className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md">
                       {formula.category}
                     </Badge>
                   </div>
                </div>
                <CardDescription className="text-sm font-medium line-clamp-1">{formula.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 text-center shadow-sm group-hover:shadow-md transition-all relative flex flex-col items-center justify-center min-h-[120px]">
                   <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
                     <BlockMath math={formula.latex} />
                   </div>
                   <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     {copiedId === formula.id ? (
                       <Check className="h-5 w-5 text-emerald-500" />
                     ) : (
                       <Copy className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                </div>
                <div className="grid grid-cols-1 gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-auto">
                  {Object.entries(formula.variables).map(([symbol, name]) => (
                    <div key={symbol} className="text-[11px] flex items-center gap-2 text-muted-foreground font-medium">
                      <span className="font-black text-primary font-mono w-5 inline-flex justify-center bg-primary/5 rounded py-0.5">{symbol}</span>
                      <span className="truncate">{name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/50">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredFormulas.map(formula => (
              <div 
                key={formula.id} 
                className="p-6 flex items-center justify-between group hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                onClick={() => handleCopy(formula)}
              >
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-extrabold text-lg">{formula.name}</h3>
                  <p className="text-sm text-muted-foreground truncate font-medium">{formula.description}</p>
                </div>
                <div className="flex-1 flex justify-center py-4">
                  <InlineMath math={formula.latex} />
                </div>
                <div className="flex-1 flex items-center justify-end gap-4">
                   <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest py-1 border-zinc-300 dark:border-zinc-700">{formula.category}</Badge>
                   <div className="w-8 flex justify-end">
                     {copiedId === formula.id ? (
                       <Check className="h-5 w-5 text-emerald-500" />
                     ) : (
                       <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                     )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Quick Tools */}
      <div className="grid gap-6 md:grid-cols-4 pt-4">
          <Card className="bg-zinc-900 text-white border-none shadow-lg rounded-3xl overflow-hidden col-span-1">
             <CardHeader className="align-center flex-col items-start space-y-4 p-6">
                <CardTitle className="text-lg font-black">Universal Constants</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 p-6">
                {[
                  { s: "g", v: "9.81 m/s²", n: "Gravity" },
                  { s: "G", v: "6.67 × 10⁻¹¹", n: "Gravitation" },
                  { s: "c", v: "3.00 × 10⁸ m/s", n: "Light Speed" },
                  { s: "h", v: "6.63 × 10⁻³⁴ Js", n: "Planck's" },
                ].map(item => (
                  <div key={item.s} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-center">
                       <span className="text-zinc-500 font-mono italic text-xs font-bold">{item.s}</span>
                       <span className="font-black text-white text-sm">{item.v}</span>
                    </div>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">{item.n}</span>
                  </div>
                ))}
             </CardContent>
          </Card>

          <Card className="md:col-span-3 border-none bg-primary/5 rounded-3xl shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4">
                <Sun className="h-32 w-32 text-primary rotate-12" />
             </div>
             <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CloudLightning className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-black">Class Data Stream</CardTitle>
                </div>
                <CardDescription className="text-base font-medium">
                  Centralized reference for {"General Physics"} (V1.2)
                </CardDescription>
             </CardHeader>
             <CardContent>
                <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-primary/10 rounded-2xl p-6">
                  <p className="text-muted-foreground font-medium italic leading-relaxed">
                    "Your teacher has not uploaded specific formula restrictions for this class. All standard physics equations are currently visible. Click any formula card to copy its calculation ready form."
                  </p>
                </div>
             </CardContent>
          </Card>
      </div>
    </div>
  );
}
