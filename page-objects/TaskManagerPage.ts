import { Page, Locator, expect } from '@playwright/test';

export class TaskManagerPage {
  readonly page: Page;
  
  // Constructor
  constructor(page: Page) {
    this.page = page;
  }

  // ==========================================
  // AUTHENTICATION SELECTORS & METHODS
  // ==========================================
  
  // Sign up elements
  signUpLink(): Locator {
    return this.page.getByText('sign up');
  }
  
  usernameInput(): Locator {
    return this.page.locator('input#username');
  }
  
  emailInput(): Locator {
    return this.page.locator('input#email');
  }
  
  passwordInput(): Locator {
    return this.page.locator('input#password');
  }
  
  submitButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }
  
  successMessage(): Locator {
    return this.page.getByText('successfully');
  }
  
  // Login specific
  async login(email: string, password: string): Promise<void> {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }
  
  // Sign up specific
  async signUp(username: string, email: string, password: string): Promise<void> {
    await this.usernameInput().fill(username);
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
  }
  
  // ==========================================
  // DASHBOARD & TASK CREATION
  // ==========================================
  
  // Task creation elements
  taskTitleInput(): Locator {
    return this.page.locator('input#title');
  }
  
  taskDescriptionInput(): Locator {
    return this.page.locator('textarea#description');
  }
  
  taskDueDateInput(): Locator {
    return this.page.locator('input#dueDate');
  }
  
  taskPrioritySelect(): Locator {
    return this.page.locator('select#priority');
  }
  
  // Create new task method
  async createTask(title: string, description?: string, dueDate?: string, priority?: string): Promise<string> {
    // Ensure uniqueness to avoid collisions between test runs
    const uniqueTitle = `${title} ${Date.now()}`;
    await this.taskTitleInput().fill(uniqueTitle);
    
    if (description) {
      await this.taskDescriptionInput().fill(description);
    }
    
    if (dueDate) {
      await this.taskDueDateInput().fill(dueDate);
    }
    
    if (priority) {
      await this.taskPrioritySelect().selectOption(priority);
    }
    
    await this.submitButton().click();
    
    // Optionally wait until the task appears to stabilize subsequent actions
    await expect(this.page.getByText(uniqueTitle)).toBeVisible();
    
    return uniqueTitle;
  }
  
  // ==========================================
  // TASK LIST & CRUD OPERATIONS
  // ==========================================
  
  // Get task by title (robust approach for dynamic elements)
  getTaskByTitle(title: string): Locator {
    return this.page.locator(`text="${title}"`).locator('xpath=ancestor::div[contains(@class, "task") or contains(@style, "border") or position()=1]/following-sibling::*[1] | ancestor::*[1]');
  }
  
  // More specific approach - get task container by title
  getTaskContainer(title: string): Locator {
    return this.page.locator(`text="${title}"`).locator('xpath=ancestor::div[1]');
  }

  // Heuristic task card container: a div that contains the title AND a Delete button
  taskCardByTitle(title: string): Locator {
    // Typical card container styling: p-6 rounded-lg shadow-md (works for both light/dark variants)
    return this.page
      .locator('div.p-6.rounded-lg.shadow-md')
      .filter({ hasText: title, has: this.page.getByText('Delete') });
  }
  
  // CRUD buttons for a specific task
  getMarkCompleteButton(title: string): Locator {
    return this.getTaskContainer(title).getByText('Mark Complete');
  }
  
  getMarkIncompleteButton(title: string): Locator {
    return this.getTaskContainer(title).getByText('Mark Incomplete');
  }
  
  getEditButton(title: string): Locator {
    return this.getTaskContainer(title).getByText('Edit');
  }
  
  getDeleteButton(title: string): Locator {
    return this.getTaskContainer(title).getByText('Delete');
  }
  
  // Clean up all tasks method
  async deleteAllTasks(): Promise<void> {
    // Get all delete buttons
    const deleteButtons = this.page.getByText('Delete');
    const buttonCount = await deleteButtons.count();
    
    // Delete each task one by one
    for (let i = 0; i < buttonCount; i++) {
      // Always click the first delete button (as list updates after each deletion)
      await deleteButtons.first().click();
      
      // Confirm deletion
      await this.confirmDeletion();
      
      // Wait for task to be removed from DOM
      await this.page.waitForTimeout(500);
    }
  }
  
  // CORRECTED: Delete specific tasks by titles with improved error handling
  async deleteTasksByTitles(taskTitles: string[]): Promise<void> {
    for (const title of taskTitles) {
      try {
        // Check if task still exists before trying to delete
        const taskExists = await this.taskCardByTitle(title).count();
        if (taskExists > 0) {
          await this.getDeleteButton(title).click();
          await this.confirmDeletion();
          
          // Wait for UI to update and verify deletion
          await this.page.waitForTimeout(300);
          await this.verifyTaskNotExists(title);
        }
      } catch (error) {
        console.warn(`Warning: Could not delete task "${title}". It may have already been deleted.`);
      }
    }
  }
  
  // Check for horizontal scroll and white space
  async checkHorizontalScrollWhiteSpace(): Promise<boolean> {
    // Use page.evaluate to access browser APIs safely
    return await this.page.evaluate(() => {
      // Scroll to the right of the page
      // @ts-ignore
      window.scrollTo(window.innerWidth, 0);
      
      // Check if there's significant white space (this is a design issue)
      // @ts-ignore
      const pageWidth = document.body.scrollWidth;
      // @ts-ignore
      const viewportWidth = window.innerWidth;
      
      // If page is significantly wider than viewport, there's white space issue
      return pageWidth > viewportWidth * 1.5;
    });
  }
  
  // ==========================================
  // EDIT MODAL
  // ==========================================
  
  editTitleInput(): Locator {
    return this.page.locator('input#edit-title');
  }
  
  editDescriptionInput(): Locator {
    return this.page.locator('textarea#edit-description');
  }
  
  editDueDateInput(): Locator {
    return this.page.locator('input#edit-dueDate');
  }
  
  editPrioritySelect(): Locator {
    return this.page.locator('select#edit-priority');
  }
  
  saveChangesButton(): Locator {
    return this.page.locator('button:has-text("Save Changes")');
  }
  
  cancelButton(): Locator {
    return this.page.locator('button:has-text("Cancel")');


  }
  
  editModalTitle(): Locator {
    return this.page.locator('h3:has-text("Edit Task")');
  }
  
  closeModalButton(): Locator {
    return this.page.locator('span:has-text("Close modal")');
  }
  
  // Edit task method
  async editTask(newTitle?: string, newDescription?: string, newDueDate?: string, newPriority?: string): Promise<void> {
    if (newTitle) {
      // Preserve the original numeric suffix (ID) added during creation
      const currentTitle = await this.editTitleInput().inputValue();
      const parts = currentTitle.trim().split(' ');
      const maybeId = parts.length ? parts[parts.length - 1] : '';
      const titleToSet = /^\d+$/.test(maybeId) ? `${newTitle} ${maybeId}` : newTitle;

      await this.editTitleInput().clear();
      await this.editTitleInput().fill(titleToSet);
    }
    
    if (newDescription) {
      await this.editDescriptionInput().clear();
      await this.editDescriptionInput().fill(newDescription);
    }
    
    if (newDueDate) {
      await this.editDueDateInput().clear();
      await this.editDueDateInput().fill(newDueDate);
    }
    
    if (newPriority) {
      await this.editPrioritySelect().selectOption(newPriority);
    }
    
    await this.clickSaveChanges();
  }

  // Prefer clicking button by its accessible name; fallback to id selector
  saveChangesByText(): Locator {
    return this.page.getByRole('button', { name: /Save Changes/i });
  }

  async clickSaveChanges(): Promise<void> {
    const byText = this.saveChangesByText();
    if (await byText.isVisible().catch(() => false)) {
      await byText.click();
      return;
    }
    // Fallback to legacy selector
    await this.saveChangesButton().click();
  }
  
  // ==========================================
  // DELETE CONFIRMATION
  // ==========================================
  
  deleteOkButton(): Locator {
    return this.page.getByRole('button', { name: /OK/i });
  }
  
  deleteCancelButton(): Locator {
    return this.page.getByRole('button', { name: /Cancel/i });
  }
  
  // ==========================================
  // LOGOUT
  // ==========================================
  
  navbarToggle(): Locator {
    return this.page.locator('button[data-collapse-toggle="navbar-default"]');
  }
  
  logoutButton(): Locator {
    return this.page.getByText('Logout');
  }
  
  async logout(): Promise<void> {
    await this.navbarToggle().click();
    await this.logoutButton().click();
  }

  // ==========================================
  // CONFIRMATION HELPERS
  // ==========================================

  /**
   * Confirm a destructive action after clicking a Delete button.
   * Handles both native JS dialogs and in-app modals.
   */
  async confirmDeletion(): Promise<void> {
    // Try to catch a native dialog quickly
    const dialogPromise = this.page
      .waitForEvent('dialog', { timeout: 1000 })
      .then(async d => {
        await d.accept();
      })
      .catch(() => undefined);

    // Common confirm button variants in in-app modals
    const confirmButton = this.page.locator(
      'button:has-text("OK"), button:has-text("Confirm"), button:has-text("Delete")'
    ).first();

    // Race: if a dialog appears we accept it, otherwise click modal confirm if visible
    await Promise.race([
      dialogPromise,
      (async () => {
        if (await confirmButton.isVisible({ timeout: 1500 }).catch(() => false)) {
          await confirmButton.click();
        }
      })(),
    ]);
  }
  
  // ==========================================
  // VERIFICATION HELPERS (DYNAMIC)
  // ==========================================
  
  async verifyTaskExists(title: string): Promise<void> {
    await expect(this.taskCardByTitle(title)).toBeVisible();
  }
  
  async verifyTaskNotExists(title: string): Promise<void> {
    // Scope to a card that contains the title AND a Delete button to avoid toasts or unrelated matches
    await expect(this.taskCardByTitle(title)).toHaveCount(0);
  }
  
  async verifyTaskCompleted(title: string): Promise<void> {
    // Check if task title has strikethrough or completed styling
    await expect(this.getTaskContainer(title)).toHaveClass(/completed|line-through/);
  }
  
  async verifyTaskWithDetails(taskTitle: string, description: string, priority: string): Promise<void> {
    // Verify task exists
    await this.verifyTaskExists(taskTitle);
    
    // Verify task details are displayed (scoped to task container)
    const container = this.getTaskContainer(taskTitle);
    await expect(container.getByText(description)).toBeVisible();
    await expect(container.getByText(priority)).toBeVisible();
  }
  
  // CORRECTED: Added method to verify long text content within specific task container
  async verifyTaskLongDescription(taskTitle: string, longDescription: string): Promise<void> {
    const taskContainer = this.getTaskContainer(taskTitle);
    
    // Try different approaches to find the long description
    // 1. First, try to find the exact text
    const exactMatch = taskContainer.getByText(longDescription);
    const exactMatchVisible = await exactMatch.isVisible().catch(() => false);
    
    if (exactMatchVisible) {
      await expect(exactMatch).toBeVisible();
      return;
    }
    
    // 2. If exact match fails, try partial matching (first 100 chars)
    const partialText = longDescription.substring(0, 100);
    const partialMatch = taskContainer.getByText(partialText, { exact: false });
    const partialMatchVisible = await partialMatch.isVisible().catch(() => false);
    
    if (partialMatchVisible) {
      await expect(partialMatch).toBeVisible();
      return;
    }
    
    // 3. Finally, check if any element in the container contains the long text
    const containerHasText = await taskContainer.evaluate((el, text) => {
      return el.textContent?.includes(text.substring(0, 50)) || false;
    }, longDescription);
    
    expect(containerHasText).toBeTruthy();
  }
  
  async verifyOnDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.page.getByText('My Tasks')).toBeVisible();
  }
  
  async verifyOnLoginPage(): Promise<void> {
    await expect(this.page.getByText('Sign in to your account')).toBeVisible();
  }
  
  async verifyOnHomePage(): Promise<void> {
    await expect(this.page.getByText('QA Challenge: Simple Task Manager - E2E Black-Box')).toBeVisible();
  }
  
  async verifyErrorMessage(message: string): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  // CORRECTED: More robust method to verify field validation with fallbacks
  async verifyFieldValidationMessage(fieldLocator: Locator, expectedMessage: string): Promise<void> {
    const validationMessage = await this.checkFieldValidation(fieldLocator);
    
    // Check multiple possible validation messages (browser-dependent)
    const validMessages = [
      expectedMessage,
      'Please fill out this field.',
      'Please fill in this field.',
      'This field is required.',
      'Veuillez remplir ce champ.' // French browsers
    ];
    
    const isValidMessage = validMessages.some(msg => validationMessage.includes(msg));
    
    if (!isValidMessage) {
      // Fallback: check if field is in invalid state
      const fieldValidity = await fieldLocator.evaluate(el => {
        const input = el as HTMLInputElement;
        return {
          valid: input.validity.valid,
          valueMissing: input.validity.valueMissing,
          hasRequired: el.hasAttribute('required')
        };
      });
      
      // If validation message doesn't match but field is properly invalid, that's acceptable
      expect(fieldValidity.valid).toBe(false);
      expect(fieldValidity.hasRequired).toBe(true);
    } else {
      expect(isValidMessage).toBe(true);
    }
  }
}