-- Create the user_scores table to store quiz progress
-- This table will track user performance across all levels

CREATE TABLE IF NOT EXISTS user_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  job TEXT NOT NULL,
  total_score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 60, -- 3 levels x 20 questions
  level_1_score INTEGER DEFAULT 0,
  level_2_score INTEGER DEFAULT 0,
  level_3_score INTEGER DEFAULT 0,
  answered_questions TEXT[] DEFAULT '{}', -- Array of question IDs answered correctly
  unlocked_biases TEXT[] DEFAULT '{}', -- Array of unlocked bias IDs
  all_levels_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_user_scores_email ON user_scores(email);

-- Create index for leaderboard queries (if needed later)
CREATE INDEX IF NOT EXISTS idx_user_scores_total_score ON user_scores(total_score DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_scores_updated_at ON user_scores;
CREATE TRIGGER update_user_scores_updated_at
    BEFORE UPDATE ON user_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anonymous users (adjust as needed)
-- Since this is a quiz app without authentication, we allow all operations
CREATE POLICY "Allow all operations on user_scores" ON user_scores
  FOR ALL 
  USING (true)
  WITH CHECK (true);
