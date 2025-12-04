"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SettingsContextType {
    animationsEnabled: boolean
    setAnimationsEnabled: (enabled: boolean) => void
    cheatMode: boolean
    setCheatMode: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [animationsEnabled, setAnimationsEnabled] = useState(true)
    const [cheatMode, setCheatMode] = useState(false)

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedAnimations = localStorage.getItem("animationsEnabled")
        const savedCheatMode = localStorage.getItem("cheatMode")
        if (savedAnimations !== null) {
            setAnimationsEnabled(savedAnimations === "true")
        }
        if (savedCheatMode !== null) {
            setCheatMode(savedCheatMode === "true")
        }
    }, [])

    // Save animations setting to localStorage
    useEffect(() => {
        localStorage.setItem("animationsEnabled", String(animationsEnabled))
    }, [animationsEnabled])

    // Save cheat mode to localStorage
    useEffect(() => {
        localStorage.setItem("cheatMode", String(cheatMode))
    }, [cheatMode])

    return (
        <SettingsContext.Provider value={{ animationsEnabled, setAnimationsEnabled, cheatMode, setCheatMode }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error("useSettings must be used within SettingsProvider")
    }
    return context
}
