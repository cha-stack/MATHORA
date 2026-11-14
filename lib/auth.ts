import {
  isSupabaseConfigured,
  sbRegisterUser,
  sbLoginUser,
  sbResetPassword,
  sbUpdateProfile,
  sbSaveSectionProgress,
  sbGetStudentProgress,
  DbSectionProgress,
} from "@/lib/supabase";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/rateLimit";
import { hashPassword, verifyPassword } from "@/lib/crypto";

export interface UserAccount {
  username: string;
  email: string;
  password: string;
  role: "siswa" | "guru";
  avatar?: string;
  createdAt: string;
}

const STORAGE_KEY = "mathora_users";
const CURRENT_USER_KEY = "mathora_current_user";
const PROGRESS_KEY = "mathora_progress";

// Ambil semua user yang tersimpan di cache lokal
export function getUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Sinkronkan data progres dari Supabase ke cache lokal (localStorage)
 */
export async function syncProgressFromSupabase(username: string): Promise<void> {
  if (!isSupabaseConfigured || typeof window === "undefined" || !username) return;

  try {
    const rows = await sbGetStudentProgress(username);
    if (!rows || rows.length === 0) return;

    const currentProg = getMateriProgress(username);
    const secMap: Record<number, SingleSectionProgress> = { ...(currentProg.sections || {}) };

    rows.forEach((row: DbSectionProgress) => {
      secMap[row.section_num] = {
        unlocked: row.unlocked,
        pretest: row.pretest,
        pretest_score: row.pretest_score,
        pretest_correct: row.pretest_correct,
        pretest_total: row.pretest_total,
        materi: row.materi,
        posttest: row.posttest,
        posttest_score: row.posttest_score,
        posttest_correct: row.posttest_correct,
        posttest_total: row.posttest_total,
      };
    });

    const updated: SectionProgress = {
      ...currentProg,
      sections: secMap,
    };

    if (secMap[1]) {
      updated.section1_pretest = secMap[1].pretest;
      updated.section1_pretest_score = secMap[1].pretest_score;
      updated.section1_pretest_correct = secMap[1].pretest_correct;
      updated.section1_materi = secMap[1].materi;
      updated.section1_posttest = secMap[1].posttest;
      updated.section1_posttest_score = secMap[1].posttest_score;
      updated.section1_posttest_correct = secMap[1].posttest_correct;
    }
    if (secMap[2]) {
      updated.section2_unlocked = secMap[2].unlocked;
      updated.section2_pretest = secMap[2].pretest;
      updated.section2_pretest_score = secMap[2].pretest_score;
      updated.section2_pretest_correct = secMap[2].pretest_correct;
      updated.section2_materi = secMap[2].materi;
      updated.section2_posttest = secMap[2].posttest;
      updated.section2_posttest_score = secMap[2].posttest_score;
      updated.section2_posttest_correct = secMap[2].posttest_correct;
    }

    localStorage.setItem(`${PROGRESS_KEY}_${username}`, JSON.stringify(updated));
  } catch (err) {
    console.warn("syncProgressFromSupabase warning:", err);
  }
}

// Registrasi user baru (didukung Supabase + cache lokal + Proteksi Rate Limiting)
export async function registerUser(
  username: string,
  email: string,
  password: string,
  role: "siswa" | "guru" = "siswa",
  avatar: string = "/images/avatar-1.svg"
): Promise<{ success: boolean; message: string; retryAfter?: number }> {
  const trimmedUser = username.trim();
  const trimmedEmail = email.trim().toLowerCase();

  // Validasi panjang password minimal 6 karakter (bebas angka atau huruf)
  if (!password || password.trim().length < 6) {
    return {
      success: false,
      message: "Password minimal harus 6 karakter (bebas angka atau huruf)!",
    };
  }

  // 1. Proteksi Rate Limiting Registrasi (Maksimal 6 akun per 10 menit per perangkat)
  const registRateCheck = checkRateLimit("regist_device_global", 6, 600_000, 300_000);
  if (!registRateCheck.allowed) {
    return {
      success: false,
      message: `Terlalu banyak pendaftaran akun (Too many requests)! Harap tunggu ${registRateCheck.remainingSeconds} detik sebelum mencoba lagi.`,
      retryAfter: registRateCheck.remainingSeconds,
    };
  }

  // 2. Simpan ke Supabase jika sudah dikonfigurasi
  if (isSupabaseConfigured) {
    const sbRes = await sbRegisterUser({
      username: trimmedUser,
      email: trimmedEmail,
      password,
      role,
      avatar,
    });
    if (!sbRes.success) {
      recordFailedAttempt("regist_device_global", 6, 600_000, 300_000);
      return sbRes;
    }
  }

  // 3. Selalu simpan juga ke cache lokal untuk akses offline instan
  if (typeof window !== "undefined") {
    const users = getUsers();
    const existingIndex = users.findIndex(
      (u) => u.username.toLowerCase() === trimmedUser.toLowerCase()
    );

    const newUser: UserAccount = {
      username: trimmedUser,
      email: trimmedEmail,
      password,
      role,
      avatar,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      users[existingIndex] = newUser;
    } else {
      users.push(newUser);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  return { success: true, message: "Pendaftaran akun berhasil!" };
}

// Validasi login user (didukung Supabase + cache lokal + Proteksi Rate Limiting Anti-Brute Force)
export async function loginUser(
  identifier: string,
  password: string,
  role: "siswa" | "guru" = "siswa"
): Promise<{ success: boolean; message: string; user?: UserAccount; retryAfter?: number }> {
  const trimmedId = identifier.trim().toLowerCase();
  const userRateKey = `login_${role}_${trimmedId}`;
  const deviceRateKey = `login_device_global`;

  // 1. Cek Proteksi Rate Limiting (Maksimal 5 kali percobaan berturut-turut dalam 60 detik)
  const userRateCheck = checkRateLimit(userRateKey, 5, 60_000, 60_000);
  if (!userRateCheck.allowed) {
    return {
      success: false,
      message: `Terlalu banyak percobaan (Too many requests)! Percobaan dibatasi maksimal 5 kali. Silakan tunggu ${userRateCheck.remainingSeconds} detik sebelum mencoba kembali.`,
      retryAfter: userRateCheck.remainingSeconds,
    };
  }

  // Cek batas perangkat global (Mencegah spam coba-coba username acak)
  const deviceRateCheck = checkRateLimit(deviceRateKey, 10, 60_000, 60_000);
  if (!deviceRateCheck.allowed) {
    return {
      success: false,
      message: `Terlalu banyak permintaan login dari perangkat ini (Too many requests). Harap tunggu ${deviceRateCheck.remainingSeconds} detik.`,
      retryAfter: deviceRateCheck.remainingSeconds,
    };
  }

  // 2. Prioritas periksa ke Supabase jika terkonfigurasi
  if (isSupabaseConfigured) {
    const sbRes = await sbLoginUser(identifier, password, role);
    if (sbRes.success && sbRes.user) {
      // Login sukses: Reset antrean & counter rate limit
      resetRateLimit(userRateKey);
      resetRateLimit(deviceRateKey);

      const activeUser: UserAccount = {
        username: sbRes.user.username,
        email: sbRes.user.email,
        password: sbRes.user.password,
        role: sbRes.user.role,
        avatar: sbRes.user.avatar,
        createdAt: sbRes.user.created_at || new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        // Simpan sesi login aktif di browser
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(activeUser));
        // Sinkronkan progres terbaru dari cloud database
        await syncProgressFromSupabase(activeUser.username);
      }
      return { success: true, message: "Login berhasil!", user: activeUser };
    } else {
      // Login gagal: Catat percobaan gagal
      const userFail = recordFailedAttempt(userRateKey, 5, 60_000, 60_000);
      recordFailedAttempt(deviceRateKey, 10, 60_000, 60_000);

      if (userFail.locked) {
        return {
          success: false,
          message: `Terlalu banyak percobaan gagal (Too many requests)! Batas 5 kali tercapai. Akses login ditahan selama ${userFail.remainingSeconds} detik.`,
          retryAfter: userFail.remainingSeconds,
        };
      }

      const sisa = 5 - userFail.currentAttempts;
      const sisaInfo = sisa > 0 ? ` (Sisa percobaan: ${sisa}x)` : "";
      return {
        success: false,
        message: `${sbRes.message}${sisaInfo}`,
      };
    }
  }

  // 3. Fallback ke localStorage jika Supabase belum dipasang
  if (typeof window === "undefined") return { success: false, message: "Window not ready" };
  const users = getUsers();

  const user = users.find(
    (u) =>
      (u.username.toLowerCase() === trimmedId || u.email?.toLowerCase() === trimmedId) &&
      u.role === role
  );

  if (!user) {
    const userFail = recordFailedAttempt(userRateKey, 5, 60_000, 60_000);
    recordFailedAttempt(deviceRateKey, 10, 60_000, 60_000);
    if (userFail.locked) {
      return {
        success: false,
        message: `Terlalu banyak percobaan salah (Too many requests)! Akses login ditahan selama ${userFail.remainingSeconds} detik.`,
        retryAfter: userFail.remainingSeconds,
      };
    }
    const sisa = 5 - userFail.currentAttempts;
    return {
      success: false,
      message: `Akun belum terdaftar! Silakan registrasi terlebih dahulu. (Sisa: ${sisa}x)`,
    };
  }

  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) {
    const userFail = recordFailedAttempt(userRateKey, 5, 60_000, 60_000);
    recordFailedAttempt(deviceRateKey, 10, 60_000, 60_000);
    if (userFail.locked) {
      return {
        success: false,
        message: `Terlalu banyak percobaan salah (Too many requests)! Akses login ditahan selama ${userFail.remainingSeconds} detik.`,
        retryAfter: userFail.remainingSeconds,
      };
    }
    const sisa = 5 - userFail.currentAttempts;
    return {
      success: false,
      message: `Password salah! Silakan periksa kembali. (Sisa: ${sisa}x)`,
    };
  }

  // Login sukses: Reset counter
  resetRateLimit(userRateKey);
  resetRateLimit(deviceRateKey);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, message: "Login berhasil!", user };
}

// Reset Password via validasi Email (didukung Supabase + cache lokal)
export async function resetPasswordByEmail(
  email: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const trimmedEmail = email.trim().toLowerCase();

  // Validasi panjang password baru minimal 6 karakter
  if (!newPassword || newPassword.trim().length < 6) {
    return {
      success: false,
      message: "Password baru minimal harus 6 karakter (bebas angka atau huruf)!",
    };
  }

  // 1. Update di Supabase jika terhubung
  if (isSupabaseConfigured) {
    const sbRes = await sbResetPassword(trimmedEmail, newPassword);
    if (!sbRes.success) {
      return sbRes;
    }
  }

  // 2. Update di cache lokal
  if (typeof window !== "undefined") {
    const users = getUsers();
    const userIndex = users.findIndex(
      (u) => u.email?.toLowerCase() === trimmedEmail
    );

    if (userIndex >= 0) {
      users[userIndex].password = newPassword;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email?.toLowerCase() === trimmedEmail) {
      currentUser.password = newPassword;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
  }

  return { success: true, message: "Password berhasil diperbarui! Silakan login kembali." };
}

// Ambil user yang sedang aktif di sesi browser saat ini
export function getCurrentUser(): UserAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Update data profil (username & avatar)
export async function updateUserProfile(
  newUsername: string,
  newAvatar?: string
): Promise<{ success: boolean; message: string; user?: UserAccount }> {
  if (typeof window === "undefined") return { success: false, message: "Tidak ada user yang sedang login." };
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, message: "Tidak ada user yang sedang login." };

  const trimmed = newUsername.trim();

  // 1. Update ke Supabase jika terhubung
  if (isSupabaseConfigured) {
    const sbRes = await sbUpdateProfile(currentUser.username, trimmed, newAvatar);
    if (!sbRes.success) {
      return { success: false, message: sbRes.message };
    }
  }

  // 2. Update cache lokal
  const users = getUsers();
  if (trimmed.toLowerCase() !== currentUser.username.toLowerCase()) {
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === trimmed.toLowerCase() &&
        u.username.toLowerCase() !== currentUser.username.toLowerCase()
    );
    if (exists && !isSupabaseConfigured) {
      return { success: false, message: `Username "${trimmed}" sudah digunakan akun lain!` };
    }
  }

  const updatedUser: UserAccount = {
    ...currentUser,
    username: trimmed || currentUser.username,
    avatar: newAvatar || currentUser.avatar || "/images/avatar-1.svg",
  };

  const updatedList = users.map((u) =>
    u.username.toLowerCase() === currentUser.username.toLowerCase() ? updatedUser : u
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  return { success: true, message: "Profil berhasil diperbarui!", user: updatedUser };
}

// Logout
export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

// ─── SISTEM TINGKATAN & PROGRESSION LOCK MATERI ──────────────────────────────

export interface SingleSectionProgress {
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
}

export interface SectionProgress {
  section1_pretest: boolean;
  section1_pretest_score?: number;
  section1_pretest_correct?: number;
  section1_materi: boolean;
  section1_posttest: boolean;
  section1_posttest_score?: number;
  section1_posttest_correct?: number;
  section2_unlocked: boolean;
  section2_pretest: boolean;
  section2_pretest_score?: number;
  section2_pretest_correct?: number;
  section2_materi: boolean;
  section2_posttest: boolean;
  section2_posttest_score?: number;
  section2_posttest_correct?: number;
  sections?: Record<number, SingleSectionProgress>;
}

export function getMateriProgress(username?: string): SectionProgress {
  const defaultProgress: SectionProgress = {
    section1_pretest: false,
    section1_materi: false,
    section1_posttest: false,
    section2_unlocked: false,
    section2_pretest: false,
    section2_materi: false,
    section2_posttest: false,
    sections: {},
  };

  if (typeof window === "undefined") return defaultProgress;
  try {
    const user = username || getCurrentUser()?.username || "default";
    const raw = localStorage.getItem(`${PROGRESS_KEY}_${user}`);
    return raw ? { ...defaultProgress, ...JSON.parse(raw) } : defaultProgress;
  } catch {
    return defaultProgress;
  }
}

export function saveMateriProgress(
  updates: Partial<SectionProgress>,
  username?: string
): SectionProgress {
  const current = getMateriProgress(username);
  const updated: SectionProgress = { ...current, ...updates };

  // Otomatis buka Section 2 jika Section 1 Post-test sudah diselesaikan
  if (updated.section1_posttest) {
    updated.section2_unlocked = true;
  }

  if (typeof window !== "undefined") {
    const user = username || getCurrentUser()?.username || "default";
    localStorage.setItem(`${PROGRESS_KEY}_${user}`, JSON.stringify(updated));
  }

  return updated;
}

export function getSectionState(sectionNum: number, username?: string): SingleSectionProgress {
  const p = getMateriProgress(username);
  const stored = p.sections?.[sectionNum];

  if (sectionNum === 1) {
    return {
      unlocked: true,
      pretest: stored?.pretest ?? p.section1_pretest,
      pretest_score: stored?.pretest_score ?? p.section1_pretest_score,
      pretest_correct: stored?.pretest_correct ?? p.section1_pretest_correct,
      pretest_total: stored?.pretest_total,
      materi: stored?.materi ?? p.section1_materi,
      posttest: stored?.posttest ?? p.section1_posttest,
      posttest_score: stored?.posttest_score ?? p.section1_posttest_score,
      posttest_correct: stored?.posttest_correct ?? p.section1_posttest_correct,
      posttest_total: stored?.posttest_total,
    };
  }

  if (sectionNum === 2) {
    const prevDone = p.sections?.[1]?.posttest ?? p.section1_posttest;
    return {
      unlocked: stored?.unlocked || p.section2_unlocked || prevDone,
      pretest: stored?.pretest ?? p.section2_pretest,
      pretest_score: stored?.pretest_score ?? p.section2_pretest_score,
      pretest_correct: stored?.pretest_correct ?? p.section2_pretest_correct,
      pretest_total: stored?.pretest_total,
      materi: stored?.materi ?? p.section2_materi,
      posttest: stored?.posttest ?? p.section2_posttest,
      posttest_score: stored?.posttest_score ?? p.section2_posttest_score,
      posttest_correct: stored?.posttest_correct ?? p.section2_posttest_correct,
      posttest_total: stored?.posttest_total,
    };
  }

  const prevState = getSectionState(sectionNum - 1, username);
  return {
    unlocked: stored?.unlocked || prevState.posttest,
    pretest: stored?.pretest ?? false,
    pretest_score: stored?.pretest_score,
    pretest_correct: stored?.pretest_correct,
    pretest_total: stored?.pretest_total,
    materi: stored?.materi ?? false,
    posttest: stored?.posttest ?? false,
    posttest_score: stored?.posttest_score,
    posttest_correct: stored?.posttest_correct,
    posttest_total: stored?.posttest_total,
  };
}

/**
 * Simpan progres per-section:
 * 1. Simpan langsung ke localStorage (instan tanpa jeda bagi siswa)
 * 2. Otomatis sinkronkan ke database Supabase di latar belakang (background sync)
 */
export function saveSectionState(
  sectionNum: number,
  updates: Partial<SingleSectionProgress>,
  username?: string
): SectionProgress {
  const current = getMateriProgress(username);
  const existing = getSectionState(sectionNum, username);
  const nextSec: SingleSectionProgress = { ...existing, ...updates };
  const nextSections: Record<number, SingleSectionProgress> = {
    ...(current.sections || {}),
    [sectionNum]: nextSec,
  };

  if (nextSec.posttest && sectionNum < 5) {
    const nextNum = sectionNum + 1;
    const prevNext = nextSections[nextNum] || getSectionState(nextNum, username);
    nextSections[nextNum] = { ...prevNext, unlocked: true };
  }

  const topUpdates: Partial<SectionProgress> = { sections: nextSections };
  if (sectionNum === 1) {
    topUpdates.section1_pretest = nextSec.pretest;
    topUpdates.section1_pretest_score = nextSec.pretest_score;
    topUpdates.section1_pretest_correct = nextSec.pretest_correct;
    topUpdates.section1_materi = nextSec.materi;
    topUpdates.section1_posttest = nextSec.posttest;
    topUpdates.section1_posttest_score = nextSec.posttest_score;
    topUpdates.section1_posttest_correct = nextSec.posttest_correct;
    if (nextSec.posttest) topUpdates.section2_unlocked = true;
  } else if (sectionNum === 2) {
    topUpdates.section2_unlocked = nextSec.unlocked;
    topUpdates.section2_pretest = nextSec.pretest;
    topUpdates.section2_pretest_score = nextSec.pretest_score;
    topUpdates.section2_pretest_correct = nextSec.pretest_correct;
    topUpdates.section2_materi = nextSec.materi;
    topUpdates.section2_posttest = nextSec.posttest;
    topUpdates.section2_posttest_score = nextSec.posttest_score;
    topUpdates.section2_posttest_correct = nextSec.posttest_correct;
  }

  const saved = saveMateriProgress(topUpdates, username);

  // Background Sync ke Supabase (Fire-and-forget tanpa membuat UI siswa menunggu)
  if (isSupabaseConfigured && typeof window !== "undefined") {
    const activeUsername = username || getCurrentUser()?.username;
    if (activeUsername) {
      sbSaveSectionProgress(activeUsername, sectionNum, nextSec).catch((err) => {
        console.warn("Background sync section progress gagal:", err);
      });
      // Jika unlock section berikutnya, simpan juga status unlocknya
      if (nextSec.posttest && sectionNum < 5) {
        const nextNum = sectionNum + 1;
        const nextState = nextSections[nextNum];
        if (nextState) {
          sbSaveSectionProgress(activeUsername, nextNum, nextState).catch((err) => {
            console.warn("Background sync next section unlock gagal:", err);
          });
        }
      }
    }
  }

  return saved;
}
