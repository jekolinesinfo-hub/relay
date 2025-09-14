-- Enable Row Level Security on all public tables

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts table
CREATE POLICY "Users can view their own contacts" ON public.contacts
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own contacts" ON public.contacts
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own contacts" ON public.contacts
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own contacts" ON public.contacts
FOR DELETE USING (auth.uid()::text = user_id);

-- Add policies for conversations table (allow updates for last_message)
CREATE POLICY "Users can update conversations they participate in" ON public.conversations
FOR UPDATE USING (
  auth.uid()::text = participant_1 OR auth.uid()::text = participant_2
);

-- Add policies for messages table (allow deletes)
CREATE POLICY "Users can delete their own messages" ON public.messages
FOR DELETE USING (auth.uid()::text = sender_id);