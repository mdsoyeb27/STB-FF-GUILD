-- ==========================================
-- STB FF GUILD - FINAL COMPLETE SCHEMA
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLES SETUP
-- ==========================================

-- 2.1. PROFILES (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    game_id TEXT,
    role TEXT DEFAULT 'member', -- 'super_admin', 'sub_admin', 'leader', 'member'
    avatar_url TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'banned'
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    squad_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2. SQUADS
CREATE TABLE IF NOT EXISTS public.squads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_name TEXT NOT NULL,
    leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    members_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Foreign Key to profiles for squad_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_squad') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_squad 
        FOREIGN KEY (squad_id) 
        REFERENCES public.squads(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 2.3. GUILD CONFIGURATION
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

-- 2.4. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id SERIAL PRIMARY KEY,
    site_name TEXT DEFAULT 'STB FF GUILD',
    logo_url TEXT,
    banner_url TEXT,
    theme_color TEXT DEFAULT '#f27d26',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ,
    image_url TEXT,
    status TEXT DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6. GUILD RULES
CREATE TABLE IF NOT EXISTS public.guild_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_text TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7. NOTICES
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    category TEXT DEFAULT 'General',
    type TEXT DEFAULT 'general',
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8. MESSAGES (Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    squad_id UUID REFERENCES public.squads(id) ON DELETE SET NULL,
    channel TEXT DEFAULT 'global',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure channel column exists (Migration for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'channel') THEN
        ALTER TABLE public.messages ADD COLUMN channel TEXT DEFAULT 'global';
    END IF;
END $$;

-- 2.9. TOURNAMENT SLOTS
CREATE TABLE IF NOT EXISTS public.tournament_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_name TEXT NOT NULL,
    slot_number INTEGER NOT NULL,
    booked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    payment_status TEXT DEFAULT 'pending',
    is_external_player BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10. MATCH RESULTS
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_name TEXT NOT NULL,
    match_type TEXT,
    team_a TEXT NOT NULL,
    team_b TEXT NOT NULL,
    score_a INTEGER DEFAULT 0,
    score_b INTEGER DEFAULT 0,
    winner TEXT,
    match_date TIMESTAMPTZ DEFAULT NOW(),
    mvp TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11. FINANCES
CREATE TABLE IF NOT EXISTS public.finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.12. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module TEXT,
    action TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. INITIAL DATA SEEDING
-- ==========================================

INSERT INTO public.guild_config (level, exp, next_level_exp, balance)
SELECT 1, 0, 1000, 0
WHERE NOT EXISTS (SELECT 1 FROM public.guild_config);

INSERT INTO public.site_settings (id, site_name, theme_color)
SELECT 1, 'STB FF GUILD', '#f27d26'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- ==========================================
-- 4. AUTOMATION (TRIGGERS)
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. SECURITY (RLS POLICIES)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Squads viewable by everyone" ON public.squads;
    DROP POLICY IF EXISTS "Admins/Leaders manage squads" ON public.squads;
    DROP POLICY IF EXISTS "Read config" ON public.guild_config;
    DROP POLICY IF EXISTS "Admin update config" ON public.guild_config;
    DROP POLICY IF EXISTS "Read settings" ON public.site_settings;
    DROP POLICY IF EXISTS "Admin update settings" ON public.site_settings;
    DROP POLICY IF EXISTS "Read events" ON public.events;
    DROP POLICY IF EXISTS "Admin manage events" ON public.events;
    DROP POLICY IF EXISTS "Read rules" ON public.guild_rules;
    DROP POLICY IF EXISTS "Admin manage rules" ON public.guild_rules;
    DROP POLICY IF EXISTS "Read notices" ON public.notices;
    DROP POLICY IF EXISTS "Admin manage notices" ON public.notices;
    DROP POLICY IF EXISTS "Read global/rules" ON public.messages;
    DROP POLICY IF EXISTS "Read squad" ON public.messages;
    DROP POLICY IF EXISTS "Insert global" ON public.messages;
    DROP POLICY IF EXISTS "Insert squad" ON public.messages;
    DROP POLICY IF EXISTS "Insert rules" ON public.messages;
    DROP POLICY IF EXISTS "Read all slots" ON public.tournament_slots;
    DROP POLICY IF EXISTS "Book slots" ON public.tournament_slots;
    DROP POLICY IF EXISTS "Read matches" ON public.match_results;
    DROP POLICY IF EXISTS "Admin manage matches" ON public.match_results;
    DROP POLICY IF EXISTS "Read finances" ON public.finances;
    DROP POLICY IF EXISTS "Admin manage finances" ON public.finances;
    DROP POLICY IF EXISTS "Read logs" ON public.activity_logs;
    DROP POLICY IF EXISTS "Insert logs" ON public.activity_logs;
END $$;

-- Create Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin')) OR auth.uid() = id
);

CREATE POLICY "Squads viewable by everyone" ON public.squads FOR SELECT USING (true);
CREATE POLICY "Admins/Leaders manage squads" ON public.squads FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin', 'leader'))
);

CREATE POLICY "Read config" ON public.guild_config FOR SELECT USING (true);
CREATE POLICY "Admin update config" ON public.guild_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

CREATE POLICY "Read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin update settings" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

CREATE POLICY "Read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admin manage events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

CREATE POLICY "Read rules" ON public.guild_rules FOR SELECT USING (true);
CREATE POLICY "Admin manage rules" ON public.guild_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

CREATE POLICY "Read notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Admin manage notices" ON public.notices FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

CREATE POLICY "Read global/rules" ON public.messages FOR SELECT USING (channel IN ('global', 'rules'));
CREATE POLICY "Read squad" ON public.messages FOR SELECT USING (
    channel = 'squad' AND 
    squad_id IN (SELECT squad_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Insert global" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND channel = 'global'
);
CREATE POLICY "Insert squad" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND channel = 'squad' AND 
    squad_id IN (SELECT squad_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Insert rules" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND channel = 'rules' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

CREATE POLICY "Read all slots" ON public.tournament_slots FOR SELECT USING (true);
CREATE POLICY "Book slots" ON public.tournament_slots FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Read matches" ON public.match_results FOR SELECT USING (true);
CREATE POLICY "Admin manage matches" ON public.match_results FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

CREATE POLICY "Read finances" ON public.finances FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);
CREATE POLICY "Admin manage finances" ON public.finances FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

CREATE POLICY "Read logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Insert logs" ON public.activity_logs FOR INSERT WITH CHECK (true);
