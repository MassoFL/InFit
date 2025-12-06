-- Add body measurements to profiles table
ALTER TABLE public.profiles
ADD COLUMN height INTEGER, -- in cm
ADD COLUMN weight INTEGER; -- in kg
