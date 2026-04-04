# Demo — Playwright Test Automation Framework

![CI](https://github.com/dkalashnyk/demo/actions/workflows/tests.yml/badge.svg)

A full-stack test automation framework built with [Playwright](https://playwright.dev/), covering API, UI, and Visual regression testing for [SauceDemo](https://www.saucedemo.com/) with [restful-api.dev](https://api.restful-api.dev) as the backend API under test.

---

## Tech Stack

| Tool                                                                                                   | Purpose                                      |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| [Playwright](https://playwright.dev/) `v1.58`                                                          | Test runner, browser automation, API testing |
| [TypeScript](https://www.typescriptlang.org/)                                                          | Language                                     |
| [Zod](https://zod.dev/)                                                                                | API response schema validation               |
| [Faker.js](https://fakerjs.dev/)                                                                       | Test data generation                         |
| [Playwright HTML Reporter](https://playwright.dev/docs/test-reporters#html-reporter)                  | Test reporting                               |
| [Docker](https://www.docker.com/)                                                                      | Consistent local test execution              |
| [GitHub Actions](https://github.com/features/actions)                                                  | CI/CD pipeline                               |
| [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) | Pre-commit hooks                             |
| [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)                                       | Code quality and formatting                  |

---

## Project Structure

```
├── .github/
│   └── workflows/
│       ├── tests.yml               # Main CI orchestrator (lint → api → ui → visual)
│       └── run-tests.yml           # Reusable workflow for all test jobs
├── .husky/
│   └── pre-commit                  # Runs lint-staged before every commit
├── config/
│   ├── env.ts                      # Typed environment config (qa/prod)
│   ├── .env.qa                     # Local QA environment variables (gitignored)
│   └── .env.prod                   # Local prod environment variables (gitignored)
├── src/
│   ├── api/                        # Centralized API endpoint constants and API methods and schemas
│   ├── fixtures/
│   │   ├── test.ts                 # Extended Playwright fixtures (page + api + ctx)
│   │   ├── api.fixtures.ts         # API-only fixtures with step/attachment integration
│   │   ├── api.client.ts           # Playwright-wrapped API request context
│   │   └── createApiContext.ts     # Shared API context factory (x-api-key + Bearer)
│   ├── pages/                      # Pages folder
│   │   └── components/             # Components folder
│   ├── test-context/
│   │   └── scenarioContext.ts      # Generic typed key-value store for cross-step data
│   ├── test-data/                  # Factories and contants folder
│   └── utils/                      # Utility functions (annotations, PDF parser, price calculation)
├── tests/
│   ├── Auth/
│   │   └── auth.setup.ts           # UI storageState + API Bearer token setup
│   ├── API/
│   ├── UI/
│   │   └── Visual/
│   └── __snapshots__/              # Visual baselines — committed to repo
├── .gitignore
├── .prettierrc
├── Dockerfile
├── eslint.config.mjs
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) (required for local test runs)
- [npm](https://www.npmjs.com/) v11+

---

## Setup

**1. Clone the repo:**

```bash
git clone https://github.com/dkalashnyk/demo.git
cd demo
```

**2. Install dependencies** (also sets up Husky pre-commit hooks automatically):

```bash
npm install
```

**3. Create your environment file:**

```bash
cp config/.env.qa.example config/.env.qa
```

Fill in your values:

```dotenv
BASE_URL=https://www.saucedemo.com/
API_BASE_URL=https://api.restful-api.dev
UI_USER=your_ui_user
UI_PASSWORD=your_ui_password
API_LOGIN=your_api_login
API_PASSWORD=your_api_password
API_KEY=your_api_key
PRACTICE_DOWNLOAD_URL=https://practice.expandtesting.com/download
PRACTICE_UPLOAD_URL=https://practice.expandtesting.com/upload
```

**4. Build the Docker image:**

```bash
docker build -t demo .
```

---

## Running Tests

All local test commands run inside Docker for consistency with CI (Linux environment ensures visual snapshot parity).

### QA environment

```bash
npm run test:qa:all                  # All tests
npm run test:qa:api                  # API tests only
npm run test:qa:ui                   # UI tests only
npm run test:qa:smoke                # Smoke tests only (@smoke tag)
npm run test:qa:visual               # Visual regression tests only
npm run test:qa:update-snapshots     # Regenerate visual baselines
```

### Production environment

```bash
npm run test:prod:all
npm run test:prod:api
npm run test:prod:ui
npm run test:prod:smoke
npm run test:prod:visual
npm run test:prod:update-snapshots
```

---

## Test Projects

| Project  | Tag       | Scope                                       |
| -------- | --------- | ------------------------------------------- |
| `api`    | `@api`    | API CRUD tests — no browser required        |
| `ui`     | `@ui`     | UI functional tests                         |
| `smoke`  | `@smoke`  | Critical path across API + UI               |
| `visual` | `@visual` | Visual regression tests                     |
| `all`    | —         | All UI tests                                |
| `setup`  | —         | Auth setup — runs before UI/visual projects |

Negative tests are tagged `@negative` and run as part of their respective project (`@api @negative`, `@ui @negative`).

---

## Authentication

The framework uses a dual authentication strategy:

- **UI** — Playwright `storageState` saved to `playwright/.auth/ui.json` after login. Loaded automatically by UI/visual projects via `storageState` in `playwright.config.ts`.
- **API** — Bearer token obtained via `POST /auth/login` and saved to `playwright/.auth/api.json`. Loaded by `createApiContext()` and injected as `Authorization: Bearer <token>` on every request alongside the static `x-api-key` header.

Both are generated once in `auth.setup.ts` before any UI or visual tests run.

---

## Visual Testing

Snapshots are stored in `tests/__snapshots__/` and committed to the repo as baselines.

**Updating snapshots after intentional UI changes:**

```bash
npm run test:qa:update-snapshots
git add tests/__snapshots__/
git commit -m "chore: update visual snapshots"
git push
```

> Always generate snapshots using Docker locally — running outside Docker on macOS/Windows produces OS-specific pixel differences that won't match CI (Linux).

---

## Test Reports

### Playwright HTML report (local)

```bash
npm run report:default
```

### Playwright HTML report (CI — GitHub Pages)

Published automatically after every CI run:

| Suite  | URL                                       |
| ------ | ----------------------------------------- |
| API    | https://dkalashnyk.github.io/demo/api/    |
| UI     | https://dkalashnyk.github.io/demo/ui/     |
| Visual | https://dkalashnyk.github.io/demo/visual/ |

---

## CI/CD Pipeline

Triggered on every push to `main`. Jobs run sequentially:

```
Lint → API Tests → UI Tests → Visual Tests
```

- **Lint** — ESLint + TypeScript checks. Blocks all test jobs if it fails.
- **API Tests** — runs first, no browser required.
- **UI Tests** — runs after API passes.
- **Visual Tests** — runs after UI passes.

Each test job generates and deploys a Playwright HTML report to GitHub Pages. UI and Visual jobs are skipped if their dependency fails.

The reusable workflow `.github/workflows/run-tests.yml` handles all test execution logic — `tests.yml` is a pure orchestrator.

### Required GitHub Secrets

| Secret            | Description                     |
| ----------------- | ------------------------------- |
| `QA_API_BASE_URL` | API base URL                    |
| `QA_API_KEY`      | Static `x-api-key` header value |
| `QA_API_LOGIN`    | API login credential            |
| `QA_API_PASSWORD` | API password                    |
| `QA_BASE_URL`     | UI base URL                     |
| `QA_UI_USER`      | UI login username               |
| `QA_UI_PASSWORD`  | UI login password               |

---

## Code Quality

```bash
npm run lint       # ESLint
npm run format     # Prettier
```

**Pre-commit hook** (via Husky + lint-staged) runs ESLint and Prettier automatically on staged `.ts` files before every commit. The commit is blocked if any errors are found.

**ESLint rules enforced on test files:**

| Rule                                      | Level | Purpose                                 |
| ----------------------------------------- | ----- | --------------------------------------- |
| `playwright/no-focused-test`              | error | Prevents accidental `test.only` commits |
| `playwright/no-skipped-test`              | warn  | Warns on `test.skip`                    |
| `playwright/no-wait-for-timeout`          | warn  | Discourages hard waits                  |
| `playwright/no-networkidle`               | warn  | Discourages `networkidle` waits         |
| `playwright/no-commented-out-tests`       | warn  | Warns on commented-out tests            |
| `@typescript-eslint/no-floating-promises` | error | Catches missing `await` on async calls  |

---

## Architecture Decisions

- **Page Object Model via fixtures** — all UI interactions encapsulated in page classes extending `BasePage`. Internal locators are `private`; only assertion and action methods are public. Page objects are injected as named fixtures (`productsPage`, `cartPage`, etc.) via `src/fixtures/test.ts` — never instantiated with `new` inside test files.
- **Zod schema validation** — every API response is validated against a typed schema at the point of the request. Separate schemas for POST (includes `createdAt`) and GET responses where shapes differ.
- **Dual authentication** — UI session via `storageState`, API Bearer token via file. Both generated once in setup and reused across all tests.
- **Factory + Builder pattern** — `CheckoutFactory` and `buildUser()` generate randomized test data. Builder methods allow targeted overrides without positional argument confusion.
- **Generic ScenarioContext** — typed key-value store (`Map<string, unknown>`) for sharing data across test steps without global variables or rigid per-field typed contexts.
- **Endpoint constants** — all API paths centralized in `endpoints.ts`. A single place to update when the API changes.
- **Docker-first local execution** — guarantees visual snapshot pixel-parity with Linux CI. Local OS differences are eliminated entirely.
- **Reusable CI workflow** — `run-tests.yml` eliminates job duplication. Adding a new test suite requires only a new job entry in `tests.yml`.
