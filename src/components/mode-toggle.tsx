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
  const { font, setFont, themeColor, setThemeColor } = useAppearance()
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
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}> 
          Dark <span className="ml-2 text-xs text-muted-foreground">(Recommended)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("light")}> 
          Light 
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}> 
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleSpaceEffects} onSelect={(e) => e.preventDefault()}>
          <Sparkles className="mr-2 h-4 w-4" />
          Space Effects: {spaceEffectsEnabled ? "On" : "Off"}
        </DropdownMenuItem>
        {spaceEffectsEnabled && (
          <div className="px-4 py-2 border-t mt-2" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Spacy Level</div>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {[0, 5, 12, 25, 40].map((level) => (
                <button
                  key={level}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSpacyLevel(level);
                  }}
                  className={`h-6 w-full text-[10px] rounded border transition-colors cursor-pointer ${
                    spacyLevel === level 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background hover:bg-muted border-border"
                  }`}
                >
                  {level}
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
                  className={`h-6 w-full text-[10px] rounded border transition-colors cursor-pointer ${
                    nebulaBrightness === level 
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
                { id: "inter", label: "Inter (Default)", font: "var(--font-inter)" },
                { id: "ibm-plex-sans", label: "IBM Plex", font: "var(--font-ibm-plex-sans)" },
                { id: "verdana", label: "Verdana", font: "Verdana, sans-serif" },
                { id: "roboto-mono", label: "Roboto Mono", font: "var(--font-roboto-mono)" },
                { id: "opendyslexic", label: "OpenDyslexic", font: "OpenDyslexic, sans-serif" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFont(f.id as FontOption);
                  }}
                  style={{ fontFamily: f.font }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors cursor-pointer flex items-center justify-between ${
                    font === f.id 
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
                  className={`group relative flex flex-col items-center justify-center p-1 rounded-md border transition-all hover:bg-muted/50 cursor-pointer ${
                    themeColor === t.value ? "border-primary bg-primary/5 shadow-sm scale-110" : "border-transparent"
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full ${t.color} shadow-xs group-hover:scale-110 transition-transform`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
