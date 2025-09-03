import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../../page-objects/TaskManagerPage';
import { TestUsers, TestTasks, AppUrls, ErrorMessages } from '../../test-data/testData';

test.describe('Task Edit Tests', () => {
  let taskManager: TaskManagerPage;
  let testTaskTitle: string;

  test.beforeEach(async ({ page }) => {
    taskManager = new TaskManagerPage(page);
    
    await test.step('Login to application', async () => {
      await page.goto(AppUrls.login);
      await taskManager.login(TestUsers.admin.email, TestUsers.admin.password);
      await taskManager.verifyOnDashboard();
    });
    
    await test.step('Create a task for editing tests', async () => {
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

  test('Should successfully edit all task fields', async ({ page }) => {
    await test.step('Open edit modal for the task', async () => {
      await taskManager.getEditButton(testTaskTitle).click();
    });
    
    await test.step('Verify edit modal is open', async () => {
      await expect(taskManager.editModalTitle()).toBeVisible();
    });
    
    await test.step('Update all task fields', async () => {
      await taskManager.editTask(
        TestTasks.updated.title,
        TestTasks.updated.description,
        TestTasks.updated.dueDate,
        TestTasks.updated.priority
      );
    });
    
    await test.step('Verify old task title no longer exists', async () => {
      await taskManager.verifyTaskNotExists(testTaskTitle);
    });
    
    await test.step('Verify updated task details are displayed (dynamic verification)', async () => {
      const taskId = testTaskTitle.split(' ').pop(); // Get the ID from original title
      const updatedTitle = `${TestTasks.updated.title} ${taskId}`;
      
      // Dynamic verification with actual data
      await taskManager.verifyTaskWithDetails(
        updatedTitle,
        TestTasks.updated.description,
        TestTasks.updated.priority
      );

      // Update reference for subsequent steps & cleanup
      testTaskTitle = updatedTitle;
    });
  });

  test('Should edit only task title @TC01', async ({ page }) => {
    const newTitle = 'Updated Title Only';
    
    await test.step('Open edit modal', async () => {
      await taskManager.getEditButton(testTaskTitle).click();
    });
    
    await test.step('Update only the title field', async () => {
      await taskManager.editTask(newTitle);
    });
    
    await test.step('Verify title was updated', async () => {
      const taskId = testTaskTitle.split(' ').pop(); // Get the ID from original title
      const updatedTitle = `${newTitle} ${taskId}`;
      await taskManager.verifyTaskExists(updatedTitle);
      // Update reference for subsequent steps & cleanup
      testTaskTitle = updatedTitle;
    });
    
    await test.step('Verify other fields remain unchanged', async () => {
      const container = taskManager.getTaskContainer(testTaskTitle);
      await expect(container.getByText(TestTasks.forEdit.description)).toBeVisible();
    });
  });

  test('Should cancel edit without saving changes', async ({ page }) => {
    await test.step('Open edit modal', async () => {
      await taskManager.getEditButton(testTaskTitle).click();
    });
    
    await test.step('Make changes but cancel without saving', async () => {
      await taskManager.editTitleInput().clear();
      await taskManager.editTitleInput().fill('This should not be saved');
      await taskManager.cancelButton().click();
    });
    
    await test.step('Verify original task title still exists', async () => {
      await taskManager.verifyTaskExists(testTaskTitle);
    });
    
    await test.step('Verify changes were not saved', async () => {
      await expect(page.getByText('This should not be saved')).not.toBeVisible();
    });
  });

  test('Should show validation error when editing title to empty', async ({ page }) => {
    await test.step('Open edit modal', async () => {
      await taskManager.getEditButton(testTaskTitle).click();
    });
    
    await test.step('Clear title field and try to save', async () => {
      await taskManager.editTitleInput().clear();
      await taskManager.clickSaveChanges();
    });
    
    await test.step('Verify HTML5 validation message for edit title field', async () => {
      const titleValidationMessage = await taskManager.editTitleInput().evaluate(el => el.validationMessage);
      expect(titleValidationMessage).toBe(ErrorMessages.requiredField);
    });
    
    await test.step('Verify modal remains open', async () => {
      await expect(taskManager.editTitleInput()).toBeVisible();
    });

    await test.step('Close modal with Close button', async () => {
      await taskManager.closeModalButton().click();
    });

    await test.step('Verify redirect to dashboard and task unchanged', async () => {
      await expect(page).toHaveURL(AppUrls.dashboard);
      await taskManager.verifyTaskExists(testTaskTitle);
    });
  });

});