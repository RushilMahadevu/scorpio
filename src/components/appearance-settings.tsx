"use client";

import { useId } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppearance, type FontOption, type ThemeColor } from "@/contexts/appearance-context";
import { useSpaceEffects } from "@/contexts/space-effects-context";

const modes = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

const accents = {
  default: "Purple (default)",
  blue: "Blue",
  emerald: "Green",
  monochrome: "Black / White",
  custom: "Custom",
} satisfies Record<ThemeColor, string>;

const fonts = {
  "ibm-plex-sans": "IBM Plex Sans",
  atkinson: "Atkinson Hyperlegible",
  inter: "Inter",
  verdana: "Verdana",
  "pt-serif": "PT Serif",
  "roboto-mono": "Roboto Mono",
} satisfies Record<FontOption, string>;

const starDensities = { 5: "Subtle", 10: "Low", 25: "Medium", 40: "High", 50: "Max" };
const nebulaLevels = { 0: "Off", 10: "Dim", 20: "Medium", 35: "High" };

export function ThemeModeControl() {
  const { theme, setTheme } = useTheme();

  return (
    <div role="group" aria-label="Theme mode" className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
      {modes.map(({ value, label, Icon }) => (
        <Button
          key={value}
          type="button"
          variant="ghost"
          size="sm"
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className="h-9 rounded-lg px-1 text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-xs"
        >
          <Icon aria-hidden="true" className="size-3.5" />
          {label}
        </Button>
      ))}
    </div>
  );
}

function PreferenceSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <div className="flex min-h-12 items-center justify-between gap-2 py-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-48 max-w-[62%] min-w-0">
          <SelectValue placeholder={value} />
        </SelectTrigger>
        <SelectContent position="popper" align="end" className="z-[60]">
          {Object.entries(options).map(([option, name]) => (
            <SelectItem key={option} value={option}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function AppearancePreferences() {
  const { font, setFont, themeColor, setThemeColor, customColor, setCustomColor } = useAppearance();
  const {
    spaceEffectsEnabled,
    toggleSpaceEffects,
    spacyLevel,
    setSpacyLevel,
    nebulaBrightness,
    setNebulaBrightness,
  } = useSpaceEffects();
  const id = useId();

  return (
    <div className="divide-y divide-border">
      <PreferenceSelect
        label="Accent color"
        value={themeColor}
        options={accents}
        onChange={(value) => setThemeColor(value as ThemeColor)}
      />
      {themeColor === "custom" && (
        <div className="flex min-h-12 items-center justify-between gap-2 py-1.5">
          <Label htmlFor={`${id}-color`}>Custom color</Label>
          <Input
            id={`${id}-color`}
            type="color"
            value={customColor}
            onChange={(event) => setCustomColor(event.target.value)}
            className="w-14 cursor-pointer px-1.5"
          />
        </div>
      )}
      <PreferenceSelect
        label="Font"
        value={font}
        options={fonts}
        onChange={(value) => setFont(value as FontOption)}
      />
      <div className="flex min-h-12 items-center justify-between gap-2 py-1.5">
        <Label htmlFor={`${id}-space`} className="cursor-pointer">Space effects</Label>
        <Checkbox id={`${id}-space`} checked={spaceEffectsEnabled} onCheckedChange={toggleSpaceEffects} />
      </div>
      {spaceEffectsEnabled && (
        <>
          <PreferenceSelect
            label="Star density"
            value={String(spacyLevel)}
            options={starDensities}
            onChange={(value) => setSpacyLevel(Number(value))}
          />
          <PreferenceSelect
            label="Nebula glow"
            value={String(nebulaBrightness)}
            options={nebulaLevels}
            onChange={(value) => setNebulaBrightness(Number(value))}
          />
        </>
      )}
    </div>
  );
}
