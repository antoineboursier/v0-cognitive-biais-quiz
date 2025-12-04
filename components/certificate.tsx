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
  onReset: () => void
}

export function Certificate({ user, score, totalQuestions, onClose, onReset }: CertificateProps) {
  const percentage = Math.round((score / totalQuestions) * 100)
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const getGrade = () => {
    if (percentage >= 90) return { label: "Excellence", stars: 5, colorClass: "text-neon-yellow" }
    if (percentage >= 80) return { label: "Expert", stars: 4, colorClass: "text-success" }
    if (percentage >= 70) return { label: "Avancé", stars: 3, colorClass: "text-primary" }
    if (percentage >= 60) return { label: "Intermédiaire", stars: 2, colorClass: "text-accent" }
    return { label: "Initié", stars: 1, colorClass: "text-destructive" }
  }

  const grade = getGrade()

  const handleDownload = () => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
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
          className="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate */}
        <div className="relative bg-gradient-to-br from-card via-secondary to-card rounded-2xl border-2 border-primary/50 overflow-hidden">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-accent rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-accent rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-primary rounded-br-2xl" />

          {/* Glow effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative p-8 md:p-12 text-center">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-muted-foreground tracking-widest uppercase">Cognitive Labs</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-destructive bg-clip-text text-transparent mb-8">
              Certificat de Réussite
            </h1>

            {/* Award icon */}
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 bg-secondary/50 border-3 border-current ${grade.colorClass}`}
            >
              <Award className="w-12 h-12" />
            </motion.div>

            {/* Recipient */}
            <p className="text-muted-foreground mb-2">Ce certificat est décerné à</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-primary mb-8">{user.job}</p>

            {/* Achievement */}
            <p className="text-muted-foreground mb-4">
              Pour avoir complété avec succès la formation
              <br />
              <span className="text-foreground font-semibold">"Maîtrise des Biais Cognitifs en UX Design"</span>
            </p>

            {/* Grade */}
            <div className="inline-block p-4 rounded-xl bg-secondary/50 border border-border mb-6">
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${i < grade.stars ? grade.colorClass : "text-muted"}`}
                    fill={i < grade.stars ? "currentColor" : "transparent"}
                  />
                ))}
              </div>
              <p className={`text-2xl font-bold ${grade.colorClass}`}>Grade : {grade.label}</p>
              <p className="text-muted-foreground mt-1">
                Score final : {score}/{totalQuestions} ({percentage}%)
              </p>
            </div>

            {/* Date */}
            <p className="text-muted-foreground mb-8">Délivré le {date}</p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleDownload}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 bg-transparent"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
            <div className="mt-4">
              <Button
                  onClick={onReset}
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
              >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rédémarrer le jeu
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
