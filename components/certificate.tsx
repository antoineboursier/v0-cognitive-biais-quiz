"use client"

import { motion } from "framer-motion"
import { Award, Download, Share2, Brain, Star, ArrowLeft, Linkedin, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserProfile } from "./onboarding-form"
import { toast } from "sonner"

interface CertificateProps {
  user: UserProfile
  score: number
  totalQuestions: number
  onClose: () => void
  onReset: () => void
}

export function Certificate({ user, score, totalQuestions, onClose }: CertificateProps) {
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

  // Generate a unique certificate ID and encode user data
  const certificateId = btoa(`${user.firstName}-${user.lastName}-${date}`).replace(/=/g, '').substring(0, 16)
  const userDataEncoded = btoa(JSON.stringify({
    firstName: user.firstName,
    lastName: user.lastName,
    job: user.job,
    score,
    totalQuestions,
    percentage,
    grade: grade.label,
    date,
    certificateId
  }))
  const certificateUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/certificate/${certificateId}?data=${encodeURIComponent(userDataEncoded)}`

  const certificationName = "Maîtrise des biais cognitifs et phénomènes comportementaux"

  const handleDownloadImage = () => {
    const link = document.createElement('a')
    link.href = '/og-image.png'
    link.download = 'cognitive-labs-certificate.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Image téléchargée !")
  }

  const handleShareLinkedIn = () => {
    const shareText = `🧠 Fier d'avoir complété la formation "${certificationName}" sur Cognitive Labs !

J'ai obtenu le grade "${grade.label}" avec un score de ${score}/${totalQuestions} (${percentage}%).

Cette formation m'a permis de mieux comprendre les biais cognitifs et les phénomènes comportementaux en UX Design.

#CognitiveLabs #BiaisCognitifs #UXDesign #FormationContinue`

    navigator.clipboard.writeText(shareText).then(() => {
      toast.success("Texte copié ! Collez-le dans votre post LinkedIn.")
      setTimeout(() => {
        window.open('https://www.linkedin.com/feed/', '_blank')
      }, 1000)
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copié !`)
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Back button */}
      <div className="p-4 md:p-8">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-8 flex items-center min-h-[calc(100vh-120px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-2 gap-6 w-full"
        >
          {/* Certificate Display */}
          <div className="relative bg-gradient-to-br from-card via-secondary to-card rounded-2xl border-2 border-primary/50 overflow-hidden flex items-center">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-accent rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-accent rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-primary rounded-br-2xl" />

            {/* Glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative p-6 md:p-8 text-center">
              {/* Header with gradient logo */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <Brain className="w-6 h-6 text-neon-cyan" />
                <span
                  className="text-lg font-bold text-transparent bg-clip-text tracking-widest uppercase"
                  style={{
                    backgroundImage: 'linear-gradient(to right, var(--neon-cyan), var(--neon-purple), var(--neon-yellow))'
                  }}
                >
                  Cognitive Labs
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-destructive bg-clip-text text-transparent mb-4">
                Certificat de Réussite
              </h1>

              {/* Award icon */}
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 bg-secondary/50 border-3 border-current ${grade.colorClass}`}
              >
                <Award className="w-8 h-8" />
              </motion.div>

              {/* Recipient */}
              <p className="text-muted-foreground mb-2 text-sm">Ce certificat est décerné à</p>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-primary mb-4 text-sm">{user.job}</p>

              {/* Achievement */}
              <p className="text-muted-foreground mb-4 text-xs">
                Pour avoir complété avec succès
                <br />
                <span className="text-foreground font-semibold text-sm">"{certificationName}"</span>
              </p>

              {/* Grade */}
              <div className="inline-block p-3 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < grade.stars ? grade.colorClass : "text-muted"}`}
                      fill={i < grade.stars ? "currentColor" : "transparent"}
                    />
                  ))}
                </div>
                <p className={`text-xl font-bold ${grade.colorClass}`}>Grade : {grade.label}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Score : {score}/{totalQuestions} ({percentage}%)
                </p>
              </div>

              {/* LinkedIn Share Button - moved here after grade */}
              <div className="mt-4">
                <Button
                  onClick={handleShareLinkedIn}
                  className="w-full bg-[#0077b5] hover:bg-[#006396] text-white"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  Partager sur LinkedIn
                </Button>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="space-y-4">
            <Card className="p-4 md:p-6 bg-card/50 border-border">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-neon-cyan" />
                Partager votre certification sur LinkedIn
              </h3>

              <div className="space-y-3">
                {/* LinkedIn Certification Guide - without Card wrapper */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Vous pouvez valoriser votre certification en l'ajoutant dans la section <span className="font-semibold">"Certifications"</span> de votre profil LinkedIn.
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Pour cela, rendez-vous dans votre profil, défilez jusqu'à la section "Licences et certifications", et cliquez sur le "+".
                  </p>
                </div>

                {/* Pre-filled fields */}
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Nom</Label>
                    <div className="flex gap-2">
                      <Input
                        value={certificationName}
                        readOnly
                        className="text-xs flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(certificationName, "Nom")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Organisme de délivrance</Label>
                    <div className="flex gap-2">
                      <Input
                        value="Cognitive Labs"
                        readOnly
                        className="text-xs flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard("Cognitive Labs", "Organisme")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">ID du diplôme</Label>
                    <div className="flex gap-2">
                      <Input
                        value={certificateId}
                        readOnly
                        className="text-xs flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(certificateId, "ID")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">URL du diplôme</Label>
                    <div className="flex gap-2">
                      <Input
                        value={certificateUrl}
                        readOnly
                        className="text-xs flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(certificateUrl, "URL")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Skills suggestions */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2">Compétences</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Biais cognitifs', 'UX Design', 'Psychologie cognitive', 'Design thinking', 'Expérience utilisateur'].map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full border border-primary/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Media */}
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs text-muted-foreground">Média</Label>
                    <Button
                      onClick={handleDownloadImage}
                      variant="outline"
                      size="sm"
                      className="border-2"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Télécharger l'image
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
