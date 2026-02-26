-- Guild Configuration Table
CREATE TABLE IF NOT EXISTS public.guild_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    next_level_exp INTEGER DEFAULT 1000,
    total_members INTEGER DEFAULT 0,
    total_squads INTEGER DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row if not exists
INSERT INTO public.guild_config (level, exp, next_level_exp)
SELECT 1, 0, 1000
WHERE NOT EXISTS (SELECT 1 FROM public.guild_config);

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ,
    image_url TEXT,
    status TEXT DEFAULT 'upcoming', -- upcoming, active, completed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rules Table
CREATE TABLE IF NOT EXISTS public.guild_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_text TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.guild_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_rules ENABLE ROW LEVEL SECURITY;

-- Config Policies
CREATE POLICY "Read config" ON public.guild_config FOR SELECT USING (true);
CREATE POLICY "Admin update config" ON public.guild_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

-- Events Policies
CREATE POLICY "Read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admin manage events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

-- Rules Policies
CREATE POLICY "Read rules" ON public.guild_rules FOR SELECT USING (true);
CREATE POLICY "Admin manage rules" ON public.guild_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);
