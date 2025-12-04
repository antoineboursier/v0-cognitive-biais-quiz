"use client"

import { useState, useReducer, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, Zap, Trophy, RotateCcw, ChevronRight, Lock, CheckCircle, ArrowLeft, Award,
  Library, CheckCircle2, BookOpen
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BrainProgress } from "./brain-progress"
import { ScanAnimation } from "./scan-animation"
import { PricingGridQuestion } from "./pricing-grid-question"
import { BiasWikiCard } from "./bias-wiki-card"
import { Certificate } from "./certificate"

import { saveState, type QuizState as BaseQuizState, type UserProfile, type QuestionAnswer } from "@/lib/storage"
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
  initialState: QuizState
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
      // Use a timeout to allow the element to render fully before scrolling
      setTimeout(() => {
        explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showExplanation]);

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
            <Brain className="w-12 h-12 text-cyan-400" />
            <h1 className="font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent text-6xl py-4">
              Cognitive Labs
            </h1>
          </motion.div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-0">
            Bienvenue <span className="text-cyan-400 font-semibold">{userProfile?.firstName}</span> ! Entraînez votre cerveau à
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

            {allLevelsCompleted && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                  <div className="text-center">
                    <Award className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-2">Formation Terminée !</h3>
                    <p className="text-gray-400 text-sm mb-4">
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
              className="w-full mt-6 border-gray-700 hover:border-red-500 hover:bg-red-500/10 bg-transparent"
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Recommencer le jeu
            </Button>
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
                    className={`p-6 transition-all duration-300 ${unlocked
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
                            Requiert 70% au niveau précédent
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
                      backgroundColor: `color-mix(in oklch, ${categoryColor} 10%, transparent)`,
                      border: `2px solid ${categoryColor}`,
                    }}
                  >
                    <BiasCategoryIcon category={questionCategory} className="w-5 h-5" style={{ color: categoryColor }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-mono">SITUATION #{currentQuestion.id}</p>
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
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${showResult && isCorrect
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
                          <p className="text-white text-base leading-relaxed">{currentQuestion.explanation}</p>

                          {(() => {
                            const correctOption = currentQuestion.options.find((o) => o.is_correct)
                            if (correctOption?.bias_id) {
                              const bias = BIAS_LIBRARY.find((b) => b.bias_id === correctOption.bias_id)
                              if (bias) {
                                return (
                                  <div className="mt-4 p-4 rounded-lg bg-gray-900/50 border border-gray-700 flex items-center gap-4">
                                      <CheckCircle2 className="w-8 h-8 text-cyan-400" aria-hidden="true" />
                                      <span className="sr-only">Succès</span>
                                      <div>
                                        <p className="text-sm text-cyan-400">Ajouté à votre bibliothèque</p>
                                        <p className="text-base font-semibold text-white">{bias.name}</p>
                                        <p className="text-xs text-gray-500">{bias.category}</p>
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

                    <div className="flex justify-end">
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
        <Card className="max-w-lg w-full p-8 bg-gray-900/50 border-gray-800 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <Trophy className="w-20 h-20 mx-auto mb-6" style={{ color: currentLevel.theme_color }} />
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">Bravo {userProfile?.firstName} !</h2>
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
                className="w-full sm:max-w-xs mx-auto"
                style={{
                  backgroundColor: nextLevel.theme_color,
                  color: "#000",
                }}
              >
                Commencer le niveau {nextLevel.name_fr}
              </Button>
            )}

            <Button variant="outline" onClick={() => startLevel(currentLevel)} className="border-gray-700 w-full sm:max-w-xs mx-auto">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refaire ce niveau
            </Button>

            <Button variant="ghost" onClick={() => setGameState("menu")} className="w-full sm:max-w-xs mx-auto">
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
          <Button variant="ghost" onClick={() => setGameState("menu")} className="text-gray-400 hover:text-white">
            ← Retour
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 justify-end">
              <Library className="w-8 h-8 text-purple-500" aria-hidden="true" />
              <span className="sr-only">Bibliothèque</span>
              Bibliothèque des Biais
            </h1>
            <p className="text-gray-400 mt-2">
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

  // --- Main Render ---
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
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Recommencer le jeu ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Êtes-vous sûr de vouloir recommencer ? Toute votre progression sera perdue.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowResetDialog(false);
                onReset();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Oui, recommencer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
