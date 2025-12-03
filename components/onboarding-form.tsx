import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, User, Mail, Briefcase, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  job: string
}

interface OnboardingFormProps {
  onComplete: (profile: UserProfile) => void
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [formData, setFormData] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    job: "",
  })
  const [errors, setErrors] = useState<Partial<UserProfile>>({})

  const validate = () => {
    const newErrors: Partial<UserProfile> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "Requis"
    if (!formData.lastName.trim()) newErrors.lastName = "Requis"
    if (!formData.email.trim()) newErrors.email = "Requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email invalide"
    if (!formData.job.trim()) newErrors.job = "Requis"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onComplete(formData)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 mb-6"
          >
            <Brain className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-destructive bg-clip-text text-transparent mb-2">
            Bienvenue sur Cognitive Labs
          </h1>
          <p className="text-muted-foreground">Créez votre profil pour commencer votre parcours d'apprentissage</p>
        </div>

        {/* Form */}
        <Card className="p-6 bg-card/70 border-border backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Prénom
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-secondary/50 border-border focus:border-primary text-foreground"
                  placeholder="Jean"
                />
                {errors.firstName && <p className="text-destructive text-xs">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-muted-foreground">
                  Nom
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-secondary/50 border-border focus:border-primary text-foreground"
                  placeholder="Dupont"
                />
                {errors.lastName && <p className="text-destructive text-xs">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary/50 border-border focus:border-primary text-foreground"
                placeholder="jean.dupont@email.com"
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job" className="text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Poste / Fonction
              </Label>
              <Input
                id="job"
                value={formData.job}
                onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                className="bg-secondary/50 border-border focus:border-primary text-foreground"
                placeholder="UX Designer, Product Manager..."
              />
              {errors.job && <p className="text-destructive text-xs">{errors.job}</p>}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Commencer l'aventure
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-4">
          Vos données restent privées et ne sont jamais partagées.
        </p>
      </motion.div>
    </div>
  )
}
