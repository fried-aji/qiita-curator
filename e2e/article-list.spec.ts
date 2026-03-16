import { test, expect } from "@playwright/test";

test("トップページが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("タグフィルターが存在する", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("React")).toBeVisible();
  await expect(page.getByText("Next.js")).toBeVisible();
});

test("検索フィールドが存在する", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByPlaceholder("記事を検索...")).toBeVisible();
});
