import { test, expect } from '@playwright/test';

test.describe('Game Listing and Navigation', () => {
  test('should display games with titles on index page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the games to load
    await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });
    
    // Check that games are displayed
    const gameCards = page.locator('[data-testid="game-card"]');
    
    // Wait for at least one game card to be visible
    await expect(gameCards.first()).toBeVisible();
    
    // Check that we have at least one game
    const gameCount = await gameCards.count();
    expect(gameCount).toBeGreaterThan(0);
    
    // Check that each game card has a title
    const firstGameCard = gameCards.first();
    await expect(firstGameCard.locator('[data-testid="game-title"]')).toBeVisible();
    
    // Verify that game titles are not empty
    const gameTitle = await firstGameCard.locator('[data-testid="game-title"]').textContent();
    expect(gameTitle?.trim()).toBeTruthy();
  });

  test('should navigate to correct game details page when clicking on a game', async ({ page }) => {
    await page.goto('/');
    
    // Wait for games to load
    await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });
    
    // Get the first game card and its data attributes
    const firstGameCard = page.locator('[data-testid="game-card"]').first();
    const gameId = await firstGameCard.getAttribute('data-game-id');
    const gameTitle = await firstGameCard.getAttribute('data-game-title');
    
    // Click on the first game
    await firstGameCard.click();
    
    // Verify we're on the correct game details page
    await expect(page).toHaveURL(`/game/${gameId}`);
    
    // Verify the game details page loads
    await page.waitForSelector('[data-testid="game-details"]', { timeout: 10000 });
    
    // Verify the title matches what we clicked on
    const detailsTitle = page.locator('[data-testid="game-details-title"]');
    await expect(detailsTitle).toHaveText(gameTitle || '');
  });

  test('should display game details with all required information', async ({ page }) => {
    // Navigate to a specific game (we'll use game ID 1 as an example)
    await page.goto('/game/1');
    
    // Wait for game details to load
    await page.waitForSelector('[data-testid="game-details"]', { timeout: 10000 });
    
    // Check that the game title is present and not empty
    const gameTitle = page.locator('[data-testid="game-details-title"]');
    await expect(gameTitle).toBeVisible();
    const titleText = await gameTitle.textContent();
    expect(titleText?.trim()).toBeTruthy();
    
    // Check that the game description is present and not empty
    const gameDescription = page.locator('[data-testid="game-details-description"]');
    await expect(gameDescription).toBeVisible();
    const descriptionText = await gameDescription.textContent();
    expect(descriptionText?.trim()).toBeTruthy();
    
    // Check that either publisher or category (or both) are present
    const publisherExists = await page.locator('[data-testid="game-details-publisher"]').isVisible();
    const categoryExists = await page.locator('[data-testid="game-details-category"]').isVisible();
    expect(publisherExists && categoryExists).toBeTruthy();
    
    // If publisher exists, check it has content
    if (publisherExists) {
      const publisherText = await page.locator('[data-testid="game-details-publisher"]').textContent();
      expect(publisherText?.trim()).toBeTruthy();
    }
    
    // If category exists, check it has content
    if (categoryExists) {
      const categoryText = await page.locator('[data-testid="game-details-category"]').textContent();
      expect(categoryText?.trim()).toBeTruthy();
    }
  });

  test('should display a button to back the game', async ({ page }) => {
    await page.goto('/game/1');
    
    // Wait for game details to load
    await page.waitForSelector('[data-testid="game-details"]', { timeout: 10000 });
    
    // Check that the back game button is present
    const backButton = page.locator('[data-testid="back-game-button"]');
    await expect(backButton).toBeVisible();
    await expect(backButton).toContainText('Support This Game');
    
    // Verify the button is clickable
    await expect(backButton).toBeEnabled();
  });

  test('should be able to navigate back to home from game details', async ({ page }) => {
    await page.goto('/game/1');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="game-details"]', { timeout: 10000 });
    
    // Find and click the back to all games link
    const backLink = page.locator('a:has-text("Back to all games")');
    await expect(backLink).toBeVisible();
    await backLink.click();
    
    // Verify we're back on the home page
    await expect(page).toHaveURL('/');
    await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });
  });

  test('should handle navigation to non-existent game gracefully', async ({ page }) => {
    // Navigate to a game that doesn't exist
    await page.goto('/game/99999');
    
    // The page should load without crashing
    // Check if there's an error message or if it handles gracefully
    await page.waitForTimeout(3000);
    
    // The page should either show an error or handle it gracefully
    // We expect the page to not crash and still have a valid title
    await expect(page).toHaveTitle(/Game Details - Tailspin Toys/);
  });

  test('should display pagination controls when there are multiple pages', async ({ page }) => {
    // Navigate to home page with smaller page size to ensure pagination
    await page.goto('/?page=1&per_page=6');
    
    // Wait for games to load
    await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });
    
    // Check that pagination controls are visible
    const paginationNav = page.locator('nav[aria-label="Pagination Navigation"]');
    await expect(paginationNav).toBeVisible();
    
    // Check that page buttons are present
    const pageButtons = page.locator('button[aria-label*="Go to page"]');
    await expect(pageButtons.first()).toBeVisible();
    
    // Check that next/previous buttons are present
    const nextButton = page.locator('button[aria-label="Go to next page"]');
    const prevButton = page.locator('button[aria-label="Go to previous page"]');
    await expect(nextButton).toBeVisible();
    await expect(prevButton).toBeVisible();
    
    // On first page, previous should be disabled
    await expect(prevButton).toBeDisabled();
    await expect(nextButton).toBeEnabled();
  });

  test('should navigate between pages correctly', async ({ page }) => {
    // Start on page 1 with 6 items per page
    await page.goto('/?page=1&per_page=6');
    await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });
    
    // Check we have 6 games on the first page
    const gameCards = page.locator('[data-testid="game-card"]');
    await expect(gameCards).toHaveCount(6);
    
    // Click next page
    const nextButton = page.locator('button[aria-label="Go to next page"]');
    await nextButton.click();
    
    // Wait for page to update
    await page.waitForTimeout(1000);
    
    // Verify URL changed to page 2
    await expect(page).toHaveURL('/?page=2&per_page=6');
    
    // Verify we still have 6 games on page 2
    await expect(gameCards).toHaveCount(6);
    
    // Previous button should now be enabled
    const prevButton = page.locator('button[aria-label="Go to previous page"]');
    await expect(prevButton).toBeEnabled();
  });

  test('should change items per page correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });
    
    // Find the per-page selector
    const perPageSelect = page.locator('select[aria-label="Number of games per page"]');
    await expect(perPageSelect).toBeVisible();
    
    // Change to 24 per page
    await perPageSelect.selectOption('24');
    
    // Wait for page to update
    await page.waitForTimeout(1000);
    
    // Verify URL updated
    await expect(page).toHaveURL('/?page=1&per_page=24');
    
    // With 21 total games and 24 per page, should see all games on one page
    const gameCards = page.locator('[data-testid="game-card"]');
    await expect(gameCards).toHaveCount(21);
    
    // Pagination should not be visible when all items fit on one page
    const paginationNav = page.locator('nav[aria-label="Pagination Navigation"]');
    await expect(paginationNav).not.toBeVisible();
  });

  test('should show correct results info', async ({ page }) => {
    await page.goto('/?page=1&per_page=6');
    await page.waitForSelector('[data-testid="games-grid"]', { timeout: 10000 });
    
    // Check the results info text
    const resultsInfo = page.locator('text=/Showing \\d+ to \\d+ of \\d+ games/');
    await expect(resultsInfo).toBeVisible();
    await expect(resultsInfo).toContainText('Showing 1 to 6 of 21 games');
    
    // Navigate to page 2
    const nextButton = page.locator('button[aria-label="Go to next page"]');
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Check updated results info
    await expect(resultsInfo).toContainText('Showing 7 to 12 of 21 games');
  });
});
