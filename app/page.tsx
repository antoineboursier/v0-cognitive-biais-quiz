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
    allLevelsCompleted: false,
    totalScore: 0,
    totalQuestions: LEVELS.length * 20, // Adjust if totals are dynamic
  };
};

export default function Home() {
  const [quizState, setQuizState] = useState<QuizState | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // This effect runs once on component mount
    try {
      const savedState = loadState()
      if (savedState) {
        setQuizState(savedState)
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
    if (quizState && quizState.userProfile) {
      const newState = createInitialState(quizState.userProfile);
      saveState(newState);
      setQuizState(newState);
    }
  }

  if (!isReady) {
    // Render nothing or a loader to avoid a flash of incorrect UI
    return null
  }

  if (quizState && quizState.userProfile) {
    // Pass state and a function to update it to the engine
    return <QuizEngine initialState={quizState} onReset={handleReset} />
  }

  return <OnboardingForm onComplete={handleOnboardingComplete} />
}
