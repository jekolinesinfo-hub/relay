-- Ensure realtime emits full row data and include tables in publication
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication (safe to run if already present)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Performance indexes for participant lookups
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations (participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_participants_rev ON public.conversations (participant_2, participant_1);
