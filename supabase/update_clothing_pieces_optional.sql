-- Make product_name, category, and purchase_link optional in clothing_pieces table
-- Only brand and size remain required

ALTER TABLE public.clothing_pieces
ALTER COLUMN product_name DROP NOT NULL,
ALTER COLUMN purchase_link DROP NOT NULL;
