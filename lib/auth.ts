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

// Ambil semua user yang tersimpan
export function getUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Registrasi user baru dengan email
export function registerUser(
  username: string,
  email: string,
  password: string,
  role: "siswa" | "guru" = "siswa",
  avatar: string = "/images/avatar-1.svg"
): { success: boolean; message: string } {
  if (typeof window === "undefined") return { success: false, message: "Window not ready" };
  const users = getUsers();

  const trimmedUser = username.trim();
  const trimmedEmail = email.trim().toLowerCase();

  const userExists = users.find(
    (u) => u.username.toLowerCase() === trimmedUser.toLowerCase()
  );
  if (userExists) {
    return {
      success: false,
      message: `Username "${username}" sudah terdaftar! Gunakan username lain.`,
    };
  }

  const emailExists = users.find(
    (u) => u.email?.toLowerCase() === trimmedEmail
  );
  if (emailExists) {
    return {
      success: false,
      message: `Email "${email}" sudah digunakan! Silakan langsung login atau gunakan fitur Lupa Password.`,
    };
  }

  const newUser: UserAccount = {
    username: trimmedUser,
    email: trimmedEmail,
    password,
    role,
    avatar,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return { success: true, message: "Pendaftaran akun berhasil!" };
}

// Validasi login user (bisa pakai username atau email)
export function loginUser(
  identifier: string,
  password: string,
  role: "siswa" | "guru" = "siswa"
): { success: boolean; message: string; user?: UserAccount } {
  if (typeof window === "undefined") return { success: false, message: "Window not ready" };
  const users = getUsers();
  const trimmedId = identifier.trim().toLowerCase();

  const user = users.find(
    (u) =>
      (u.username.toLowerCase() === trimmedId || u.email?.toLowerCase() === trimmedId) &&
      u.role === role
  );

  if (!user) {
    return {
      success: false,
      message: "Akun belum terdaftar! Silakan registrasi terlebih dahulu.",
    };
  }

  if (user.password !== password) {
    return { success: false, message: "Password salah! Silakan periksa kembali." };
  }

  // Simpan sesi login aktif
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, message: "Login berhasil!", user };
}

// Reset Password via validasi Email
export function resetPasswordByEmail(
  email: string,
  newPassword: string
): { success: boolean; message: string } {
  if (typeof window === "undefined") return { success: false, message: "Window not ready" };
  const users = getUsers();
  const trimmedEmail = email.trim().toLowerCase();

  const userIndex = users.findIndex(
    (u) => u.email?.toLowerCase() === trimmedEmail
  );

  if (userIndex === -1) {
    return {
      success: false,
      message: `Email "${email}" tidak ditemukan dalam sistem!`,
    };
  }

  users[userIndex].password = newPassword;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

  // Update current user if matches
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email?.toLowerCase() === trimmedEmail) {
    currentUser.password = newPassword;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  }

  return { success: true, message: "Password berhasil diperbarui! Silakan login kembali." };
}

// Ambil user yang sedang aktif
export function getCurrentUser(): UserAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Update data profil
export function updateUserProfile(
  newUsername: string,
  newAvatar?: string
): { success: boolean; message: string; user?: UserAccount } {
  if (typeof window === "undefined") return { success: false, message: "Window not ready" };
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, message: "Tidak ada user yang sedang login." };

  const users = getUsers();
  const trimmed = newUsername.trim();

  if (trimmed.toLowerCase() !== currentUser.username.toLowerCase()) {
    const exists = users.some(
      (u) =>
        u.username.toLowerCase() === trimmed.toLowerCase() &&
        u.username.toLowerCase() !== currentUser.username.toLowerCase()
    );
    if (exists) {
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

// --- SISTEM TINGKATAN & PROGRESSION LOCK MATERI ---
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

  return saveMateriProgress(topUpdates, username);
}
