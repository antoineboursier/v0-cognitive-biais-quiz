"use client"

import { motion } from "framer-motion"
import { Award, Download, Share2, Brain, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserProfile } from "./onboarding-form"

interface CertificateProps {
  user: UserProfile
  score: number
  totalQuestions: number
  onClose: () => void
}

export function Certificate({ user, score, totalQuestions, onClose }: CertificateProps) {
  const percentage = Math.round((score / totalQuestions) * 100)
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const getGrade = () => {
    if (percentage >= 90) return { label: "Excellence", stars: 5, color: "#FFD700" }
    if (percentage >= 80) return { label: "Expert", stars: 4, color: "#00FF88" }
    if (percentage >= 70) return { label: "Avancé", stars: 3, color: "#00D4FF" }
    if (percentage >= 60) return { label: "Intermédiaire", stars: 2, color: "#A855F7" }
    return { label: "Initié", stars: 1, color: "#FF6B6B" }
  }

  const grade = getGrade()

  const handleDownload = () => {
    // Simulate download - in production, generate PDF
    alert("Fonctionnalité de téléchargement PDF à venir !")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Mon diplôme Cognitive Labs",
        text: `J'ai obtenu le grade "${grade.label}" sur Cognitive Labs avec ${percentage}% de bonnes réponses !`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(
        `J'ai obtenu le grade "${grade.label}" sur Cognitive Labs avec ${percentage}% de bonnes réponses !`,
      )
      alert("Lien copié dans le presse-papier !")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-cyan-500/50 overflow-hidden">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-cyan-400 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-purple-500 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-purple-500 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-cyan-400 rounded-br-2xl" />

          {/* Glow effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

          <div className="relative p-8 md:p-12 text-center">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-cyan-400" />
              <span className="text-xl font-bold text-gray-400 tracking-widest uppercase">Cognitive Labs</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
              Certificat de Réussite
            </h1>

            {/* Award icon */}
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
              style={{ backgroundColor: `${grade.color}20`, border: `3px solid ${grade.color}` }}
            >
              <Award className="w-12 h-12" style={{ color: grade.color }} />
            </motion.div>

            {/* Recipient */}
            <p className="text-gray-400 mb-2">Ce certificat est décerné à</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-cyan-400 mb-8">{user.job}</p>

            {/* Achievement */}
            <p className="text-gray-300 mb-4">
              Pour avoir complété avec succès la formation
              <br />
              <span className="text-white font-semibold">"Maîtrise des Biais Cognitifs en UX Design"</span>
            </p>

            {/* Grade */}
            <div className="inline-block p-4 rounded-xl bg-gray-800/50 border border-gray-700 mb-6">
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6"
                    fill={i < grade.stars ? grade.color : "transparent"}
                    color={i < grade.stars ? grade.color : "#374151"}
                  />
                ))}
              </div>
              <p className="text-2xl font-bold" style={{ color: grade.color }}>
                Grade : {grade.label}
              </p>
              <p className="text-gray-400 mt-1">
                Score final : {score}/{totalQuestions} ({percentage}%)
              </p>
            </div>

            {/* Date */}
            <p className="text-gray-500 mb-8">Délivré le {date}</p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleDownload} className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10 bg-transparent"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
