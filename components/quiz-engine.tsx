"use client"

import { useState, useReducer, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, Zap, Trophy, RotateCcw, ChevronRight, Lock, CheckCircle, ArrowLeft, Award,
  Library, CheckCircle2, BookOpen, Settings
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BrainProgress } from "./brain-progress"
import { ScanAnimation } from "./scan-animation"
import { PricingGridQuestion } from "./pricing-grid-question"
import { BiasWikiCard } from "./bias-wiki-card"
import { Certificate } from "./certificate"

import { saveState, type QuizState as BaseQuizState, type UserProfile, type QuestionAnswer } from "@/lib/storage"
import { useSettings } from "@/lib/settings-context"
import { LEVELS, QUESTIONS, BIAS_LIBRARY, type Level, type Question, type BiasEntry, shuffleArray } from "@/lib/data"
import { saveUserScore } from "@/lib/supabase/score-manager"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BiasCategoryIcon, categoryColors } from "@/components/ui/icons"

// ------------------------------
// PROPS
// ------------------------------
interface QuizEngineProps {
  initialState: BaseQuizState
  onReset: () => void
}

// ------------------------------
// REDUCER AND STATE
// ------------------------------
type GameState = "menu" | "playing" | "levelComplete" | "wiki" | "certificate"

// Extend the base state with the volatile, non-persistent UI state
interface QuizState extends BaseQuizState {
  selectedAnswer: number | null;
  isScanning: boolean;
  scanResult: "success" | "error" | null;
  showExplanation: boolean;
  selectedBias: BiasEntry | null;
  showCertificate: boolean;
  showResetDialog: boolean; // New: control AlertDialog visibility
}


type Action =
  | { type: "START_LEVEL"; payload: Level }
  | { type: "SELECT_ANSWER"; payload: { answerIndex: number; question: Question } }
  | { type: "SCAN_COMPLETE" }
  | { type: "NEXT_QUESTION" }
  | { type: "COMPLETE_LEVEL" }
  | { type: "CHANGE_GAME_STATE"; payload: GameState }
  | { type: "SELECT_WIKI_BIAS"; payload: BiasEntry | null }
  | { type: "SHOW_CERTIFICATE"; payload: boolean }
  | { type: "SHOW_RESET_DIALOG"; payload: boolean }
  | { type: "RESET" }

// The reducer function handles all state transitions
function quizReducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case "START_LEVEL": {
      // Get all questions for this level
      const allLevelQuestions = QUESTIONS.filter((q) => q.level_id === action.payload.id)

      // Filter out questions that were answered correctly
      const correctlyAnsweredIds = state.answeredQuestions
        .filter(a => a.isCorrect)
        .map(a => a.questionId);

      const unansweredQuestions = allLevelQuestions.filter(
        q => !correctlyAnsweredIds.includes(q.id)
      );

      // Randomize the filtered questions
      const randomizedQuestions = shuffleArray(unansweredQuestions).map(q => ({
        ...q,
        options: shuffleArray([...q.options]) // Also randomize options
      }));

      return {
        ...state,
        gameState: "playing",
        currentLevelId: action.payload.id,
        questions: randomizedQuestions,
        currentQuestionIndex: 0,
        // Reset volatile playing state
        selectedAnswer: null,
        isScanning: false,
        scanResult: null,
        showExplanation: false,
      }
    }

    case "SELECT_ANSWER": {
      if (state.selectedAnswer !== null || state.isScanning) return state
      const { answerIndex, question } = action.payload
      const isCorrect = question.options[answerIndex].is_correct

      return {
        ...state,
        selectedAnswer: answerIndex,
        isScanning: true,
        scanResult: isCorrect ? "success" : "error",
      }
    }

    case "SCAN_COMPLETE": {
      const currentQuestion = state.questions?.[state.currentQuestionIndex];
      if (!currentQuestion || state.selectedAnswer === null) return state;

      const isCorrect = state.scanResult === 'success';
      const updatedLevelProgress = { ...state.levelProgress };

      // Only increment score if this question wasn't already answered correctly
      const wasAlreadyCorrect = state.answeredQuestions.some(
        a => a.questionId === currentQuestion.id && a.isCorrect
      );

      let newScore = updatedLevelProgress[state.currentLevelId!].score;
      if (isCorrect && !wasAlreadyCorrect) {
        newScore += 1;
      }

      updatedLevelProgress[state.currentLevelId!] = {
        ...updatedLevelProgress[state.currentLevelId!],
        score: newScore,
      };

      const correctOption = currentQuestion.options.find(o => o.is_correct);
      const unlockedBiases = new Set(state.unlockedBiases);
      if (correctOption?.bias_id) {
        unlockedBiases.add(correctOption.bias_id);
      }

      // Track this answer
      const newAnswer: QuestionAnswer = {
        questionId: currentQuestion.id,
        isCorrect,
        answeredAt: Date.now(),
      };

      // Remove previous answer for this question if it exists, then add new one
      const updatedAnswers = [
        ...state.answeredQuestions.filter(a => a.questionId !== currentQuestion.id),
        newAnswer,
      ];

      // Calculate total score
      const totalScore = Object.values(updatedLevelProgress).reduce((acc, p) => acc + p.score, 0);

      return {
        ...state,
        isScanning: false,
        showExplanation: true,
        levelProgress: updatedLevelProgress,
        unlockedBiases: Array.from(unlockedBiases),
        answeredQuestions: updatedAnswers,
        totalScore,
      };
    }

    case "NEXT_QUESTION": {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return {
          ...state,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          selectedAnswer: null,
          scanResult: null,
          showExplanation: false,
        }
      }
      // If it's the last question, fall through to complete the level
      return quizReducer(state, { type: "COMPLETE_LEVEL" })
    }

    case "COMPLETE_LEVEL": {
      const levelId = state.currentLevelId!
      const updatedLevelProgress = {
        ...state.levelProgress,
        [levelId]: {
          ...state.levelProgress[levelId],
          completed: true,
        },
      }

      const allCompleted = LEVELS.every(
        (level) => updatedLevelProgress[level.id]?.completed
      )

      return {
        ...state,
        gameState: "levelComplete",
        levelProgress: updatedLevelProgress,
        allLevelsCompleted: allCompleted,
      }
    }

    case "CHANGE_GAME_STATE":
      return { ...state, gameState: action.payload, selectedAnswer: null, showExplanation: false, scanResult: null, isScanning: false }

    case "SELECT_WIKI_BIAS":
      return { ...state, selectedBias: action.payload }

    case "SHOW_CERTIFICATE":
      return { ...state, showCertificate: action.payload };

    case "SHOW_RESET_DIALOG":
      return { ...state, showResetDialog: action.payload };

    case "RESET":
      // This action is handled by the parent component, but we can reset volatile state here
      return { ...state, gameState: 'menu', showResetDialog: false };

    default:
      return state
  }
}

// ------------------------------
// COMPONENT
// ------------------------------
export function QuizEngine({ initialState, onReset }: QuizEngineProps) {
  const { theme, setTheme } = useTheme()
  const { animationsEnabled, cheatMode } = useSettings()

  // All state is managed by the reducer, initialized by props
  const [state, dispatch] = useReducer(quizReducer, {
    ...initialState,
    // Initialize non-persistent state
    selectedAnswer: null,
    isScanning: false,
    scanResult: null,
    showExplanation: false,
    selectedBias: null,
    showCertificate: false,
    showResetDialog: false,
  })

  // Destructure state for easier access in the render methods
  const {
    userProfile,
    gameState,
    currentLevelId,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    isScanning,
    scanResult,
    showExplanation,
    levelProgress,
    unlockedBiases,
    allLevelsCompleted,
    selectedBias,
    showCertificate,
    showResetDialog,
  } = state;

  // Local state for reset dialog and ref for auto-scroll
  const [showResetDialogLocal, setShowResetDialogLocal] = useState(showResetDialog);
  const explanationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showExplanation && explanationRef.current) {
      if (animationsEnabled) {
        // Use a timeout to allow the element to render fully before scrolling
        setTimeout(() => {
          explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        // Immediate scroll
        explanationRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }
  }, [showExplanation, animationsEnabled]);

  // Persist state to localStorage on every change
  useEffect(() => {
    // We only save the "Base" state, not the volatile UI state
    const stateToSave: BaseQuizState = {
      userProfile: state.userProfile,
      gameState: state.gameState,
      currentLevelId: state.currentLevelId,
      questions: state.questions,
      currentQuestionIndex: state.currentQuestionIndex,
      levelProgress: state.levelProgress,
      unlockedBiases: state.unlockedBiases,
      completedQuestionIds: state.completedQuestionIds, // Keep for backward compatibility
      answeredQuestions: state.answeredQuestions,
      allLevelsCompleted: state.allLevelsCompleted,
      totalScore: state.totalScore,
      totalQuestions: state.totalQuestions,
    }
    saveState(stateToSave)

    // Also save to Supabase (async, non-blocking)
    if (state.userProfile) {
      saveUserScore(stateToSave).catch(err => {
        console.error('Failed to save to Supabase:', err);
      });
    }
  }, [state])

  const currentLevel = LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];
  const currentQuestion = questions?.[currentQuestionIndex];

  // --- Event Handlers ---
  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer === null && !isScanning) {
      dispatch({ type: "SELECT_ANSWER", payload: { answerIndex, question: currentQuestion! } })

      if (!animationsEnabled) {
        // Skip scan animation
        setTimeout(() => dispatch({ type: "SCAN_COMPLETE" }), 0)
      }
    }
  }

  const handleScanComplete = useCallback(() => dispatch({ type: "SCAN_COMPLETE" }), []);
  const nextQuestion = () => dispatch({ type: "NEXT_QUESTION" });
  const startLevel = (level: Level) => dispatch({ type: "START_LEVEL", payload: level });
  const setGameState = (gameState: GameState) => dispatch({ type: "CHANGE_GAME_STATE", payload: gameState });
  const setSelectedBias = (bias: BiasEntry | null) => dispatch({ type: "SELECT_WIKI_BIAS", payload: bias });
  const setShowCertificate = (show: boolean) => dispatch({ type: "SHOW_CERTIFICATE", payload: show });
  const setShowResetDialog = (show: boolean) => dispatch({ type: "SHOW_RESET_DIALOG", payload: show });

  // --- Computed Values ---
  const getLevelPercentage = (levelId: number) => {
    const progress = levelProgress[levelId]
    if (!progress || progress.total === 0) return 0
    return (progress.score / progress.total) * 100
  }

  const isLevelUnlocked = (level: Level) => {
    if (level.id === 1) return true; // Novice is always unlocked
    const prevLevel = LEVELS.find((l) => l.id === level.id - 1);
    if (!prevLevel) return false;

    // Enforce 70% for both Practicien (id: 2) and Expert (id: 3)
    const requiredScore = 70;

    return getLevelPercentage(prevLevel.id) >= requiredScore;
  }

  const totalScoreCalculated = Object.values(levelProgress).reduce((acc, p) => acc + p.score, 0);
  const totalQuestionsCalculated = Object.values(levelProgress).reduce((acc, p) => acc + p.total, 0);

  // ... (The rest of the render methods are identical) ...
  const renderMenu = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <Brain className="w-12 h-12 text-neon-cyan" />
            <h1
              className="font-bold text-transparent bg-clip-text text-6xl py-4"
              style={{
                backgroundImage: 'linear-gradient(to right, var(--neon-cyan), var(--neon-purple), var(--neon-yellow))'
              }}
            >
              Cognitive Labs
            </h1>
          </motion.div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-0">
            Bienvenue <span className="text-neon-cyan font-semibold">{userProfile?.firstName}</span> ! Entraînez votre cerveau à
            détecter les biais cognitifs utilisés en UX Design.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-0 pt-4">
          {/* Progression cérébrale */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 bg-card/50 border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon-yellow" />
                Votre Progression
              </h2>
              <BrainProgress
                level1Progress={getLevelPercentage(1)}
                level2Progress={getLevelPercentage(2)}
                level3Progress={getLevelPercentage(3)}
                currentLevel={currentLevel.id}
              />
            </Card>

            {allLevelsCompleted && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                  <div className="text-center">
                    <Award className="w-12 h-12 text-neon-yellow mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-foreground mb-2">Formation Terminée !</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Félicitations {userProfile?.firstName} ! Récupérez votre diplôme.
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
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-6 border-border hover:border-red-500 hover:bg-red-500/10 bg-transparent text-foreground"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Recommencer le jeu
            </Button>
          </div>

          {/* Sélection de niveau */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Choisissez votre niveau</h2>
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
                    className={`p-6 transition-all duration-300 ${unlocked
                      ? "bg-card/50 border-border hover:border-cyan-500/50 cursor-pointer focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20"
                      : "bg-card/30 border-border opacity-50"
                      }`}
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: unlocked ? level.theme_color : "#333",
                    }}
                    tabIndex={-1}
                  >
                    <div
                      role="button"
                      tabIndex={unlocked ? 0 : -1}
                      aria-disabled={!unlocked}
                      aria-label={`${level.name_fr}: ${level.description}. ${unlocked ? `${progress.score} sur ${progress.total} complétés` : 'Niveau verrouillé, requiert 70% au niveau précédent'}`}
                      onClick={() => unlocked && startLevel(level)}
                      onKeyDown={(e) => {
                        if (unlocked && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          startLevel(level)
                        }
                      }}
                      className="outline-none w-full"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-3xl" style={{ color: level.theme_color }}>
                              {level.name_fr}
                            </span>
                            {progress.completed && <Trophy className="w-5 h-5 text-neon-yellow" aria-label="Niveau complété" />}
                          </div>
                          <p className="text-muted-foreground mb-3 text-lg">{level.description}</p>

                          {unlocked && (
                            <div className="flex items-center gap-4">
                              <Progress value={getLevelPercentage(level.id)} className="flex-1 h-2" aria-label={`Progression: ${Math.round(getLevelPercentage(level.id))}%`} />
                              <span className="text-muted-foreground font-mono text-base" aria-label={`${progress.score} questions réussies sur ${progress.total}`}>
                                {progress.score}/{progress.total}
                              </span>
                            </div>
                          )}

                          {!unlocked && (
                            <p className="text-red-400/70 flex items-center gap-2 text-lg">
                              <Lock className="w-4 h-4" aria-hidden="true" />
                              Requiert 70% au niveau précédent
                            </p>
                          )}
                        </div>

                        {unlocked && (
                          <ChevronRight className="w-8 h-8 text-muted-foreground" style={{ color: level.theme_color }} aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}

            {/* Bouton Wiki */}
            <Button
              variant="outline"
              size="lg"
              className="w-full mt-6 border-border hover:border-purple-500 hover:bg-purple-500/10 bg-transparent text-foreground text-lg py-3"
              onClick={() => setGameState("wiki")}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Bibliothèque des Biais ({unlockedBiases.length}/{QUESTIONS.length})
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderPlaying = () => {
    if (!currentQuestion) return null

    // Find the category and color for the current question's bias
    const correctOption = currentQuestion.options.find(o => o.is_correct);
    const bias = correctOption?.bias_id ? BIAS_LIBRARY.find(b => b.bias_id === correctOption.bias_id) : undefined;
    const questionCategory = bias?.category || 'default';
    const categoryColor = categoryColors[questionCategory] || 'var(--muted-foreground)';

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-4 md:p-8 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header de niveau */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setGameState("menu")} className="text-muted-foreground hover:text-foreground">
              ← Retour
            </Button>
            <div className="flex items-center gap-4">
              <span className="font-bold font-mono" style={{ color: currentLevel.theme_color }}>
                {currentLevel.name_fr}
              </span>
              <span className="text-muted-foreground font-mono">
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
              <Card className="p-6 md:p-8 bg-card/50 border-border mb-6">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${categoryColor} 10%, transparent)`,
                      border: `2px solid ${categoryColor}`,
                    }}
                  >
                    <BiasCategoryIcon category={questionCategory} className="w-5 h-5" style={{ color: categoryColor }} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">SITUATION #{currentQuestion.id}</p>
                    <p className="text-lg md:text-xl text-foreground leading-relaxed">{currentQuestion.scenario}</p>
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

                      let buttonStyle = "border-border bg-secondary/50 hover:border-neon-cyan/50 hover:bg-neon-cyan/10"

                      if (showResult) {
                        if (isCorrect) {
                          buttonStyle = "border-green-500 bg-green-500/20"
                        } else if (isSelected && !isCorrect) {
                          buttonStyle = "border-red-500 bg-red-500/20"
                        }
                      } else if (isSelected) {
                        buttonStyle = "border-neon-cyan bg-neon-cyan/20"
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
                          <div className="flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${showResult && isCorrect
                                  ? "bg-green-500 text-black"
                                  : showResult && isSelected && !isCorrect
                                    ? "bg-destructive text-destructive-foreground"
                                    : "bg-muted text-muted-foreground"
                                  }`}
                              >
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="text-foreground">{option.text}</span>
                            </div>
                            {/* Cheat mode indicator - only show before answer is revealed */}
                            {cheatMode && !showExplanation && isCorrect && (
                              <div
                                className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold shadow-lg"
                                title="Bonne réponse (mode triche)"
                              >
                                ✓
                              </div>
                            )}
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
                    ref={explanationRef}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <Card
                      className={`p-6 mb-6 ${scanResult === "success"
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
                            className={`mb-2 ${scanResult === "success" ? "text-green-400" : "text-red-400"}`}
                          >
                            {scanResult === "success"
                              ? "Excellente analyse !"
                              : "Biais détecté dans votre raisonnement"}
                          </p>
                          <p className="text-foreground text-base leading-relaxed">{currentQuestion.explanation}</p>

                          {(() => {
                            const correctOption = currentQuestion.options.find((o) => o.is_correct)
                            if (correctOption?.bias_id) {
                              const bias = BIAS_LIBRARY.find((b) => b.bias_id === correctOption.bias_id)
                              if (bias) {
                                return (
                                  <div className="mt-4 p-4 rounded-lg bg-card/50 border border-border flex items-center gap-4">
                                    <CheckCircle2 className="w-8 h-8 text-neon-cyan" aria-hidden="true" />
                                    <span className="sr-only">Succès</span>
                                    <div>
                                      <p className="text-sm text-neon-cyan">Ajouté à votre bibliothèque</p>
                                      <p className="text-base font-semibold text-foreground">{bias.name}</p>
                                      <p className="text-xs text-muted-foreground">{bias.category}</p>
                                    </div>
                                  </div>
                                )
                              }
                            }
                            return null
                          })()}
                        </div>
                      </div>
                    </Card>

                    <div className="flex justify-center">
                      <Button
                        onClick={nextQuestion}
                        className="w-full sm:max-w-xs"
                        size="lg"
                        style={{
                          backgroundColor: currentLevel.theme_color,
                          color: "#000",
                        }}
                      >
                        {currentQuestionIndex < questions.length - 1 ? "Question Suivante" : "Voir les Résultats"}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
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
        className="min-h-screen flex items-center justify-center p-8 pb-20"
      >
        <Card className="max-w-lg w-full p-8 bg-card/50 border-border text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <Trophy className="w-20 h-20 mx-auto mb-6" style={{ color: currentLevel.theme_color }} />
          </motion.div>

          <h2 className="text-3xl font-bold text-foreground mb-2">Bravo {userProfile?.firstName} !</h2>
          <p className="text-muted-foreground mb-4">Niveau {currentLevel.name_fr} terminé</p>

          <div className="my-8">
            <div
              className="text-6xl font-bold mb-2"
              style={{ color: percentage >= 70 ? "#00FF88" : percentage >= 50 ? "#FFD700" : "#FF4444" }}
            >
              {Math.round(percentage)}%
            </div>
            <p className="text-muted-foreground">
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
                className="w-full sm:max-w-xs mx-auto"
                style={{
                  backgroundColor: nextLevel.theme_color,
                  color: "#000",
                }}
              >
                Commencer le niveau {nextLevel.name_fr}
              </Button>
            )}

            <Button variant="outline" onClick={() => startLevel(currentLevel)} className="border-border w-full sm:max-w-xs mx-auto text-foreground">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refaire ce niveau
            </Button>

            <Button variant="ghost" onClick={() => setGameState("menu")} className="w-full sm:max-w-xs mx-auto text-muted-foreground hover:text-foreground">
              Retour au menu
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  const renderWiki = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => setGameState("menu")} className="text-muted-foreground hover:text-foreground">
            ← Retour
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 justify-end">
              <Library className="w-8 h-8 text-neon-purple" aria-hidden="true" />
              <span className="sr-only">Bibliothèque</span>
              Bibliothèque des Biais
            </h1>
            <p className="text-muted-foreground mt-2">
              {unlockedBiases.length} / {QUESTIONS.length} concepts débloqués
            </p>
          </div>
        </div>

        <Progress value={(unlockedBiases.length / BIAS_LIBRARY.length) * 100} className="h-2 mb-8" />

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
                    isUnlocked={unlockedBiases.includes(bias.bias_id)}
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
              <Card className="p-6 bg-card border-border">
                <h2 className="text-2xl font-bold text-foreground mb-2">{selectedBias.name}</h2>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-mono bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 mb-4">
                  {selectedBias.category}
                </span>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">DÉFINITION</h3>
                    <p className="text-foreground">{selectedBias.definition}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-neon-yellow" />
                      CONTRE-MESURE
                    </h3>
                    <p className="text-foreground">{selectedBias.counter_tactic}</p>
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

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
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
        {gameState === "menu" && renderMenu()}
        {gameState === "playing" && renderPlaying()}
        {gameState === "levelComplete" && renderLevelComplete()}
        {gameState === "wiki" && renderWiki()}
      </div>

      <AnimatePresence>
        {showCertificate && userProfile && (
          <Certificate
            user={userProfile}
            score={totalScoreCalculated}
            totalQuestions={totalQuestionsCalculated}
            onClose={() => setShowCertificate(false)}
            onReset={onReset}
          />
        )}
      </AnimatePresence>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-popover border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Recommencer le jeu ?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Êtes-vous sûr de vouloir tout effacer ? Votre progression et vos biais débloqués seront perdus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onReset()
                setShowResetDialog(false)
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Tout effacer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
