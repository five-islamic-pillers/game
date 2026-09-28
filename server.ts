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

  // Dynamic sitemap.xml for Google Search Console
  app.get("/sitemap.xml", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.get("host") || "ais-pre-ec3oxz4hx4cyh2q5bypnxc-27342607303.europe-west2.run.app";
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split("T")[0];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/board.jpg</image:loc>
      <image:title>تەختەی یاری پێنج پایەکەی ئیسلام</image:title>
      <image:caption>نەخشە و خانەکانی یاری خێزانی پێنج پایەی ئیسلام</image:caption>
    </image:image>
    <image:image>
      <image:loc>${baseUrl}/bg.png</image:loc>
      <image:title>پێنج پایەکەی ئیسلام</image:title>
      <image:caption>یاری پەروەردەیی و مەعریفی ئیسلامی بۆ تەواوی خێزان</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/?view=rules</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?view=leaderboard</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?view=online</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?view=download</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  });

  // Dynamic robots.txt
  app.get("/robots.txt", (req, res) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.get("host") || "ais-pre-ec3oxz4hx4cyh2q5bypnxc-27342607303.europe-west2.run.app";
    const baseUrl = `${protocol}://${host}`;

    const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header("Content-Type", "text/plain; charset=utf-8");
    res.send(robots);
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
