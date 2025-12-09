"use client";

import * as React from "react";

interface SpaceEffectsContextType {
  spaceEffectsEnabled: boolean;
  toggleSpaceEffects: () => void;
}

const SpaceEffectsContext = React.createContext<SpaceEffectsContextType | undefined>(undefined);

export function SpaceEffectsProvider({ children }: { children: React.ReactNode }) {
  const [spaceEffectsEnabled, setSpaceEffectsEnabled] = React.useState(true);

  React.useEffect(() => {
    const stored = localStorage.getItem("spaceEffectsEnabled");
    if (stored !== null) {
      setSpaceEffectsEnabled(JSON.parse(stored));
    }
  }, []);

  const toggleSpaceEffects = () => {
    setSpaceEffectsEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("spaceEffectsEnabled", JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    <SpaceEffectsContext.Provider value={{ spaceEffectsEnabled, toggleSpaceEffects }}>
      {children}
    </SpaceEffectsContext.Provider>
  );
}

export function useSpaceEffects() {
  const context = React.useContext(SpaceEffectsContext);
  if (context === undefined) {
    throw new Error("useSpaceEffects must be used within a SpaceEffectsProvider");
  }
  return context;
}
