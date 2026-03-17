"use client"

import * as React from "react"
import { Moon, Sun, Sparkles } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
