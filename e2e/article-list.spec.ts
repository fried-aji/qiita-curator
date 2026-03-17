import { test, expect } from "@playwright/test";

test("トップページが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("タグフィルターが存在する", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "React", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next.js", exact: true })).toBeVisible();
});

test("検索フィールドが存在する", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByPlaceholder("記事を検索...")).toBeVisible();
});

test("ページネーションUIが表示される", async ({ page }) => {
  await page.goto("/");
  // ページ番号ボタン（1番）が表示されること（Qiita APIのレスポンスを待つため長めのタイムアウト）
  await expect(page.getByRole("link", { name: "1ページ目" })).toBeVisible({
    timeout: 15000,
  });
});

test("次のページへ遷移できる", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "次のページ" })
    .click({ timeout: 15000 });
  await expect(page).toHaveURL(/page=2/);
});

test("タグ切り替えでpage=1にリセットされる", async ({ page }) => {
  await page.goto("/?tag=React&page=2");
  await page.getByRole("button", { name: "Next.js", exact: true }).click();
  await expect(page).toHaveURL(/tag=Next\.js/);
  await expect(page).toHaveURL(/page=1/);
});
