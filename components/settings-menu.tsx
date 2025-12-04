"use client"

import { Settings, Moon, Sun, Zap, ZapOff, Eye, Film } from "lucide-react"
import { useTheme } from "next-themes"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface SettingsMenuProps {
    onDemoPageRequested?: (page: 'levelComplete' | 'certificate') => void
}

export function SettingsMenu({ onDemoPageRequested }: SettingsMenuProps = {}) {
    const { theme, setTheme } = useTheme()
    const { animationsEnabled, setAnimationsEnabled, cheatMode, setCheatMode } = useSettings()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="h-12 w-12 rounded-full hover:bg-muted bg-background/80 backdrop-blur-sm border border-border shadow-sm p-0">
                    <Settings className="h-8 w-8" />
                    <span className="sr-only">Paramètres</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Paramètres</h4>
                        <p className="text-sm text-muted-foreground">
                            Personnalisez votre expérience.
                        </p>
                    </div>
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="animations" className="flex items-center gap-2">
                                    {animationsEnabled ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
                                    Animations
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    Activer/désactiver les animations
                                </span>
                            </div>
                            <Switch
                                id="animations"
                                checked={animationsEnabled}
                                onCheckedChange={setAnimationsEnabled}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="theme" className="flex items-center gap-2">
                                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                    Thème
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    Mode sombre ou clair
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant={theme === 'light' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setTheme('light')}
                                    className="h-8 px-2"
                                >
                                    <Sun className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={theme === 'dark' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setTheme('dark')}
                                    className="h-8 px-2"
                                >
                                    <Moon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Cheat mode toggle - ONLY in development */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="flex items-center justify-between space-x-2 border-t border-muted/50 pt-4 mt-2">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="cheat-mode" className="flex items-center gap-2 text-destructive">
                                        <Eye className="h-4 w-4" />
                                        Mode Triche
                                    </Label>
                                    <span className="text-xs text-muted-foreground">
                                        Afficher la bonne réponse pendant le quiz.
                                    </span>
                                </div>
                                <Switch
                                    id="cheat-mode"
                                    checked={cheatMode}
                                    onCheckedChange={setCheatMode}
                                    className="data-[state=checked]:bg-destructive"
                                />
                            </div>
                        )}

                        {/* Demo Pages - ONLY in development */}
                        {process.env.NODE_ENV === 'development' && onDemoPageRequested && (
                            <div className="space-y-3 border-t border-muted/50 pt-4 mt-2">
                                <div>
                                    <h4 className="text-sm font-semibold text-warning mb-2">🎬 Pages de Démo</h4>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Accès rapide aux pages invisibles.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-left"
                                        onClick={() => onDemoPageRequested('levelComplete')}
                                    >
                                        🏆 Écran de fin de niveau
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-left"
                                        onClick={() => onDemoPageRequested('certificate')}
                                    >
                                        🎓 Certificat de complétion
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
