-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    game_id TEXT,
    role TEXT DEFAULT 'member',
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    squad_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SQUADS TABLE
CREATE TABLE IF NOT EXISTS public.squads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_name TEXT NOT NULL,
    leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    members_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TOURNAMENT SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.tournament_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_name TEXT NOT NULL,
    slot_number INTEGER NOT NULL,
    booked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    payment_status TEXT DEFAULT 'pending',
    is_external_player BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MATCH RESULTS TABLE
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

-- 5. NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    category TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module TEXT,
    action TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FINANCES TABLE
CREATE TABLE IF NOT EXISTS public.finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRIGGER FOR NEW AUTH USERS
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

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

DROP POLICY IF EXISTS "Squads are viewable by everyone" ON public.squads;
DROP POLICY IF EXISTS "Admins and Leaders can insert squads" ON public.squads;
DROP POLICY IF EXISTS "Admins and Leaders can update squads" ON public.squads;

DROP POLICY IF EXISTS "Read all" ON public.tournament_slots;
DROP POLICY IF EXISTS "Insert auth" ON public.tournament_slots;

DROP POLICY IF EXISTS "Read all matches" ON public.match_results;
DROP POLICY IF EXISTS "Admin manage matches" ON public.match_results;

DROP POLICY IF EXISTS "Read all notices" ON public.notices;
DROP POLICY IF EXISTS "Admin manage notices" ON public.notices;

DROP POLICY IF EXISTS "Read all logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Insert logs" ON public.activity_logs;

DROP POLICY IF EXISTS "Read finances" ON public.finances;
DROP POLICY IF EXISTS "Admin manage finances" ON public.finances;

-- Re-create Policies

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can insert any profile" ON public.profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

-- Squads
CREATE POLICY "Squads are viewable by everyone" ON public.squads FOR SELECT USING (true);
CREATE POLICY "Admins and Leaders can insert squads" ON public.squads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin', 'leader'))
);
CREATE POLICY "Admins and Leaders can update squads" ON public.squads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin', 'leader'))
);

-- Tournament Slots
CREATE POLICY "Read all" ON public.tournament_slots FOR SELECT USING (true);
CREATE POLICY "Insert auth" ON public.tournament_slots FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Match Results
CREATE POLICY "Read all matches" ON public.match_results FOR SELECT USING (true);
CREATE POLICY "Admin manage matches" ON public.match_results FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

-- Notices
CREATE POLICY "Read all notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Admin manage notices" ON public.notices FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);

-- Activity Logs
CREATE POLICY "Read all logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Insert logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Finances
CREATE POLICY "Read finances" ON public.finances FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);
CREATE POLICY "Admin manage finances" ON public.finances FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);
