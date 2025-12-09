"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export type BuilderType = "fraction" | "vector" | "power" | "sqrt" | "integral" | "partial" | "nabla" | "sum" | "subscript" | null;

interface MathBuilderModalProps {
  open: boolean;
  type: BuilderType;
  onClose: () => void;
  onInsert: (latex: string) => void;
}

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
      setNumerator("");
      setDenominator("");
      setVariable("");
      setBase("");
      setExponent("");
      setExpression("");
      setSubscript("");
    }
  }, [open]);

  const getPreviewLatex = () => {
    if (type === "fraction") {
      return `$\\frac{${numerator || "top"}}{${denominator || "bottom"}}$`;
    } else if (type === "vector") {
      return `$\\vec{${variable || "v"}}$`;
    } else if (type === "power") {
      return `$${base || "x"}^{${exponent || "2"}}$`;
    } else if (type === "sqrt") {
      return `$\\sqrt{${expression || "x"}}$`;
    } else if (type === "integral") {
      return `$\\int ${expression || "f(x)"}$`;
    } else if (type === "partial") {
      return `$\\partial ${variable || "x"}$`;
    } else if (type === "nabla") {
      return `$\\nabla ${variable || "f"}$`;
    } else if (type === "sum") {
      return `$\\sum ${expression || "x"}$`;
    } else if (type === "subscript") {
      return `$${base || "x"}_{${subscript || "1"}}$`;
    }
    return "";
  };

  const handleInsert = () => {
    let latex = "";
    if (type === "fraction" && numerator && denominator) {
      latex = `$\\frac{${numerator}}{${denominator}}$`;
    } else if (type === "vector" && variable) {
      latex = `$\\vec{${variable}}$`;
    } else if (type === "power" && base && exponent) {
      latex = `$${base}^{${exponent}}$`;
    } else if (type === "sqrt" && expression) {
      latex = `$\\sqrt{${expression}}$`;
    } else if (type === "integral" && expression) {
      latex = `$\\int ${expression}$`;
    } else if (type === "partial" && variable) {
      latex = `$\\partial ${variable}$`;
    } else if (type === "nabla" && variable) {
      latex = `$\\nabla ${variable}$`;
    } else if (type === "sum" && expression) {
      latex = `$\\sum ${expression}$`;
    } else if (type === "subscript" && base && subscript) {
      latex = `$${base}_{${subscript}}$`;
    }
    
    if (latex) {
      onInsert(latex);
      onClose();
    }
  };

  const isValid = () => {
    if (type === "fraction") return numerator && denominator;
    if (type === "vector") return variable;
    if (type === "power") return base && exponent;
    if (type === "sqrt") return expression;
    if (type === "integral") return expression;
    if (type === "partial") return variable;
    if (type === "nabla") return variable;
    if (type === "sum") return expression;
    if (type === "subscript") return base && subscript;
    return false;
  };

  const getTitle = () => {
    if (type === "fraction") return "Create Fraction";
    if (type === "vector") return "Create Vector";
    if (type === "power") return "Create Power/Exponent";
    if (type === "sqrt") return "Create Square Root";
    if (type === "integral") return "Create Integral";
    if (type === "partial") return "Create Partial Derivative";
    if (type === "nabla") return "Create Nabla/Gradient";
    if (type === "sum") return "Create Summation";
    if (type === "subscript") return "Create Subscript";
    return "";
  };

  const getDescription = () => {
    if (type === "fraction") return "Enter the top and bottom numbers of your fraction";
    if (type === "vector") return "Enter the variable name for your vector (e.g., v, F, a)";
    if (type === "power") return "Enter the base and exponent for your power";
    if (type === "sqrt") return "Enter the expression inside the square root";
    if (type === "integral") return "Enter the expression to integrate";
    if (type === "partial") return "Enter the variable for the partial derivative";
    if (type === "nabla") return "Enter the function for the gradient operator";
    if (type === "sum") return "Enter the expression to sum";
    if (type === "subscript") return "Enter the base and subscript (e.g., x₁, v₀)";
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type === "fraction" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="numerator">Top Number (Numerator)</Label>
                <Input
                  id="numerator"
                  placeholder="e.g., 3"
                  value={numerator}
                  onChange={(e) => setNumerator(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="denominator">Bottom Number (Denominator)</Label>
                <Input
                  id="denominator"
                  placeholder="e.g., 5"
                  value={denominator}
                  onChange={(e) => setDenominator(e.target.value)}
                />
              </div>
            </>
          )}

          {type === "vector" && (
            <div className="space-y-2">
              <Label htmlFor="variable">Variable Name</Label>
              <Input
                id="variable"
                placeholder="e.g., v, F, a"
                value={variable}
                onChange={(e) => setVariable(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {type === "power" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="base">Base</Label>
                <Input
                  id="base"
                  placeholder="e.g., x, 10"
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exponent">Exponent</Label>
                <Input
                  id="exponent"
                  placeholder="e.g., 2"
                  value={exponent}
                  onChange={(e) => setExponent(e.target.value)}
                />
              </div>
            </>
          )}

          {type === "sqrt" && (
            <div className="space-y-2">
              <Label htmlFor="expression">Expression</Label>
              <Input
                id="expression"
                placeholder="e.g., x, 25, x²+1"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {type === "integral" && (
            <div className="space-y-2">
              <Label htmlFor="expression">Expression to Integrate</Label>
              <Input
                id="expression"
                placeholder="e.g., f(x), x²"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {type === "partial" && (
            <div className="space-y-2">
              <Label htmlFor="variable">Variable</Label>
              <Input
                id="variable"
                placeholder="e.g., x, y, t"
                value={variable}
                onChange={(e) => setVariable(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {type === "nabla" && (
            <div className="space-y-2">
              <Label htmlFor="variable">Function</Label>
              <Input
                id="variable"
                placeholder="e.g., f, V, φ"
                value={variable}
                onChange={(e) => setVariable(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {type === "sum" && (
            <div className="space-y-2">
              <Label htmlFor="expression">Expression to Sum</Label>
              <Input
                id="expression"
                placeholder="e.g., x, i²"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {type === "subscript" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="base">Base</Label>
                <Input
                  id="base"
                  placeholder="e.g., x, v"
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscript">Subscript</Label>
                <Input
                  id="subscript"
                  placeholder="e.g., 1, 0, initial"
                  value={subscript}
                  onChange={(e) => setSubscript(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="pt-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Preview:</Label>
            <div className="p-4 border rounded-md bg-muted/30 min-h-[60px] flex items-center justify-center">
              <div className="text-2xl">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {getPreviewLatex()}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleInsert} disabled={!isValid()}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
