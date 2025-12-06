-- Add purchase_link column to clothing_pieces table
ALTER TABLE public.clothing_pieces 
ADD COLUMN IF NOT EXISTS purchase_link TEXT;

-- Make product_name into description (more flexible)
ALTER TABLE public.clothing_pieces 
ADD COLUMN IF NOT EXISTS description TEXT;
