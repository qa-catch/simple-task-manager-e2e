import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../../page-objects/TaskManagerPage';
import { TestUsers, AppUrls, ErrorMessages } from '../../test-data/testData';

test.describe('Login Validation Edge Cases Tests', () => {
  let taskManager: TaskManagerPage;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    
    await test.step('Navigate to login page', async () => {
      await page.goto(AppUrls.login);
    });
  });

  test('Should show HTML5 validation for invalid email format', async ({ page }) => {
    await test.step('Fill email with invalid format and password', async () => {
      await taskManager.emailInput().fill('invalid-email');
      await taskManager.passwordInput().fill(TestUsers.admin.password);
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify HTML5 validation message for invalid email format', async () => {
      const emailValidationMessage = await taskManager.emailInput().evaluate(el => el.validationMessage);
      expect(emailValidationMessage).toBe("Please include an '@' in the email address. 'invalid-email' is missing an '@'.");
    });
  });

  test('Should show HTML5 validation for empty email field', async ({ page }) => {
    await test.step('Leave email empty and fill password', async () => {
      await taskManager.emailInput().fill('');
      await taskManager.passwordInput().fill(TestUsers.admin.password);
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify HTML5 validation message for empty email', async () => {
      const emailValidationMessage = await taskManager.emailInput().evaluate(el => el.validationMessage);
      expect(emailValidationMessage).toBe(ErrorMessages.requiredField);
    });
  });

  test('Should show HTML5 validation for empty password field', async ({ page }) => {
    await test.step('Fill email and leave password empty', async () => {
      await taskManager.emailInput().fill(TestUsers.admin.email);
      await taskManager.passwordInput().fill('');
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify HTML5 validation message for empty password', async () => {
      const passwordValidationMessage = await taskManager.passwordInput().evaluate(el => el.validationMessage);
      expect(passwordValidationMessage).toBe(ErrorMessages.requiredField);
    });
  });

  test('Should show HTML5 validation for both empty fields', async ({ page }) => {
    await test.step('Leave both fields empty and submit', async () => {
      await taskManager.emailInput().fill('');
      await taskManager.passwordInput().fill('');
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify HTML5 validation message for first empty field', async () => {
      const emailValidationMessage = await taskManager.emailInput().evaluate(el => el.validationMessage);
      expect(emailValidationMessage).toBe(ErrorMessages.requiredField);
    });
  });
});