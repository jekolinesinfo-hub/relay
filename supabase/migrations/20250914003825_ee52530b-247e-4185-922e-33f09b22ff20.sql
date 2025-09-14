-- Update existing profiles to have user-specific names instead of generic "Relay User"
UPDATE public.profiles 
SET 
  name = CASE 
    WHEN name = 'Relay User' THEN 'User' || RIGHT(id, 4)
    ELSE name 
  END,
  display_name = CASE 
    WHEN display_name = 'Relay User' THEN 'User' || RIGHT(id, 4)
    ELSE display_name 
  END
WHERE name = 'Relay User' OR display_name = 'Relay User';