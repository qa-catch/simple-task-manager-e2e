// Test data for Simple Task Manager E2E tests

export const TestUsers = {
  // Existing admin user for login tests
  admin: {
    email: 'admin@cc.com',
    password: 'admin123'
  },
  
  // New user for registration tests (will be unique each run)
  newUser: {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'Test123!'
  },
  
  // Invalid user for negative tests
  invalid: {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  }
};

export const TestTasks = {
  // Valid task data
  valid: {
    title: 'Complete Playwright Tests',
    description: 'Write comprehensive E2E tests for the task manager',
    dueDate: '2025-12-31',
    priority: 'High'
  },
  
  // Task for editing tests
  forEdit: {
    title: 'Task to be Modified',
    description: 'This task will be updated during tests',
    dueDate: '2025-11-15',
    priority: 'Medium'
  },
  
  // Updated version of the edit task
  updated: {
    title: 'Updated Task Title',
    description: 'Updated description after modification',
    dueDate: '2025-01-12',
    priority: 'Low'
  },
  
  // Invalid task data for negative tests
  invalid: {
    emptyTitle: {
      title: '',
      description: 'Task with empty title',
      dueDate: '2025-12-31',
      priority: 'Medium'
    },
    pastDueDate: {
      title: 'Task with Past Due Date',
      description: 'This task has an invalid past due date',
      dueDate: '2020-01-01',
      priority: 'High'
    },
    longTitle: {
      title: 'A'.repeat(500), // Very long title
      description: 'Task with extremely long title',
      dueDate: '2025-12-31',
      priority: 'Low'
    }
  },
  
  // Special characters test
  specialChars: {
    title: 'Task with Special Chars: @#$%^&*()[]{}',
    description: 'Testing special characters: <script>alert("test")</script>',
    dueDate: '2025-12-31',
    priority: 'Medium'
  }
};

export const AppUrls = {
  base: 'https://significant-darcey-kwikicity-3dda52ea.koyeb.app',
  login: 'https://significant-darcey-kwikicity-3dda52ea.koyeb.app/auth/login',
  dashboard: 'https://significant-darcey-kwikicity-3dda52ea.koyeb.app/dashboard'
};

export const ErrorMessages = {
  invalidLogin: 'Invalid email or password.',
  requiredField: 'Please fill out this field.',
  passwordTooShort: 'Password must be at least 6 characters.',
  invalidEmailFormat: "Please include an '@' in the email address",
  invalidEmailMissing: "is missing an '@'",
  userRegisteredSuccess: 'User registered successfully',
  usernameExists: 'Username already taken'
};

export const HomePageText = {
  welcomeMessage: 'QA Challenge: Simple Task Manager - E2E Black-Box'
};