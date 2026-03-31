"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export type BuilderType =
  | "fraction"
  | "vector"
  | "power"
  | "sqrt"
  | "integral"
  | "partial"
  | "nabla"
  | "sum"
  | "subscript"
  | null;

interface MathBuilderModalProps {
  open: boolean;
  type: BuilderType;
  onClose: () => void;
  onInsert: (latex: string) => void;
}

// Visual preview component — renders KaTeX from the internally-generated LaTeX
function MathPreview({ latex }: { latex: string }) {
  if (!latex) return null;
  return (
    <div className="flex items-center justify-center min-h-[56px]">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {`$${latex}$`}
      </ReactMarkdown>
    </div>
  );
}

// Shows a clear descriptive label & a field, completely abstracted from LaTeX
function FieldRow({ label, hint, value, onChange, autoFocus = false, id }: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  id: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground leading-snug">{hint}</p>}
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        className="font-mono"
        placeholder={hint}
      />
    </div>
  );
}

const BUILDER_CONFIG: Record<
  Exclude<BuilderType, null>,
  {
    title: string;
    description: string;
    symbol: string;
    example: string;
  }
> = {
  fraction: {
    title: "Fraction",
    description: "Enter the top number and bottom number of your fraction.",
    symbol: "½",
    example: "e.g.,  3 over 4 → ¾",
  },
  vector: {
    title: "Vector",
    description: "Enter the variable name for your vector (a letter like v, F, or a).",
    symbol: "→",
    example: "e.g., v, F, a",
  },
  power: {
    title: "Exponent / Power",
    description: "Enter the base (the main number) and the exponent (the small raised number).",
    symbol: "xⁿ",
    example: "e.g., base = x, exponent = 2 → x²",
  },
  sqrt: {
    title: "Square Root",
    description: "Enter what goes inside the square root symbol √",
    symbol: "√",
    example: "e.g., 25, x+1",
  },
  integral: {
    title: "Integral",
    description: "Enter the expression you want to integrate (the function after the ∫ sign).",
    symbol: "∫",
    example: "e.g., f(x), x^2",
  },
  partial: {
    title: "Partial Derivative",
    description: "Enter the variable you are differentiating with respect to.",
    symbol: "∂",
    example: "e.g., x, y, t",
  },
  nabla: {
    title: "Gradient / Nabla (∇)",
    description: "Enter the function the gradient acts on.",
    symbol: "∇",
    example: "e.g., f, V, phi",
  },
  sum: {
    title: "Summation (Σ)",
    description: "Enter the expression inside the summation.",
    symbol: "Σ",
    example: "e.g., x_i, n^2",
  },
  subscript: {
    title: "Subscript",
    description: "Enter the main symbol and its subscript (small number or letter below it).",
    symbol: "x₁",
    example: "e.g., symbol = v, subscript = 0 → v₀",
  },
};

export function MathBuilderModal({ open, type, onClose, onInsert }: MathBuilderModalProps) {
  const [numerator, setNumerator] = React.useState("");
  const [denominator, setDenominator] = React.useState("");
  const [variable, setVariable] = React.useState("");
  const [base, setBase] = React.useState("");
  const [exponent, setExponent] = React.useState("");
  const [expression, setExpression] = React.useState("");
  const [subscript, setSubscript] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setNumerator(""); setDenominator(""); setVariable("");
      setBase(""); setExponent(""); setExpression(""); setSubscript("");
    }
  }, [open, type]);

  // Builds the internal LaTeX (invisible to student - only used for rendering preview & output)
  const buildLatex = (): string => {
    if (type === "fraction") return `\\frac{${numerator || "\\square"}}{${denominator || "\\square"}}`;
    if (type === "vector") return `\\vec{${variable || "v"}}`;
    if (type === "power") return `${base || "x"}^{${exponent || "2"}}`;
    if (type === "sqrt") return `\\sqrt{${expression || "x"}}`;
    if (type === "integral") return `\\int ${expression || "f(x)"}`;
    if (type === "partial") return `\\partial ${variable || "x"}`;
    if (type === "nabla") return `\\nabla ${variable || "f"}`;
    if (type === "sum") return `\\sum ${expression || "x"}`;
    if (type === "subscript") return `${base || "x"}_{${subscript || "1"}}`;
    return "";
  };

  const isValid = (): boolean => {
    if (type === "fraction") return !!(numerator && denominator);
    if (type === "vector") return !!variable;
    if (type === "power") return !!(base && exponent);
    if (type === "sqrt") return !!expression;
    if (type === "integral") return !!expression;
    if (type === "partial") return !!variable;
    if (type === "nabla") return !!variable;
    if (type === "sum") return !!expression;
    if (type === "subscript") return !!(base && subscript);
    return false;
  };

  const handleInsert = () => {
    if (!isValid()) return;
    const latex = buildLatex();
    onInsert(`$${latex}$`);
    onClose();
  };

  if (!type) return null;
  const config = BUILDER_CONFIG[type];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary select-none">
              {config.symbol}
            </div>
            <div>
              <DialogTitle className="text-base">{config.title}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* === Fraction === */}
          {type === "fraction" && (
            <div className="space-y-3">
              <FieldRow id="numerator" label="Top Number (Numerator)" hint="e.g., 3" value={numerator} onChange={setNumerator} autoFocus />
              <FieldRow id="denominator" label="Bottom Number (Denominator)" hint="e.g., 4" value={denominator} onChange={setDenominator} />
            </div>
          )}

          {/* === Vector === */}
          {type === "vector" && (
            <FieldRow id="variable" label="Variable Name" hint="e.g., v, F, a" value={variable} onChange={setVariable} autoFocus />
          )}

          {/* === Power === */}
          {type === "power" && (
            <div className="space-y-3">
              <FieldRow id="base" label="Base (main symbol)" hint="e.g., x, 10" value={base} onChange={setBase} autoFocus />
              <FieldRow id="exponent" label="Exponent (raised number)" hint="e.g., 2, 3" value={exponent} onChange={setExponent} />
            </div>
          )}

          {/* === Square Root === */}
          {type === "sqrt" && (
            <FieldRow id="expression" label="Inside the Square Root" hint="e.g., 25, x+1" value={expression} onChange={setExpression} autoFocus />
          )}

          {/* === Integral === */}
          {type === "integral" && (
            <FieldRow id="expression" label="Function to Integrate" hint="e.g., f(x), x^2" value={expression} onChange={setExpression} autoFocus />
          )}

          {/* === Partial Derivative === */}
          {type === "partial" && (
            <FieldRow id="variable" label="Variable to Differentiate" hint="e.g., x, y, t" value={variable} onChange={setVariable} autoFocus />
          )}

          {/* === Nabla === */}
          {type === "nabla" && (
            <FieldRow id="variable" label="Function" hint="e.g., f, V" value={variable} onChange={setVariable} autoFocus />
          )}

          {/* === Sum === */}
          {type === "sum" && (
            <FieldRow id="expression" label="Expression Inside Sum" hint="e.g., x_i, n^2" value={expression} onChange={setExpression} autoFocus />
          )}

          {/* === Subscript === */}
          {type === "subscript" && (
            <div className="space-y-3">
              <FieldRow id="base" label="Main Symbol" hint="e.g., v, x" value={base} onChange={setBase} autoFocus />
              <FieldRow id="subscript" label="Subscript (small number/letter below)" hint="e.g., 0, i, initial" value={subscript} onChange={setSubscript} />
            </div>
          )}

          {/* Live Rendered Preview — student sees the math visually, not as code */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Preview</p>
            <div className="text-2xl text-center min-h-[56px] flex items-center justify-center">
              {isValid() ? (
                <MathPreview latex={buildLatex()} />
              ) : (
                <span className="text-muted-foreground text-sm italic font-normal">Fill in the fields above to see a preview</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleInsert} disabled={!isValid()}>
            Insert into Answer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
