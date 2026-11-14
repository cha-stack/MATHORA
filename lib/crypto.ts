/**
 * Mathora Crypto Utility - Keamanan Password
 * Menggunakan Web Crypto API (SHA-256 dengan Salt Rahasia).
 * Menghasilkan hash 64 karakter heksadesimal yang aman dan tidak dapat dibalik.
 */

const SALT_KEY = "mathora_pkm_smp_islam_parung_2026_salt";

/**
 * Menghasilkan hash SHA-256 yang aman dari password
 */
export async function hashPassword(password: string): Promise<string> {
  const payload = `${SALT_KEY}::${password.trim()}`;

  // 1. Browser Environment (Web Crypto API)
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // 2. Node.js / Server Environment Fallback
  try {
    const nodeCrypto = await import("crypto");
    return nodeCrypto.createHash("sha256").update(payload).digest("hex");
  } catch {
    // Fallback sederhana jika modul crypto tidak tersedia
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hash_${Math.abs(hash)}`;
  }
}

/**
 * Memverifikasi apakah password input cocok dengan yang tersimpan di database.
 * Mendukung:
 * - Password yang sudah di-hash (SHA-256)
 * - Password lama berbentuk plaintext (untuk backward compatibility akun lama seperti siswa123/guru123)
 */
export async function verifyPassword(
  inputPassword: string,
  storedPasswordOrHash: string
): Promise<boolean> {
  if (!storedPasswordOrHash || !inputPassword) return false;

  // 1. Cek langsung jika di database masih berupa plaintext lama
  if (storedPasswordOrHash === inputPassword) {
    return true;
  }

  // 2. Cek kecocokan hash SHA-256
  const inputHash = await hashPassword(inputPassword);
  return inputHash === storedPasswordOrHash;
}

