import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../../page-objects/TaskManagerPage';
import { TestUsers, TestTasks, AppUrls } from '../../test-data/testData';

test.describe('Task Delete Tests', () => {
  let taskManager: TaskManagerPage;
  let testTaskTitle: string;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    
    await test.step('Login to application', async () => {
      await page.goto(AppUrls.login);
      await taskManager.login(TestUsers.admin.email, TestUsers.admin.password);
      await taskManager.verifyOnDashboard();
    });
    
    await test.step('Create a task for deletion tests', async () => {
      testTaskTitle = await taskManager.createTask(
        TestTasks.forEdit.title,
        TestTasks.forEdit.description,
        TestTasks.forEdit.dueDate,
        TestTasks.forEdit.priority
      );
      await taskManager.verifyTaskExists(testTaskTitle);
    });
  });

  test('Should successfully delete task when confirming', async ({ page }) => {
    await test.step('Click delete button for the task', async () => {
      await taskManager.getDeleteButton(testTaskTitle).click();
    });
    
    const confirmText = page.getByText('Are you sure you want to delete this task?');
    let modalVisible = false;
    await test.step('Optionally verify delete confirmation modal appears', async () => {
      modalVisible = await confirmText.isVisible().catch(() => false);
      if (modalVisible) {
        await expect(confirmText).toBeVisible();
      }
    });
    
    await test.step('Confirm deletion', async () => {
      await taskManager.confirmDeletion();
    });
    
    await test.step('Wait for confirmation dialog to close (if modal)', async () => {
      if (modalVisible) {
        await expect(confirmText).toHaveCount(0);
      }
    });
    
    await test.step('Verify task is removed from the list', async () => {
      await taskManager.verifyTaskNotExists(testTaskTitle);
    });
  });

  test('Should cancel delete operation', async ({ page }) => {
    await test.step('Click delete button', async () => {
      await taskManager.getDeleteButton(testTaskTitle).click();
    });
    
    const confirmText = page.getByText('Are you sure you want to delete this task?');
    let modalVisible = false;
    await test.step('Optionally verify delete confirmation modal appears', async () => {
      modalVisible = await confirmText.isVisible().catch(() => false);
      if (modalVisible) {
        await expect(confirmText).toBeVisible();
      }
    });
    
    await test.step('Cancel deletion', async () => {
      if (modalVisible) {
        await taskManager.deleteCancelButton().click();
      } else {
        const dialog = await page.waitForEvent('dialog', { timeout: 1500 }).catch(() => undefined);
        if (dialog) await dialog.dismiss();
      }
    });
    
    await test.step('Wait for confirmation dialog to close (if modal)', async () => {
      if (modalVisible) {
        await expect(confirmText).toHaveCount(0);
      }
    });
    
    await test.step('Verify task still exists in the list', async () => {
      await taskManager.verifyTaskExists(testTaskTitle);
    });
  });

  test('Should delete multiple tasks independently', async ({ page }) => {
    let secondTaskTitle: string;
    
    await test.step('Create second task for deletion test', async () => {
      secondTaskTitle = await taskManager.createTask('Second Task for Deletion', 'Second task description');
    });
    
    let initialDeleteCount = 0;
    await test.step('Verify both tasks exist and capture initial delete count', async () => {
      await taskManager.verifyTaskExists(testTaskTitle);
      await taskManager.verifyTaskExists(secondTaskTitle);
      initialDeleteCount = await page.getByText('Delete').count();
    });
    
    await test.step('Delete first task', async () => {
      await taskManager.getDeleteButton(testTaskTitle).click();
      const confirmText = page.getByText('Are you sure you want to delete this task?');
      const modalVisible = await confirmText.isVisible().catch(() => false);
      if (modalVisible) {
        await expect(confirmText).toBeVisible();
      }
      await taskManager.confirmDeletion();
      if (modalVisible) {
        await expect(confirmText).toHaveCount(0);
      }
    });
    
    await test.step('Verify first task deleted, second task remains', async () => {
      const afterFirstDeleteCount = await page.getByText('Delete').count();
      expect(afterFirstDeleteCount).toBe(initialDeleteCount - 1);
      await taskManager.verifyTaskNotExists(testTaskTitle);
      await taskManager.verifyTaskExists(secondTaskTitle);
    });
    
    await test.step('Delete second task', async () => {
      await taskManager.getDeleteButton(secondTaskTitle).click();
      const confirmText = page.getByText('Are you sure you want to delete this task?');
      const modalVisible = await confirmText.isVisible().catch(() => false);
      if (modalVisible) {
        await expect(confirmText).toBeVisible();
      }
      await taskManager.confirmDeletion();
      if (modalVisible) {
        await expect(confirmText).toHaveCount(0);
      }
    });
    
    await test.step('Verify second task is also deleted', async () => {
      const afterSecondDeleteCount = await page.getByText('Delete').count();
      expect(afterSecondDeleteCount).toBe(initialDeleteCount - 2);
      await taskManager.verifyTaskNotExists(secondTaskTitle);
    });
  });
});