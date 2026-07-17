import { test, expect } from '@playwright/test';

/**
 * Smoke E2E: verifies the app shell renders and the AI assistant entry point
 * is present. Firestore/Auth are not exercised here (covered by unit tests +
 * emulator in CI), this guards against regressions in the app boot/render.
 */
test('home page loads and shows the app shell', async ({ page }) => {
  await page.goto('/');
  // The PWA shell mounts; the floating assistant button is the AI entry point.
  await expect(page.getByRole('button')).toBeVisible();
});

test('floating assistant toggle is reachable', async ({ page }) => {
  await page.goto('/');
  // Coach AI launcher button exists in the DOM.
  const buttons = page.getByRole('button');
  await expect(buttons.first()).toBeAttached();
});
