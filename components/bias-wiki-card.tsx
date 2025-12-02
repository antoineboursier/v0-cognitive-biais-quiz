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
    Perception: "#00FFFF",
    Cognition: "#FF6B35",
    Décision: "#A855F7",
    Mémoire: "#FFD700",
    Social: "#FF69B4",
    "UX Law": "#00FF88",
    Persuasion: "#FF4444",
    "Dark Pattern": "#FF0000",
    Organisation: "#4169E1",
    Métacognition: "#20B2AA",
    Probabilité: "#DDA0DD",
    Possession: "#98FB98",
    Pricing: "#FFB6C1",
    Addiction: "#FF8C00",
    Motivation: "#7FFF00",
    Émotion: "#DC143C",
    Attention: "#00CED1",
    Technologie: "#9370DB",
    Communication: "#F0E68C",
    Projection: "#8B4513",
    Méthodologie: "#2E8B57",
    Métriques: "#4682B4",
    Risque: "#B22222",
    Estimation: "#6B8E23",
    Jugement: "#483D8B",
    Analyse: "#708090",
    Recherche: "#5F9EA0",
    Comportement: "#D2691E",
  }

  return (
    <motion.div
      onClick={isUnlocked ? onClick : undefined}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        isUnlocked
          ? "border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 cursor-pointer"
          : "border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed"
      }`}
      whileHover={isUnlocked ? { scale: 1.02 } : {}}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
          <Lock className="w-8 h-8 text-gray-600" />
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-white">{bias.name}</h3>
        <span
          className="text-xs px-2 py-1 rounded-full font-mono"
          style={{
            backgroundColor: `${categoryColors[bias.category] || "#666"}20`,
            color: categoryColors[bias.category] || "#666",
            border: `1px solid ${categoryColors[bias.category] || "#666"}40`,
          }}
        >
          {bias.category}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{bias.definition}</p>

      <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-900/50">
        {bias.counter_tactic.startsWith("⚠️") ? (
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        ) : (
          <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
        )}
        <p className="text-xs text-gray-500 line-clamp-2">{bias.counter_tactic}</p>
      </div>
    </motion.div>
  )
}
