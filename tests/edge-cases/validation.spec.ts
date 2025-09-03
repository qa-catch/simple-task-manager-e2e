import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../../page-objects/TaskManagerPage';
import { TestUsers, TestTasks, AppUrls, ErrorMessages } from '../../test-data/testData';

test.describe('Edge Cases and Validation Tests', () => {
  let taskManager: TaskManagerPage;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    
    await test.step('Login to application', async () => {
      await page.goto(AppUrls.login);
      await taskManager.login(TestUsers.admin.email, TestUsers.admin.password);
      await taskManager.verifyOnDashboard();
    });
  });

  test('Should handle special characters in task fields', async ({ page }) => {
    let uniqueTaskTitle = '';
    
    await test.step('Create task with special characters and HTML-like content', async () => {
      uniqueTaskTitle = await taskManager.createTask(
        TestTasks.specialChars.title,
        TestTasks.specialChars.description
      );
    });
    
    await test.step('Verify task is created and special characters are properly escaped', async () => {
      const taskContainer = taskManager.getTaskContainer(uniqueTaskTitle);
      await expect(taskContainer).toBeVisible();
      await taskManager.verifyTaskWithDetails(
        uniqueTaskTitle,
        TestTasks.specialChars.description,
        'Medium'
      );
    });
    
    await test.step('Ensure no JavaScript injection occurred', async () => {
      // Scope the script check to the created task container to avoid counting app scripts
      const taskContainer = taskManager.getTaskContainer(uniqueTaskTitle);
      await expect(taskContainer.locator('script')).toHaveCount(0);
    });
    
    await test.step('Clean up - delete created task', async () => {
      await taskManager.getDeleteButton(uniqueTaskTitle).click();
      await taskManager.confirmDeletion();
    });
  });

  test('Should handle extremely long input in description field', async ({ page }) => {
    const longDescription = 'A'.repeat(1000);
    let uniqueTaskTitle = '';
    
    await test.step('Create task with very long description', async () => {
      uniqueTaskTitle = await taskManager.createTask('Long Description Test', longDescription);
    });
    
    await test.step('Verify task is created', async () => {
      const taskContainer = taskManager.getTaskContainer(uniqueTaskTitle);
      await expect(taskContainer).toBeVisible();
    });
    
    // CORRECTED: Use the new method that properly searches within task container
    await test.step('Verify application handles long text appropriately', async () => {
      await taskManager.verifyTaskLongDescription(uniqueTaskTitle, longDescription);
    });
    
    await test.step('Clean up - delete created task', async () => {
      await taskManager.getDeleteButton(uniqueTaskTitle).click();
      await taskManager.confirmDeletion();
    });
  });

  test('Should handle priority dropdown edge cases', async ({ page }) => {
    await test.step('Start creating task and access priority dropdown', async () => {
      await taskManager.taskTitleInput().fill('Priority Test');
      await taskManager.taskPrioritySelect().click();
    });
    
    await test.step('Verify all priority options are available', async () => {
      await expect(page.locator('option[value="High"], option[value="Medium"], option[value="Low"]')).toHaveCount(3);
    });
    
    await test.step('Test selecting each priority option', async () => {
      await taskManager.taskPrioritySelect().selectOption('High');
      await taskManager.taskPrioritySelect().selectOption('Medium');
      await taskManager.taskPrioritySelect().selectOption('Low');
    });
  });

  test('Should prevent task creation with only whitespace in title', async ({ page }) => {
    await test.step('Try to create task with whitespace-only title', async () => {
      await taskManager.taskTitleInput().fill('   '); // Only whitespace
      // Don't click submit yet - validation method will handle it
    });
    
    await test.step('Verify HTML5 validation prevents submission', async () => {
      // Use the enhanced validation verification method
      await taskManager.verifyFieldValidationMessage(taskManager.taskTitleInput(), ErrorMessages.requiredField);
    });
    
    await test.step('Verify task was not created', async () => {
      // Verify no task with whitespace title exists
      const whitespaceTaskExists = await page.getByText('   ').count();
      expect(whitespaceTaskExists).toBe(0);
    });
  });

  test('Should handle rapid successive task operations', async ({ page }) => {
    const taskTitles = ['Quick Task 1', 'Quick Task 2', 'Quick Task 3'];
    const createdTaskTitles: string[] = [];
    
    await test.step('Quickly create multiple tasks', async () => {
      for (const title of taskTitles) {
        const uniqueTitle = await taskManager.createTask(title);
        createdTaskTitles.push(uniqueTitle);
        await page.waitForTimeout(500); // Small delay for UI updates
      }
    });
    
    await test.step('Verify all tasks were created successfully', async () => {
      for (const title of createdTaskTitles) {
        const taskContainer = taskManager.getTaskContainer(title);
        await expect(taskContainer).toBeVisible();
      }
    });
    
    // CORRECTED: Use the improved deletion method with better error handling
    await test.step('Quickly delete all tasks', async () => {
      await taskManager.deleteTasksByTitles(createdTaskTitles);
    });
    
    await test.step('Verify all tasks were deleted', async () => {
      for (const title of createdTaskTitles) {
        await taskManager.verifyTaskNotExists(title);
      }
    });
  });

  test('Should handle browser refresh on dashboard', async ({ page }) => {
    let uniqueTaskTitle = '';
    
    await test.step('Create a task for persistence test', async () => {
      uniqueTaskTitle = await taskManager.createTask('Persistence Test', 'Testing data persistence');
      await taskManager.verifyTaskExists(uniqueTaskTitle);
    });
    
    await test.step('Refresh the browser page', async () => {
      await page.reload();
    });
    
    await test.step('Verify user stays logged in and task persists', async () => {
      await taskManager.verifyOnDashboard();
      await taskManager.verifyTaskExists(uniqueTaskTitle);
    });
    
    await test.step('Clean up - delete persisted task', async () => {
      await taskManager.getDeleteButton(uniqueTaskTitle).click();
      await taskManager.confirmDeletion();
    });
  });
});