"use client";

import * as React from "react";
import { useRef, useEffect, useCallback, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { MathBuilderModal, type BuilderType } from "@/components/math-builder-modal";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { cn } from "@/lib/utils";
import { Bold, Italic, List, ListOrdered, Calculator, AtSign, ChevronDown, ChevronUp, PenLine, Eye } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function valueToHTML(value: string): string {
  if (!value) return "";
  
  // 1. Isolate Math Chips to protect them from parsing
  const chips: string[] = [];
  let processed = value.replace(/\$(.*?)\$/g, (_, latex) => {
    chips.push(latex);
    return `__MATH_${chips.length - 1}__`;
  });
  
  processed = esc(processed);
  processed = processed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  processed = processed.replace(/_(.*?)_/g, "<em>$1</em>");
  
  // Create blocks / lists
  const lines = processed.split("\n");
  let html = "";
  let inUL = false;
  let inOL = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ulMatch = line.match(/^-\s+(.*)$/);
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    
    if (ulMatch) {
      if (inOL) { html += "</ol>"; inOL = false; }
      if (!inUL) { html += "<ul>"; inUL = true; }
      html += `<li>${ulMatch[1]}</li>`;
    } else if (olMatch) {
      if (inUL) { html += "</ul>"; inUL = false; }
      if (!inOL) { html += "<ol>"; inOL = true; }
      html += `<li>${olMatch[1]}</li>`;
    } else {
      if (inUL) { html += "</ul>"; inUL = false; }
      if (inOL) { html += "</ol>"; inOL = false; }
      html += `<div>${line || "<br>"}</div>`;
    }
  }
  if (inUL) html += "</ul>";
  if (inOL) html += "</ol>";
  
  return html.replace(/__MATH_(\d+)__/g, (_, idx) => chipHTML(chips[Number(idx)]));
}

function chipHTML(latex: string): string {
  try {
    const rendered = katex.renderToString(latex, { throwOnError: false, displayMode: false, output: "html" });
    return `<span contenteditable="false" data-math="${esc(latex)}" class="math-chip">${rendered}</span>`;
  } catch {
    return `<span contenteditable="false" data-math="${esc(latex)}" class="math-chip">[${esc(latex)}]</span>`;
  }
}

function domToValue(div: HTMLElement): string {
  let out = "";
  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) { out += node.textContent ?? ""; return; }
    if (!(node instanceof HTMLElement)) return;
    if (node.hasAttribute("data-math")) { out += `$${node.getAttribute("data-math")}$`; return; }
    const tag = node.tagName.toUpperCase();
    if (tag === "BR") { out += "\n"; return; }
    if (tag === "STRONG" || tag === "B") { out += "**"; node.childNodes.forEach(walk); out += "**"; return; }
    if (tag === "EM" || tag === "I") { out += "_"; node.childNodes.forEach(walk); out += "_"; return; }
    if (tag === "LI") { 
      const parentTag = node.parentElement?.tagName.toUpperCase();
      out += parentTag === "OL" ? "\n1. " : "\n- "; 
      node.childNodes.forEach(walk); 
      return; 
    }
    if (tag === "UL" || tag === "OL") { 
      if (out !== "" && !out.endsWith("\n")) out += "\n";
      node.childNodes.forEach(walk); 
      return; 
    }
    if (tag === "DIV" || tag === "P") {
      // If we are starting a block AND already have content, add a newline
      if (out !== "" && !out.endsWith("\n")) out += "\n";
      node.childNodes.forEach(walk);
      return;
    }
    node.childNodes.forEach(walk);
  }
  div.childNodes.forEach(walk);
  return out;
}

// ─── Symbol data ──────────────────────────────────────────────────────────────
interface Sym { label: string; insert: string; tip: string; }
const COMMON_SYMS: Sym[] = [
  { label: "÷", insert: "÷", tip: "Division" }, { label: "×", insert: "×", tip: "Multiplication" },
  { label: "±", insert: "±", tip: "Plus or minus" }, { label: "≠", insert: "≠", tip: "Not equal" },
  { label: "≈", insert: "≈", tip: "Approx. equal" }, { label: "≤", insert: "≤", tip: "≤" },
  { label: "≥", insert: "≥", tip: "≥" }, { label: "∞", insert: "∞", tip: "Infinity" },
  { label: "°", insert: "°", tip: "Degrees" }, { label: "²", insert: "²", tip: "Squared" },
  { label: "³", insert: "³", tip: "Cubed" },
];
const GREEK_SYMS: Sym[] = [
  { label: "α", insert: "α", tip: "Alpha" }, { label: "β", insert: "β", tip: "Beta" },
  { label: "γ", insert: "γ", tip: "Gamma" }, { label: "θ", insert: "θ", tip: "Theta" },
  { label: "λ", insert: "λ", tip: "Lambda" }, { label: "μ", insert: "μ", tip: "Mu" },
  { label: "π", insert: "π", tip: "Pi" }, { label: "σ", insert: "σ", tip: "Sigma" },
  { label: "ω", insert: "ω", tip: "Omega" }, { label: "Δ", insert: "Δ", tip: "Delta" },
  { label: "φ", insert: "φ", tip: "Phi" }, { label: "ρ", insert: "ρ", tip: "Rho" },
  { label: "Ω", insert: "Ω", tip: "Ohm" },
];
const PHYSICS_UNITS: Sym[] = [
  { label: "m/s", insert: " m/s", tip: "m/s" }, { label: "m/s²", insert: " m/s²", tip: "Acceleration" },
  { label: "kg", insert: " kg", tip: "Kilograms" }, { label: "N", insert: " N", tip: "Newtons" },
  { label: "J", insert: " J", tip: "Joules" }, { label: "W", insert: " W", tip: "Watts" },
  { label: "Pa", insert: " Pa", tip: "Pascals" }, { label: "Hz", insert: " Hz", tip: "Hertz" },
];
const MATH_BUILDERS: { label: string; type: BuilderType; symbol: string; desc: string }[] = [
  { label: "Fraction", type: "fraction", symbol: "½", desc: "like 3/4" },
  { label: "Power", type: "power", symbol: "x²", desc: "like x²" },
  { label: "√ Root", type: "sqrt", symbol: "√", desc: "like √25" },
  { label: "Subscript", type: "subscript", symbol: "x₁", desc: "like v₀" },
  { label: "Vector", type: "vector", symbol: "v⃗", desc: "like F⃗" },
  { label: "∫ Integral", type: "integral", symbol: "∫", desc: "integral" },
  { label: "Σ Sum", type: "sum", symbol: "Σ", desc: "summation" },
  { label: "∂ Partial", type: "partial", symbol: "∂", desc: "partial deriv." },
  { label: "∇ Nabla", type: "nabla", symbol: "∇", desc: "gradient" },
];

// ─── Component ────────────────────────────────────────────────────────────────
type Tab = "math" | "symbols" | "writing";

interface MathInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  compact?: boolean;
}

export function MathInputField({
  value,
  onChange,
  placeholder = "Type your answer here…",
  disabled = false,
  rows = 4,
  compact = false,
}: MathInputFieldProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastExtracted = useRef("");
  // ← KEY FIX: save the cursor range before the modal opens and steals focus
  const savedRange = useRef<Range | null>(null);

  const [showToolbar, setShowToolbar] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("math");
  const [builderType, setBuilderType] = useState<BuilderType>(null);
  const [showPreview, setShowPreview] = useState(true);

  // Sync external value → DOM (only when change came from outside)
  useEffect(() => {
    const div = editorRef.current;
    if (!div) return;
    if (value !== lastExtracted.current) {
      div.innerHTML = valueToHTML(value);
      lastExtracted.current = value;
    }
  }, [value]);

  const syncValue = useCallback(() => {
    const div = editorRef.current;
    if (!div) return;
    const extracted = domToValue(div);
    lastExtracted.current = extracted;
    onChange(extracted);
  }, [onChange]);

  // Insert text at cursor
  const insertText = useCallback((text: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand("insertText", false, text);
    syncValue();
  }, [disabled, syncValue]);

  // ← KEY FIX: Save range before modal steals focus, restore on insert
  const openBuilder = useCallback((type: BuilderType) => {
    // Capture current selection *before* Dialog opens and focus moves away
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    } else {
      // If no selection, place at end of editor
      const div = editorRef.current;
      if (div) {
        const range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(false);
        savedRange.current = range;
      }
    }
    setBuilderType(type);
  }, []);

  const insertMath = useCallback((latexWithDollars: string) => {
    const div = editorRef.current;
    if (!div || disabled) return;
    const raw = latexWithDollars.replace(/^\$|\$$/g, "");

    // Restore saved range (cursor was lost when Dialog opened)
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      } catch {
        // Range may be detached; fall back to appending
      }
    }

    // Build rendered chip
    const chip = document.createElement("span");
    chip.contentEditable = "false";
    chip.setAttribute("data-math", raw);
    chip.className = "math-chip";
    try { katex.render(raw, chip, { throwOnError: false, displayMode: false }); }
    catch { chip.textContent = `[${raw}]`; }

    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const anchor = document.createTextNode("\u200B");
      range.insertNode(anchor);
      range.insertNode(chip);
      const newRange = document.createRange();
      newRange.setStartAfter(anchor);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else {
      // Fallback: append to div
      div.appendChild(chip);
      div.appendChild(document.createTextNode("\u200B"));
    }

    savedRange.current = null;
    syncValue();
    setBuilderType(null);
  }, [disabled, syncValue]);

  const applyFormat = useCallback((cmd: "bold" | "italic") => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(cmd, false);
    syncValue();
  }, [disabled, syncValue]);

  const applyList = useCallback((type: "unordered" | "ordered") => {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(type === "ordered" ? "insertOrderedList" : "insertUnorderedList", false);
    syncValue();
  }, [disabled, syncValue]);

  const symCls = cn(
    "inline-flex items-center justify-center rounded border border-border",
    "bg-background hover:bg-muted active:scale-95 transition-all font-medium text-foreground select-none cursor-pointer",
    compact ? "h-7 min-w-[28px] px-1.5 text-xs" : "h-8 min-w-[32px] px-2 text-sm",
  );

  return (
    <div className="space-y-2">
      <MathBuilderModal
        open={builderType !== null}
        type={builderType}
        onClose={() => setBuilderType(null)}
        onInsert={insertMath}
      />

      {/* ── Contenteditable answer field ── */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={syncValue}
          onBlur={syncValue}
          className={cn(
            "w-full rounded-lg border border-input bg-transparent px-3 py-2.5 outline-none",
            "text-base md:text-sm leading-relaxed transition-[color,box-shadow] shadow-xs",
            "focus:ring-2 focus:ring-ring/50 focus:border-ring",
            "[&_.math-chip]:inline-flex [&_.math-chip]:items-center [&_.math-chip]:mx-0.5",
            "[&_.math-chip]:px-1.5 [&_.math-chip]:py-0.5 [&_.math-chip]:rounded-md",
            "[&_.math-chip]:bg-violet-100 [&_.math-chip]:dark:bg-violet-950/40",
            "[&_.math-chip]:border [&_.math-chip]:border-violet-300 [&_.math-chip]:dark:border-violet-700",
            "[&_.math-chip]:text-violet-800 [&_.math-chip]:dark:text-violet-300",
            "[&_.math-chip]:select-none [&_.math-chip]:cursor-default [&_.math-chip]:text-sm",
            "[&_strong]:font-bold [&_em]:italic",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          )}
          style={{ minHeight: `${rows * 1.75}rem` }}
        />
        {/* Placeholder overlay — shown only when div is empty */}
        {!value && (
          <span className="absolute top-2.5 left-3 text-muted-foreground pointer-events-none text-sm md:text-sm">
            {placeholder}
          </span>
        )}
      </div>

      {/* ── Toolbar & preview toggle row ── */}
      {!disabled && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowToolbar((v) => !v); }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
              showToolbar
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
            )}
          >
            <Calculator className="h-3 w-3" />
            {showToolbar ? "Hide Tools" : "Math & Formatting"}
            {showToolbar ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {!compact && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowPreview((v) => !v); }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                showPreview
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
              )}
            >
              <Eye className="h-3 w-3" />
              {showPreview ? "Hide Preview" : "Preview Answer"}
            </button>
          )}
        </div>
      )}

      {/* ── Live rendered preview ── */}
      {showPreview && !compact && (
        <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Rendered Preview
          </p>
          {value ? (
            <MarkdownRenderer className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
              {value}
            </MarkdownRenderer>
          ) : (
            <span className="text-sm text-muted-foreground italic">Start typing to see a preview…</span>
          )}
        </div>
      )}

      {/* ── Toolbar panel ── */}
      {showToolbar && !disabled && (
        <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border bg-muted/40">
            {([
              { id: "math" as Tab, label: "Math", icon: <Calculator className="h-3 w-3" /> },
              { id: "symbols" as Tab, label: "Symbols", icon: <AtSign className="h-3 w-3" /> },
              { id: "writing" as Tab, label: "Writing", icon: <PenLine className="h-3 w-3" /> },
            ]).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition-all cursor-pointer",
                  activeTab === tab.id
                    ? "text-foreground bg-background border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          <div className="p-3 space-y-3">
            {/* MATH TAB */}
            {activeTab === "math" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Click a button — a guided form opens. You&apos;ll see a preview of the math before inserting. No code to type!
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {MATH_BUILDERS.map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); openBuilder(b.type); }}
                      className="flex items-center gap-2 rounded-lg border border-border p-2.5 bg-background hover:bg-primary/5 hover:border-primary/40 active:scale-[0.98] transition-all text-left cursor-pointer"
                    >
                      <span className="text-lg w-6 text-center shrink-0">{b.symbol}</span>
                      <div>
                        <div className="text-xs font-semibold">{b.label}</div>
                        <div className="text-[10px] text-muted-foreground">{b.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SYMBOLS TAB */}
            {activeTab === "symbols" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Operators</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SYMS.map((s, i) => (
                      <button key={i} type="button" title={s.tip} className={symCls}
                        onMouseDown={(e) => { e.preventDefault(); insertText(s.insert); }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Greek Letters</p>
                  <div className="flex flex-wrap gap-1.5">
                    {GREEK_SYMS.map((s, i) => (
                      <button key={i} type="button" title={s.tip} className={symCls}
                        onMouseDown={(e) => { e.preventDefault(); insertText(s.insert); }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                {!compact && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Physics Units</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PHYSICS_UNITS.map((s, i) => (
                        <button key={i} type="button" title={s.tip} className={symCls}
                          onMouseDown={(e) => { e.preventDefault(); insertText(s.insert); }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WRITING TAB */}
            {activeTab === "writing" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Select words in your answer, then click <strong>Bold</strong> or <strong>Italic</strong>.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { icon: <Bold className="h-4 w-4" />, label: "Bold", action: () => applyFormat("bold") },
                    { icon: <Italic className="h-4 w-4" />, label: "Italic", action: () => applyFormat("italic") },
                    { icon: <List className="h-4 w-4" />, label: "Bullets", action: () => applyList("unordered") },
                    { icon: <ListOrdered className="h-4 w-4" />, label: "Numbered", action: () => applyList("ordered") },
                  ].map((b, i) => (
                    <button key={i} type="button"
                      onMouseDown={(e) => { e.preventDefault(); b.action(); }}
                      className="inline-flex items-center gap-1.5 rounded border border-border bg-background hover:bg-muted active:scale-95 transition-all h-8 px-2.5 text-sm font-medium text-foreground cursor-pointer">
                      {b.icon}{b.label}
                    </button>
                  ))}
                  {[
                    { label: "→ Arrow", insert: " → " },
                    { label: "∴ Therefore", insert: " ∴ " },
                    { label: "∵ Because", insert: " ∵ " },
                  ].map((b, i) => (
                    <button key={i} type="button"
                      onMouseDown={(e) => { e.preventDefault(); insertText(b.insert); }}
                      className="inline-flex items-center rounded border border-border bg-background hover:bg-muted active:scale-95 transition-all h-8 px-2.5 text-sm font-medium text-foreground cursor-pointer">
                      {b.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5 border border-border/50">
                  <strong>Tip:</strong> Highlight words in your answer box, then click Bold or Italic above.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
