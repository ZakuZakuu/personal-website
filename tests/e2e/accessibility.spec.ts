import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const route of [
  '/',
  '/writing/durable-technical-notes/',
  '/projects/personal-content-hub/',
  '/courses/language-model-foundations/',
]) {
  test(`${route} has no automatically detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
