-- Schema Database Mathora (PostgreSQL)

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT,
  password VARCHAR(255) NOT NULL,
  role TEXT NOT NULL DEFAULT 'siswa',
  avatar TEXT DEFAULT '/images/avatar-1.svg',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT users_username_unique UNIQUE (username)
);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

CREATE TABLE IF NOT EXISTS public.section_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  section_num INT NOT NULL,
  unlocked BOOLEAN DEFAULT false,
  pretest BOOLEAN DEFAULT false,
  pretest_score INT DEFAULT 0,
  pretest_correct INT DEFAULT 0,
  pretest_total INT DEFAULT 0,
  materi BOOLEAN DEFAULT false,
  posttest BOOLEAN DEFAULT false,
  posttest_score INT DEFAULT 0,
  posttest_correct INT DEFAULT 0,
  posttest_total INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_section UNIQUE (username, section_num)
);

CREATE INDEX IF NOT EXISTS idx_section_progress_user ON public.section_progress (username);

CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1 TEXT NOT NULL,
  player2 TEXT NOT NULL,
  materi TEXT NOT NULL,
  mode TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  score_p1 INT DEFAULT 0,
  score_p2 INT DEFAULT 0,
  winner TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_scores_created ON public.game_scores (created_at DESC);

-- Grants & RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.section_progress TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.game_scores TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon All Access users" ON public.users;
CREATE POLICY "Anon All Access users" ON public.users
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon All Access section_progress" ON public.section_progress;
CREATE POLICY "Anon All Access section_progress" ON public.section_progress
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon All Access game_scores" ON public.game_scores;
CREATE POLICY "Anon All Access game_scores" ON public.game_scores
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- Seed data
INSERT INTO public.users (username, email, password, role, avatar)
VALUES 
  ('adminguru', 'guru@mathora.sch.id', 'guru123', 'guru', '/images/avatar-guru.svg'),
  ('siswa1', 'siswa1@mathora.sch.id', 'siswa123', 'siswa', '/images/avatar-1.svg')
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.section_progress (username, section_num, unlocked, pretest, materi, posttest)
VALUES 
  ('siswa1', 1, true, false, false, false),
  ('siswa1', 2, false, false, false, false),
  ('siswa1', 3, false, false, false, false),
  ('siswa1', 4, false, false, false, false),
  ('siswa1', 5, false, false, false, false)
ON CONFLICT (username, section_num) DO NOTHING;
