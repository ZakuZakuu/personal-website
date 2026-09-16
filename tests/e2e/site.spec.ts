import { expect, test } from '@playwright/test';

const representativeRoutes = [
  '/',
  '/writing/',
  '/writing/cs336-overview/',
  '/writing/learn-dsh-interactive-harness-course/',
  '/series/',
  '/series/cs336/',
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

test('article typography renders clean headings and math', async ({ page, isMobile }) => {
  await page.goto('/writing/cs336-overview/');

  await expect(page.locator('.katex').first()).toBeVisible();
  await expect(page.locator('.katex-display')).toHaveCount(2);
  await expect(page.locator('.katex-display').first()).toHaveAttribute('tabindex', '0');

  const tableOfContentsLabels = await page
    .getByRole('navigation', { name: '本页目录' })
    .getByRole('link')
    .allTextContents();
  expect(tableOfContentsLabels.every((label) => !label.trim().endsWith('#'))).toBe(true);

  if (!isMobile) {
    const titleLineCount = await page.locator('h1').evaluate((heading) => {
      const range = document.createRange();
      range.selectNodeContents(heading);
      return range.getClientRects().length;
    });
    expect(titleLineCount).toBeLessThanOrEqual(2);
  }
});

test('wrapped section headings keep a full-width divider', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The divider is intentionally simplified at compact widths.');
  await page.goto('/writing/cs336-overview/');

  const heading = page.getByRole('heading', {
    name: 'Data 不是训练前的准备工作，而是模型能力的一部分',
  });
  const divider = await heading.evaluate((element) => {
    const styles = getComputedStyle(element);
    const after = getComputedStyle(element, '::after');
    return { borderTopWidth: styles.borderTopWidth, afterContent: after.content };
  });

  expect(divider.borderTopWidth).toBe('1px');
  expect(divider.afterContent).toBe('none');
});

test('strong text remains distinct from body text', async ({ page }) => {
  await page.goto('/writing/cs336-overview/');

  const contrast = await page
    .locator('.prose strong')
    .first()
    .evaluate((element) => {
      const strong = getComputedStyle(element);
      const body = getComputedStyle(element.parentElement!);
      return {
        color: strong.color,
        parentColor: body.color,
        weight: Number(strong.fontWeight),
      };
    });

  expect(contrast.weight).toBeGreaterThanOrEqual(750);
  expect(contrast.color).not.toBe(contrast.parentColor);
});

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
  await expect(navigation.getByRole('link')).toHaveCount(5);
});
