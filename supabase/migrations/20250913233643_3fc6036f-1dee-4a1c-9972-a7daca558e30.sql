-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;

-- Create new policies with proper user_id filtering
CREATE POLICY "Users can view their own contacts" 
ON public.contacts 
FOR SELECT 
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own contacts" 
ON public.contacts 
FOR DELETE 
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own contacts" 
ON public.contacts 
FOR UPDATE 
USING (user_id = auth.uid()::text);