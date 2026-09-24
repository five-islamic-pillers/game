import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";

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

      return res.json({
        success: true,
        email: normalizedEmail,
        previewOtp: otp,
        expiresInSeconds: 600,
        message: "کۆدی دڵنیابوونەوە بەسەرکەوتوویی دروستکرا"
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

  const server = http.createServer(app);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
