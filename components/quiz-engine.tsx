"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Zap,
  Trophy,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Lock,
  CheckCircle,
  ArrowLeft,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LEVELS, QUESTIONS, BIAS_LIBRARY, type Level, type Question } from "@/lib/data"
import { BrainProgress } from "./brain-progress"
import { ScanAnimation } from "./scan-animation"
import { PricingGridQuestion } from "./pricing-grid-question"
import { BiasWikiCard } from "./bias-wiki-card"
import { OnboardingForm, type UserProfile } from "./onboarding-form"
import { Certificate } from "./certificate"

type GameState = "onboarding" | "menu" | "playing" | "feedback" | "levelComplete" | "wiki" | "certificate"

interface LevelProgress {
  score: number
  total: number
  completed: boolean
}

export function QuizEngine() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [gameState, setGameState] = useState<GameState>("onboarding")
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<"success" | "error" | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelProgress>>({
    1: { score: 0, total: 20, completed: false },
    2: { score: 0, total: 20, completed: false },
    3: { score: 0, total: 20, completed: false },
  })
  const [unlockedBiases, setUnlockedBiases] = useState<Set<string>>(new Set())
  const [selectedBias, setSelectedBias] = useState<Question | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [allLevelsCompletedStatus, setAllLevelsCompletedStatus] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const startLevel = (level: Level) => {
    const levelQuestions = QUESTIONS.filter((q) => q.level_id === level.id)
    setQuestions(levelQuestions)
    setCurrentLevel(level)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setGameState("playing")
  }

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || isScanning) return

    setSelectedAnswer(answerIndex)
    setIsScanning(true)

    const isCorrect = currentQuestion.options[answerIndex].is_correct
    setScanResult(isCorrect ? "success" : "error")
  }

  const handleScanComplete = useCallback(() => {
    setIsScanning(false)
    setShowExplanation(true)

    const isCorrect = selectedAnswer !== null && currentQuestion?.options[selectedAnswer]?.is_correct

    // Mettre à jour le score
    if (isCorrect) {
      setLevelProgress((prev) => ({
        ...prev,
        [currentLevel.id]: {
          ...prev[currentLevel.id],
          score: prev[currentLevel.id].score + 1,
        },
      }))
    }

    // Débloquer le biais associé
    const correctOption = currentQuestion?.options.find((o) => o.is_correct)
    if (correctOption?.bias_id) {
      setUnlockedBiases((prev) => new Set([...prev, correctOption.bias_id!]))
    }
  }, [selectedAnswer, currentQuestion, currentLevel.id])

  const nextQuestion = () => {
    setSelectedAnswer(null)
    setScanResult(null)
    setShowExplanation(false)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // Niveau terminé
      const finalScore =
        levelProgress[currentLevel.id].score +
        (selectedAnswer !== null && currentQuestion?.options[selectedAnswer]?.is_correct ? 1 : 0)
      const percentage = (finalScore / questions.length) * 100

      setLevelProgress((prev) => ({
        ...prev,
        [currentLevel.id]: {
          ...prev[currentLevel.id],
          score: finalScore,
          completed: true,
        },
      }))

      setGameState("levelComplete")
    }
  }

  const getLevelPercentage = (levelId: number) => {
    const progress = levelProgress[levelId]
    if (!progress.completed && progress.score === 0) return 0
    return (progress.score / progress.total) * 100
  }

  const isLevelUnlocked = (level: Level) => {
    if (level.id === 1) return true
    const prevLevel = LEVELS.find((l) => l.id === level.id - 1)
    if (!prevLevel) return false
    return getLevelPercentage(prevLevel.id) >= level.unlock_criteria
  }

  const renderMenu = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <Brain className="w-12 h-12 text-cyan-400" />
            <h1 className="font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent text-6xl py-4">
              Cognitive Labs
            </h1>
          </motion.div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-0">
            Bienvenue <span className="text-cyan-400 font-semibold">{user?.firstName}</span> ! Entraînez votre cerveau à
            détecter les biais cognitifs utilisés en UX Design.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-0 pt-4">
          {/* Progression cérébrale */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Votre Progression
              </h2>
              <BrainProgress
                level1Progress={getLevelPercentage(1)}
                level2Progress={getLevelPercentage(2)}
                level3Progress={getLevelPercentage(3)}
                currentLevel={currentLevel.id}
              />
            </Card>

            {allLevelsCompletedStatus && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                  <div className="text-center">
                    <Award className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">Formation Terminée !</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Félicitations {user?.firstName} ! Récupérez votre diplôme.
                    </p>
                    <Button
                      onClick={() => setShowCertificate(true)}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Obtenir mon diplôme
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sélection de niveau */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Choisissez votre niveau</h2>
            {LEVELS.map((level, index) => {
              const unlocked = isLevelUnlocked(level)
              const progress = levelProgress[level.id]

              return (
                <motion.div
                  key={level.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`p-6 transition-all duration-300 ${
                      unlocked
                        ? "bg-gray-900/50 border-gray-700 hover:border-cyan-500/50 cursor-pointer"
                        : "bg-gray-900/30 border-gray-800 opacity-50"
                    }`}
                    onClick={() => unlocked && startLevel(level)}
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: unlocked ? level.theme_color : "#333",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-3xl" style={{ color: level.theme_color }}>
                            {level.name_fr}
                          </span>
                          {progress.completed && <Trophy className="w-5 h-5 text-yellow-500" />}
                        </div>
                        <p className="text-gray-400 mb-3 text-lg">{level.description}</p>

                        {unlocked && (
                          <div className="flex items-center gap-4">
                            <Progress value={getLevelPercentage(level.id)} className="flex-1 h-2" />
                            <span className="text-gray-500 font-mono text-base">
                              {progress.score}/{progress.total}
                            </span>
                          </div>
                        )}

                        {!unlocked && (
                          <p className="text-red-400/70 flex items-center gap-2 text-lg">
                            <Lock className="w-4 h-4" />
                            Requiert {level.unlock_criteria}% au niveau précédent
                          </p>
                        )}
                      </div>

                      {unlocked && (
                        <ChevronRight className="w-8 h-8 text-gray-600" style={{ color: level.theme_color }} />
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}

            {/* Bouton Wiki */}
            <Button
              variant="outline"
              size="lg"
              className="w-full mt-6 border-gray-700 hover:border-purple-500 hover:bg-purple-500/10 bg-transparent text-lg py-3"
              onClick={() => setGameState("wiki")}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Bibliothèque des Biais ({unlockedBiases.size}/{BIAS_LIBRARY.length})
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderPlaying = () => {
    if (!currentQuestion) return null

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header de niveau */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setGameState("menu")} className="text-gray-400 hover:text-white">
              ← Retour
            </Button>
            <div className="flex items-center gap-4">
              <span className="font-bold font-mono" style={{ color: currentLevel.theme_color }}>
                {currentLevel.name_fr}
              </span>
              <span className="text-gray-500 font-mono">
                {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-8">
            <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2" />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
            >
              <Card className="p-6 md:p-8 bg-gray-900/50 border-gray-800 mb-6">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${currentLevel.theme_color}20`,
                      border: `2px solid ${currentLevel.theme_color}`,
                    }}
                  >
                    <Brain className="w-5 h-5" style={{ color: currentLevel.theme_color }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-mono mb-2">SITUATION #{currentQuestion.id}</p>
                    <p className="text-lg md:text-xl text-white leading-relaxed">{currentQuestion.scenario}</p>
                  </div>
                </div>

                {/* Options selon le type d'interaction */}
                {currentQuestion.ui_interaction === "PRICE_GRID" && currentQuestion.experience_data ? (
                  <PricingGridQuestion
                    options={currentQuestion.experience_data.options}
                    onSelect={(index) => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                  />
                ) : (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedAnswer === index
                      const isCorrect = option.is_correct
                      const showResult = showExplanation

                      let buttonStyle = "border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-cyan-500/10"

                      if (showResult) {
                        if (isCorrect) {
                          buttonStyle = "border-green-500 bg-green-500/20"
                        } else if (isSelected && !isCorrect) {
                          buttonStyle = "border-red-500 bg-red-500/20"
                        }
                      } else if (isSelected) {
                        buttonStyle = "border-cyan-500 bg-cyan-500/20"
                      }

                      return (
                        <motion.button
                          key={index}
                          onClick={() => handleAnswer(index)}
                          disabled={selectedAnswer !== null}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${buttonStyle}`}
                          whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                          whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                showResult && isCorrect
                                  ? "bg-green-500 text-black"
                                  : showResult && isSelected && !isCorrect
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="text-white">{option.text}</span>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                )}
              </Card>

              {/* Explication après réponse */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <Card
                      className={`p-6 mb-6 ${
                        scanResult === "success"
                          ? "bg-green-500/10 border-green-500/50"
                          : "bg-red-500/10 border-red-500/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {scanResult === "success" ? (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        ) : (
                          <ArrowLeft className="w-6 h-6 text-red-500 flex-shrink-0" />
                        )}
                        <div>
                          <p
                            className={`font-bold mb-2 ${scanResult === "success" ? "text-green-400" : "text-red-400"}`}
                          >
                            {scanResult === "success"
                              ? "Excellente analyse !"
                              : "Biais détecté dans votre raisonnement"}
                          </p>
                          <p className="text-gray-300">{currentQuestion.explanation}</p>

                          {/* Info sur le biais débloqué */}
                          {(() => {
                            const correctOption = currentQuestion.options.find((o) => o.is_correct)
                            if (correctOption?.bias_id) {
                              const bias = BIAS_LIBRARY.find((b) => b.bias_id === correctOption.bias_id)
                              if (bias) {
                                return (
                                  <div className="mt-4 p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                                    <p className="text-xs text-cyan-400 font-mono mb-1">
                                      📚 AJOUTÉ À VOTRE BIBLIOTHÈQUE
                                    </p>
                                    <p className="text-white font-semibold">{bias.name}</p>
                                    <p className="text-gray-500 text-sm">{bias.category}</p>
                                  </div>
                                )
                              }
                            }
                            return null
                          })()}
                        </div>
                      </div>
                    </Card>

                    <Button
                      onClick={nextQuestion}
                      className="w-full"
                      size="lg"
                      style={{
                        backgroundColor: currentLevel.theme_color,
                        color: "#000",
                      }}
                    >
                      {currentQuestionIndex < questions.length - 1 ? "Question Suivante" : "Voir les Résultats"}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Animation de scan */}
        <ScanAnimation isScanning={isScanning} result={scanResult} onComplete={handleScanComplete} />
      </motion.div>
    )
  }

  const renderLevelComplete = () => {
    const progress = levelProgress[currentLevel.id]
    const percentage = (progress.score / progress.total) * 100
    const nextLevel = LEVELS.find((l) => l.id === currentLevel.id + 1)
    const canUnlockNext = nextLevel && percentage >= nextLevel.unlock_criteria

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-8"
      >
        <Card className="max-w-lg w-full p-8 bg-gray-900/50 border-gray-800 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <Trophy className="w-20 h-20 mx-auto mb-6" style={{ color: currentLevel.theme_color }} />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">Bravo {user?.firstName} !</h2>
          <p className="text-gray-400 mb-4">Niveau {currentLevel.name_fr} terminé</p>

          <div className="my-8">
            <div
              className="text-6xl font-bold mb-2"
              style={{ color: percentage >= 70 ? "#00FF88" : percentage >= 50 ? "#FFD700" : "#FF4444" }}
            >
              {Math.round(percentage)}%
            </div>
            <p className="text-gray-400">
              {progress.score} / {progress.total} bonnes réponses
            </p>
          </div>

          {percentage >= 70 ? (
            <p className="text-green-400 mb-6">🎉 Excellent travail ! Votre cerveau est affûté !</p>
          ) : percentage >= 50 ? (
            <p className="text-yellow-400 mb-6">👍 Pas mal ! Continuez à vous entraîner.</p>
          ) : (
            <p className="text-red-400 mb-6">💪 Courage ! La pratique fait le maître.</p>
          )}

          {canUnlockNext && nextLevel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-lg bg-green-500/10 border border-green-500/50 mb-6"
            >
              <p className="text-green-400 font-semibold">🔓 Niveau {nextLevel.name_fr} débloqué !</p>
            </motion.div>
          )}

          <div className="flex flex-col gap-3">
            {canUnlockNext && nextLevel && (
              <Button
                onClick={() => startLevel(nextLevel)}
                size="lg"
                style={{
                  backgroundColor: nextLevel.theme_color,
                  color: "#000",
                }}
              >
                Commencer le niveau {nextLevel.name_fr}
              </Button>
            )}

            <Button variant="outline" onClick={() => startLevel(currentLevel)} className="border-gray-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refaire ce niveau
            </Button>

            <Button variant="ghost" onClick={() => setGameState("menu")}>
              Retour au menu
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  const renderWiki = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-500" />
              Bibliothèque des Biais
            </h1>
            <p className="text-gray-400 mt-2">
              {unlockedBiases.size} / {BIAS_LIBRARY.length} concepts débloqués
            </p>
          </div>
          <Button variant="outline" onClick={() => setGameState("menu")} className="border-gray-700">
            ← Retour
          </Button>
        </div>

        <Progress value={(unlockedBiases.size / BIAS_LIBRARY.length) * 100} className="h-2 mb-8" />

        {/* Filtres par niveau */}
        {LEVELS.map((level) => {
          const levelBiases = BIAS_LIBRARY.filter((b) => b.level_unlocked === level.id)

          return (
            <div key={level.id} className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: level.theme_color }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.theme_color }} />
                Niveau {level.name_fr}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {levelBiases.map((bias) => (
                  <BiasWikiCard
                    key={bias.bias_id}
                    bias={bias}
                    isUnlocked={unlockedBiases.has(bias.bias_id)}
                    onClick={() => setSelectedBias(bias)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal détail biais */}
      <AnimatePresence>
        {selectedBias && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedBias(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-6 bg-gray-900 border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedBias.name}</h2>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mb-4">
                  {selectedBias.category}
                </span>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">DÉFINITION</h3>
                    <p className="text-gray-300">{selectedBias.definition}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <h3 className="text-sm font-semibold text-yellow-500 mb-2 flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      CONTRE-TACTIQUE UX
                    </h3>
                    <p className="text-gray-300">{selectedBias.counter_tactic}</p>
                  </div>
                </div>

                <Button className="w-full mt-6" onClick={() => setSelectedBias(null)}>
                  Fermer
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  useEffect(() => {
    const savedUser = localStorage.getItem("cognitiveLabsUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setGameState("menu")
    }
  }, [])

  useEffect(() => {
    const totalScore = Object.values(levelProgress).reduce((acc, p) => acc + p.score, 0)
    const totalQuestions = Object.values(levelProgress).reduce((acc, p) => acc + p.total, 0)
    setTotalScore(totalScore)
    setTotalQuestions(totalQuestions)
    setAllLevelsCompletedStatus(LEVELS.every((level) => levelProgress[level.id]?.completed))
  }, [levelProgress])

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile)
    setGameState("menu")
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {gameState === "onboarding" && <OnboardingForm onComplete={handleOnboardingComplete} />}
        {gameState === "menu" && renderMenu()}
        {gameState === "playing" && renderPlaying()}
        {gameState === "levelComplete" && renderLevelComplete()}
        {gameState === "wiki" && renderWiki()}
      </div>

      <AnimatePresence>
        {showCertificate && user && (
          <Certificate
            user={user}
            score={totalScore}
            totalQuestions={totalQuestions}
            onClose={() => setShowCertificate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
