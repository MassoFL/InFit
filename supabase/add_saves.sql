-- Create saves/bookmarks table
CREATE TABLE public.saves (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, outfit_id)
);

-- Enable Row Level Security
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- Saves policies
CREATE POLICY "Saves are viewable by everyone" ON public.saves
  FOR SELECT USING (true);

CREATE POLICY "Users can save outfits" ON public.saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave outfits" ON public.saves
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_saves_user_id ON public.saves(user_id);
CREATE INDEX idx_saves_outfit_id ON public.saves(outfit_id);
