import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../../page-objects/TaskManagerPage';
import { TestUsers, TestTasks, AppUrls, ErrorMessages } from '../../test-data/testData';

test.describe('Task Creation Tests', () => {
  let taskManager: TaskManagerPage;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    
    await test.step('Login to application', async () => {
      await page.goto(AppUrls.login);
      await taskManager.login(TestUsers.admin.email, TestUsers.admin.password);
      await taskManager.verifyOnDashboard();
    });
  });

  test('Should create a new task with all fields', async ({ page }) => {
    let uniqueTaskTitle = '';
    
    await test.step('Fill all task fields and submit', async () => {
      uniqueTaskTitle = await taskManager.createTask(
        TestTasks.valid.title,
        TestTasks.valid.description,
        TestTasks.valid.dueDate,
        TestTasks.valid.priority
      );
    });
    
    await test.step('Verify task appears in the task list', async () => {
      await taskManager.verifyTaskExists(uniqueTaskTitle);
    });
    
    await test.step('Verify all task details are displayed correctly', async () => {
      const taskContainer = taskManager.getTaskContainer(uniqueTaskTitle);
      await expect(taskContainer.getByText(TestTasks.valid.description)).toBeVisible();
      await expect(taskContainer.getByText(TestTasks.valid.priority)).toBeVisible();
      await expect(taskContainer.getByText('2025-12-31')).toBeVisible();
    });
    
    await test.step('Clean up - delete created task', async () => {
      await taskManager.getDeleteButton(uniqueTaskTitle).click();
      await taskManager.confirmDeletion();
    });
  });

  test('Should create a task with only required title field', async ({ page }) => {
    let uniqueTaskTitle = '';
    
    await test.step('Create task with only title field', async () => {
      uniqueTaskTitle = await taskManager.createTask('Simple Task Title Only');
    });
    
    await test.step('Verify task appears in the task list', async () => {
      await taskManager.verifyTaskExists(uniqueTaskTitle);
    });
    
    await test.step('Clean up - delete created task', async () => {
      await taskManager.getDeleteButton(uniqueTaskTitle).click();
      await taskManager.confirmDeletion();
    });
  });

  test('Should create task with special characters in title', async ({ page }) => {
    let uniqueTaskTitle = '';
    
    await test.step('Create task with special characters', async () => {
      uniqueTaskTitle = await taskManager.createTask(
        TestTasks.specialChars.title,
        TestTasks.specialChars.description
      );
    });
    
    await test.step('Verify task with special characters is created properly', async () => {
      await taskManager.verifyTaskExists(uniqueTaskTitle);
    });
    
    await test.step('Clean up - delete created task', async () => {
      await taskManager.getDeleteButton(uniqueTaskTitle).click();
      await taskManager.confirmDeletion();
    });
  });

  test('Should show validation error for empty title', async ({ page }) => {
    await test.step('Try to create task without title', async () => {
      await taskManager.taskTitleInput().fill('');
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify HTML5 validation message for title field', async () => {
      const titleValidationMessage = await taskManager.taskTitleInput().evaluate(el => el.validationMessage);
      expect(titleValidationMessage).toBe(ErrorMessages.requiredField);
    });
    
    // await test.step('Verify task was not created', async () => {
    //   await expect(page.locator('text=""')).not.toBeVisible();
    // });
  });

  test('Should handle very long title input', async ({ page }) => {
    let uniqueTaskTitle = '';
    
    await test.step('Create task with extremely long title', async () => {
      uniqueTaskTitle = await taskManager.createTask(TestTasks.invalid.longTitle.title);
    });
    
    await test.step('Verify application handles long input gracefully', async () => {
      const isErrorShown = await page.locator('text=/too long|maximum|limit/i').isVisible();
      const isTaskCreated = await page.getByText(uniqueTaskTitle.substring(0, 50)).isVisible();
      
      expect(isErrorShown || isTaskCreated).toBeTruthy();
    });
    
    await test.step('Check for horizontal scroll white space issue', async () => {
      if (await page.getByText(uniqueTaskTitle.substring(0, 50)).isVisible()) {
        const hasWhiteSpace = await taskManager.checkHorizontalScrollWhiteSpace();
        if (hasWhiteSpace) {
          console.log('DESIGN ISSUE: Horizontal white space detected with long title');
        }
      }
    });
    
    await test.step('Clean up - delete created task if exists', async () => {
      if (await page.getByText(uniqueTaskTitle.substring(0, 20)).isVisible()) {
        await taskManager.getDeleteButton(uniqueTaskTitle).click();
        await taskManager.confirmDeletion();
      }
    });
  });

  test('Should show error for past due date', async ({ page }) => {
    await test.step('Try to create task with past due date using direct date input', async () => {
      await taskManager.taskTitleInput().fill(TestTasks.invalid.pastDueDate.title);
      await taskManager.taskDescriptionInput().fill(TestTasks.invalid.pastDueDate.description);
      // Use YYYY-MM-DD format for direct input
      await taskManager.taskDueDateInput().fill('2020-01-01'); // Past date
      await taskManager.submitButton().click();
    });
    
    await test.step('Verify error message for past due date', async () => {
      await expect(page.locator('text=/past|invalid.*date|date.*past|cannot.*past/i')).toBeVisible();
    });
  });
});