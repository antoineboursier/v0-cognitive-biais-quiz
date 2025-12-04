"use client";
import React, { createContext, useState, useContext, ReactNode } from "use-client";

interface CheatModeContextType {
  isCheatModeEnabled: boolean;
  toggleCheatMode: () => void;
}

const CheatModeContext = createContext<CheatModeContextType | undefined>(
  undefined
);

export const CheatModeProvider = ({ children }: { children: ReactNode }) => {
  const [isCheatModeEnabled, setIsCheatModeEnabled] = useState(false);

  const toggleCheatMode = () => {
    setIsCheatModeEnabled((prev) => !prev);
  };

  return (
    <CheatModeContext.Provider value={{ isCheatModeEnabled, toggleCheatMode }}>
      {children}
    </CheatModeContext.Provider>
  );
};

export const useCheatMode = () => {
  const context = useContext(CheatModeContext);
  if (context === undefined) {
    throw new Error("useCheatMode must be used within a CheatModeProvider");
  }
  return context;
};
