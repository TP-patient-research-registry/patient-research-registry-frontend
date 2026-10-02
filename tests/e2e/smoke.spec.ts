import { expect, test } from "@playwright/test";

test("redirects / to the default Slovak locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/sk$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "sk");
});

test("landing page has a main landmark and a working skip link", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("main")).toBeVisible();

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
});

test("protected areas redirect anonymous users to login", async ({ page }) => {
  await page.goto("/en/participant/dashboard");
  await expect(page).toHaveURL(/\/en\/login\?next=/);
});
