import { expect, test } from '@playwright/test';

test('renders the home hero', async ({ page }) => {
  await page.goto('/');

  expect(await page.locator('h1').innerText()).toContain('Angular components');
});
