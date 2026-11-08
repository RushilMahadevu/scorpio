"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  LayoutGrid, 
  List, 
  PackageOpen,
  Copy,
  Check,
  BatteryFull
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkspaceHeader } from "@/components/ui/workspace";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InlineMath } from "react-katex";
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
  { id: "all", name: "All categories" },
  { id: "kinematics", name: "Kinematics" },
  { id: "dynamics", name: "Dynamics" },
  { id: "energy", name: "Energy & Momentum" },
  { id: "optics", name: "Waves & Optics" },
  { id: "thermo", name: "Thermodynamics" },
  { id: "electricity", name: "Electricity" },
  { id: "nuclear", name: "Nuclear & Atomic" },
  { id: "custom", name: "Custom Equations" },
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
  const [restrictedIds, setRestrictedIds] = useState<string[]>([]);
  const [customFormulas, setCustomFormulas] = useState<Formula[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      if (profile?.courseId) {
        const courseDoc = await getDoc(doc(db, "courses", profile.courseId));
        if (courseDoc.exists()) {
          const data = courseDoc.data();
          setCourseName(data.name);
          setRestrictedIds(data.restrictedFormulaIds || []);
          setCustomFormulas(data.customFormulas || []);
        }
      }
    }
    fetchCourse();
  }, [profile?.courseId]);

  const handleCopy = (formula: Formula) => {
    navigator.clipboard.writeText(formula.formula || formula.latex);
    setCopiedId(formula.id);
    toast.success(`${formula.name} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allFormulas = [...FORMULAS, ...customFormulas];

  const filteredFormulas = allFormulas.filter(formula => {
    // Check if formula is restricted by teacher
    if (restrictedIds.includes(formula.id)) return false;

    const matchesSearch = formula.name.toLowerCase().includes(search.toLowerCase()) || 
                         formula.formula.toLowerCase().includes(search.toLowerCase()) ||
                         formula.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || formula.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      <WorkspaceHeader title="Equation Vault" description={`Search formulas and constants for ${courseName || "physics"}.`} />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-48 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search formulas…"
            aria-label="Search formulas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger aria-label="Formula category"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1" role="group" aria-label="Formula layout">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")} aria-label="Grid view" aria-pressed={viewMode === "grid"}><LayoutGrid /></Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")} aria-label="List view" aria-pressed={viewMode === "list"}><List /></Button>
        </div>
      </div>

      {restrictedIds.length > 0 && <p className="text-sm text-muted-foreground">Your class can only see formulas approved by your teacher.</p>}

      {filteredFormulas.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <PackageOpen className="mx-auto mb-2 size-5 text-muted-foreground" />
          <p className="font-medium">Nothing found in the vault.</p>
          <p className="text-sm text-muted-foreground">Try another search or category.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {filteredFormulas.map(formula => (
            <Card 
              key={formula.id} 
              className="min-w-0 gap-3 py-4 shadow-none"
            >
              <CardHeader className="px-4">
                <div className="flex flex-wrap justify-between gap-2">
                   <CardTitle className="break-words text-base">{formula.name}</CardTitle>
                   <div className="flex items-center gap-2">
                     <Badge variant="secondary" className="capitalize">
                       {formula.category}
                     </Badge>
                   </div>
                </div>
                <CardDescription className="break-words text-sm">{formula.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3">
                  <div className="min-w-0 flex-1 overflow-x-auto py-3 text-center"><InlineMath math={formula.latex} /></div>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(formula)} aria-label={copiedId === formula.id ? `Copied ${formula.name}` : `Copy ${formula.name}`}>
                    {copiedId === formula.id ? <Check /> : <Copy />}
                  </Button>
                </div>
                <div className="space-y-1">
                  {formula.variables && Object.entries(formula.variables).map(([symbol, name]) => (
                    <div key={symbol} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="shrink-0 font-mono text-foreground">{symbol}</span>
                      <span className="break-words">{name}</span>
                    </div>
                  ))}
                  {!formula.variables && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground italic">
                      No variable definitions provided.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {filteredFormulas.map((formula) => (
            <li key={formula.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1 basis-48">
                <h2 className="break-words text-sm font-medium">{formula.name}</h2>
                <p className="break-words text-xs text-muted-foreground">{formula.description}</p>
              </div>
              <div className="min-w-0 max-w-full overflow-x-auto"><InlineMath math={formula.latex} /></div>
              <Badge variant="outline" className="capitalize">{formula.category}</Badge>
              <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(formula)} aria-label={copiedId === formula.id ? `Copied ${formula.name}` : `Copy ${formula.name}`}>
                {copiedId === formula.id ? <Check /> : <Copy />}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <details className="rounded-xl border border-border bg-card">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Universal constants</summary>
        <dl className="grid gap-3 border-t border-border p-4 sm:grid-cols-2">
          {[
            { s: "g", v: "9.81 m/s²", n: "Gravity" },
            { s: "G", v: "6.67 × 10⁻¹¹", n: "Gravitation" },
            { s: "c", v: "3.00 × 10⁸ m/s", n: "Light speed" },
            { s: "h", v: "6.63 × 10⁻³⁴ Js", n: "Planck’s constant" },
          ].map((item) => (
            <div key={item.s} className="text-sm">
              <dt className="text-muted-foreground">{item.n}</dt>
              <dd className="font-mono">{item.s} = {item.v}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
