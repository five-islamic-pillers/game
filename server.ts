import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

function generateOtpHtml(otp: string, displayName?: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ckb">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>کۆدی دڵنیابوونەوەی هەژمار</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1c1917; color: #f5f5f4; margin: 0; padding: 24px; direction: rtl; }
    .card { max-width: 480px; margin: 0 auto; background-color: #292524; border: 1px solid #44403c; border-radius: 16px; padding: 32px; text-align: center; }
    .badge { display: inline-block; background-color: #d97706; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: 900; color: #ffffff; margin-bottom: 8px; }
    .desc { font-size: 14px; color: #d6d3d1; line-height: 1.6; margin-bottom: 24px; }
    .otp-box { background-color: #1c1917; border: 2px dashed #f59e0b; border-radius: 12px; padding: 18px 24px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #fbbf24; margin: 20px 0; }
    .notice { font-size: 12px; color: #78716c; margin-top: 24px; border-top: 1px solid #44403c; pt-4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">پێنج پایەکەی ئیسلام</div>
    <h1 class="title">کۆدی دڵنیابوونەوەی هەژمار</h1>
    <p class="desc">سڵاو ${displayName ? `<strong>${displayName}</strong>` : 'یاریزانی بەڕێز'}،<br>تکایە ئەم کۆدە لە یارییەکەدا بنووسە بۆ تەواوکردنی دروستکردنی هەژمارەکەت:</p>
    <div class="otp-box">${otp}</div>
    <p class="desc" style="font-size: 13px; color: #a8a29e;">ئەم کۆدە بۆ ماوەی <strong>١٠ خولەک</strong> کارایە.<br>ئەگەر تۆ داوای ئەم کۆدەت نەکردووە، دەتوانیت بە ئارامی ئەم نامەیە پشتگوێ بخەیت.</p>
    <div class="notice">کێبڕکێی ئۆنلاینی پێنج پایەکەی ئیسلام</div>
  </div>
</body>
</html>`;
}

interface StoredOtp {
  otp: string;
  expiresAt: number;
  attempts: number;
  displayName?: string;
}

const otpStore = new Map<string, StoredOtp>();

// Periodically clean up expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of otpStore.entries()) {
    if (now > entry.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 60 * 1000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // POST /api/send-otp
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email, displayName } = req.body;
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ success: false, error: "تکایە ئیمەیڵێکی دروست بنووسە" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStore.set(normalizedEmail, {
        otp,
        expiresAt,
        attempts: 0,
        displayName: displayName || ""
      });

      console.log(`[OTP] Generated code ${otp} for ${normalizedEmail}`);

      let emailSent = false;
      let emailError: string | null = null;

      // 1. Try SMTP if configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"پێنج پایەکەی ئیسلام" <${process.env.SMTP_USER}>`,
            to: normalizedEmail,
            subject: `${otp} کۆدی دڵنیابوونەوە - پێنج پایەکەی ئیسلام`,
            html: generateOtpHtml(otp, displayName),
          });
          emailSent = true;
          console.log(`[OTP] Email successfully dispatched via SMTP to ${normalizedEmail}`);
        } catch (err: any) {
          console.error("[OTP] SMTP dispatch failed:", err?.message || err);
          emailError = err?.message || "SMTP Error";
        }
      } 
      // 2. Try Resend if configured
      else if (process.env.RESEND_API_KEY) {
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: process.env.SMTP_FROM || "onboarding@resend.dev",
              to: [normalizedEmail],
              subject: `${otp} کۆدی دڵنیابوونەوە - پێنج پایەکەی ئیسلام`,
              html: generateOtpHtml(otp, displayName),
            })
          });
          if (response.ok) {
            emailSent = true;
            console.log(`[OTP] Email successfully dispatched via Resend to ${normalizedEmail}`);
          } else {
            const errData = await response.json().catch(() => ({}));
            console.error("[OTP] Resend dispatch failed:", errData);
            emailError = "Resend delivery error";
          }
        } catch (err: any) {
          console.error("[OTP] Resend fetch failed:", err);
          emailError = err?.message;
        }
      }

      return res.json({
        success: true,
        email: normalizedEmail,
        emailSent,
        emailError,
        // previewOtp ensures seamless testing in preview container without requiring active SMTP keys
        previewOtp: otp,
        expiresInSeconds: 600,
        message: emailSent
          ? "کۆدی دڵنیابوونەوە بە سەرکەوتوویی بۆ ئیمەیڵەکەت نێردرا"
          : "کۆدی دڵنیابوونەوە بەسەرکەوتوویی دروستکرا"
      });
    } catch (e: any) {
      console.error("[OTP] Error in /api/send-otp:", e);
      return res.status(500).json({ success: false, error: "هەڵەیەک لە ناردنی کۆد ڕوویدا" });
    }
  });

  // POST /api/verify-otp
  app.post("/api/verify-otp", (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, error: "تکایە ئیمەیڵ و کۆد بنووسە" });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const stored = otpStore.get(normalizedEmail);

      if (!stored) {
        return res.status(400).json({ 
          success: false, 
          error: "هیچ کۆدێک بۆ ئەم ئیمەیڵە نەدۆزرایەوە. تکایە دووبارە داوای کۆد بکەوە." 
        });
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ 
          success: false, 
          error: "کاتی بەکارهێنانی ئەم کۆدە بەسەرچووە. تکایە دووبارە داوای کۆد بکەوە." 
        });
      }

      if (stored.attempts >= 5) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ 
          success: false, 
          error: "زیاتر لە ٥ جار کۆدی هەڵە تاقیکراوەتەوە. تکایە دووبارە داوای کۆدی نوێ بکە." 
        });
      }

      if (stored.otp.trim() !== otp.toString().trim()) {
        stored.attempts += 1;
        const remaining = 5 - stored.attempts;
        return res.status(400).json({ 
          success: false, 
          error: `کۆدەکە هەڵەیە! (${remaining} هەوڵ ماوە)` 
        });
      }

      // Valid OTP
      otpStore.delete(normalizedEmail);
      return res.json({ 
        success: true, 
        verified: true, 
        message: "ئیمەیڵ بە سەرکەوتوویی پشتڕاستکرایەوە" 
      });
    } catch (e: any) {
      console.error("[OTP] Error in /api/verify-otp:", e);
      return res.status(500).json({ success: false, error: "هەڵەیەک لە پشتڕاستکردنەوە ڕوویدا" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
