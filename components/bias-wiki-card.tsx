"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Lightbulb, Lock } from "lucide-react"
import type { BiasEntry } from "@/lib/data"
import { BiasCategoryIcon, categoryColors } from "./ui/icons"

interface BiasWikiCardProps {
  bias: BiasEntry
  isUnlocked: boolean
  onClick?: () => void
}

export function BiasWikiCard({ bias, isUnlocked, onClick }: BiasWikiCardProps) {
  const color = categoryColors[bias.category] || "var(--muted-foreground)"

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
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-foreground pr-2">{bias.name}</h3>
        <BiasCategoryIcon category={bias.category} title={bias.category} className="w-5 h-5 flex-shrink-0" style={{ color }} />
      </div>

      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{bias.definition}</p>

      <div className="flex items-start gap-2 p-2 rounded-lg bg-card/50">
        {bias.counter_tactic.startsWith("⚠️") ? (
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
        ) : (
          <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
        )}
        <p className="text-xs text-muted-foreground line-clamp-2">{bias.counter_tactic}</p>
      </div>
    </motion.div>
  )
}