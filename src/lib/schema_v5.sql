-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id SERIAL PRIMARY KEY,
    site_name TEXT DEFAULT 'STB FF GUILD',
    logo_url TEXT,
    banner_url TEXT,
    theme_color TEXT DEFAULT '#f27d26',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO public.site_settings (id, site_name, theme_color)
SELECT 1, 'STB FF GUILD', '#f27d26'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Read site settings" ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admin update site settings" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'sub_admin'))
);
