-- Table pour les republications (reposts/shares)
CREATE TABLE IF NOT EXISTS reposts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, outfit_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_reposts_outfit_id ON reposts(outfit_id);
CREATE INDEX IF NOT EXISTS idx_reposts_created_at ON reposts(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut voir les reposts
CREATE POLICY "Reposts are viewable by everyone"
  ON reposts FOR SELECT
  USING (true);

-- Politique : Les utilisateurs authentifiés peuvent créer des reposts
CREATE POLICY "Users can create reposts"
  ON reposts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres reposts
CREATE POLICY "Users can delete their own reposts"
  ON reposts FOR DELETE
  USING (auth.uid() = user_id);
