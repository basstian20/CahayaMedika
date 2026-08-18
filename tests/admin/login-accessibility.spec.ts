import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// QA visual & aksesibilitas untuk S5 (Login) — UI Template Spec §7:
// kontras WCAG AA, target sentuh 44x44px, fokus keyboard terlihat.
// /admin/login dipilih karena satu-satunya route admin yang tidak butuh
// koneksi Supabase untuk render (middleware.ts mengecualikannya dari guard,
// dan halaman ini "use client" tanpa data fetch server-side).
test.describe("Halaman login admin — aksesibilitas", () => {
  test("tidak ada pelanggaran WCAG 2.1 AA (kontras, label, dsb.)", async ({ page }) => {
    await page.goto("/admin/login");

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("elemen interaktif memenuhi target sentuh minimum 44x44px", async ({ page }) => {
    await page.goto("/admin/login");

    const interactiveSelectors = ["#email", "#password", 'button[type="submit"]', 'button[type="button"]'];

    for (const selector of interactiveSelectors) {
      const box = await page.locator(selector).boundingBox();
      expect(box, `elemen "${selector}" tidak ditemukan`).not.toBeNull();
      expect(box!.width, `lebar "${selector}" di bawah 44px`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `tinggi "${selector}" di bawah 44px`).toBeGreaterThanOrEqual(44);
    }
  });

  test("fokus keyboard terlihat jelas di atas latar gelap", async ({ page }) => {
    await page.goto("/admin/login");

    await page.locator("#email").focus();
    await expect(page.locator("#email")).toBeFocused();

    const outline = await page
      .locator("#email")
      .evaluate((el) => window.getComputedStyle(el, ":focus").boxShadow || window.getComputedStyle(el).boxShadow);
    expect(outline).not.toBe("none");
  });
});
