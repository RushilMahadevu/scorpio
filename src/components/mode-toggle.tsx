"use client"

import * as React from "react"
import { Moon, Sun, Sparkles, Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSpaceEffects } from "@/contexts/space-effects-context"
import { useAppearance, FontOption, ThemeColor } from "@/contexts/appearance-context"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const {
    spaceEffectsEnabled,
    toggleSpaceEffects,
    spacyLevel,
    setSpacyLevel,
    nebulaBrightness,
    setNebulaBrightness
  } = useSpaceEffects()
  const { font, setFont, themeColor, setThemeColor, customColor, setCustomColor } = useAppearance()
  const [showNote, setShowNote] = React.useState(false)

  const handleThemeChange = (newTheme: string) => {
    if (newTheme === "light") {
      setShowNote(true)
      setTimeout(() => setShowNote(false), 3000)
    }
    setTheme(newTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="cursor-pointer" aria-label="Toggle theme">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 cursor-pointer" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 cursor-pointer" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-0.5 py-2" onClick={() => handleThemeChange("dark")}>
          <div className="flex items-center justify-between w-full">
            <span>Dark</span>
            <span className="text-[10px] text-muted-foreground">(Recommended)</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-normal">Perfect for late-night studying</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-0.5 py-2" onClick={() => handleThemeChange("light")}>
          <span>Light</span>
          <span className="text-[10px] text-muted-foreground font-normal">Classic bright interface</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-0.5 py-2" onClick={() => handleThemeChange("system")}>
          <span>System</span>
          <span className="text-[10px] text-muted-foreground font-normal">Follow your device settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={toggleSpaceEffects} onSelect={(e) => e.preventDefault()}>
          <Sparkles className="mr-2 h-4 w-4" />
          Space Effects: {spaceEffectsEnabled ? "On" : "Off"}
        </DropdownMenuItem>
        {spaceEffectsEnabled && (
          <div className="px-4 py-2 border-t mt-2" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Spacy Level</div>
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {[10, 25, 40, 50].map((level) => (
                <button
                  key={level}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSpacyLevel(level);
                  }}
                  className={`h-6 w-full text-[10px] rounded border transition-colors cursor-pointer ${spacyLevel === level
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border"
                    }`}
                >
                  {level === 10 ? "Low" : level === 25 ? "Med" : level === 40 ? "High" : "Max"}
                </button>
              ))}
            </div>

            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nebula Intensity</div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 10, 20, 35].map((level) => (
                <button
                  key={level}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNebulaBrightness(level);
                  }}
                  className={`h-6 w-full text-[10px] rounded border transition-colors cursor-pointer ${nebulaBrightness === level
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border"
                    }`}
                >
                  {level === 0 ? "Off" : level === 10 ? "Dim" : level === 20 ? "Mid" : "High"}
                </button>
              ))}
            </div>

            <div className="my-3 h-px bg-border/50" />

            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Palette className="h-3 w-3" />
              Typography
            </div>
            <div className="flex flex-col gap-1">
              {[
                { id: "ibm-plex-sans", label: "IBM Plex (Default)", font: "var(--font-ibm-plex-sans)" },
                { id: "inter", label: "Inter", font: "var(--font-inter)" },
                { id: "verdana", label: "Verdana", font: "Verdana, sans-serif" },
                { id: "pt-serif", label: "PT Serif", font: "var(--font-pt-serif), serif" },
                { id: "roboto-mono", label: "Roboto Mono", font: "var(--font-roboto-mono)" },
                { id: "atkinson", label: "Atkinson", font: "var(--font-atkinson), sans-serif" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFont(f.id as FontOption);
                  }}
                  style={{ fontFamily: f.font }}
                  className={`w-full text-left px-2 py-1.5 text-[11px] rounded transition-colors cursor-pointer flex items-center justify-between ${font === f.id
                    ? "bg-primary/10 text-primary font-bold"
                    : "hover:bg-muted text-muted-foreground"
                    }`}
                >
                  {f.label}
                  {font === f.id && <div className="h-1 w-1 rounded-full bg-primary" />}
                </button>
              ))}
            </div>

            <div className="my-3 h-px bg-border/50" />

            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Palette className="h-3 w-3" />
              Accent Color
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {[
                { name: "Default", value: "default", color: "bg-foreground" },
                { name: "Ocean", value: "ocean", color: "bg-sky-500" },
                { name: "Violet", value: "violet", color: "bg-violet-500" },
                { name: "Rose", value: "rose", color: "bg-rose-500" },
                { name: "Amber", value: "amber", color: "bg-amber-500" },
                { name: "Emerald", value: "emerald", color: "bg-emerald-500" },
                { name: "Midnight", value: "midnight", color: "bg-slate-950" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    setThemeColor(t.value as ThemeColor);
                  }}
                  title={t.name}
                  disabled={t.value === "midnight" && theme === "light"}
                  className={`group relative flex flex-col items-center justify-center p-1 rounded-md border transition-all hover:bg-muted/50 cursor-pointer ${themeColor === t.value ? "border-primary bg-primary/5 shadow-sm scale-110" : "border-transparent"} ${t.value === "midnight" && theme === "light" ? "opacity-50 grayscale pointer-events-none" : ""
                    }`}
                >
                  <div className={`h-4 w-4 rounded-full ${t.color} shadow-xs group-hover:scale-110 transition-transform`} />
                </button>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setThemeColor("custom");
                }}
                className={`group relative flex flex-col items-center justify-center p-1 rounded-md border transition-all hover:bg-muted/50 cursor-pointer ${themeColor === "custom" ? "border-primary bg-primary/5 shadow-sm scale-110" : "border-transparent"
                  }`}
                title="Custom Color"
              >
                <div 
                  className="h-4 w-4 rounded-full shadow-xs group-hover:scale-110 transition-transform relative overflow-hidden" 
                  style={{ backgroundColor: customColor }}
                >
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value)
                      setThemeColor("custom")
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
