"use client";

import * as React from "react";

export type FontOption = "inter" | "ibm-plex-sans" | "verdana" | "roboto-mono" | "opendyslexic";

interface AppearanceContextType {
  font: FontOption;
  setFont: (font: FontOption) => void;
}

const AppearanceContext = React.createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = React.useState<FontOption>("inter");

  React.useEffect(() => {
    const storedFont = localStorage.getItem("app-font") as FontOption;
    if (storedFont && ["inter", "ibm-plex-sans", "verdana", "roboto-mono", "opendyslexic"].includes(storedFont)) {
      setFontState(storedFont);
    }
  }, []);

  const setFont = (newFont: FontOption) => {
    setFontState(newFont);
    localStorage.setItem("app-font", newFont);
    // Apply font class to html element for global styling
    const html = document.documentElement;
    html.classList.remove("font-inter", "font-ibm-plex-sans", "font-verdana", "font-roboto-mono", "font-opendyslexic");
    html.classList.add(`font-${newFont}`);
  };

  // Initial application of font class
  React.useEffect(() => {
    const html = document.documentElement;
    html.classList.add(`font-${font}`);
  }, [font]);

  return (
    <AppearanceContext.Provider value={{ font, setFont }}>
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
