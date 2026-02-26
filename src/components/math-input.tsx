"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { MathBuilderModal } from "@/components/math-builder-modal";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface MathInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  compact?: boolean;
}

interface SymbolButton {
  label: string;
  insert: string;
  tooltip: string;
}

const COMMON_SYMBOLS: SymbolButton[] = [
  { label: "÷", insert: "÷", tooltip: "Division" },
  { label: "×", insert: "×", tooltip: "Multiplication" },
  { label: "±", insert: "±", tooltip: "Plus-minus" },
  { label: "=", insert: " = ", tooltip: "Equals" },
  { label: "≠", insert: "≠", tooltip: "Not equal" },
  { label: "≈", insert: "≈", tooltip: "Approximately equal" },
  { label: "≤", insert: "≤", tooltip: "Less than or equal" },
  { label: "≥", insert: "≥", tooltip: "Greater than or equal" },
];

const GREEK_LETTERS: SymbolButton[] = [
  { label: "α", insert: "α", tooltip: "Alpha (angle, coefficient)" },
  { label: "β", insert: "β", tooltip: "Beta (angle, coefficient)" },
  { label: "γ", insert: "γ", tooltip: "Gamma (angle, coefficient)" },
  { label: "θ", insert: "θ", tooltip: "Theta (angle)" },
  { label: "λ", insert: "λ", tooltip: "Lambda (wavelength)" },
  { label: "μ", insert: "μ", tooltip: "Mu (coefficient, micro)" },
  { label: "π", insert: "π", tooltip: "Pi (3.14159...)" },
  { label: "σ", insert: "σ", tooltip: "Sigma (stress, deviation)" },
  { label: "ω", insert: "ω", tooltip: "Omega (angular velocity)" },
  { label: "Δ", insert: "Δ", tooltip: "Delta (change in)" },
  { label: "Ω", insert: "Ω", tooltip: "Omega (ohm, resistance)" },
];

const ADVANCED_SYMBOLS: SymbolButton[] = [
  { label: "∞", insert: "∞", tooltip: "Infinity" },
];

const PHYSICS_TEMPLATES: SymbolButton[] = [
  { label: "m/s", insert: " m/s", tooltip: "Meters per second" },
  { label: "m/s²", insert: " m/s²", tooltip: "Meters per second squared" },
  { label: "kg⋅m/s", insert: " kg⋅m/s", tooltip: "Momentum units" },
  { label: "N", insert: " N", tooltip: "Newtons (force)" },
];

export function MathInputField({
  value,
  onChange,
  placeholder = "Type your answer here...",
  disabled = false,
  rows = 3,
  compact = false,
}: MathInputFieldProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const [showHelp, setShowHelp] = React.useState(false);
  const [showToolbar, setShowToolbar] = React.useState(false);
  const [builderType, setBuilderType] = React.useState<"fraction" | "vector" | "power" | "sqrt" | "integral" | "partial" | "nabla" | "sum" | "subscript" | null>(null);

  const handleInsert = (textToInsert: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value;

    // Insert text at cursor position
    const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
    onChange(newValue);

    // Set cursor position after the inserted text
    setTimeout(() => {
      const newCursorPos = start + textToInsert.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      setCursorPosition(newCursorPos);
    }, 0);
  };

  const autoFormatText = (text: string): string => {
    let formatted = text;
    
    // Convert simple fractions like 2/3 to LaTeX (but not in existing LaTeX)
    formatted = formatted.replace(/(?<!\$)(\d+)\/(\d+)(?!\$)/g, '$$\\frac{$1}{$2}$$');
    
    // Convert -> to vector notation
    formatted = formatted.replace(/->([a-zA-Z]+)/g, '$$\\vec{$1}$$');
    
    // Convert ^ for powers (e.g., x^2 to x²)
    formatted = formatted.replace(/(?<!\$)([a-zA-Z0-9]+)\^(\d+)(?!\$)/g, '$$$1^{$2}$$');
    
    return formatted;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Check if user just typed a space or Enter (trigger auto-format)
    if (e.nativeEvent instanceof InputEvent) {
      const inputType = (e.nativeEvent as InputEvent).inputType;
      if (inputType === 'insertText' || inputType === 'insertLineBreak') {
        const lastChar = newValue[cursorPos - 1];
        if (lastChar === ' ' || lastChar === '\n') {
          const formatted = autoFormatText(newValue);
          if (formatted !== newValue) {
            onChange(formatted);
            // Adjust cursor position for the added characters
            setTimeout(() => {
              if (textareaRef.current) {
                const diff = formatted.length - newValue.length;
                textareaRef.current.setSelectionRange(cursorPos + diff, cursorPos + diff);
              }
            }, 0);
            return;
          }
        }
      }
    }
    
    onChange(newValue);
    setCursorPosition(cursorPos);
  };

  const handleTextareaSelect = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  const handleBuilderInsert = (latex: string) => {
    handleInsert(latex);
    setBuilderType(null);
  };

  return (
    <div className="space-y-3">
      <MathBuilderModal
        open={builderType !== null}
        type={builderType}
        onClose={() => setBuilderType(null)}
        onInsert={handleBuilderInsert}
      />
      {/* Textarea Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onSelect={handleTextareaSelect}
          onKeyUp={handleTextareaSelect}
          onClick={handleTextareaSelect}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={cn(
            "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          )}
        />
      </div>

      {/* Symbol Toolbar */}
      {!disabled && (
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowToolbar(!showToolbar)}
            className="mb-2 h-8 px-3 text-xs"
          >
            {showToolbar ? <ChevronUp className="h-3 w-3 mr-1.5" /> : <ChevronDown className="h-3 w-3 mr-1.5" />}
            {showToolbar ? "Hide" : "Show"} Math Symbols
          </Button>
          
          {showToolbar && (
            <Card className={cn("p-3", compact && "p-2")}>
              <div className="space-y-3">
                {/* Help Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Math Symbols</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHelp(!showHelp)}
                    className="h-6 px-2 text-xs"
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    {showHelp ? "Hide" : "Help"}
                    {showHelp ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                  </Button>
                </div>

            {/* Help Section */}
            {showHelp && (
              <div className="text-xs space-y-2 p-3 bg-muted/50 rounded-md">
                <p className="font-medium">How to use:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Click any symbol button to insert at your cursor position</li>
                  <li>Example: Click &quot;v&quot; → &quot; = &quot; → &quot;5&quot; → &quot;m/s&quot; creates: v = 5 m/s</li>
                  <li><strong>Fraction/Vector/Power:</strong> Click these buttons to open a simple form</li>
                  <li><strong>Auto-formatting:</strong> Type &quot;2/3&quot; then space → auto-formats as fraction</li>
                  <li>Preview shows exactly how it will appear to students</li>
                  <li>Hover over any button to see what it does</li>
                </ul>
              </div>
            )}

            {/* Common Symbols */}
            {!compact && (
              <>
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Common:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SYMBOLS.map((symbol, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsert(symbol.insert)}
                        className="h-8 min-w-8 px-2 text-sm font-medium"
                        title={symbol.tooltip}
                      >
                        {symbol.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Greek Letters */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Greek Letters:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {GREEK_LETTERS.map((symbol, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsert(symbol.insert)}
                        className="h-8 min-w-8 px-2 text-sm font-medium"
                        title={symbol.tooltip}
                      >
                        {symbol.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Advanced */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Advanced:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ADVANCED_SYMBOLS.map((symbol, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsert(symbol.insert)}
                        className="h-8 min-w-8 px-2 text-sm font-medium"
                        title={symbol.tooltip}
                      >
                        {symbol.label}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setBuilderType("sqrt")}
                      className="h-8 px-2 text-sm font-medium"
                      title="Create a square root"
                    >
                      √ Root
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setBuilderType("fraction")}
                      className="h-8 px-2 text-sm font-medium"
                      title="Create a fraction with top and bottom numbers"
                    >
                      Fraction
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setBuilderType("vector")}
                      className="h-8 px-2 text-sm font-medium"
                      title="Create a vector with arrow notation"
                    >
                      Vector
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setBuilderType("power")}
                      className="h-8 px-2 text-sm font-medium"
                      title="Create an exponent/power"
                    >
                      Power
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setBuilderType("subscript")}
                      className="h-8 px-2 text-sm font-medium"
                      title="Create a subscript"
                    >
                      Subscript
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setBuilderType("integral")}
                      className="h-8 px-2 text-sm font-medium"
                      title="Create an integral"
                    >
                      ∫ Integral
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setBuilderType("partial")}
                      className="h-8 px-2 text-sm font-medium"
                      title="Create a partial derivative"
                    >
                      ∂ Partial
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setBuilderType("nabla")}
                      className="h-8 px-2 text-sm font-medium"
                      title="Create a gradient/nabla"
                    >
                      ∇ Nabla
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setBuilderType("sum")}
                      className="h-8 px-2 text-sm font-medium"
                      title="Create a summation"
                    >
                      ∑ Sum
                    </Button>
                  </div>
                </div>

                {/* Physics Templates */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">Physics Templates:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PHYSICS_TEMPLATES.map((symbol, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleInsert(symbol.insert)}
                        className="h-8 px-2 text-sm font-medium"
                        title={symbol.tooltip}
                      >
                        {symbol.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Compact Mode - Show only essential symbols */}
            {compact && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {[...COMMON_SYMBOLS.slice(0, 6), ...GREEK_LETTERS.slice(0, 4), ...PHYSICS_TEMPLATES.slice(0, 4)].map((symbol, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInsert(symbol.insert)}
                      className="h-7 min-w-7 px-1.5 text-xs"
                      title={symbol.tooltip}
                    >
                      {symbol.label}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setBuilderType("sqrt")}
                    className="h-7 px-1.5 text-xs"
                  >
                    √
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setBuilderType("fraction")}
                    className="h-7 px-1.5 text-xs"
                  >
                    x/y
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setBuilderType("power")}
                    className="h-7 px-1.5 text-xs"
                  >
                    x²
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setBuilderType("subscript")}
                    className="h-7 px-1.5 text-xs"
                  >
                    x₁
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
          )}
        </div>
      )}

      {/* Live Preview */}
      {!compact && (
        <Card className="p-4 bg-muted/30">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
             Live Preview
          </div>
          <div className="min-h-[3rem] flex items-center">
            {value ? (
              <MarkdownRenderer className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
                {value}
              </MarkdownRenderer>
            ) : (
              <span className="text-muted-foreground italic text-sm">Your formatted text will appear here...</span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
