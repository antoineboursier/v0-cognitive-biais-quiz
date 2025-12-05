"use client"

import { motion } from "framer-motion"
import { Brain } from "lucide-react"

interface BrainProgressProps {
  level1Progress: number
  level2Progress: number
  level3Progress: number
  currentLevel: number
}

export function BrainProgress({ level1Progress, level2Progress, level3Progress, currentLevel }: BrainProgressProps) {
  // Calculate overall progress as the average of all levels
  // This gives a good representation of "general advancement"
  const totalProgress = (level1Progress + level2Progress + level3Progress) / 3

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (totalProgress / 100) * circumference

  return (
    <div className="flex flex-col items-center w-full max-w-[240px] mx-auto">
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        {/* SVG Circular Progress */}
        <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
          {/* Track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="12"
            strokeOpacity="0.2"
          />
          {/* Progress Indicator */}
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--neon-cyan)" />
              <stop offset="50%" stopColor="var(--neon-purple)" />
              <stop offset="100%" stopColor="var(--neon-yellow)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Brain className="w-10 h-10 text-neon-cyan mb-1" />
          </motion.div>
          <motion.span
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {Math.round(totalProgress)}%
          </motion.span>
        </div>
      </div>

      {/* Legend / Breakdown */}
      <div className="w-full space-y-3 px-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_8px_var(--neon-cyan)]" />
            <span className="text-muted-foreground">Novice</span>
          </div>
          <span className="font-mono font-medium">{Math.round(level1Progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--neon-cyan)]"
            initial={{ width: 0 }}
            animate={{ width: `${level1Progress}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>

        <div className="flex items-center justify-between text-sm pt-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--neon-orange)] shadow-[0_0_8px_var(--neon-orange)]" />
            <span className="text-muted-foreground">Praticien</span>
          </div>
          <span className="font-mono font-medium">{Math.round(level2Progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--neon-orange)]"
            initial={{ width: 0 }}
            animate={{ width: `${level2Progress}%` }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </div>

        <div className="flex items-center justify-between text-sm pt-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--neon-purple)] shadow-[0_0_8px_var(--neon-purple)]" />
            <span className="text-muted-foreground">Expert</span>
          </div>
          <span className="font-mono font-medium">{Math.round(level3Progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--neon-purple)]"
            initial={{ width: 0 }}
            animate={{ width: `${level3Progress}%` }}
            transition={{ duration: 1, delay: 0.6 }}
          />
        </div>
      </div>
    </div>
  )
}
