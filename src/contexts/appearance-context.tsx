"use client";

import * as React from "react";

export type FontOption = "inter" | "ibm-plex-sans" | "verdana" | "roboto-mono" | "opendyslexic";
export type ThemeColor = "default" | "ocean" | "violet" | "rose" | "amber" | "emerald" | "midnight";

interface AppearanceContextType {
  font: FontOption;
  setFont: (font: FontOption) => void;
  themeColor: ThemeColor;
  setThemeColor: (theme: ThemeColor) => void;
}

const AppearanceContext = React.createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = React.useState<FontOption>("inter");
  const [themeColor, setThemeColorState] = React.useState<ThemeColor>("default");

  React.useEffect(() => {
    const storedFont = localStorage.getItem("app-font") as FontOption;
    if (storedFont && ["inter", "ibm-plex-sans", "verdana", "roboto-mono", "opendyslexic"].includes(storedFont)) {
      setFontState(storedFont);
    }
    
    const storedTheme = localStorage.getItem("app-theme-color") as ThemeColor;
    if (storedTheme && ["default", "ocean", "violet", "rose", "amber", "emerald", "midnight"].includes(storedTheme)) {
      setThemeColorState(storedTheme);
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

  // Synchronize classes with state
  React.useEffect(() => {
    const html = document.documentElement;
    
    // Manage Font Classes
    const fontClasses = ["font-inter", "font-ibm-plex-sans", "font-verdana", "font-roboto-mono", "font-opendyslexic"];
    html.classList.remove(...fontClasses);
    html.classList.add(`font-${font}`);
    
    // Manage Theme Classes
    const themeClasses = ["theme-default", "theme-ocean", "theme-violet", "theme-rose", "theme-amber", "theme-emerald", "theme-midnight"];
    html.classList.remove(...themeClasses);
    html.classList.add(`theme-${themeColor}`);
  }, [font, themeColor]);

  return (
    <AppearanceContext.Provider value={{ font, setFont, themeColor, setThemeColor }}>
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
