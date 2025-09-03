import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../../page-objects/TaskManagerPage';
import { AppUrls, ErrorMessages, TestUsers } from '../../test-data/testData';

test.describe('User Registration Tests', () => {
  let taskManager: TaskManagerPage;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    
    await test.step('Navigate to the login page', async () => {
      await page.goto(AppUrls.login);
    });
  });

  test('Should successfully register a new user', async ({ page }) => {
    await test.step('Navigate to sign up page', async () => {
      await taskManager.signUpLink().click();
    });
    
    await test.step('Fill registration form with valid data', async () => {
      await taskManager.signUp(
        TestUsers.newUser.username,
        TestUsers.newUser.email,
        TestUsers.newUser.password
      );
    });
    
    await test.step('Verify success message appears', async () => {
      await taskManager.verifyErrorMessage('successfully');
    });
    
    await test.step('Verify redirect to login page', async () => {
      await taskManager.verifyOnLoginPage();
    });
  });

  test('Should show validation error for empty username', async ({ page }) => {
    await test.step('Navigate to sign up page', async () => {
      await taskManager.signUpLink().click();
    });
    
    await test.step('Try to register with empty username field', async () => {
      await taskManager.usernameInput().fill('');
      await taskManager.emailInput().fill(TestUsers.newUser.email);
      await taskManager.passwordInput().fill(TestUsers.newUser.password);
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify HTML5 validation message for username field', async () => {
      const usernameValidationMessage = await taskManager.usernameInput().evaluate(el => el.validationMessage);
      expect(usernameValidationMessage).toBe(ErrorMessages.requiredField);
    });
  });

  test('Should show validation error for invalid email format', async ({ page }) => {
    await test.step('Navigate to sign up page', async () => {
      await taskManager.signUpLink().click();
    });
    
    await test.step('Try to register with invalid email format', async () => {
      await taskManager.usernameInput().fill(TestUsers.newUser.username);
      await taskManager.emailInput().fill('invalid-email'); // Invalid email format
      await taskManager.passwordInput().fill(TestUsers.newUser.password);
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify HTML5 validation message for email format', async () => {
      const emailValidationMessage = await taskManager.emailInput().evaluate(el => el.validationMessage);
      expect(emailValidationMessage).toContain("Please include an '@' in the email address");
      expect(emailValidationMessage).toContain("'invalid-email' is missing an '@'");
    });
  });

  test('Should show validation error for weak password', async ({ page }) => {
    await test.step('Navigate to sign up page', async () => {
      await taskManager.signUpLink().click();
    });
    
    await test.step('Try to register with weak password', async () => {
      await taskManager.signUp(
        TestUsers.newUser.username,
        TestUsers.newUser.email,
        '123' // Weak password
      );
    });
    
    await test.step('Verify password validation error appears', async () => {
      await expect(page.getByText(ErrorMessages.passwordTooShort)).toBeVisible();
    });
  });
});