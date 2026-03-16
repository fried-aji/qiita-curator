import { test, expect } from "@playwright/test";

test("ブックマークページに遷移できる", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "ブックマーク" }).click();
  await expect(page).toHaveURL("/bookmarks");
});

test("ブックマークなしの場合メッセージが表示される", async ({ page }) => {
  // localStorageをクリアしてから確認
  await page.goto("/bookmarks");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText("ブックマークした記事はありません")).toBeVisible();
});
