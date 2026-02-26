-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    squad_id UUID REFERENCES public.squads(id) ON DELETE SET NULL,
    channel TEXT DEFAULT 'global', -- 'global', 'squad', 'rules', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
-- Read:
-- 1. Global and Rules messages are viewable by everyone (or authenticated users)
CREATE POLICY "Read global and rules messages" ON public.messages
FOR SELECT USING (channel IN ('global', 'rules'));

-- 2. Squad messages are viewable by squad members
CREATE POLICY "Read squad messages" ON public.messages
FOR SELECT USING (
    channel = 'squad' AND 
    squad_id IN (SELECT squad_id FROM public.profiles WHERE id = auth.uid())
);

-- Insert:
-- 1. Authenticated users can insert global messages
CREATE POLICY "Insert global messages" ON public.messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND channel = 'global'
);

-- 2. Squad members can insert squad messages
CREATE POLICY "Insert squad messages" ON public.messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND channel = 'squad' AND
    squad_id IN (SELECT squad_id FROM public.profiles WHERE id = auth.uid())
);

-- 3. Admins can insert rules messages
CREATE POLICY "Admins insert rules" ON public.messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND channel = 'rules' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);
