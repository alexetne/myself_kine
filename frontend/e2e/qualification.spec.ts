import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function completeJourney(page: import("@playwright/test").Page) {
  await page
    .getByRole("button", { name: "Découvrir le fonctionnement" })
    .click();
  await page.getByRole("button", { name: "J’ai compris" }).click();
  await page.getByRole("button", { name: /Prévenir/ }).click();
  await page.getByRole("button", { name: "Continuer" }).click();
  await page
    .getByRole("group", { name: "As-tu 18 ans ou plus ?" })
    .getByRole("button", { name: "Oui" })
    .click();
  await page
    .getByRole("group", { name: "Es-tu autonome dans tes déplacements ?" })
    .getByRole("button", { name: "Oui" })
    .click();
  await page.getByRole("button", { name: "Continuer" }).click();
  await page.getByLabel("Adresse email").fill("camille@example.fr");
  await page.getByLabel("Mot de passe").fill("mot-de-passe-test");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Enregistrer mon choix" }).click();
  await page.getByRole("button", { name: "Route" }).click();
  await page.getByRole("button", { name: "Régulier" }).click();
  await page.getByRole("button", { name: "Enregistrer et continuer" }).click();
  for (let index = 0; index < 5; index += 1)
    await page.getByRole("button", { name: "Non", exact: true }).click();
}

const orientations = [
  ["possible", "Accompagnement possible"],
  ["monitor", "Adaptation ou surveillance"],
  ["consult", "Consultation recommandée"],
  ["urgent", "Arrêt et orientation urgente"],
] as const;

for (const [scenario, title] of orientations) {
  test(`parcours complet — ${scenario}`, async ({ page }) => {
    await page.goto(`/?scenario=${scenario}`);
    await completeJourney(page);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText(/Aucun calcul clinique/)).toBeVisible();
  });
}

test("accessibilité essentielle du premier écran", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
