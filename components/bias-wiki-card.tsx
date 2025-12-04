"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Info, Lightbulb, Lock } from "lucide-react"
import type { BiasEntry } from "@/lib/data"
import { BiasCategoryIcon, categoryColors } from "./ui/icons"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"


interface BiasWikiCardProps {
  bias: BiasEntry
  isUnlocked: boolean
  onClick?: () => void
}

export function BiasWikiCard({ bias, isUnlocked, onClick }: BiasWikiCardProps) {
  const color = categoryColors[bias.category] || "var(--muted-foreground)"

  // Stop propagation to prevent card's onClick from firing
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
  }

  return (
    <motion.div
      onClick={isUnlocked ? onClick : undefined}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        isUnlocked
          ? "border-border bg-secondary/50 hover:border-primary/50 cursor-pointer"
          : "border-muted bg-card/50 opacity-50 cursor-not-allowed"
      }`}
      whileHover={isUnlocked ? { scale: 1.02 } : {}}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl z-10">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <h3 className="font-bold text-foreground truncate">{bias.name}</h3>
          {isUnlocked && (
            <Popover>
              <PopoverTrigger onClick={stopPropagation} asChild>
                <button aria-label="Plus d'infos">
                  <Info className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                </button>
              </PopoverTrigger>
              <PopoverContent onClick={stopPropagation} className="w-80">
                <h4 className="font-bold mb-2">Définition</h4>
                <p className="text-sm mb-4">{bias.definition}</p>
                <h4 className="font-bold mb-2">Contre-mesure</h4>
                <p className="text-sm">{bias.counter_tactic}</p>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <BiasCategoryIcon category={bias.category} title={bias.category} className="w-5 h-5 flex-shrink-0 ml-2" style={{ color }} />
      </div>

      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{bias.definition}</p>

      <div className="flex items-start gap-2 p-2 rounded-lg bg-card/50 mb-4">
        {bias.counter_tactic.startsWith("⚠️") ? (
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
        ) : (
          <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
        )}
        <p className="text-xs text-muted-foreground line-clamp-2">{bias.counter_tactic}</p>
      </div>

      {isUnlocked && (
         <div onClick={stopPropagation} className="flex items-center space-x-2 mt-4 pt-4 border-t border-muted/50">
          <Switch id={`learned-${bias.name}`} aria-label="Marquer comme appris" />
          <Label htmlFor={`learned-${bias.name}`} className="text-sm font-medium text-muted-foreground">
            Marqué comme appris
          </Label>
        </div>
      )}
    </motion.div>
  )
}