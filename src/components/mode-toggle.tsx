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
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
        <DropdownMenuItem onClick={toggleSpaceEffects}>
          <Sparkles className="mr-2 h-4 w-4" />
          Space Effects: {spaceEffectsEnabled ? "On" : "Off"}
        </DropdownMenuItem>
        {spaceEffectsEnabled && (
          <div className="px-4 py-2">
            <div className="mb-2 text-xs font-semibold">Spacy Level</div>
            <RadioGroup value={String(spacyLevel)} onValueChange={v => setSpacyLevel(Number(v))} className="grid grid-cols-5 gap-2">
              {[0, 10, 25, 40, 50].map(level => (
                <RadioGroupItem key={level} value={String(level)} />
              ))}
            </RadioGroup>
            <div className="mt-4 mb-2 text-xs font-semibold">Nebula Brightness</div>
            <input
              type="range"
              min={0}
              max={25}
              value={nebulaBrightness}
              onChange={e => setNebulaBrightness(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">{nebulaBrightness}</div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
