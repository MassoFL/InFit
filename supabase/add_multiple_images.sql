-- Create outfit_images table for multiple images per outfit
CREATE TABLE IF NOT EXISTS public.outfit_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.outfit_images ENABLE ROW LEVEL SECURITY;

-- Policies for outfit_images
CREATE POLICY "Outfit images are viewable by everyone" ON public.outfit_images
  FOR SELECT USING (true);

CREATE POLICY "Users can add images to own outfits" ON public.outfit_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.outfits
      WHERE outfits.id = outfit_id AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images from own outfits" ON public.outfit_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.outfits
      WHERE outfits.id = outfit_id AND outfits.user_id = auth.uid()
    )
  );

-- Index for performance
CREATE INDEX idx_outfit_images_outfit_id ON public.outfit_images(outfit_id);
CREATE INDEX idx_outfit_images_order ON public.outfit_images(outfit_id, display_order);
