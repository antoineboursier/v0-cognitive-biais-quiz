"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"

interface ScanAnimationProps {
  isScanning: boolean
  result: "success" | "error" | null
  onComplete: () => void
}

export function ScanAnimation({ isScanning, result, onComplete }: ScanAnimationProps) {
  const [phase, setPhase] = useState<"scanning" | "result">("scanning")
  const [isVisible, setIsVisible] = useState(false)

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setPhase("scanning")
    onComplete()
  }, [onComplete])

  useEffect(() => {
    if (isScanning) {
      setIsVisible(true)
      setPhase("scanning")

      // Phase 1: Scanning animation (1.5s)
      const scanTimer = setTimeout(() => {
        setPhase("result")
      }, 1500)

      return () => clearTimeout(scanTimer)
    }
  }, [isScanning])

  useEffect(() => {
    if (phase === "result" && isVisible) {
      const closeTimer = setTimeout(() => {
        handleClose()
      }, 2000) // Auto-close after 2 seconds

      return () => clearTimeout(closeTimer)
    }
  }, [phase, isVisible, handleClose])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-800/80 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-6 h-6 text-gray-400 hover:text-white" />
        </button>

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {phase === "scanning" ? (
            <div className="text-center">
              {/* Brain scan animation */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Cercle de scan */}
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#00FFFF"
                    strokeWidth="2"
                    strokeDasharray="502"
                    initial={{ strokeDashoffset: 502 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1.5, ease: "linear" }}
                  />

                  {/* Ligne de scan */}
                  <motion.line
                    x1="20"
                    y1="100"
                    x2="180"
                    y2="100"
                    stroke="#00FFFF"
                    strokeWidth="2"
                    initial={{ y1: 20, y2: 20 }}
                    animate={{ y1: 180, y2: 180 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />

                  {/* Icône cerveau simplifiée */}
                  <path
                    d="M100 40 C130 40 155 65 155 100 C155 135 130 160 100 160 C70 160 45 135 45 100 C45 65 70 40 100 40"
                    fill="none"
                    stroke="#00FFFF"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <motion.path
                    d="M70 80 Q100 60 130 80 M60 100 Q100 120 140 100 M70 120 Q100 140 130 120"
                    fill="none"
                    stroke="#00FFFF"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5 }}
                  />
                </svg>

                {/* Particules */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                    animate={{
                      x: Math.cos((i * Math.PI * 2) / 8) * 60,
                      y: Math.sin((i * Math.PI * 2) / 8) * 60,
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>

              <motion.p
                className="text-cyan-400 font-mono text-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              >
                ANALYSE COGNITIVE EN COURS...
              </motion.p>
            </div>
          ) : (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              {result === "success" ? (
                <>
                  <motion.div
                    className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-green-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    style={{ boxShadow: "0 0 30px #00FF88" }}
                  >
                    <motion.svg
                      className="w-12 h-12 text-green-500"
                      viewBox="0 0 24 24"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    </motion.svg>
                  </motion.div>
                  <p className="text-green-400 font-mono text-xl">CONCEPT MAÎTRISÉ</p>
                  <p className="text-gray-500 text-sm mt-3 font-mono">Fermeture automatique...</p>
                </>
              ) : (
                <>
                  <motion.div
                    className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-red-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    style={{ boxShadow: "0 0 30px #FF4444" }}
                  >
                    <motion.svg className="w-12 h-12 text-red-500" viewBox="0 0 24 24">
                      <motion.path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                        fill="currentColor"
                      />
                      <motion.path
                        d="M12 8v4M12 16h.01"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </motion.svg>
                  </motion.div>
                  <p className="text-red-400 font-mono text-xl">BIAIS DÉTECTÉ</p>
                  <p className="text-gray-500 text-sm mt-3 font-mono">Fermeture automatique...</p>
                </>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
