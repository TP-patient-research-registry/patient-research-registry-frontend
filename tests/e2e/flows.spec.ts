import { expect, type Page, test } from "@playwright/test";

/**
 * End-to-end flows against a real backend seeded with `make seed` (demo accounts).
 * Run with E2E_SEEDED=1, e.g. `E2E_SEEDED=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm test:e2e`.
 */
test.skip(!process.env.E2E_SEEDED, "needs a backend seeded with demo data (E2E_SEEDED=1)");

const PASSWORD = "demo-password-123";

async function login(page: Page, email: string) {
  await page.goto("/en/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
}

test.describe("participant", () => {
  test("logs in, edits profile, manages consents and browses studies", async ({ page }) => {
    await login(page, "participant1@demo.example");
    await expect(page).toHaveURL(/\/en\/participant\/dashboard$/);
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();

    await page.getByRole("link", { name: "Profile" }).click();
    const birthYear = page.getByLabel("Year of birth");
    await expect(birthYear).not.toHaveValue("");
    await page.getByLabel("Diagnoses (ICD-10)").fill("e11, I10");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText("Profile saved.")).toBeVisible();
    await expect(page.getByLabel("Diagnoses (ICD-10)")).toHaveValue("E11, I10");

    await page.getByRole("link", { name: "Consents" }).click();
    await expect(page.getByRole("heading", { name: "Processing of health data" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Consent history" })).toBeVisible();

    await page.getByRole("link", { name: "Find studies" }).click();
    await expect(
      page.getByText(/Studies whose eligibility criteria match|No matching studies/),
    ).toBeVisible();
    await page.getByRole("tab", { name: "All studies" }).click();
    await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();

    await page.getByRole("link", { name: "My data" }).click();
    await expect(page.getByRole("heading", { name: "Who accessed my data" })).toBeVisible();
  });

  test("anonymous visitors are sent to login with a return URL", async ({ page }) => {
    await page.goto("/en/studies");
    await page.getByRole("heading", { level: 3 }).first().getByRole("link").click();
    await page.getByRole("link", { name: "Log in to apply" }).click();
    await expect(page).toHaveURL(/\/en\/login\?next=%2Fen%2Fstudies%2F/);
  });
});

test.describe("researcher", () => {
  test("creates a study with criteria and a questionnaire", async ({ page }) => {
    await login(page, "researcher@demo.example");
    await expect(page).toHaveURL(/\/en\/researcher\/dashboard$/);
    await expect(page.getByText("Verified researcher")).toBeVisible();

    await page.getByRole("link", { name: "New study" }).first().click();
    const title = `E2E study ${Date.now()}`;
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Description").fill("A study created by the end-to-end test.");
    await page.getByLabel("Minimum age").fill("50");
    await page.getByLabel("Maximum age").fill("40");
    await page.getByRole("button", { name: "Create draft" }).click();
    await expect(page.getByText("Maximum age must be greater than or equal to minimum age.")).toBeVisible();
    await page.getByLabel("Maximum age").fill("70");
    await page.getByLabel("Košice").check();
    await page.getByLabel("Diagnoses (ICD-10)").fill("E11");
    await page.getByRole("button", { name: "Create draft" }).click();

    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByLabel("Košice")).toBeChecked();
    await expect(page.getByLabel("Minimum age")).toHaveValue("50");

    await page.getByRole("link", { name: "Questionnaires" }).click();
    await page.getByRole("button", { name: "New questionnaire" }).click();
    await page.getByLabel("Questionnaire title").fill("Baseline");
    await page.getByRole("button", { name: "Save questionnaire" }).click();
    await expect(page.getByText("Add at least one question.")).toBeVisible();
    await page.getByRole("button", { name: "Add question" }).click();
    await page.getByLabel("Question text").fill("How are you?");
    await page.getByRole("button", { name: "Save questionnaire" }).click();
    await expect(page.getByText("Questionnaire saved.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Baseline" })).toBeVisible();

    await page.getByRole("link", { name: "Details" }).click();
    await expect(page.getByLabel("Title")).toHaveValue(title);
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/researcher\/studies$/);
    await expect(page.getByText(title)).toHaveCount(0);
  });

  test("cannot open the participant area", async ({ page }) => {
    await login(page, "researcher@demo.example");
    await expect(page).toHaveURL(/researcher\/dashboard/);
    await page.goto("/en/participant/dashboard");
    await expect(page).toHaveURL(/\/en\/403$/);
    await expect(page.getByRole("link", { name: "Go to my dashboard" })).toBeVisible();
  });
});

test("full loop: publish → apply → accept → questionnaire → pseudonymised answers → access log", async ({
  browser,
}) => {
  const researcher = await (await browser.newContext()).newPage();
  const participant = await (await browser.newContext()).newPage();
  const title = `E2E loop ${Date.now()}`;

  // Researcher publishes an open study with a questionnaire.
  await login(researcher, "researcher@demo.example");
  await expect(researcher).toHaveURL(/researcher\/dashboard/);
  await researcher.goto("/en/researcher/studies/new");
  await researcher.getByLabel("Title").fill(title);
  await researcher.getByLabel("Description").fill("Open to everyone.");
  await researcher.getByRole("button", { name: "Create draft" }).click();
  await expect(researcher.getByRole("heading", { level: 1, name: title })).toBeVisible();
  const studyUrl = researcher.url();

  await researcher.getByRole("link", { name: "Questionnaires" }).click();
  await researcher.getByRole("button", { name: "New questionnaire" }).click();
  await researcher.getByLabel("Questionnaire title").fill("Wellbeing");
  await researcher.getByRole("button", { name: "Add question" }).click();
  await researcher.getByLabel("Question text").fill("How do you feel today?");
  await researcher.getByLabel("Required").check();
  await researcher.getByRole("button", { name: "Save questionnaire" }).click();
  await expect(researcher.getByText("Questionnaire saved.")).toBeVisible();

  await researcher.goto(studyUrl);
  await researcher.getByRole("button", { name: "Publish" }).click();
  await researcher.getByRole("dialog").getByRole("button", { name: "Publish" }).click();
  await expect(researcher.getByText("The study is published.")).toBeVisible();
  const studyId = studyUrl.split("/").pop();

  // Participant applies.
  await login(participant, "participant2@demo.example");
  await expect(participant).toHaveURL(/participant\/dashboard/);
  await participant.goto(`/en/participant/studies/${studyId}`);
  await participant.getByRole("button", { name: "Apply" }).click();
  await expect(participant.getByText("You have applied:")).toBeVisible();

  // Researcher accepts the (pseudonymised) applicant.
  await researcher.goto(`${studyUrl}/participants`);
  await expect(researcher.getByText("participant2@demo.example")).toHaveCount(0);
  await researcher.getByRole("button", { name: "Accept" }).click();
  await expect(researcher.getByText("Status updated.")).toBeVisible();

  // Participant answers the questionnaire.
  await participant.goto("/en/participant/questionnaires");
  await participant
    .getByRole("listitem")
    .filter({ hasText: title })
    .getByRole("link", { name: "Fill in" })
    .click();
  await participant.getByRole("button", { name: "Submit" }).click();
  await participant.getByRole("dialog").getByRole("button", { name: "Submit" }).click();
  await expect(participant.getByText("This question is required.")).toBeVisible();
  await participant.getByLabel(/How do you feel today/).fill("Great, thanks");
  await participant.getByRole("button", { name: "Save draft" }).click();
  await expect(participant.getByText("Draft saved.")).toBeVisible();
  await participant.getByRole("button", { name: "Submit" }).click();
  await participant.getByRole("dialog").getByRole("button", { name: "Submit" }).click();
  await expect(participant.getByText(/Submitted on/)).toBeVisible();

  // Researcher reads the answers under a pseudonym.
  await researcher.goto(`${studyUrl}/questionnaires`);
  await researcher.getByRole("button", { name: "Responses" }).click();
  await expect(researcher.getByRole("cell", { name: "Great, thanks" })).toBeVisible();

  // …and the participant sees that access in their log.
  await participant.goto("/en/participant/my-data");
  await expect(
    participant.getByRole("row").filter({ hasText: "Research team" }).filter({ hasText: "Viewed" }).first(),
  ).toBeVisible();

  // Clean up: close recruitment so the demo list stays tidy.
  await researcher.goto(studyUrl);
  await researcher.getByRole("button", { name: "Close recruitment" }).click();
  await researcher.getByRole("dialog").getByRole("button", { name: "Close recruitment" }).click();
  await expect(researcher.getByText("Recruitment closed.")).toBeVisible();
});
