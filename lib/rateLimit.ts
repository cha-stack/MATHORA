/**
 * Rate Limiting Utility - Mathora Security Shield
 * Mencegah spam request, brute force login, dan serangan flooding/DDoS.
 * 
 * Aturan bawaan:
 * - Maksimal percobaan: 5 kali per menit (window 60 detik).
 * - Jika melebihi 5 kali: Diblokir sementara selama 60 detik (lockout).
 * - Memberikan pesan "Too many requests" dengan hitung mundur detik.
 */

interface RateLimitData {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number;
}

const STORAGE_PREFIX = "mathora_rl_";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Mengambil status rate limit dari storage
 */
export function getRateLimitData(key: string): RateLimitData {
  const storage = getStorage();
  if (!storage) {
    return { attempts: 0, firstAttemptAt: Date.now(), lockedUntil: 0 };
  }

  try {
    const raw = storage.getItem(STORAGE_PREFIX + key);
    if (!raw) {
      return { attempts: 0, firstAttemptAt: Date.now(), lockedUntil: 0 };
    }
    const parsed: RateLimitData = JSON.parse(raw);
    return parsed;
  } catch {
    return { attempts: 0, firstAttemptAt: Date.now(), lockedUntil: 0 };
  }
}

/**
 * Menyimpan status rate limit ke storage
 */
function setRateLimitData(key: string, data: RateLimitData) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Periksa apakah request diizinkan atau sedang diblokir (Too Many Requests)
 * @param key Identifier unik (misal: "login_siswa_username" atau "login_device")
 * @param maxAttempts Jumlah maksimal percobaan (default: 5)
 * @param windowMs Durasi jendela waktu dalam ms (default: 60.000 ms = 1 menit)
 * @param lockoutMs Durasi pemblokiran jika mencapai batas dalam ms (default: 60.000 ms)
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60_000,
  lockoutMs = 60_000
): {
  allowed: boolean;
  remainingSeconds: number;
  currentAttempts: number;
  maxAttempts: number;
} {
  const now = Date.now();
  const data = getRateLimitData(key);

  // 1. Cek apakah masih dalam masa penalti (lockout)
  if (data.lockedUntil > now) {
    const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingSeconds,
      currentAttempts: data.attempts,
      maxAttempts,
    };
  }

  // 2. Jika masa lockout sudah lewat, atau jendela waktu sudah kadaluarsa -> reset antrean
  if (now - data.firstAttemptAt > windowMs) {
    const resetData: RateLimitData = {
      attempts: 0,
      firstAttemptAt: now,
      lockedUntil: 0,
    };
    setRateLimitData(key, resetData);
    return {
      allowed: true,
      remainingSeconds: 0,
      currentAttempts: 0,
      maxAttempts,
    };
  }

  // 3. Cek apakah sudah melebihi batas percobaan dalam window waktu
  if (data.attempts >= maxAttempts) {
    // Kunci selama lockoutMs jika belum terkunci
    const lockedUntil = now + lockoutMs;
    setRateLimitData(key, {
      ...data,
      lockedUntil,
    });
    const remainingSeconds = Math.ceil(lockoutMs / 1000);
    return {
      allowed: false,
      remainingSeconds,
      currentAttempts: data.attempts,
      maxAttempts,
    };
  }

  return {
    allowed: true,
    remainingSeconds: 0,
    currentAttempts: data.attempts,
    maxAttempts,
  };
}

/**
 * Catat 1 kali percobaan gagal (menaikkan counter & mengunci jika >= maxAttempts)
 */
export function recordFailedAttempt(
  key: string,
  maxAttempts = 5,
  windowMs = 60_000,
  lockoutMs = 60_000
): { locked: boolean; remainingSeconds: number; currentAttempts: number } {
  const now = Date.now();
  const data = getRateLimitData(key);

  let newAttempts = data.attempts + 1;
  let firstAttemptAt = data.firstAttemptAt;

  // Jika window sudah kadaluarsa, mulai window baru
  if (now - firstAttemptAt > windowMs && data.lockedUntil <= now) {
    newAttempts = 1;
    firstAttemptAt = now;
  }

  let lockedUntil = 0;
  let locked = false;
  let remainingSeconds = 0;

  if (newAttempts >= maxAttempts) {
    locked = true;
    lockedUntil = now + lockoutMs;
    remainingSeconds = Math.ceil(lockoutMs / 1000);
  }

  setRateLimitData(key, {
    attempts: newAttempts,
    firstAttemptAt,
    lockedUntil,
  });

  return {
    locked,
    remainingSeconds,
    currentAttempts: newAttempts,
  };
}

/**
 * Reset status rate limit (dipanggil saat login berhasil)
 */
export function resetRateLimit(key: string) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Ignore
  }
}

