"use client"

import { useState, useEffect } from "react"
import { QuizEngine } from "@/components/quiz-engine"
import { OnboardingForm, type UserProfile } from "@/components/onboarding-form"
import { loadState, saveState, type QuizState } from "@/lib/storage"
import { LEVELS } from "@/lib/data"


// Function to create a fresh, initial state for a new user
const createInitialState = (profile: UserProfile): QuizState => {
  const initialProgress = LEVELS.reduce((acc, level) => {
    acc[level.id] = { score: 0, total: 20, completed: false }; // Assuming 20 questions per level, might need to be dynamic
    return acc;
  }, {} as Record<number, { score: 0, total: 20, completed: false }>);

  return {
    userProfile: profile,
    gameState: "menu",
    currentLevelId: 1,
    questions: [],
    currentQuestionIndex: 0,
    levelProgress: initialProgress,
    unlockedBiases: [],
    completedQuestionIds: [],
    answeredQuestions: [], // New: track all answered questions with correctness
    allLevelsCompleted: false,
    totalScore: 0,
    totalQuestions: LEVELS.length * 20, // Adjust if totals are dynamic
  };
};

export default function Home() {
  const [quizState, setQuizState] = useState<QuizState | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [resetCounter, setResetCounter] = useState(0) // Counter to force remount on reset

  useEffect(() => {
    // This effect runs once on component mount
    try {
      const savedState = loadState()
      if (savedState && savedState.userProfile) {
        // Ensure backward compatibility by merging with default structure
        // This fixes issues where old state might be missing new fields like answeredQuestions
        const defaultState = createInitialState(savedState.userProfile);
        const migratedState = {
          ...defaultState,
          ...savedState,
          answeredQuestions: savedState.answeredQuestions || [],
          allLevelsCompleted: savedState.allLevelsCompleted || false,
        };
        setQuizState(migratedState)
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error)
    } finally {
      setIsReady(true)
    }
  }, [])

  const handleOnboardingComplete = (profile: UserProfile) => {
    const newState = createInitialState(profile)
    saveState(newState)
    setQuizState(newState)
  }

  const handleReset = () => {
    // Reset is now handled by AlertDialog in QuizEngine component
    if (quizState && quizState.userProfile) {
      const newState = createInitialState(quizState.userProfile);
      saveState(newState);
      setQuizState(newState);
      setResetCounter(prev => prev + 1); // Increment to force remount
    }
  }

  const handleDemoPage = (page: 'levelComplete' | 'certificate') => {
    if (!quizState) return;

    if (page === 'levelComplete') {
      // Navigate to level complete screen with fake data
      const updatedState: QuizState = {
        ...quizState,
        gameState: 'levelComplete',
        currentLevelId: 1, // Show Novice level completion
        levelProgress: {
          ...quizState.levelProgress,
          1: { score: 18, total: 20, completed: true }
        }
      };
      setQuizState(updatedState);
      setResetCounter(prev => prev + 1); // Force remount to apply new state
    } else if (page === 'certificate') {
      // Navigate to certificate screen with all levels completed
      const allCompletedProgress = LEVELS.reduce((acc, level) => {
        acc[level.id] = { score: 20, total: 20, completed: true };
        return acc;
      }, {} as Record<number, { score: number, total: number, completed: boolean }>);

      const updatedState: QuizState = {
        ...quizState,
        allLevelsCompleted: true,
        levelProgress: allCompletedProgress,
        totalScore: 60,
      };
      setQuizState(updatedState);
      setResetCounter(prev => prev + 1); // Force remount to apply new state

      // Trigger certificate display via a state update after a brief delay
      setTimeout(() => {
        setQuizState(prev => prev ? { ...prev } : prev);
      }, 100);
    }
  }

  if (!isReady) {
    // Render nothing or a loader to avoid a flash of incorrect UI
    return null
  }

  return (
    <>

      {quizState && quizState.userProfile ? (
        <QuizEngine
          key={resetCounter}
          initialState={quizState}
          onReset={handleReset}
          onGameStateChange={(newState) => {
            setQuizState(prev => prev ? { ...prev, gameState: newState } : null)
          }}
          onDemoPageRequested={handleDemoPage}
        />
      ) : (
        <OnboardingForm onComplete={handleOnboardingComplete} />
      )}
    </>
  )
}
