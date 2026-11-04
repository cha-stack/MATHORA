export interface UserAccount {
  username: string;
  password: string;
  role: "siswa" | "guru";
  avatar?: string;
  createdAt: string;
}

const STORAGE_KEY = "mathora_users";
const CURRENT_USER_KEY = "mathora_current_user";

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

// Registrasi user baru
export function registerUser(
  username: string,
  password: string,
  role: "siswa" | "guru" = "siswa",
  avatar: string = "/images/avatar.png"
): { success: boolean; message: string } {
  if (typeof window === "undefined") return { success: false, message: "Window not ready" };
  const users = getUsers();

  const existing = users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (existing) {
    return {
      success: false,
      message: `Username "${username}" sudah terdaftar! Silakan gunakan username lain.`,
    };
  }

  const newUser: UserAccount = {
    username: username.trim(),
    password,
    role,
    avatar,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return { success: true, message: "Pendaftaran berhasil!" };
}

// Validasi login user
export function loginUser(
  username: string,
  password: string,
  role: "siswa" | "guru" = "siswa"
): { success: boolean; message: string; user?: UserAccount } {
  if (typeof window === "undefined") return { success: false, message: "Window not ready" };
  const users = getUsers();

  const user = users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.role === role
  );

  if (!user) {
    return {
      success: false,
      message: "Username belum terdaftar! Silakan klik 'Regis' terlebih dahulu.",
    };
  }

  if (user.password !== password) {
    return { success: false, message: "Password salah! Silakan periksa kembali." };
  }

  // Simpan sesi login aktif
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, message: "Login berhasil!", user };
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

// Update data profil (username & avatar)
export function updateUserProfile(
  newUsername: string,
  newAvatar?: string
): { success: boolean; message: string; user?: UserAccount } {
  if (typeof window === "undefined") return { success: false, message: "Window not ready" };
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, message: "Tidak ada user yang sedang login." };

  const users = getUsers();
  const trimmed = newUsername.trim();

  // Jika ganti username, pastikan tidak bentrok dengan user lain
  if (trimmed.toLowerCase() !== currentUser.username.toLowerCase()) {
    const exists = users.some(
      (u) => u.username.toLowerCase() === trimmed.toLowerCase() && u.username.toLowerCase() !== currentUser.username.toLowerCase()
    );
    if (exists) {
      return { success: false, message: `Username "${trimmed}" sudah digunakan akun lain!` };
    }
  }

  const updatedUser: UserAccount = {
    ...currentUser,
    username: trimmed || currentUser.username,
    avatar: newAvatar || currentUser.avatar || "/images/avatar.png",
  };

  // Update in array
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
