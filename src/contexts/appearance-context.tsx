"use client";

import * as React from "react";

export type FontOption = "inter" | "ibm-plex-sans" | "verdana" | "roboto-mono" | "pt-serif" | "atkinson";
export type ThemeColor = "default" | "ocean" | "violet" | "rose" | "amber" | "emerald" | "midnight" | "custom";

interface AppearanceContextType {
  font: FontOption;
  setFont: (font: FontOption) => void;
  themeColor: ThemeColor;
  setThemeColor: (theme: ThemeColor) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
}

const AppearanceContext = React.createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = React.useState<FontOption>("ibm-plex-sans");
  const [themeColor, setThemeColorState] = React.useState<ThemeColor>("default");
  const [customColor, setCustomColorState] = React.useState<string>("#3b82f6");

  React.useEffect(() => {
    const storedFont = localStorage.getItem("app-font") as FontOption;
    if (storedFont && ["inter", "ibm-plex-sans", "verdana", "roboto-mono", "pt-serif", "atkinson"].includes(storedFont)) {
      setFontState(storedFont);
    }

    const storedTheme = localStorage.getItem("app-theme-color") as ThemeColor;
    if (storedTheme && ["default", "ocean", "violet", "rose", "amber", "emerald", "midnight", "custom"].includes(storedTheme)) {
      setThemeColorState(storedTheme);
    }

    const storedCustomColor = localStorage.getItem("app-custom-color");
    if (storedCustomColor) {
      setCustomColorState(storedCustomColor);
    }
  }, []);

  const setFont = (newFont: FontOption) => {
    setFontState(newFont);
    localStorage.setItem("app-font", newFont);
  };

  const setThemeColor = (newTheme: ThemeColor) => {
    setThemeColorState(newTheme);
    localStorage.setItem("app-theme-color", newTheme);

    // Smooth transition for all elements when changing theme
    const html = document.documentElement;
    html.classList.add("theme-transition-all");
    setTimeout(() => {
      html.classList.remove("theme-transition-all");
    }, 300);
  };

  const setCustomColor = (newColor: string) => {
    setCustomColorState(newColor);
    localStorage.setItem("app-custom-color", newColor);
    if (themeColor === "custom") {
      document.documentElement.style.setProperty("--primary", newColor);
    }
  };

  // Synchronize classes with state
  React.useEffect(() => {
    const html = document.documentElement;

    // Manage Font Classes
    const fontClasses = ["font-inter", "font-ibm-plex-sans", "font-verdana", "font-roboto-mono", "font-pt-serif", "font-atkinson"];
    html.classList.remove(...fontClasses);
    html.classList.add(`font-${font}`);

    // Manage Theme Classes
    const themeClasses = ["theme-default", "theme-ocean", "theme-violet", "theme-rose", "theme-amber", "theme-emerald", "theme-midnight", "theme-custom"];
    html.classList.remove(...themeClasses);
    html.classList.add(`theme-${themeColor}`);

    if (themeColor === "custom") {
      html.style.setProperty("--primary", customColor);
      // Also update other primary-related variables if necessary
      // e.g., --primary-foreground can be calculated or set to a default
    } else {
      html.style.removeProperty("--primary");
    }
  }, [font, themeColor, customColor]);

  return (
    <AppearanceContext.Provider value={{ font, setFont, themeColor, setThemeColor, customColor, setCustomColor }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = React.useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
}
