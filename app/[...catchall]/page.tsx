import { notFound } from 'next/navigation'

/**
 * Semua route yang tidak dikenal (file hilang, salah ketik URL, dll.)
 * diarahkan ke halaman 404 standar.
 *
 * PENTING: dulu file ini melakukan `import Home from './page'` — yaitu
 * mengimpor dirinya sendiri, sehingga render berujung rekursi tanpa batas
 * (RangeError: Maximum call stack size exceeded / HTTP 500).
 */
export default function CatchAll() {
  notFound()
}

