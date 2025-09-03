# Simple Task Manager - E2E Tests

Automated end-to-end testing suite for the Simple Task Manager web application using Playwright and TypeScript.

## Overview

This project contains comprehensive E2E tests covering user authentication, task management operations (CRUD), and edge case scenarios. The tests are designed to be simple, maintainable, and beginner-friendly.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd simple-task-manager-e2e
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install chromium
   ```

4. **Run the setup script (optional)**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Categories
```bash
# Authentication tests only
npm run test:auth

# Task management tests only  
npm run test:tasks

# Edge cases and validation tests
npm run test:edge
```

### Debug Mode
```bash
npm run test:debug
```

### Headed Mode (Watch tests run)
```bash
npm run test:headed
```

### View Test Reports
```bash
npm run test:report
```

## Project Structure

```
├── tests/                 # Test files organized by feature
│   ├── auth/              # Authentication tests
│   ├── tasks/             # Task management tests
│   └── edge-cases/        # Validation and edge case tests
├── page-objects/          # Page Object Model for reusable methods
├── test-data/            # Test data and configuration
├── reports/              # Bug reports and test execution reports
└── Configuration files
```

## Test Coverage

### Authentication
- ✅ User registration with validation
- ✅ User login (positive and negative scenarios)
- ✅ User logout functionality

### Task Management
- ✅ Create tasks (with all field combinations)
- ✅ Edit existing tasks
- ✅ Delete tasks with confirmation
- ✅ Mark tasks as complete/incomplete

### Edge Cases
- ✅ Input validation (empty fields, special characters)
- ✅ Data persistence after browser refresh
- ✅ Rapid successive operations
- ✅ Long input handling

## Application Under Test

- **URL**: https://significant-darcey-kwikicity-3dda52ea.koyeb.app
- **Test Credentials**: admin@cc.com / admin123

## Bug Reports

Identified issues are documented in the `reports/` directory:
- `design-issues.md` - UI/UX problems
- `functional-issues.md` - Logic and functional bugs

## Notes

- Tests are configured to run on Chrome browser only
- Screenshots and videos are captured on test failures
- HTML reports are generated after each test run
- All tests use TypeScript for better code quality and maintainability
- **Test Steps**: Each test uses `test.step()` for clear organization and better debugging
- **Simple Architecture**: Focus on readability and maintainability for beginners