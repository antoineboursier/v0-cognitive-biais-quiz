"use client"

import { useState, useReducer, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, Zap, Trophy, RotateCcw, ChevronRight, Lock, CheckCircle, ArrowLeft, Award,
  Library, CheckCircle2, BookOpen, Settings, Linkedin
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BrainProgress } from "./brain-progress"
import { ScanAnimation } from "./scan-animation"
import { PricingGridQuestion } from "./pricing-grid-question"
import { BiasWikiCard } from "./bias-wiki-card"
import { Certificate } from "./certificate"
import { Logo } from "./logo"
import { SettingsMenu } from "@/components/settings-menu"

import { saveState, type QuizState as BaseQuizState, type UserProfile, type QuestionAnswer } from "@/lib/storage"
import { useSettings } from "@/lib/settings-context"
import { LEVELS, QUESTIONS, BIAS_LIBRARY, type Level, type Question, type BiasEntry, shuffleArray } from "@/lib/data"
import { saveUserScore } from "@/lib/supabase/score-manager"
import { useConfetti } from "@/hooks/use-confetti"
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
  onGameStateChange?: (newState: GameState) => void
  onDemoPageRequested?: (page: 'levelComplete' | 'certificate') => void
}

// ------------------------------
// REDUCER AND STATE
// ------------------------------
type GameState = "menu" | "playing" | "levelComplete" | "wiki" | "certificate" | "onboarding"

// Extend the base state with the volatile, non-persistent UI state
interface QuizState extends BaseQuizState {
  selectedAnswer: number | null;
  isScanning: boolean;
  scanResult: "success" | "error" | null;
  showExplanation: boolean;
  selectedBias: BiasEntry | null;
  showCertificate: boolean;
  showResetDialog: boolean;
  showNoviceIntro: boolean; // New: control Novice tutorial visibility
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
  | { type: "CLOSE_NOVICE_INTRO" } // New action
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

      // If all questions are answered correctly, show level complete screen directly
      if (unansweredQuestions.length === 0) {
        return {
          ...state,
          gameState: "levelComplete",
          currentLevelId: action.payload.id,
          questions: allLevelQuestions, // Keep questions for reference
          currentQuestionIndex: 0,
          selectedAnswer: null,
          isScanning: false,
          scanResult: null,
          showExplanation: false,
          showNoviceIntro: false,
        }
      }

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
        // Show intro ONLY if starting Level 1 (Novice) and it's the first question
        showNoviceIntro: action.payload.id === 1,
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
      return { ...state, gameState: action.payload, selectedAnswer: null, showExplanation: false, scanResult: null, isScanning: false, showNoviceIntro: false }

    case "SELECT_WIKI_BIAS":
      return { ...state, selectedBias: action.payload }

    case "SHOW_CERTIFICATE":
      return { ...state, showCertificate: action.payload };

    case "SHOW_RESET_DIALOG":
      return { ...state, showResetDialog: action.payload };

    case "CLOSE_NOVICE_INTRO":
      return { ...state, showNoviceIntro: false };

    case "RESET":
      // This action is handled by the parent component, but we can reset volatile state here
      return { ...state, gameState: 'menu', showResetDialog: false, showNoviceIntro: false };

    default:
      return state
  }
}

// ------------------------------
// COMPONENT
// ------------------------------
export function QuizEngine({ initialState, onReset, onGameStateChange, onDemoPageRequested }: QuizEngineProps) {
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
    showNoviceIntro: false,
  } as QuizState)

  // Destructure state for easier access in the render methods
  const {
    userProfile,
    gameState,
    currentLevelId,
    questions,
    currentQuestionIndex,
    levelProgress,
    unlockedBiases,
    completedQuestionIds,
    allLevelsCompleted,
    selectedAnswer,
    isScanning,
    scanResult,
    showExplanation,
    selectedBias,
    showCertificate,
    showResetDialog,
    showNoviceIntro
  } = state

  // Local state for reset dialog and ref for auto-scroll
  const explanationRef = useRef<HTMLDivElement>(null);
  const lastNotifiedGameState = useRef<GameState>(state.gameState);

  // Confetti effect - only active when level is complete and animations are enabled
  useConfetti(animationsEnabled && gameState === 'levelComplete', 4000)

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

    // Notify parent of game state change if it changed
    if (onGameStateChange && state.gameState !== lastNotifiedGameState.current) {
      onGameStateChange(state.gameState)
      lastNotifiedGameState.current = state.gameState
    }
  }, [state, onGameStateChange])

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
  const closeNoviceIntro = () => dispatch({ type: "CLOSE_NOVICE_INTRO" });

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
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 right-0 md:top-0 md:right-0">
            <SettingsMenu onDemoPageRequested={onDemoPageRequested} />
          </div>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center mb-4"
          >
            <Logo size="large" />
          </motion.div>
          <p className="text-lg max-w-2xl mx-auto mb-4">
            Bienvenue <span className="text-neon-cyan font-semibold">{userProfile?.firstName}</span> ! Entraînez votre cerveau à détecter les biais cognitifs et les phénomènes comportementaux...
          </p>
          <p className="text-muted-foreground/80 text-base max-w-2xl mx-auto">
            Chaque niveau comporte 20 questions. Pas de panique : si vous vous trompez sur une question, elle vous sera reproposée par la suite.
            Prenez votre temps et recommencez autant que nécessaire : le but est d'apprendre, sans stress !
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-0 pt-4">
          {/* Sélection de niveau - First on mobile (default order), Second on Desktop (col-span-2) */}
          <div className="lg:col-span-2 space-y-4 lg:order-2">
            <h2 className="text-xl font-semibold text-foreground mb-4">Choisissez votre niveau :</h2>
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
                      ? "bg-card/50 cursor-pointer focus-within:ring-2 focus-within:ring-cyan-500/20"
                      : "bg-muted/50 border-border cursor-not-allowed"
                      }`}
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: unlocked ? level.theme_color : "#333",
                      backgroundColor: unlocked ? `color-mix(in oklab, ${level.theme_color} 8%, transparent)` : undefined,
                      borderColor: unlocked ? level.theme_color : undefined,
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
                      className={`outline-none w-full ${!unlocked ? 'pointer-events-none' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {!unlocked && (
                            <p className="text-red-500 flex items-center gap-2 text-s font-medium mb-2 uppercase tracking-wide">
                              <Lock className="w-3 h-3" aria-hidden="true" />
                              Bloqué - Requiert 70% au niveau précédent
                            </p>
                          )}
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-3xl" style={{ color: unlocked ? level.theme_color : 'var(--muted-foreground)' }}>
                              {level.name_fr}
                            </span>
                            {progress.completed && <Trophy className="w-5 h-5 text-neon-yellow" aria-label="Niveau complété" />}
                          </div>
                          <p className="text-muted-foreground mb-3 text-lg opacity-80" style={{ color: unlocked ? level.theme_color : undefined }}>{level.description}</p>

                          {unlocked && (
                            <div className="flex items-center gap-4">
                              <Progress
                                value={getLevelPercentage(level.id)}
                                className="flex-1 h-2"
                                style={{ backgroundColor: `color-mix(in oklab, ${level.theme_color} 20%, transparent)` }}
                                indicatorColor={level.theme_color}
                                aria-label={`Progression: ${Math.round(getLevelPercentage(level.id))}%`}
                              />
                              <span className="font-mono text-base" style={{ color: level.theme_color }} aria-label={`${progress.score} questions réussies sur ${progress.total}`}>
                                {progress.score}/{progress.total}
                              </span>
                            </div>
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
              className="w-full mt-6 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-foreground text-lg py-6"
              onClick={() => setGameState("wiki")}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Bibliothèque des biais ({unlockedBiases.length}/{QUESTIONS.length})
            </Button>
          </div>

          {/* Progression cérébrale - Second on mobile, First on Desktop (col-span-1) */}
          <div className="lg:col-span-1 space-y-4 lg:order-1">
            <Card className="p-6 bg-card/50 border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon-yellow" />
                Votre progression
              </h2>
              <BrainProgress
                level1Progress={getLevelPercentage(1)}
                level2Progress={getLevelPercentage(2)}
                level3Progress={getLevelPercentage(3)}
                currentLevel={currentLevel.id}
              />
            </Card>

            {/* Certificate Card - Always visible, locked until all levels completed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`p-6 ${allLevelsCompleted
                  ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                  : "bg-muted/50 border-border"
                }`}>
                <div className="text-center">
                  <Award className={`w-12 h-12 mx-auto mb-3 ${allLevelsCompleted ? "text-neon-yellow" : "text-muted-foreground"
                    }`} />
                  {allLevelsCompleted && (
                    <>
                      <h3 className="text-lg font-bold text-foreground mb-2">Formation terminée !</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Félicitations {userProfile?.firstName} ! Récupérez votre diplôme.
                      </p>
                    </>
                  )}
                  <Button
                    onClick={() => allLevelsCompleted && setGameState('certificate')}
                    disabled={!allLevelsCompleted}
                    className={`w-full font-semibold ${allLevelsCompleted
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      }`}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Obtenir mon diplôme
                  </Button>
                </div>
              </Card>
            </motion.div>


            {/* Share Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] border-[#0077b5]/20"
                onClick={() => {
                  const url = window.location.href;
                  const shareText = `🧠 Je m'entraîne à détecter les biais cognitifs et les phénomènes comportementauxsur Cognitive Labs !\n\nJ'ai atteint le niveau ${currentLevelId} (${currentLevel.name_fr}).\n Tentez de faire mieux ! ${url}`;

                  navigator.clipboard.writeText(shareText).then(() => {
                    toast.success("Texte copié ! Collez-le dans votre post LinkedIn.");
                    setTimeout(() => {
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                    }, 1000);
                  });
                }}
              >
                <Linkedin className="w-4 h-4 mr-2" />
                Partager
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border-[#25D366]/20"
                onClick={() => {
                  const url = window.location.href;
                  const text = `🧠 Je m'entraîne et j'apprend plein de trucs sur Cognitive Labs, sur les biais et les phénomènes comportementaux !\n\nJ'ai atteint le niveau ${currentLevelId} : ${currentLevel.name_fr}.\n Viens essayer de battre mon score 👉 ${url}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                WhatsApp
              </Button>
            </div>

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
        </div>
      </div>
    </motion.div >
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

        {/* Novice Intro Overlay */}
        <AnimatePresence>
          {showNoviceIntro && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full"
              >
                <Card className="p-6 bg-card border-border shadow-2xl">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center mb-2">
                      <Brain className="w-8 h-8 text-neon-cyan" />
                    </div>

                    <h2 className="text-2xl font-bold text-foreground">Petit tuto</h2>

                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Pour chaque question, une situation vous est présentée, avec 3 réponses possibles (biais ou effets psychologiques).
                      </p>
                      <p className="font-medium text-foreground">
                        À vous de trouver la bonne réponse !
                      </p>
                      <p className="text-sm bg-secondary/50 p-3 rounded-lg border border-border">
                        <span className="flex items-center justify-center gap-2 mb-1 text-neon-yellow font-semibold">
                          <Zap className="w-4 h-4" /> Pas de panique
                        </span>
                        Nous sommes là pour apprendre. En cas d'erreur, la question vous sera représentée ultérieurement.
                      </p>
                    </div>

                    <Button
                      className="w-full mt-4 bg-neon-cyan text-black hover:bg-neon-cyan/90 font-bold"
                      size="lg"
                      onClick={closeNoviceIntro}
                    >
                      C'est parti !
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  const renderLevelComplete = () => {
    if (!currentLevel) return null;

    const progress = levelProgress[currentLevel.id] || { score: 0, total: 20, completed: false };
    const percentage = progress.total > 0 ? (progress.score / progress.total) * 100 : 0;
    const nextLevel = LEVELS.find((l) => l.id === currentLevel.id + 1)
    const canUnlockNext = nextLevel && percentage >= nextLevel.unlock_criteria

    // Confetti effect moved to top level component

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen p-8 pb-20"
      >
        <div className="max-w-3xl mx-auto">
          {/* Back button - top left, BEFORE logo */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setGameState("menu")}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Retour à l'accueil
            </Button>
          </div>

          {/* Logo at top */}
          <div className="flex justify-center mb-12">
            <Logo size="medium" />
          </div>

          {/* Main content - NO Card wrapper */}
          <div className="text-center">
            {/* Trophy REMOVED */}

            {/* Level name - Reduced size by one step */}
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: currentLevel.theme_color }}
            >
              Niveau {currentLevel.name_fr} terminé
            </h2>

            {/* Score - Reduced size by one step & 80% opacity */}
            <p
              className="text-3xl md:text-4xl font-bold mb-8 opacity-80"
              style={{ color: currentLevel.theme_color }}
            >
              {progress.score}/{progress.total} bonnes réponses !
            </p>

            {/* Encouragement message - white, no emoji */}
            {percentage >= 70 ? (
              <p className="text-foreground text-xl mb-12">
                Excellent travail ! Votre cerveau est affûté !
              </p>
            ) : percentage >= 50 ? (
              <p className="text-foreground text-xl mb-12">
                Pas mal ! Continuez à vous entraîner.
              </p>
            ) : (
              <p className="text-foreground text-xl mb-12">
                Courage ! La pratique fait le maître.
              </p>
            )}

            {/* Next level unlock - simple gray text */}
            {canUnlockNext && nextLevel && (
              <div className="mb-8">
                <p className="text-muted-foreground text-lg mb-4">
                  Niveau {nextLevel.name_fr} débloqué :
                </p>
                <div className="flex flex-col gap-3 items-center">
                  <Button
                    onClick={() => startLevel(nextLevel)}
                    size="lg"
                    className="w-full sm:max-w-xs text-lg py-6" // Increased text size
                    style={{
                      backgroundColor: nextLevel.theme_color,
                      color: "#000",
                    }}
                  >
                    Commencer le niveau {nextLevel.name_fr}
                  </Button>
                </div>
              </div>
            )}

            {/* Other buttons */}
            <div className="flex flex-col gap-3 items-center mt-8">
              {!canUnlockNext && (
                <Button
                  variant="outline"
                  onClick={() => startLevel(currentLevel)}
                  className="border-border w-full sm:max-w-xs text-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refaire ce niveau
                </Button>
              )}
            </div>
          </div>
        </div>
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
        {gameState === "certificate" && userProfile && (
          <Certificate
            user={userProfile}
            score={totalScoreCalculated}
            totalQuestions={totalQuestionsCalculated}
            onClose={() => setGameState('menu')}
            onReset={onReset}
          />
        )}
      </div>

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
