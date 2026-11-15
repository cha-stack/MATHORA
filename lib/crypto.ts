/**
 * Mathora Crypto Utility - Keamanan Password Standar OWASP
 * Menggunakan algoritma Bcrypt (Work Factor / Cost 10, Salt Acak per-User).
 *
 * Mendukung 3 lapis kompatibilitas (Backward Compatibility):
 * 1. Bcrypt Hash ($2a$, $2b$, $2y$) - Standar modern utama
 * 2. SHA-256 Hash - Kompatibel dengan akun hasil testing sebelumnya
 * 3. Plaintext - Kompatibel dengan akun bawaan awal (siswa123 / guru123)
 */

import bcrypt from "bcryptjs";

// Salt lama untuk verifikasi akun SHA-256 terdahulu
const LEGACY_SHA256_SALT = "mathora_pkm_smp_islam_parung_2026_salt";

/**
 * Menghasilkan hash Bcrypt yang aman (OWASP Recommended)
 * Salt di-generate secara acak per-password, cost factor 10 putaran.
 */
export async function hashPassword(password: string): Promise<string> {
  const cleanPassword = password.trim();
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(cleanPassword, salt);
}

/**
 * Helper internal untuk cek verifikasi hash SHA-256 lama
 */
async function verifyLegacySha256(password: string, storedHash: string): Promise<boolean> {
  const payload = `${LEGACY_SHA256_SALT}::${password.trim()}`;
  try {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return hex === storedHash;
    }
    const nodeCrypto = await import("crypto");
    const hex = nodeCrypto.createHash("sha256").update(payload).digest("hex");
    return hex === storedHash;
  } catch {
    return false;
  }
}

/**
 * Memverifikasi apakah password input cocok dengan yang tersimpan di database.
 */
export async function verifyPassword(
  inputPassword: string,
  storedPasswordOrHash: string
): Promise<boolean> {
  if (!storedPasswordOrHash || !inputPassword) return false;

  const trimmedInput = inputPassword.trim();

  // 1. Cek apakah format hash adalah Bcrypt ($2a$, $2b$, atau $2y$)
  if (
    storedPasswordOrHash.startsWith("$2a$") ||
    storedPasswordOrHash.startsWith("$2b$") ||
    storedPasswordOrHash.startsWith("$2y$")
  ) {
    try {
      return await bcrypt.compare(trimmedInput, storedPasswordOrHash);
    } catch {
      return false;
    }
  }

  // 2. Cek apakah berupa hash SHA-256 lama (panjang 64 heksadesimal)
  if (/^[a-f0-9]{64}$/i.test(storedPasswordOrHash)) {
    return await verifyLegacySha256(trimmedInput, storedPasswordOrHash);
  }

  // 3. Fallback plaintext lama (misal akun demo bawaan awal: guru123 / siswa123)
  return storedPasswordOrHash === trimmedInput;
}
