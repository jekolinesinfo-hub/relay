-- Add last_message column to conversations table for better performance
ALTER TABLE public.conversations 
ADD COLUMN last_message TEXT,
ADD COLUMN last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update profiles table to match expected structure
ALTER TABLE public.profiles 
ADD COLUMN user_id TEXT,
ADD COLUMN display_name TEXT;

-- Update existing profiles data if any
UPDATE public.profiles SET user_id = id, display_name = name WHERE user_id IS NULL;