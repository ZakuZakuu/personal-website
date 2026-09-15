import { expect, test } from '@playwright/test';

const representativeRoutes = [
  '/',
  '/writing/',
  '/projects/learn-dsh-interactive-harness-course/',
  '/courses/',
  '/about/',
  '/now/',
  '/search/',
];

for (const route of representativeRoutes) {
  test(`${route} renders without document overflow`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('main')).toBeVisible();
    await expect(page).toHaveTitle(/Rabbit Hole/);

    const sizes = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(sizes.document).toBeLessThanOrEqual(sizes.viewport + 1);
  });
}

test('theme choice persists after navigation', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: '切换到深色主题' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('the production search component is registered', async ({ page }) => {
  await page.goto('/search/');
  await expect(page.locator('pagefind-input')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Boolean(customElements.get('pagefind-input'))))
    .toBe(true);
  await page.locator('pagefind-input input').fill('Harness');
  await expect(page.locator('pagefind-results a').first()).toBeVisible();
});

test('mobile navigation exposes every primary destination', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile navigation is only rendered at the compact breakpoint.');
  await page.goto('/');
  await page.getByText('菜单', { exact: true }).click();
  const navigation = page.getByRole('navigation', { name: '移动端导航' });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole('link')).toHaveCount(4);
});
