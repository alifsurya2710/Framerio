/**
 * Aturan kekuatan password — dipakai bersama oleh form admin (client)
 * dan API route (server) agar validasi selalu konsisten.
 */
export type PasswordRule = {
  id: string
  label: string
  test: (pw: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'Minimal 8 karakter', test: (pw) => pw.length >= 8 },
  { id: 'upper', label: 'Huruf besar (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lower', label: 'Huruf kecil (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { id: 'digit', label: 'Angka (0-9)', test: (pw) => /[0-9]/.test(pw) },
  { id: 'symbol', label: 'Simbol (@$!%*?&)', test: (pw) => /[@$!%*?&]/.test(pw) },
]

/** Kembalikan pesan error gabungan, atau null jika password valid. */
export function validatePassword(pw: string): string | null {
  const failed = PASSWORD_RULES.filter((r) => !r.test(pw)).map((r) => r.label)
  if (failed.length === 0) return null
  return `Password belum memenuhi: ${failed.join(', ')}`
}
