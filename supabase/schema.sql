-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outfits table
CREATE TABLE public.outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  publisher_height INTEGER NOT NULL,
  publisher_size TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clothing pieces table
CREATE TABLE public.clothing_pieces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  brand TEXT NOT NULL,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table
CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Likes table
CREATE TABLE public.likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, outfit_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Outfits policies
CREATE POLICY "Outfits are viewable by everyone" ON public.outfits
  FOR SELECT USING (true);

CREATE POLICY "Users can create own outfits" ON public.outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits" ON public.outfits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits" ON public.outfits
  FOR DELETE USING (auth.uid() = user_id);

-- Clothing pieces policies
CREATE POLICY "Clothing pieces are viewable by everyone" ON public.clothing_pieces
  FOR SELECT USING (true);

CREATE POLICY "Users can create clothing pieces for own outfits" ON public.clothing_pieces
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.outfits
      WHERE outfits.id = outfit_id AND outfits.user_id = auth.uid()
    )
  );

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like outfits" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike outfits" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_outfits_user_id ON public.outfits(user_id);
CREATE INDEX idx_outfits_created_at ON public.outfits(created_at DESC);
CREATE INDEX idx_clothing_pieces_outfit_id ON public.clothing_pieces(outfit_id);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_likes_outfit_id ON public.likes(outfit_id);
