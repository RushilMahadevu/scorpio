"use client";

import * as React from "react";

interface SpaceEffectsContextType {
  spaceEffectsEnabled: boolean;
  toggleSpaceEffects: () => void;
  spacyLevel: number;
  setSpacyLevel: (level: number) => void;
  nebulaBrightness: number;
  setNebulaBrightness: (brightness: number) => void;
}

const SpaceEffectsContext = React.createContext<SpaceEffectsContextType | undefined>(undefined);

export function SpaceEffectsProvider({ children }: { children: React.ReactNode }) {
  const [spaceEffectsEnabled, setSpaceEffectsEnabled] = React.useState(true);
  const [spacyLevel, setSpacyLevelState] = React.useState(12); // default value changed to 12
  const [nebulaBrightness, setNebulaBrightnessState] = React.useState(12); // default value changed to 12

  React.useEffect(() => {
    const stored = localStorage.getItem("spaceEffectsEnabled");
    if (stored !== null) {
      setSpaceEffectsEnabled(JSON.parse(stored));
    }
    const storedSpacy = localStorage.getItem("spacyLevel");
    if (storedSpacy !== null) {
      setSpacyLevelState(Number(storedSpacy));
    }
    const storedNebula = localStorage.getItem("nebulaBrightness");
    if (storedNebula !== null) {
      setNebulaBrightnessState(Number(storedNebula));
    }
  }, []);

  const toggleSpaceEffects = () => {
    setSpaceEffectsEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("spaceEffectsEnabled", JSON.stringify(newValue));
      return newValue;
    });
  };

  const setSpacyLevel = (level: number) => {
    setSpacyLevelState(level);
    localStorage.setItem("spacyLevel", String(level));
  };

  const setNebulaBrightness = (brightness: number) => {
    setNebulaBrightnessState(brightness);
    localStorage.setItem("nebulaBrightness", String(brightness));
  };

  return (
    <SpaceEffectsContext.Provider value={{
      spaceEffectsEnabled,
      toggleSpaceEffects,
      spacyLevel,
      setSpacyLevel,
      nebulaBrightness,
      setNebulaBrightness
    }}>
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
