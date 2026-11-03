import nodemailer from 'nodemailer'

/**
 * Pengirim email via Gmail SMTP.
 * Wajib menggunakan APP PASSWORD Gmail (bukan password akun biasa).
 * Buat di: Google Account → Security → 2-Step Verification → App passwords.
 */
export async function sendMail(opts: { to: string; subject: string; html: string }): Promise<void> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error('SMTP_USER / SMTP_PASS belum dikonfigurasi di environment')
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || `"FramerPhotobooth" <${user}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })

  // Catat keberhasilan kirim agar mudah ditelusuri saat debugging
  console.log('[mail] terkirim ->', opts.to, '| messageId:', info.messageId)
}

/** Bangun URL aplikasi — APP_URL lebih diutamakan, fallback ke NEXTAUTH_URL / origin request. */
export function appUrl(req?: Request): string {
  const base = process.env.APP_URL || process.env.NEXTAUTH_URL || (req ? new URL(req.url).origin : '')
  return base.replace(/\/$/, '')
}

/** Template HTML email reset password. */
export function resetPasswordEmailHtml(link: string, expiresMinutes = 60): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f2f1ec;padding:32px 0">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e1dc">
      <div style="background:#1c1c1c;padding:24px 32px">
        <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.5px">Framer<span style="color:#e85200">io</span></span>
        <div style="color:#9a9a9a;font-size:11px;margin-top:4px">PHOTOBOOTH · ADMIN SYSTEM</div>
      </div>
      <div style="padding:32px">
        <h2 style="margin:0 0 12px;font-size:18px;color:#1c1c1c">Reset Kata Sandi</h2>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#555">
          Kami menerima permintaan untuk mereset kata sandi akun FramerPhotobooth Anda.
          Klik tombol di bawah untuk membuat kata sandi baru:
        </p>
        <p style="margin:24px 0;text-align:center">
          <a href="${link}"
             style="display:inline-block;background:#e85200;color:#ffffff;font-size:14px;font-weight:bold;
                    text-decoration:none;padding:14px 32px;border-radius:999px">
            Reset Kata Sandi
          </a>
        </p>
        <p style="margin:0 0 8px;font-size:12px;color:#888;line-height:1.6">
          Tautan ini berlaku <strong>${expiresMinutes} menit</strong> dan hanya bisa dipakai satu kali.
          Jika tombol tidak berfungsi, salin tautan berikut ke browser:
        </p>
        <p style="margin:0 0 16px;font-size:11px;color:#aaa;word-break:break-all;font-family:monospace">${link}</p>
        <p style="margin:0;font-size:12px;color:#888;line-height:1.6">
          Jika Anda tidak meminta reset ini, abaikan email ini — kata sandi Anda tidak akan berubah.
        </p>
      </div>
      <div style="background:#f7f6f2;padding:16px 32px;border-top:1px solid #e2e1dc">
        <span style="font-size:10px;color:#aaa">© ${new Date().getFullYear()} FramerPhotobooth. All rights reserved.</span>
      </div>
    </div>
  </div>`
}
