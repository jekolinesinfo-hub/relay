-- Enable RLS on conversations (already likely enabled)
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;

-- Allow users to delete conversations (aligning with existing permissive policies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'conversations' 
      AND policyname = 'Users can delete conversations'
  ) THEN
    CREATE POLICY "Users can delete conversations"
    ON public.conversations
    FOR DELETE
    USING (true);
  END IF;
END $$;