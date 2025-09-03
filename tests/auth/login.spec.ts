import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../../page-objects/TaskManagerPage';
import { TestUsers, AppUrls, ErrorMessages } from '../../test-data/testData';

test.describe('User Login Tests', () => {
  let taskManager: TaskManagerPage;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    
    await test.step('Navigate to login page', async () => {
      await page.goto(AppUrls.login);
    });
  });

  test('Should successfully login with valid credentials', async ({ page }) => {
    await test.step('Enter valid login credentials', async () => {
      await taskManager.login(TestUsers.admin.email, TestUsers.admin.password);
    });
    
    await test.step('Verify successful redirect to dashboard', async () => {
      await taskManager.verifyOnDashboard();
    });
    
    await test.step('Verify correct dashboard URL', async () => {
      await expect(page).toHaveURL(AppUrls.dashboard);
    });
  });

  test('Should show error message with invalid email', async ({ page }) => {
    await test.step('Attempt login with invalid email', async () => {
      await taskManager.login(TestUsers.invalid.email, TestUsers.admin.password);
    });
    
    await test.step('Verify error message is displayed', async () => {
      await expect(page.locator('text=/invalid|incorrect|error/i')).toBeVisible();
    });
    
    await test.step('Verify user remains on login page', async () => {
      await taskManager.verifyOnLoginPage();
    });
  });

  test('Should show error message with invalid password', async ({ page }) => {
    await test.step('Attempt login with invalid password', async () => {
      await taskManager.login(TestUsers.admin.email, TestUsers.invalid.password);
    });
    
    await test.step('Verify error message is displayed', async () => {
      await expect(page.locator('text=/invalid|incorrect|wrong|password/i')).toBeVisible();
    });
    
    await test.step('Verify user remains on login page', async () => {
      await taskManager.verifyOnLoginPage();
    });
  });

  test('Should show validation error for empty email', async ({ page }) => {
    await test.step('Attempt login with empty email field', async () => {
      await taskManager.emailInput().fill('');
      await taskManager.passwordInput().fill(TestUsers.admin.password);
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify HTML5 validation message for email field', async () => {
      const emailValidationMessage = await taskManager.emailInput().evaluate(el => el.validationMessage);
      expect(emailValidationMessage).toBe(ErrorMessages.requiredField);
    });
    
    await test.step('Verify user remains on login page', async () => {
      await taskManager.verifyOnLoginPage();
    });
  });

  test('Should show validation error for empty password', async ({ page }) => {
    await test.step('Attempt login with empty password field', async () => {
      await taskManager.emailInput().fill(TestUsers.admin.email);
      await taskManager.passwordInput().fill('');
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify HTML5 validation message for password field', async () => {
      const passwordValidationMessage = await taskManager.passwordInput().evaluate(el => el.validationMessage);
      expect(passwordValidationMessage).toBe(ErrorMessages.requiredField);
    });
    
    await test.step('Verify user remains on login page', async () => {
      await taskManager.verifyOnLoginPage();
    });
  });

  test('Should show validation error for both empty fields', async ({ page }) => {
    await test.step('Attempt login with both empty fields', async () => {
      await taskManager.emailInput().fill('');
      await taskManager.passwordInput().fill('');
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify HTML5 validation message appears', async () => {
      const emailValidationMessage = await taskManager.emailInput().evaluate(el => el.validationMessage);
      expect(emailValidationMessage).toBe(ErrorMessages.requiredField);
    });
    
    await test.step('Verify user remains on login page', async () => {
      await taskManager.verifyOnLoginPage();
    });
  });
});