import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../../page-objects/TaskManagerPage';
import { TestUsers, AppUrls } from '../../test-data/testData';

test.describe('User Logout Tests', () => {
  let taskManager: TaskManagerPage;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    
    await test.step('Navigate and login to application', async () => {
      await page.goto(AppUrls.login);
      await taskManager.login(TestUsers.admin.email, TestUsers.admin.password);
      await taskManager.verifyOnDashboard();
    });
  });

  test('Should successfully logout user', async ({ page }) => {
    await test.step('Perform logout action', async () => {
      await taskManager.logout();
    });
    
    await test.step('Verify redirect to login page', async () => {
      await taskManager.verifyOnHomePage();
    });
    
  });

  test('Should show navbar toggle before logout', async ({ page }) => {
    await test.step('Verify navbar toggle button is visible', async () => {
      await expect(taskManager.navbarToggle()).toBeVisible();
    });
    
    await test.step('Click navbar toggle to reveal logout option', async () => {
      await taskManager.navbarToggle().click();
    });
    
    await test.step('Verify logout button becomes visible', async () => {
      await expect(taskManager.logoutButton()).toBeVisible();
    });
  });
});