# Demo — Playwright Test Automation Framework

A full-stack test automation framework built with [Playwright](https://playwright.dev/), covering API, UI, and Visual testing for [SauceDemo](https://www.saucedemo.com/) with [restful-api.dev](https://api.restful-api.dev) as the backend API under test.

---

## Tech Stack

| Tool                                                  | Purpose                                      |
| ----------------------------------------------------- | -------------------------------------------- |
| [Playwright](https://playwright.dev/)                 | Test runner, browser automation, API testing |
| [TypeScript](https://www.typescriptlang.org/)         | Language                                     |
| [Zod](https://zod.dev/)                               | API response schema validation               |
| [Faker.js](https://fakerjs.dev/)                      | Test data generation                         |
| [Allure](https://allurereport.org/)                   | Test reporting                               |
| [Docker](https://www.docker.com/)                     | Consistent local test execution              |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline                               |

---

## Project Structure

```
├── config/
│   ├── env.ts                  # Environment config (qa/prod)
│   ├── .env.qa                 # Local QA environment variables
│   └── .env.prod               # Local prod environment variables
├── src/
│   ├── api/
│   │   ├── items.api.ts        # Items API methods + schemas
│   │   └── users.api.ts        # Users API methods + schemas
│   ├── fixtures/
│   │   ├── test.ts             # Extended Playwright fixtures (page + api + ctx)
│   │   ├── api.fixtures.ts     # API-only fixtures with Allure integration
│   │   └── createApiContext.ts # Shared API context factory
│   ├── pages/
│   │   ├── BasePage.ts         # Base class with shared page methods
│   │   ├── LoginPage.ts
│   │   ├── ProductsPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutStepOnePage.ts
│   │   ├── CheckoutStepTwoPage.ts
│   │   ├── CheckoutSummaryPage.ts
│   │   └── components/
│   │       ├── Header.ts
│   │       └── CartTable.ts
│   ├── test-context/
│   │   └── scenarioContext.ts  # Generic typed context for sharing data across steps
│   ├── test-data/
│   │   ├── checkoutFactory.ts  # Checkout form data factory + builder
│   │   └── product.ts          # Static product test data
│   └── utils/
│       └── allure.ts           # Allure step/label helpers
├── tests/
│   ├── Auth/
│   │   └── auth.setup.ts       # UI + API authentication setup
│   ├── API/
│   │   ├── item/               # Item CRUD API tests
│   │   └── user/               # User CRUD API tests
│   ├── UI/
│   │   ├── checkout.spec.ts    # UI checkout flow tests
│   │   ├── E2ECheckout.spec.ts # E2E tests with API setup/teardown
│   │   └── Visual/
│   │       └── checkout.visual.spec.ts
│   └── __snapshots__/          # Visual test baselines (committed to repo)
├── .github/
│   └── workflows/
│       ├── tests.yml           # Main CI workflow
│       └── run-tests.yml       # Reusable workflow
├── Dockerfile
├── playwright.config.ts
└── package.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) (for local test runs)
- [npm](https://www.npmjs.com/) v11+

---

## Setup

**1. Clone the repo:**

```bash
git clone https://github.com/dkalashnyk/demo.git
cd demo
```

**2. Install dependencies:**

```bash
npm install
```

**3. Create environment file:**

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
```

**4. Build the Docker image:**

```bash
docker build -t demo .
```

---

## Running Tests

All local test commands run inside Docker for consistency with CI.

### QA environment

```bash
# All tests
npm run test:qa:all

# API tests only
npm run test:qa:api

# UI tests only
npm run test:qa:ui

# Smoke tests only
npm run test:qa:smoke

# Visual tests only
npm run test:qa:visual

# Update visual snapshots
npm run test:qa:update-snapshots
```

### Production environment

```bash
npm run test:prod:all
npm run test:prod:api
npm run test:prod:ui
npm run test:prod:smoke
npm run test:prod:visual
```

---

## Test Projects

| Project  | Tag       | Description                        |
| -------- | --------- | ---------------------------------- |
| `api`    | `@api`    | API CRUD tests — no browser        |
| `ui`     | `@ui`     | UI functional tests                |
| `smoke`  | `@smoke`  | Smoke subset across API + UI       |
| `visual` | `@visual` | Visual regression tests            |
| `all`    | —         | All UI tests                       |
| `setup`  | —         | Auth setup (runs before UI/visual) |

---

## Test Reports

### Playwright HTML report

```bash
npm run report:default
```

### Allure report (local)

```bash
# Generate
npm run report:allure:generate

# Open
npm run report:allure:open
# Available at http://localhost:4040
```

### Allure report (CI)

Reports are published to GitHub Pages after every CI run:

- **API:** `https://dkalashnyk.github.io/demo/api/`
- **UI:** `https://dkalashnyk.github.io/demo/ui/`
- **Visual:** `https://dkalashnyk.github.io/demo/visual/`

---

## Visual Testing

Visual snapshots are committed to the repo under `tests/__snapshots__/` and serve as baselines for comparison.

**Updating snapshots** (run inside Docker to match CI Linux environment):

```bash
npm run test:qa:update-snapshots
git add tests/__snapshots__/
git commit -m "chore: update visual snapshots"
git push
```

> Always update snapshots using Docker locally — running them outside Docker on macOS/Windows will produce OS-specific pixel differences that won't match CI.

---

## CI/CD

Tests run automatically on every push to `main` via GitHub Actions in this order:

```
API Tests → UI Tests → Visual Tests
```

Each job publishes its Allure report to GitHub Pages. UI and Visual jobs are skipped if the preceding job fails.

### Required GitHub Secrets

| Secret            | Description                         |
| ----------------- | ----------------------------------- |
| `QA_API_BASE_URL` | API base URL                        |
| `QA_API_KEY`      | Static API key (`x-api-key` header) |
| `QA_API_LOGIN`    | API login credential                |
| `QA_API_PASSWORD` | API password                        |
| `QA_BASE_URL`     | UI base URL                         |
| `QA_UI_USER`      | UI login username                   |
| `QA_UI_PASSWORD`  | UI login password                   |

---

## Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

---

## Architecture Decisions

- **Page Object Model** — all UI interactions encapsulated in page classes extending `BasePage`
- **API layer with Zod validation** — every API response is validated against a schema at the point of the request
- **Dual authentication** — UI session stored via Playwright `storageState`, API Bearer token persisted to `playwright/.auth/api.json`
- **Factory pattern** — `CheckoutFactory` and `buildUser()` generate randomized test data with optional overrides
- **ScenarioContext** — generic typed key-value store for sharing data across test steps without global state
- **Docker-first local runs** — ensures snapshot pixel-perfect consistency with Linux CI environment
