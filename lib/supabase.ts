import { createClient } from "@supabase/supabase-js";
import { hashPassword, verifyPassword } from "@/lib/crypto";

// Ambil credentials dari Environment Variables (Mendukung nama baru & nama standar)
const supabaseUrl = (
  process.env.NEXT_PUBLIC_SB_URL ||
  process.env.SB_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_MATHORA_DB_URL ||
  ""
).trim();

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SB_KEY ||
  process.env.SB_KEY ||
  process.env.NEXT_PUBLIC_SB_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_MATHORA_DB_KEY ||
  ""
).trim();

/**
 * Validasi apakah Supabase sudah dikonfigurasi dengan URL & Anon Key yang valid
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project") &&
    supabaseAnonKey !== "your-anon-key-here"
);

/**
 * Instance Supabase Client (null jika env belum diisi, sehingga tidak membuat crash pada build/lokal)
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

// ─── TIPE DATA TABEL SUPABASE ────────────────────────────────────────────────

export interface DbUser {
  id?: string;
  username: string;
  email: string;
  password: string;
  role: "siswa" | "guru";
  avatar: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbSectionProgress {
  id?: string;
  username: string;
  section_num: number;
  unlocked: boolean;
  pretest: boolean;
  pretest_score?: number;
  pretest_correct?: number;
  pretest_total?: number;
  materi: boolean;
  posttest: boolean;
  posttest_score?: number;
  posttest_correct?: number;
  posttest_total?: number;
  updated_at?: string;
}

export interface DbGameScore {
  id?: string;
  player1: string;
  player2: string;
  materi: string;
  mode: string;
  difficulty?: string;
  score_p1: number;
  score_p2: number;
  winner?: string;
  created_at?: string;
}

// ─── HELPER CRUD SUPABASE ────────────────────────────────────────────────────

/**
 * Registrasi user baru ke tabel 'users' Supabase
 */
export async function sbRegisterUser(
  user: DbUser
): Promise<{ success: boolean; message: string }> {
  if (!supabase) return { success: false, message: "Supabase belum terhubung." };

  try {
    const trimmedUser = user.username.trim();
    const trimmedEmail = user.email.trim().toLowerCase();

    // 1. Cek duplikasi username
    const { data: existingUser, error: checkUserErr } = await supabase
      .from("users")
      .select("username")
      .ilike("username", trimmedUser)
      .maybeSingle();

    if (checkUserErr) {
      console.warn("sbRegisterUser checkUserErr:", checkUserErr.message);
    }
    if (existingUser) {
      return {
        success: false,
        message: `Username "${user.username}" sudah digunakan! Gunakan username lain.`,
      };
    }

    // 2. Cek duplikasi email jika ada
    if (trimmedEmail) {
      const { data: existingEmail, error: checkEmailErr } = await supabase
        .from("users")
        .select("email")
        .ilike("email", trimmedEmail)
        .maybeSingle();

      if (checkEmailErr) {
        console.warn("sbRegisterUser checkEmailErr:", checkEmailErr.message);
      }
      if (existingEmail) {
        return {
          success: false,
          message: `Email "${user.email}" sudah terdaftar! Silakan login atau gunakan lupa password.`,
        };
      }
    }

    // 3. Masukkan user baru (Password otomatis di-hash dengan SHA-256 + Salt)
    const hashedPassword = await hashPassword(user.password);
    const { error: insertErr } = await supabase.from("users").insert({
      username: trimmedUser,
      email: trimmedEmail,
      password: hashedPassword,
      role: user.role,
      avatar: user.avatar || "/images/avatar-1.svg",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertErr) {
      return {
        success: false,
        message: `Gagal mendaftar di database: ${insertErr.message}`,
      };
    }

    // Buat initial progress untuk Section 1 agar otomatis terbuka
    await supabase.from("section_progress").upsert(
      {
        username: trimmedUser,
        section_num: 1,
        unlocked: true,
        pretest: false,
        materi: false,
        posttest: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "username,section_num" }
    );

    return { success: true, message: "Pendaftaran akun berhasil!" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan jaringan.";
    return { success: false, message: `Error Supabase: ${msg}` };
  }
}

/**
 * Validasi login user dari tabel 'users' Supabase (Mendukung Hash & Plaintext Lama)
 */
export async function sbLoginUser(
  identifier: string,
  password: string,
  role: "siswa" | "guru"
): Promise<{ success: boolean; message: string; user?: DbUser }> {
  if (!supabase) return { success: false, message: "Supabase belum terhubung." };

  try {
    const trimmedId = identifier.trim().toLowerCase();

    // Cari berdasarkan username ATAU email
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`username.ilike.${trimmedId},email.ilike.${trimmedId}`)
      .eq("role", role)
      .maybeSingle();

    if (error) {
      return { success: false, message: `Database error: ${error.message}` };
    }

    if (!data) {
      return {
        success: false,
        message: "Akun belum terdaftar! Silakan lakukan pendaftaran terlebih dahulu.",
      };
    }

    // Verifikasi password (cocokkan hash atau plaintext lama)
    const isPasswordValid = await verifyPassword(password, data.password);
    if (!isPasswordValid) {
      return { success: false, message: "Password salah! Silakan periksa kembali." };
    }

    // Otomatis upgrade ke hash jika di Supabase masih berupa plaintext lama
    if (data.password === password) {
      try {
        const upgradedHash = await hashPassword(password);
        await supabase.from("users").update({ password: upgradedHash }).eq("id", data.id);
      } catch {
        // Abaikan jika update upgrade gagal, user tetap bisa login
      }
    }

    return {
      success: true,
      message: "Login berhasil!",
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        avatar: data.avatar,
        created_at: data.created_at,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menghubungi database.";
    return { success: false, message: `Koneksi gagal: ${msg}` };
  }
}

/**
 * Reset password via validasi email (Password baru otomatis di-hash)
 */
export async function sbResetPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  if (!supabase) return { success: false, message: "Supabase belum terhubung." };

  try {
    const trimmedEmail = email.trim().toLowerCase();
    const { data: user, error: findErr } = await supabase
      .from("users")
      .select("id, email")
      .ilike("email", trimmedEmail)
      .maybeSingle();

    if (findErr || !user) {
      return { success: false, message: `Email "${email}" tidak ditemukan!` };
    }

    const hashedPassword = await hashPassword(newPassword);
    const { error: updateErr } = await supabase
      .from("users")
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateErr) {
      return { success: false, message: `Gagal memperbarui: ${updateErr.message}` };
    }

    return { success: true, message: "Password berhasil diperbarui! Silakan login." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal mereset password.";
    return { success: false, message: `Error: ${msg}` };
  }
}

/**
 * Update profil user (username & avatar)
 */
export async function sbUpdateProfile(
  oldUsername: string,
  newUsername: string,
  newAvatar?: string
): Promise<{ success: boolean; message: string; user?: DbUser }> {
  if (!supabase) return { success: false, message: "Supabase belum terhubung." };

  try {
    const trimmedOld = oldUsername.trim();
    const trimmedNew = newUsername.trim();

    // Jika ganti username, pastikan belum dipakai orang lain
    if (trimmedNew.toLowerCase() !== trimmedOld.toLowerCase()) {
      const { data: exist } = await supabase
        .from("users")
        .select("id")
        .ilike("username", trimmedNew)
        .maybeSingle();

      if (exist) {
        return {
          success: false,
          message: `Username "${trimmedNew}" sudah dipakai akun lain!`,
        };
      }
    }

    const updates: Partial<DbUser> = {
      username: trimmedNew,
      updated_at: new Date().toISOString(),
    };
    if (newAvatar) updates.avatar = newAvatar;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .ilike("username", trimmedOld)
      .select()
      .maybeSingle();

    if (error || !data) {
      return { success: false, message: `Gagal update profil: ${error?.message}` };
    }

    // Jika username berubah, perbarui juga di tabel section_progress
    if (trimmedNew.toLowerCase() !== trimmedOld.toLowerCase()) {
      await supabase
        .from("section_progress")
        .update({ username: trimmedNew })
        .eq("username", trimmedOld);
    }

    return {
      success: true,
      message: "Profil berhasil diperbarui!",
      user: data as DbUser,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal mengupdate profil.";
    return { success: false, message: `Error: ${msg}` };
  }
}

/**
 * Upsert progres section siswa ke tabel 'section_progress'
 */
export async function sbSaveSectionProgress(
  username: string,
  sectionNum: number,
  data: Partial<DbSectionProgress>
): Promise<boolean> {
  if (!supabase || !username) return false;

  try {
    const payload = {
      username: username.trim(),
      section_num: sectionNum,
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("section_progress")
      .upsert(payload, { onConflict: "username,section_num" });

    if (error) {
      console.warn("sbSaveSectionProgress error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("sbSaveSectionProgress exception:", err);
    return false;
  }
}

/**
 * Ambil seluruh progres section untuk 1 siswa dari Supabase
 */
export async function sbGetStudentProgress(
  username: string
): Promise<DbSectionProgress[]> {
  if (!supabase || !username) return [];

  try {
    const { data, error } = await supabase
      .from("section_progress")
      .select("*")
      .ilike("username", username.trim())
      .order("section_num", { ascending: true });

    if (error) {
      console.warn("sbGetStudentProgress error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("sbGetStudentProgress exception:", err);
    return [];
  }
}

/**
 * Ambil rekap data semua siswa (untuk Dashboard Guru & evaluasi PKM)
 */
export interface StudentSummary {
  username: string;
  email?: string;
  avatar?: string;
  created_at?: string;
  sections: Record<number, DbSectionProgress>;
  totalCompletedSections: number;
}

export async function sbGetAllStudentsForTeacher(): Promise<StudentSummary[]> {
  if (!supabase) return [];

  try {
    // 1. Ambil semua akun role 'siswa'
    const { data: students, error: studentsErr } = await supabase
      .from("users")
      .select("username, email, avatar, created_at")
      .eq("role", "siswa")
      .order("username", { ascending: true });

    if (studentsErr || !students) {
      console.warn("sbGetAllStudentsForTeacher users err:", studentsErr?.message);
      return [];
    }

    // 2. Ambil semua baris progress
    const { data: allProgress, error: progErr } = await supabase
      .from("section_progress")
      .select("*");

    if (progErr) {
      console.warn("sbGetAllStudentsForTeacher prog err:", progErr.message);
    }

    const progressMap: Record<string, Record<number, DbSectionProgress>> = {};
    (allProgress || []).forEach((row) => {
      const u = row.username.toLowerCase();
      if (!progressMap[u]) progressMap[u] = {};
      progressMap[u][row.section_num] = row;
    });

    return students.map((s) => {
      const u = s.username.toLowerCase();
      const secMap = progressMap[u] || {};
      const completed = Object.values(secMap).filter((p) => p.posttest).length;
      return {
        username: s.username,
        email: s.email,
        avatar: s.avatar,
        created_at: s.created_at,
        sections: secMap,
        totalCompletedSections: completed,
      };
    });
  } catch (err) {
    console.warn("sbGetAllStudentsForTeacher exception:", err);
    return [];
  }
}

/**
 * Catat hasil Game Kompetitif Tarik Tambang ke Supabase
 */
export async function sbSaveGameScore(score: DbGameScore): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("game_scores").insert({
      player1: score.player1,
      player2: score.player2,
      materi: score.materi,
      mode: score.mode,
      difficulty: score.difficulty || "medium",
      score_p1: score.score_p1,
      score_p2: score.score_p2,
      winner: score.winner || "Seri / Imbang",
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("sbSaveGameScore error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("sbSaveGameScore exception:", err);
    return false;
  }
}
