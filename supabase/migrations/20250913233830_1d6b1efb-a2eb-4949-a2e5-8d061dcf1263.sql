-- Temporarily disable RLS policies until proper authentication is implemented
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;

-- Disable RLS temporarily for development
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;