"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Lightbulb, Lock } from "lucide-react"
import type { BiasEntry } from "@/lib/data"

interface BiasWikiCardProps {
  bias: BiasEntry
  isUnlocked: boolean
  onClick?: () => void
}

export function BiasWikiCard({ bias, isUnlocked, onClick }: BiasWikiCardProps) {
  const categoryColors: Record<string, string> = {
    Perception: "var(--neon-cyan)",
    Cognition: "var(--neon-orange)",
    Décision: "var(--neon-purple)",
    Mémoire: "var(--neon-yellow)",
    Social: "var(--accent)",
    "UX Law": "var(--neon-green)",
    Persuasion: "var(--neon-red)",
    "Dark Pattern": "var(--destructive)",
    Organisation: "var(--primary)",
    Métacognition: "var(--info)",
    Probabilité: "var(--accent)",
    Possession: "var(--success)",
    Pricing: "var(--warning)",
    Addiction: "var(--neon-orange)",
    Motivation: "var(--neon-green)",
    Émotion: "var(--destructive)",
    Attention: "var(--neon-cyan)",
    Technologie: "var(--neon-purple)",
    Communication: "var(--neon-yellow)",
    Projection: "var(--warning)",
    Méthodologie: "var(--success)",
    Métriques: "var(--primary)",
    Risque: "var(--destructive)",
    Estimation: "var(--neon-green)",
    Jugement: "var(--neon-purple)",
    Analyse: "var(--muted-foreground)",
    Recherche: "var(--info)",
    Comportement: "var(--warning)",
  }

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
        <h3 className="font-bold text-foreground">{bias.name}</h3>
        <span
          className="text-xs px-2 py-1 rounded-full font-mono"
          style={{
            backgroundColor: `color-mix(in oklch, ${color} 20%, transparent)`,
            color: color,
            border: `1px solid color-mix(in oklch, ${color} 40%, transparent)`,
          }}
        >
          {bias.category}
        </span>
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
