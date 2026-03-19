import { test, expect } from "@playwright/test";

test("ブックマークページに遷移できる", async ({ page }) => {
  await page.goto("/bookmarks");
  await expect(page).toHaveURL("/bookmarks");
});

test("未ログイン時はブックマークなしメッセージが表示される", async ({
  page,
}) => {
  await page.goto("/bookmarks");
  await expect(
    page.getByText("ブックマークした記事はありません"),
  ).toBeVisible();
});
