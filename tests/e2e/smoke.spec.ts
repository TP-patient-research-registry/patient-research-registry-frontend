import { expect, test } from "@playwright/test";

test("redirects / to the browser's locale (Slovak)", async ({ browser }) => {
  // next-intl detects the locale from Accept-Language; Playwright's Chrome defaults to en-US.
  const page = await (await browser.newContext({ locale: "sk-SK" })).newPage();
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
