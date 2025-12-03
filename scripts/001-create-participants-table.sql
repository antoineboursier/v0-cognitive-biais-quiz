-- Table pour stocker les participants au quiz Cognitive Labs
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  job TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index sur l'email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);

-- Activer Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre les insertions publiques (pas d'auth requise pour s'inscrire)
CREATE POLICY "Allow public insert" ON participants
  FOR INSERT
  WITH CHECK (true);

-- Politique pour permettre la lecture publique (pour vérifier si un email existe déjà)
CREATE POLICY "Allow public select" ON participants
  FOR SELECT
  USING (true);

-- Politique pour permettre la mise à jour par email
CREATE POLICY "Allow public update" ON participants
  FOR UPDATE
  USING (true);
