// Database types for Supabase tables

export interface UserScore {
    id?: string;
    email: string;
    first_name: string;
    last_name: string;
    job: string;
    total_score: number;
    total_questions: number;
    level_1_score: number;
    level_2_score: number;
    level_3_score: number;
    answered_questions: string[]; // Array of question IDs answered correctly
    unlocked_biases: string[];
    all_levels_completed: boolean;
    created_at?: string;
    updated_at?: string;
}
