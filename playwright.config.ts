import { defineConfig, devices } from "@playwright/test";

// QA visual & aksesibilitas (CLAUDE.md §9) — cakupan sengaja sempit: kontras,
// target sentuh, breakpoint, prefers-reduced-motion. BUKAN test suite bisnis-logic
// formal (itu item yang sengaja masih terbuka, lihat Frontend Logic §"Item Terbuka").
//
// Test di sini hanya menyasar halaman yang tidak butuh koneksi Supabase untuk
// render (mis. /admin/login) — homepage publik query DB langsung saat render/build
// (TSD §3.3) sehingga di luar cakupan sampai ada Supabase dev project untuk CI.
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-360", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 800 } } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/admin/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
