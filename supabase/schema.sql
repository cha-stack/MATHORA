-- ==============================================================================
-- MATHORA - SKEMA DATABASE SUPABASE (POSTGRESQL)
-- Program Pengabdian kepada Masyarakat (PKM) • SMP Islam Parung
-- ==============================================================================
-- CARA PENGGUNAAN:
-- 1. Buka dashboard proyek Supabase Anda di https://supabase.com/dashboard
-- 2. Masuk ke menu "SQL Editor" (ikon terminal di menu sebelah kiri).
-- 3. Klik "New Query", tempel (paste) seluruh isi script ini, lalu klik "RUN".
-- ==============================================================================

-- 1. TABEL PENGGUNA (USERS)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'siswa', -- 'siswa' atau 'guru'
  avatar TEXT DEFAULT '/images/avatar-1.svg',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT users_username_unique UNIQUE (username)
);

-- Indeks pencarian cepat username & email
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);


-- 2. TABEL PROGRES BELAJAR SPLDV BERTINGKAT (SECTION_PROGRESS)
CREATE TABLE IF NOT EXISTS public.section_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  section_num INT NOT NULL,            -- 1 s/d 5
  unlocked BOOLEAN DEFAULT false,      -- Tahap terbuka / terkunci
  pretest BOOLEAN DEFAULT false,       -- Sudah menyelesaikan Pre-test
  pretest_score INT DEFAULT 0,         -- Nilai Pre-test (0 - 100)
  pretest_correct INT DEFAULT 0,       -- Jumlah benar Pre-test
  pretest_total INT DEFAULT 0,         -- Total soal Pre-test
  materi BOOLEAN DEFAULT false,        -- Sudah membaca & mencoba materi
  posttest BOOLEAN DEFAULT false,      -- Sudah menyelesaikan Post-test
  posttest_score INT DEFAULT 0,        -- Nilai Post-test (0 - 100)
  posttest_correct INT DEFAULT 0,      -- Jumlah benar Post-test
  posttest_total INT DEFAULT 0,        -- Total soal Post-test
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_section UNIQUE (username, section_num)
);

CREATE INDEX IF NOT EXISTS idx_section_progress_user ON public.section_progress (username);


-- 3. TABEL SKOR GAME KOMPETITIF (GAME_SCORES)
CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1 TEXT NOT NULL,
  player2 TEXT NOT NULL,
  materi TEXT NOT NULL,
  mode TEXT NOT NULL,                  -- '1vs1' atau 'vsAI'
  difficulty TEXT DEFAULT 'medium',    -- 'easy', 'medium', 'hard'
  score_p1 INT DEFAULT 0,
  score_p2 INT DEFAULT 0,
  winner TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_scores_created ON public.game_scores (created_at DESC);


-- ==============================================================================
-- 4. PENGATURAN HAK AKSES (GRANT) & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Berikan izin akses skema public ke role anon dan authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Berikan izin penuh operasi CRUD pada tabel-tabel Mathora
GRANT ALL ON TABLE public.users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.section_progress TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.game_scores TO anon, authenticated, service_role;

-- Berikan izin sequence jika ada
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Aktifkan RLS dengan Policy All-Access untuk Anon & Authenticated
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk Anon Key (Frontend Web PKM)
DROP POLICY IF EXISTS "Anon All Access users" ON public.users;
CREATE POLICY "Anon All Access users" ON public.users
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon All Access section_progress" ON public.section_progress;
CREATE POLICY "Anon All Access section_progress" ON public.section_progress
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon All Access game_scores" ON public.game_scores;
CREATE POLICY "Anon All Access game_scores" ON public.game_scores
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- 5. AKUN DEMO BAWAAN (SEED DATA)
-- ==============================================================================
-- Akun Guru default untuk testing
INSERT INTO public.users (username, email, password, role, avatar)
VALUES 
  ('adminguru', 'guru@mathora.sch.id', 'guru123', 'guru', '/images/avatar-guru.svg'),
  ('siswa1', 'siswa1@mathora.sch.id', 'siswa123', 'siswa', '/images/avatar-1.svg')
ON CONFLICT (username) DO NOTHING;

-- Initial progress untuk siswa1 (Section 1 terbuka)
INSERT INTO public.section_progress (username, section_num, unlocked, pretest, materi, posttest)
VALUES 
  ('siswa1', 1, true, false, false, false),
  ('siswa1', 2, false, false, false, false),
  ('siswa1', 3, false, false, false, false),
  ('siswa1', 4, false, false, false, false),
  ('siswa1', 5, false, false, false, false)
ON CONFLICT (username, section_num) DO NOTHING;
