"use client"

import { motion } from "framer-motion"

interface BrainProgressProps {
  level1Progress: number
  level2Progress: number
  level3Progress: number
  currentLevel: number
}

export function BrainProgress({ level1Progress, level2Progress, level3Progress, currentLevel }: BrainProgressProps) {
  const getZoneColor = (level: number, progress: number) => {
    if (progress === 0) return "#1a1a2e"
    if (level < currentLevel || progress >= 100) return "#00FF88"
    if (level === currentLevel) return "#00FFFF"
    return "#1a1a2e"
  }

  const getGlowIntensity = (progress: number) => {
    return progress > 0 ? `0 0 ${10 + progress * 0.2}px` : "none"
  }

  return (
    <div className="relative w-full max-w-[200px] mx-auto">
      <svg viewBox="0 0 200 180" className="w-full h-auto">
        {/* Cerveau en fil de fer - Vue latérale stylisée */}
        <defs>
          {/* Glow filters pour chaque niveau */}
          <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow3" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background brain outline */}
        <path
          d="M100 20 C140 20 170 50 175 90 C180 130 160 160 120 165 C100 167 80 167 60 165 C20 160 0 130 5 90 C10 50 40 20 80 20 Z"
          fill="none"
          stroke="#2a2a4a"
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Niveau 1 - Lobe Frontal (gauche-haut) - Fondamentaux */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <motion.path
            d="M40 60 Q60 30 100 35 Q85 50 75 70 Q55 80 40 60"
            fill={getZoneColor(1, level1Progress)}
            stroke={level1Progress > 0 ? "#00FFFF" : "#3a3a5a"}
            strokeWidth="2"
            filter={level1Progress > 0 ? "url(#glow1)" : "none"}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
            style={{
              filter:
                level1Progress > 0
                  ? `drop-shadow(${getGlowIntensity(level1Progress)} ${getZoneColor(1, level1Progress)})`
                  : "none",
            }}
          />
          {/* Connexions neuronales niveau 1 */}
          <motion.path
            d="M50 55 L65 50 M55 65 L70 60 M45 70 L60 72"
            fill="none"
            stroke={level1Progress > 30 ? "#00FFFF" : "#2a2a4a"}
            strokeWidth="1"
            opacity={level1Progress / 100}
          />
        </motion.g>

        {/* Niveau 2 - Lobe Pariétal (centre-haut) - Application */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <motion.path
            d="M100 35 Q140 30 155 60 Q145 85 120 90 Q95 85 85 65 Q85 45 100 35"
            fill={getZoneColor(2, level2Progress)}
            stroke={level2Progress > 0 ? "#FF6B35" : "#3a3a5a"}
            strokeWidth="2"
            filter={level2Progress > 0 ? "url(#glow2)" : "none"}
            style={{
              filter:
                level2Progress > 0
                  ? `drop-shadow(${getGlowIntensity(level2Progress)} ${getZoneColor(2, level2Progress)})`
                  : "none",
            }}
          />
          {/* Connexions neuronales niveau 2 */}
          <motion.path
            d="M110 45 L125 50 M115 55 L130 58 M105 65 L120 70"
            fill="none"
            stroke={level2Progress > 30 ? "#FF6B35" : "#2a2a4a"}
            strokeWidth="1"
            opacity={level2Progress / 100}
          />
        </motion.g>

        {/* Niveau 3 - Lobe Temporal (bas) - Expert */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <motion.path
            d="M35 85 Q25 110 40 140 Q60 155 100 155 Q140 155 160 140 Q175 110 165 85 Q140 100 100 100 Q60 100 35 85"
            fill={getZoneColor(3, level3Progress)}
            stroke={level3Progress > 0 ? "#A855F7" : "#3a3a5a"}
            strokeWidth="2"
            filter={level3Progress > 0 ? "url(#glow3)" : "none"}
            style={{
              filter:
                level3Progress > 0
                  ? `drop-shadow(${getGlowIntensity(level3Progress)} ${getZoneColor(3, level3Progress)})`
                  : "none",
            }}
          />
          {/* Connexions neuronales niveau 3 */}
          <motion.path
            d="M60 120 L80 115 M70 130 L90 125 M80 140 L100 138 M120 140 L140 135 M130 125 L145 120"
            fill="none"
            stroke={level3Progress > 30 ? "#A855F7" : "#2a2a4a"}
            strokeWidth="1"
            opacity={level3Progress / 100}
          />
        </motion.g>

        {/* Tronc cérébral */}
        <path d="M95 155 Q90 170 95 180 M105 155 Q110 170 105 180" fill="none" stroke="#3a3a5a" strokeWidth="2" />

        {/* Synapses animées */}
        {level1Progress > 0 && (
          <motion.circle
            cx="60"
            cy="55"
            r="2"
            fill="#00FFFF"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        )}
        {level2Progress > 0 && (
          <motion.circle
            cx="120"
            cy="55"
            r="2"
            fill="#FF6B35"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
          />
        )}
        {level3Progress > 0 && (
          <motion.circle
            cx="100"
            cy="130"
            r="2"
            fill="#A855F7"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
          />
        )}
      </svg>

      {/* Légende */}
      <div className="mt-4 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: level1Progress > 0 ? "#00FFFF" : "#2a2a4a" }}
          />
          <span className="text-gray-400">Novice: {Math.round(level1Progress)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: level2Progress > 0 ? "#FF6B35" : "#2a2a4a" }}
          />
          <span className="text-gray-400">Praticien: {Math.round(level2Progress)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: level3Progress > 0 ? "#A855F7" : "#2a2a4a" }}
          />
          <span className="text-gray-400">Expert: {Math.round(level3Progress)}%</span>
        </div>
      </div>
    </div>
  )
}
