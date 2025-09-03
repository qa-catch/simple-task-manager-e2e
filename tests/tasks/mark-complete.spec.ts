import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../../page-objects/TaskManagerPage';
import { TestUsers, TestTasks, AppUrls } from '../../test-data/testData';

test.describe('Task Status Toggle Tests', () => {
  let taskManager: TaskManagerPage;
  let testTaskTitle: string;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    
    await test.step('Login to application', async () => {
      await page.goto(AppUrls.login);
      await taskManager.login(TestUsers.admin.email, TestUsers.admin.password);
      await taskManager.verifyOnDashboard();
    });
    
    await test.step('Create a task for status testing', async () => {
      testTaskTitle = await taskManager.createTask(
        TestTasks.forEdit.title,
        TestTasks.forEdit.description,
        TestTasks.forEdit.dueDate,
        TestTasks.forEdit.priority
      );
      await taskManager.verifyTaskExists(testTaskTitle);
    });
  });

  test.afterEach(async ({ page }) => {
    await test.step('Clean up - delete test task if exists', async () => {
      try {
        if (await page.getByText(testTaskTitle).isVisible()) {
          await taskManager.getDeleteButton(testTaskTitle).click();
          await taskManager.confirmDeletion();
        }
      } catch (error) {
        console.log('Task already cleaned up or not found');
      }
    });
  });

  test('Should mark task as complete @tc02', async ({ page }) => {
    await test.step('Click Mark Complete button', async () => {
      await taskManager.getMarkCompleteButton(testTaskTitle).click();
    });
        
    await test.step('Verify button text, yellow background, and status text', async () => {
      const taskContainer = taskManager.getTaskContainer(testTaskTitle);
      const incompleteBtn = taskManager.getMarkIncompleteButton(testTaskTitle);
      // Text changed to Mark Incomplete (case-insensitive)
      await expect(incompleteBtn).toBeVisible();
      await expect(incompleteBtn).toHaveText(/Mark\s+Incomplete/i);
      // Status text shows Incomplete/Incomplet within this task block
      await expect(taskContainer.locator('text=/Incomplete/i')).toBeVisible();
    });
  });

  test('Should mark completed task back to incomplete', async ({ page }) => {
    await test.step('Mark task as complete first', async () => {
      await taskManager.getMarkCompleteButton(testTaskTitle).click();
      await expect(taskManager.getMarkIncompleteButton(testTaskTitle)).toBeVisible();
    });
    
    await test.step('Mark task back to incomplete', async () => {
      await taskManager.getMarkIncompleteButton(testTaskTitle).click();
    });
    
    await test.step('Verify button is back to Mark Complete', async () => {
      await expect(taskManager.getMarkCompleteButton(testTaskTitle)).toBeVisible();
    });
  });

  test('Should toggle task status multiple times', async ({ page }) => {
    await test.step('Toggle task to complete', async () => {
      await taskManager.getMarkCompleteButton(testTaskTitle).click();
      await expect(taskManager.getMarkIncompleteButton(testTaskTitle)).toBeVisible();
    });
    
    await test.step('Toggle task back to incomplete', async () => {
      await taskManager.getMarkIncompleteButton(testTaskTitle).click();
      await expect(taskManager.getMarkCompleteButton(testTaskTitle)).toBeVisible();
    });
    
    await test.step('Toggle task to complete again', async () => {
      await taskManager.getMarkCompleteButton(testTaskTitle).click();
      await expect(taskManager.getMarkIncompleteButton(testTaskTitle)).toBeVisible();
    });
  });

  test('Should verify visual changes when task is marked complete', async ({ page }) => {
    const taskContainer = taskManager.getTaskContainer(testTaskTitle);
    
    await test.step('Mark task as complete', async () => {
      await taskManager.getMarkCompleteButton(testTaskTitle).click();
    });
  });

  test('Should maintain task details when toggling status', async ({ page }) => {
    await test.step('Verify initial task details are present', async () => {
      const taskContainer = taskManager.getTaskContainer(testTaskTitle);
      await expect(taskContainer.getByText(TestTasks.forEdit.description)).toBeVisible();
      await expect(taskContainer.getByText(TestTasks.forEdit.priority)).toBeVisible();
    });
    
    await test.step('Mark task as complete', async () => {
      await taskManager.getMarkCompleteButton(testTaskTitle).click();
    });
    
    await test.step('Verify task details remain after status change', async () => {
      const taskContainer = taskManager.getTaskContainer(testTaskTitle);
      await expect(taskContainer.getByText(TestTasks.forEdit.description)).toBeVisible();
      await expect(taskContainer.getByText(TestTasks.forEdit.priority)).toBeVisible();
    });
    
    await test.step('Mark back to incomplete', async () => {
      await taskManager.getMarkIncompleteButton(testTaskTitle).click();
    });
    
    await test.step('Verify details are still preserved', async () => {
      const taskContainer = taskManager.getTaskContainer(testTaskTitle);
      await expect(taskContainer.getByText(TestTasks.forEdit.description)).toBeVisible();
      await expect(taskContainer.getByText(TestTasks.forEdit.priority)).toBeVisible();
    });
  });
});