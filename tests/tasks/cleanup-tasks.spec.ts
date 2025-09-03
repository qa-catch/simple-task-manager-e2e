import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../../page-objects/TaskManagerPage';
import { TestUsers, AppUrls } from '../../test-data/testData';

test.describe('Task Cleanup Tests', () => {
  let taskManager: TaskManagerPage;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    
    await test.step('Login to application', async () => {
      await page.goto(AppUrls.login);
      await taskManager.login(TestUsers.admin.email, TestUsers.admin.password);
      await taskManager.verifyOnDashboard();
    });
  });

  test('Should delete all existing tasks for cleanup', async ({ page }) => {
    await test.step('Check if any tasks exist on dashboard', async () => {
      const deleteButtons = page.getByText('Delete');
      const taskCount = await deleteButtons.count();
      
      if (taskCount > 0) {
        console.log(`Found ${taskCount} tasks to cleanup`);
      } else {
        console.log('No tasks found to cleanup');
      }
    });
    
    await test.step('Delete all existing tasks', async () => {
      await taskManager.deleteAllTasks();
    });
    
    await test.step('Verify all tasks have been removed', async () => {
      const remainingDeleteButtons = page.getByText('Delete');
      await expect(remainingDeleteButtons).toHaveCount(0);
      console.log('All tasks successfully cleaned up');
    });
  });
});