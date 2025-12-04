import { createClient } from './client';
import type { UserScore } from './database.types';
import type { QuizState } from '../storage';

/**
 * Save or update user score in Supabase
 */
export async function saveUserScore(quizState: QuizState): Promise<{ success: boolean; error?: string }> {
    if (!quizState.userProfile) {
        return { success: false, error: 'No user profile found' };
    }

    try {
        const supabase = createClient();

        // Get correctly answered questions
        const correctlyAnsweredQuestions = quizState.answeredQuestions
            .filter(q => q.isCorrect)
            .map(q => q.questionId);

        const userScore: UserScore = {
            email: quizState.userProfile.email,
            first_name: quizState.userProfile.firstName,
            last_name: quizState.userProfile.lastName,
            job: quizState.userProfile.job,
            total_score: quizState.totalScore,
            total_questions: quizState.totalQuestions,
            level_1_score: quizState.levelProgress[1]?.score || 0,
            level_2_score: quizState.levelProgress[2]?.score || 0,
            level_3_score: quizState.levelProgress[3]?.score || 0,
            answered_questions: correctlyAnsweredQuestions,
            unlocked_biases: quizState.unlockedBiases,
            all_levels_completed: quizState.allLevelsCompleted,
        };

        // Upsert the score (insert or update if email exists)
        const { error } = await supabase
            .from('user_scores')
            .upsert(userScore, {
                onConflict: 'email',
                ignoreDuplicates: false,
            });

        if (error) {
            console.error('Supabase save error:', error);
            console.warn('⚠️ Assurez-vous que la table "user_scores" existe dans Supabase.');
            console.warn('📝 Exécutez le fichier supabase_migration.sql dans votre dashboard Supabase.');
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error saving user score:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Load user score from Supabase
 */
export async function loadUserScore(email: string): Promise<{ success: boolean; data?: UserScore; error?: string }> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('user_scores')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            // Not found is not an error, just means new user
            if (error.code === 'PGRST116') {
                return { success: true, data: undefined };
            }
            console.error('Supabase load error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error loading user score:', error);
        return { success: false, error: String(error) };
    }
}
