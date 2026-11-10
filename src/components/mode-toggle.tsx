"use client";

import { ChevronDown, Moon, Sun } from "lucide-react";

import { AppearancePreferences, ThemeModeControl } from "@/components/appearance-settings";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function ModeToggle() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Appearance" className="text-muted-foreground">
          <Sun aria-hidden="true" className="dark:hidden" />
          <Moon aria-hidden="true" className="hidden dark:block" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Appearance"
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="z-[60] max-h-(--radix-popover-content-available-height) w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto p-3"
      >
        <h2 className="mb-2 text-sm font-semibold">Appearance</h2>
        <ThemeModeControl />
        <details className="group mt-3 border-t border-border pt-1">
          <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            More settings
            <ChevronDown aria-hidden="true" className="size-4 group-open:rotate-180" />
          </summary>
          <AppearancePreferences />
        </details>
      </PopoverContent>
    </Popover>
  );
}
