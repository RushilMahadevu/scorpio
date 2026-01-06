"use client";

import { useState, useEffect } from "react";

export function useSidebarState(key: string, defaultCollapsed: boolean = false) {
  const [isCollapsed, setIsCollapsedState] = useState(defaultCollapsed);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Determine the storage key
    const storageKey = `sidebar_collapsed_${key}`;
    
    // Try to load from local storage
    const saved = localStorage.getItem(storageKey);
    
    if (saved !== null) {
      setIsCollapsedState(saved === "true");
    }
    
    setIsLoaded(true);
  }, [key]);

  const setIsCollapsed = (value: boolean) => {
    setIsCollapsedState(value);
    localStorage.setItem(`sidebar_collapsed_${key}`, String(value));
  };

  return { isCollapsed, setIsCollapsed, isLoaded };
}
