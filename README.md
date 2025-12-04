# Playwright Test Automation Framework

A comprehensive end-to-end testing framework built with Playwright and TypeScript, designed to test across multiple environments (dev, stage, UAT) with a clean, maintainable architecture.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [How It Works](#how-it-works)
- [Future Updates](#future-updates)

## Overview

This Playwright test framework provides a robust foundation for automated testing with:

- **Multi-environment support**: Run tests against dev, stage, and UAT environments seamlessly
- **Environment-based configuration**: Separate config files for each environment
- **Secure credential management**: Credentials stored in `.env` file (not committed to git)
- **Custom environment loader**: Zero-dependency script to load environment variables
- **Type-safe utilities**: TypeScript interfaces for better developer experience

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher (check with `node --version`)
- **npm**: Comes with Node.js (check with `npm --version`)
- **Git**: For cloning the repository

## Installation

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <repository-url>
   cd Playwright--Learn
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install Playwright browsers**:

   ```bash
   npx playwright install
   ```

4. **Set up environment variables**:
   Create a `.env` file in the root directory with the following structure:

   ```env
   # Development Environment Credentials
   DEVELOP_USER_EMAIL=your-dev-email@example.com
   DEVELOP_USER_PASSWORD=your-dev-password

   # Staging Environment Credentials
   STAGING_USER_EMAIL=your-stage-email@example.com
   STAGING_USER_PASSWORD=your-stage-password

   # UAT Environment Credentials
   UAT_USER_EMAIL=your-uat-email@example.com
   UAT_USER_PASSWORD=your-uat-password
   ```

   > ⚠️ **Important**: The `.env` file should be added to `.gitignore` to prevent committing sensitive credentials.

## Project Structure

```
Playwright--Learn/
├── config/                 # Environment-specific Playwright configurations
│   ├── dev.config.ts      # Development environment config
│   ├── stage.config.ts    # Staging environment config
│   └── uat.config.ts      # UAT environment config
├── scripts/               # Utility scripts
│   └── load-env.js       # Custom environment variable loader
├── Tests/                 # Test files
│   ├── example.spec.ts   # Example test file
│   └── Smoke/            # Smoke test suite
│       └── login.smoke.spec.ts
├── testdata/             # Test data files
│   └── urls.json         # Environment base URLs
├── utils/                 # Utility functions
│   ├── credentials.ts    # Credential management
│   └── env.ts            # Environment configuration helper
├── playwright.config.ts  # Main Playwright configuration
├── package.json          # Project dependencies and scripts
└── .env                  # Environment variables (not in git)
```

## Configuration

### Environment Configuration Files

Each environment has its own configuration file in the `config/` directory:

- **`dev.config.ts`**: Points to `http://develop.swivl.tech`
- **`stage.config.ts`**: Points to `http://staging.swivl.tech`
- **`uat.config.ts`**: Points to `http://uat.swivl.tech`

These configs inherit from the main `playwright.config.ts` but override the `baseURL` for their specific environment.

### Base URLs Configuration

Environment base URLs are defined in `testdata/urls.json`:

```json
{
  "dev": {
    "baseUrl": "http://develop.swivl.tech"
  },
  "stage": {
    "baseUrl": "http://staging.swivl.tech"
  },
  "UAT": {
    "baseUrl": "http://uat.swivl.tech"
  }
}
```

The `utils/env.ts` module reads from this file to provide environment-specific configurations.

## Environment Variables

The framework uses a custom environment loader (`scripts/load-env.js`) that:

1. **Loads variables from `.env`**: Parses the `.env` file without external dependencies
2. **Sets process.env**: Makes variables available to Playwright and test files
3. **Runs the command**: Executes Playwright with the loaded environment

### Required Environment Variables

| Variable                | Description                      | Example            |
| ----------------------- | -------------------------------- | ------------------ |
| `DEVELOP_USER_EMAIL`    | Email for dev environment        | `user@example.com` |
| `DEVELOP_USER_PASSWORD` | Password for dev environment     | `password123`      |
| `STAGING_USER_EMAIL`    | Email for staging environment    | `user@example.com` |
| `STAGING_USER_PASSWORD` | Password for staging environment | `password123`      |
| `UAT_USER_EMAIL`        | Email for UAT environment        | `user@example.com` |
| `UAT_USER_PASSWORD`     | Password for UAT environment     | `password123`      |

## Running Tests

### Basic Commands

Run tests for a specific environment:

```bash
# Development environment
npm run test:dev

# Staging environment
npm run test:stage

# UAT environment
npm run test:uat
```

### Headed Mode (See the browser)

To run tests with the browser visible:

```bash
# Development with headed browser
npm run test:dev:headed

# Staging with headed browser
npm run test:stage:headed

# UAT with headed browser
npm run test:uat:headed
```

### Default Test Command

```bash
npm test
```

This runs tests using the default `playwright.config.ts` (defaults to dev environment).

### Running Specific Tests

You can run specific test files or use Playwright's filtering:

```bash
# Run a specific test file
npm run test:dev -- Tests/Smoke/login.smoke.spec.ts

# Run tests matching a pattern
npm run test:dev -- --grep "smoke"
```

## How It Works

### The Environment Loading Flow

1. **Script Execution**: When you run `npm run test:dev`, it executes:

   ```bash
   node scripts/load-env.js ENV=dev playwright test --config=config/dev.config.ts
   ```

2. **Environment Loading**: The `load-env.js` script:

   - Reads the `.env` file from the project root
   - Parses each line (skipping comments and empty lines)
   - Sets `process.env` variables
   - Spawns the Playwright command with those variables

3. **Configuration Selection**: The environment-specific config file (e.g., `dev.config.ts`) is used, which:

   - Sets the `baseURL` for that environment
   - Configures test timeouts, retries, and other Playwright options

4. **Test Execution**: Tests can access:
   - `process.env.ENV` to know which environment they're running in
   - Credentials via `getCredentials(env)` utility
   - Base URLs via `getEnvconfig(env)` utility

### Credential Management

The `utils/credentials.ts` module provides a type-safe way to get credentials:

```typescript
import { getCredentials } from "../../utils/credentials";

const env = process.env.ENV || "dev";
const credentials = getCredentials(env);
// Returns: { email: string, password: string }
```

It automatically:

- Reads the correct environment variables based on the `ENV` value
- Validates that credentials exist
- Throws helpful error messages if credentials are missing

### Example Test Structure

Here's how a typical test uses the framework:

```typescript
import { test, expect } from "@playwright/test";
import { getCredentials } from "../../utils/credentials";

test.describe("Login Smoke Test", () => {
  test("Login @smoke", async ({ page }) => {
    // Get environment (defaults to 'dev' if not set)
    const env = process.env.ENV || "dev";

    // Get credentials for the current environment
    const credentials = getCredentials(env);

    // Navigate to base URL (set in config)
    await page.goto("/");

    // Use credentials in test
    await page.locator('input[name="email"]').fill(credentials.email);
    await page.locator('input[name="password"]').fill(credentials.password);
    await page.locator('button[type="submit"]').click();

    // Assertions
    await page.waitForSelector("text=Dashboard");
  });
});
```

## Future Updates

This README and the framework structure are designed to evolve. Potential future enhancements might include:

- **CI/CD Integration**: GitHub Actions, Jenkins, or other CI pipelines
- **Test Reporting**: Enhanced reporting with Allure, TestRail, or custom reporters
- **Visual Testing**: Screenshot comparison and visual regression testing
- **API Testing**: Integration with API testing alongside E2E tests
- **Parallel Execution**: Enhanced parallel test execution strategies
- **Page Object Model**: Implementation of POM pattern for better maintainability
- **Custom Fixtures**: Shared test fixtures for common setup/teardown
- **Test Data Management**: More sophisticated test data handling

As the project grows, this README will be updated to reflect new features and best practices.

---

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Credentials not found" error

- **Solution**: Ensure your `.env` file exists and contains all required variables for the environment you're testing

**Issue**: Tests can't connect to the base URL

- **Solution**: Verify the URL in `testdata/urls.json` is correct and accessible

**Issue**: Environment variables not loading

- **Solution**: Check that `scripts/load-env.js` is being executed (it should show "✅ Environment variables loaded from .env file")

---

## Contributing

When adding new tests or features:

1. Follow the existing project structure
2. Use TypeScript for type safety
3. Add appropriate test descriptions and tags
4. Update this README if you add new features or change the setup

---

**Happy Testing! 🎭**
