// v0-cognitive-biais-quiz/lib/storage.ts

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  job: string;
}

export interface LevelProgress {
  score: number;
  total: number;
  completed: boolean;
}

// The single, unified state for the entire quiz application
export interface QuizState {
  userProfile: UserProfile | null;
  gameState: "onboarding" | "menu" | "playing" | "levelComplete" | "wiki" | "certificate";
  currentLevelId: number;
  questions: any[]; // Keep it simple for now, Question type is in a component
  currentQuestionIndex: number;
  levelProgress: Record<number, LevelProgress>;
  unlockedBiases: string[]; // Storing as an array of strings for JSON compatibility
  allLevelsCompleted: boolean;
  totalScore: number;
  totalQuestions: number;
}

const STATE_KEY = 'cognitiveBiasQuizState';

/**
 * Saves the user's quiz state to localStorage.
 * @param state The quiz state object to save.
 */
export const saveState = (state: QuizState): void => {
  if (typeof window !== 'undefined') {
    try {
      const data = JSON.stringify(state);
      window.localStorage.setItem(STATE_KEY, data);
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }
};

/**
 * Loads the user's quiz state from localStorage.
 * @returns The loaded quiz state object, or null if not found or on error.
 */
export const loadState = (): QuizState | null => {
  if (typeof window !== 'undefined') {
    try {
      const data = window.localStorage.getItem(STATE_KEY);
      if (data === null) {
        return null;
      }
      // Here you might add validation with a schema library like Zod
      // to ensure the loaded data matches the QuizState interface.
      return JSON.parse(data) as QuizState;
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      // If parsing fails, remove the invalid data
      window.localStorage.removeItem(STATE_KEY);
      return null;
    }
  }
  return null;
};

/**
 * Clears the user's quiz state from localStorage.
 */
export const clearState = (): void => {
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.removeItem(STATE_KEY);
        } catch (error) {
            console.error("Failed to clear state from localStorage:", error);
        }
    }
}
