# Copilot Instructions for Demo Test Automation Framework

## 📋 Project Overview

**Demo** is a comprehensive test automation framework built with [Playwright](https://playwright.dev/) and **TypeScript**, designed for test automation covering **API**, **UI**, and **Visual regression testing**.

### Tech Stack

- **Playwright v1.58** — Test runner & browser automation
- **TypeScript** — Type-safe test code
- **Zod** — API response schema validation
- **Faker.js** — Realistic test data generation
- **Allure** — Test reporting and analytics
- **Docker** — Consistent environment execution
- **GitHub Actions** — CI/CD automation

---

## 📁 Project Structure & Organization

```
demo/
├── .github/
│   └── workflows/
│       ├── tests.yml              # Main CI orchestrator (lint → api → ui → visual)
│       └── run-tests.yml          # Reusable workflow template
├── .husky/
│   └── pre-commit                 # Runs lint-staged before every commit
├── config/
│   ├── env.ts                     # Typed environment configuration
│   ├── .env.qa                    # QA environment variables (gitignored)
│   └── .env.prod                  # Production environment variables (gitignored)
├── src/
│   ├── api/                       # API endpoint constants and methods
│   ├── pages/                     # UI Page Object Model classes folder
│   │   └── components/            # Reusable page components folder
│   ├── fixtures/
│   │   ├── test.ts                # Extended Playwright fixtures (ui + api + context)
│   │   ├── api.fixtures.ts        # API-only fixtures with Allure
│   │   ├── allure-api.client.ts   # Allure-wrapped API request context
│   │   └── createApiContext.ts    # API context factory with auth
│   ├── test-context/
│   │   └── scenarioContext.ts     # Test execution context for data sharing
│   ├── test-data/                 # Test data builders and constants
│   └── utils/                     # Utility functions (Allure, etc.)
├── tests/
│   ├── API/
│   ├── Auth/
│   └── UI/
│       └── Visual/
├── playwright.config.ts           # Playwright configuration (projects, reporters)
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies & scripts
└── Dockerfile                     # Container setup for test execution
```

---

## 🔌 API Structure & Conventions

### Endpoint Definition

API endpoints are defined as constants in `src/api/endpoints.ts`:

```typescript
export const ENDPOINTS = {
  items: '/objects',
  users: '/users',
  root: '/',
};
```

### API Module Pattern

Each API resource has its own module with:

- **Zod schemas** for request/response validation
- **Type definitions** inferred from schemas
- **Builder functions** for test data generation
- **API methods** that return `{ res, json, parsed }`

**Example: `src/api/items.api.ts`**

```typescript
import { APIRequestContext } from '@playwright/test';
import { z } from 'zod';
import { faker } from '@faker-js/faker';
import { ENDPOINTS } from './endpoints';

// ===== ZODB SCHEMAS =====
export const ItemDataSchema = z
  .object({
    year: z.number().int().optional(),
    Color: z.string().optional(),
    Price: z.number().optional(),
    Description: z.string().optional(),
  })
  .optional()
  .nullable();

export const ItemBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  data: ItemDataSchema,
});

export const CreatedItemSchema = ItemBaseSchema.extend({
  createdAt: z.number(),
});

export const ItemSchema = ItemBaseSchema;

export const DeleteResponseSchema = z.object({
  message: z.string(),
});

export const ErrorSchema = z.object({
  error: z.string(),
});

// ===== TYPE DEFINITIONS =====
export type Item = z.infer<typeof ItemSchema>;
export type CreatedItem = z.infer<typeof CreatedItemSchema>;
export type ApiError = z.infer<typeof ErrorSchema>;

export type CreateItemPayload = {
  name: string;
  data: {
    year?: number;
    Color?: string;
    Price?: number;
    Description?: string;
  };
};

// ===== TEST DATA BUILDER =====
/**
 * Factory function to create valid test data with sensible defaults.
 * Override only the fields you care about.
 */
export function buildItem(overrides: Partial<CreateItemPayload> = {}): CreateItemPayload {
  return {
    name: faker.book.title() + '_TA',
    data: {
      year: faker.date.past().getFullYear(),
      Color: faker.color.human(),
      Price: faker.number.float({ min: 0, max: 10000 }),
      Description: faker.lorem.sentence(),
    },
    ...overrides,
  };
}

// ===== API METHODS =====
const itemsApi = {
  async createItem(api: APIRequestContext, payload: CreateItemPayload) {
    const res = await api.post(ENDPOINTS.items, { data: payload });
    const json = await res.json();
    return { res, json, parsed: CreatedItemSchema.safeParse(json) };
  },

  async getItem(api: APIRequestContext, id: string) {
    const res = await api.get(`${ENDPOINTS.items}/${id}`);
    const json = await res.json();
    return { res, json, parsed: ItemSchema.safeParse(json) };
  },

  async deleteItem(api: APIRequestContext, id: string) {
    const res = await api.delete(`${ENDPOINTS.items}/${id}`);
    const json = await res.json();
    return { res, json, parsed: DeleteResponseSchema.safeParse(json) };
  },
};

export default itemsApi;
```

### API Response Handling

All API methods return a tuple `{ res, json, parsed }`:

- **`res`** — Raw Playwright APIResponse (status, headers, etc.)
- **`json`** — Parsed JSON body
- **`parsed`** — Zod SafeParseResult with `.success` and `.data` / `.error`

```typescript
// Usage in tests
const { res, json, parsed } = await itemsApi.getItem(api, '123');

expect(res.status()).toBe(200);
expect(parsed.success).toBe(true);
expect(json.name).toBe('Expected Name');
```

---

## 🖼️ UI Pages & Components

### Page Object Model (POM)

All UI pages extend `BasePage` and follow this pattern:

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class [PageName]Page extends BasePage {
  // ===== LOCATORS (Private) =====
  private readonly primaryElement = this.page.getByTestId('element-id');
  private readonly button = this.page.getByRole('button', { name: 'Action' });

  constructor(page: Page) {
    super(page);
    // Initialize any page components
  }

  // ===== HELPER METHODS (Private) =====
  private getItemByName(name: string): Locator {
    return this.page.locator(`[data-testid="item"]:has-text("${name}")`);
  }

  // ===== PUBLIC METHODS =====
  async open(): Promise<void> {
    await this.page.goto('/page-path');
  }

  async assertOnPage(): Promise<void> {
    await this.expectUrlContains('/page-path');
    await expect(this.primaryElement).toBeVisible();
  }

  async performAction(): Promise<void> {
    await this.button.click();
  }

  async expectState(expected: string): Promise<void> {
    await expect(this.primaryElement).toContainText(expected);
  }
}
```

### Example: ProductsPage

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Header } from './components/Header';

export class ProductsPage extends BasePage {
  readonly header: Header;
  private readonly products = this.page.getByTestId('inventory-item');

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  // Small, reusable locator builders
  private productItem(name: string): Locator {
    return this.products.filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: name }),
    });
  }

  private addItemToCartButton(name: string): Locator {
    return this.productItem(name).getByRole('button', { name: 'Add to cart' });
  }

  // Public methods always start with action verbs
  async open(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async assertOnProductsPage(): Promise<void> {
    await this.expectUrlContains('/inventory.html');
    await this.header.expectTitle('Products');
  }

  async addProductToCartByName(name: string): Promise<void> {
    await this.addItemToCartButton(name).click();
  }

  async expectProductVisible(
    name: string,
    expected: { price: string; description?: string; img: string },
  ): Promise<void> {
    await expect(this.productPrice(name)).toContainText(expected.price);
  }
}
```

### Page Component Example

```typescript
// src/pages/components/Header.ts
import { Page, Locator, expect } from '@playwright/test';

export class Header {
  private readonly title: Locator;
  private readonly cartBadge: Locator;

  constructor(page: Page) {
    this.title = page.locator('[data-testid="page-title"]');
    this.cartBadge = page.locator('.cart-badge');
  }

  async expectTitle(expected: string): Promise<void> {
    await expect(this.title).toContainText(expected);
  }

  async expectCartCount(count: number): Promise<void> {
    await expect(this.cartBadge).toContainText(count.toString());
  }
}
```

### Locator Selection Rules

1. **Prefer `getByTestId()`** — Element must have `data-testid` attribute
2. **Fallback to `getByRole()`** — For buttons, links, text inputs
3. **Avoid CSS selectors** unless structure is guaranteed stable
4. **Use `filter()`** for dynamic filtering with conditions

---

## 🧪 API Tests

### Structure & Naming

- **Location**: `tests/API/[resource]/[operation].spec.ts`
- **Pattern**: One spec file per API operation (create, read, update, delete)
- **Fixtures**: Import `test` and `expect` from `src/fixtures/api.fixtures`

### API Test Example

```typescript
// tests/API/item/createItem.spec.ts
import { test, expect } from '../../../src/fixtures/api.fixtures';
import itemsApi, { buildItem } from '../../../src/api/items.api';

test('@api @smoke Create an item', async ({ api }) => {
  // ===== SETUP =====
  const payload = buildItem({
    name: 'Custom Item Name',
    data: { Price: 99.99 },
  });

  // ===== EXECUTE =====
  const { res, json, parsed } = await itemsApi.createItem(api, payload);

  // ===== VERIFY =====
  try {
    expect(res.status()).toBe(200);
    expect(parsed.success).toBe(true);
    expect(json).toMatchObject({
      name: payload.name,
      data: payload.data,
    });
  } finally {
    // ===== CLEANUP =====
    await itemsApi.deleteItem(api, json.id);
  }
});
```

### Test Tags (Markers)

- `@api` — Test is an API test
- `@smoke` — Part of smoke test suite
- `@negative` — Negative test case
- `@ui` — UI test
- `@e2e` — End-to-end test
- `@visual` — Visual regression test

**Run by tag:**

```bash
npm run test:qa -- --grep "@smoke"
npm run test:qa -- --grep "@negative"
```

---

## 🎯 UI Tests

### Structure & Naming

- **Location**: `tests/UI/[feature]/[scenario].spec.ts`
- **Fixtures**: Import `test` and `expect` from `src/fixtures/test`
- **Pattern**: Arrange → Act → Assert with Allure steps

### Authentication Pattern

The framework uses a centralized authentication setup (`tests/Auth/auth.setup.ts`) that runs **before all UI tests**. This approach:

- ✅ Authenticates once before all tests run
- ✅ Uses **environment variables** (never hardcoded credentials)
- ✅ Saves authenticated session state to `playwright/.auth/ui.json`
- ✅ All UI tests automatically inherit the authenticated browser state
- ✅ Reduces redundant API calls and speeds up test execution

**How It Works:**

1. **Setup Project** (`auth.setup.ts`) runs first and authenticates using `env.user` and `env.password`:

```typescript
// tests/Auth/auth.setup.ts (runs in 'setup' project)
import { env } from '../../config/env';

setup('Auth UI', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);

  await loginPage.open();
  await loginPage.login(env.user, env.password); // ← Uses ENV variables, NOT hardcoded
  await productsPage.assertOnProductsPage();

  // Save authenticated session
  await page.context().storageState({ path: UI_AUTH_FILE });
});
```

2. **Environment Variables** are defined in `config/env.ts`:

```typescript
// config/env.ts
export const env = {
  user: process.env.UI_USER ?? '', // ← From .env.qa or secrets
  password: process.env.UI_PASSWORD ?? '', // ← From .env.qa or secrets
  apiLogin: process.env.API_LOGIN ?? '', // ← From .env.qa or secrets
  apiPassword: process.env.API_PASSWORD ?? '', // ← From .env.qa or secrets
};
```

3. **Playwright Config** automatically applies authenticated session to all UI tests:

```typescript
// playwright.config.ts
{
  name: 'ui',
  use: { storageState: 'playwright/.auth/ui.json' },  // ← Loads authenticated session
  dependencies: ['setup'],                             // ← Runs setup first
}
```

4. **UI Tests** assume authentication is already done:

```typescript
// tests/UI/checkout.spec.ts
test('@ui TC02 User completes purchase', async ({ page }) => {
  // User is already authenticated — no login needed
  const productsPage = new ProductsPage(page);
  await productsPage.open();
  await productsPage.assertOnProductsPage();
  // Continue with test flow...
});
```

**Security Best Practices:**

⚠️ **CRITICAL: NEVER hardcode credentials in test code!**

```typescript
// ❌ NEVER DO THIS
await loginPage.login('standard_user', 'secret_sauce');

// ✅ ALWAYS DO THIS
await loginPage.login(env.user, env.password);
```

**For CI/CD**, provide credentials via GitHub Secrets or environment files:

```bash
# Set via GitHub Actions secrets
- name: Run tests
  env:
    UI_USER: ${{ secrets.UI_USER }}
    UI_PASSWORD: ${{ secrets.UI_PASSWORD }}
  run: npm run test:qa:ui
```

**For Local Development**, create `.env.qa` (gitignored):

```bash
# .env.qa (add to .gitignore)
UI_USER=your_user
UI_PASSWORD=your_password
API_LOGIN=your_api_user
API_PASSWORD=your_api_password
```

### Test Data & Context

Tests use `ctx` (ScenarioContext) for data sharing across steps:

```typescript
import { test } from '../../src/fixtures/test';
import { CheckoutFactory, CheckoutFormData } from '../../src/test-data/checkoutFactory';
import { CartPage } from '../../src/pages/CartPage';

test('@ui TC02 User completes checkout', async ({ page, ctx }) => {
  // Store data in context
  const checkoutData = CheckoutFactory.create();
  ctx.set<CheckoutFormData>('checkout', checkoutData);

  // Retrieve data later
  const { firstName, lastName } = ctx.require<CheckoutFormData>('checkout');
});
```

### Allure Reporting in Tests

```typescript
import allure from '../../src/utils/allure';

test('@ui Complete Purchase', async ({ page }) => {
  // Set test metadata
  await allure.epic('Web App');
  await allure.feature('Checkout');
  await allure.story('User purchases product');

  // Wrap steps with Allure reporting
  await allure.step('Open Products page', async () => {
    await productsPage.open();
    await productsPage.assertOnProductsPage();
  });

  await allure.step('Add product to cart', async () => {
    await productsPage.addProductToCartByName('Backpack');
  });
});
```

**Note on Screenshots:** Only use `assertVisual()` in **Visual regression tests** (`tests/UI/Visual/`). Regular UI tests should focus on functional assertions, not visual snapshots. For debugging purposes, you can use `await page.screenshot()` in UI tests, but this should not be part of the main test flow.

### Visual Regression Tests

- **Location**: `tests/UI/Visual/[feature].visual.spec.ts`
- **Purpose**: Capture and compare UI snapshots for visual regressions
- **Key Method**: `assertVisual()` — taken from `BasePage`, disables animations and captures full-page screenshots
- **Tag**: Use `@visual` tag for these tests

**Important:** Do NOT use `assertVisual()` in regular UI tests. Visual regression testing is handled separately and should only be in files dedicated to visual testing.

```typescript
// tests/UI/Visual/checkout.visual.spec.ts
import { test } from '../../../src/fixtures/test';
import { CheckoutSummaryPage } from '../../../src/pages/CheckoutSummaryPage';

test('@visual Verify checkout complete page appearance', async ({ page }) => {
  const checkoutSummaryPage = new CheckoutSummaryPage(page);

  // Navigate to page
  await checkoutSummaryPage.open();

  // Capture visual snapshot (animations disabled)
  await checkoutSummaryPage.assertVisual();
});
```

````

### Comprehensive UI Test Example

```typescript
// tests/UI/checkout.spec.ts
import { test } from '../../src/fixtures/test';
import allure from '../../src/utils/allure';
import { PRODUCTS } from '../../src/test-data/product';
import { CheckoutFactory, CheckoutFormData } from '../../src/test-data/checkoutFactory';
import { ProductsPage } from '../../src/pages/ProductsPage';
import { CartPage } from '../../src/pages/CartPage';
import { CheckoutStepOnePage } from '../../src/pages/CheckoutStepOnePage';

const product = PRODUCTS.TC02;

test.describe('User purchases a product', () => {
  test('@ui TC02 User purchases one product with valid data', async ({ page, ctx }) => {
    // ===== METADATA =====
    await allure.epic('Web App');
    await allure.feature('Checkout');
    await allure.story('Purchase product');

    // ===== SETUP =====
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOnePage = new CheckoutStepOnePage(page);
    const checkoutData = CheckoutFactory.create();
    ctx.set<CheckoutFormData>('checkout', checkoutData);

    // ===== ACT & VERIFY with STEPS =====
    await allure.step('Open Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await allure.step('Add product to cart', async () => {
      await productsPage.expectProductVisible(product.name, {
        price: product.price,
        description: product.description,
        img: product.img,
      });
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
    });

    await allure.step('Proceed to checkout', async () => {
      await cartPage.open();
      await cartPage.assertOnCartPage();
      await cartPage.proceedToCheckout();
    });

    await allure.step('Fill checkout information', async () => {
      const { firstName, lastName, zip } = ctx.require<CheckoutFormData>('checkout');
      await checkoutStepOnePage.fillCheckoutInformation(firstName, lastName, zip);
      await checkoutStepOnePage.clickContinue();
    });
  });
});
````

---

## 📊 Test Data & Factories

### Builder Pattern

Create sensible test data using builder functions:

```typescript
// src/test-data/checkoutFactory.ts
import { faker } from '@faker-js/faker';

export type CheckoutFormData = {
  firstName: string;
  lastName: string;
  zip: string;
};

export class CheckoutFactory {
  static create(overrides: Partial<CheckoutFormData> = {}): CheckoutFormData {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      zip: faker.location.zipCode(),
      ...overrides,
    };
  }
}
```

### Usage

```typescript
// Use defaults
const checkout = CheckoutFactory.create();

// Override specific fields
const checkout = CheckoutFactory.create({
  firstName: 'John',
  zip: '10001',
});
```

### Constants & Fixtures

Static test data stored as constants:

```typescript
// src/test-data/product.ts
export const PRODUCTS = {
  TC01: {
    name: 'Sauce Labs Backpack',
    price: '$29.99',
    description: 'carry.allTheThings() with the sleek, streamlined...',
    img: 'backpack-1-1200x1500.jpg',
    tax: '$2.40',
    total: '$32.39',
  },
  TC02: {
    name: 'Sauce Labs Bike Light',
    price: '$9.99',
    description: 'A red light isnt just for the bike.',
    img: 'bike-light-1-1200x1500.jpg',
    tax: '$0.80',
    total: '$10.79',
  },
};
```

---

## 🚀 Running Tests

### Local Execution

```bash
# Run all tests in QA environment (via Docker)
npm run test:qa:all

# Run specific test suites
npm run test:qa:api          # API tests only
npm run test:qa:ui           # UI tests only
npm run test:qa:smoke        # Smoke tests (@smoke tag)
npm run test:qa:visual       # Visual regression tests

# Update visual snapshots
npm run test:qa:update-snapshots
```

### CI/CD

Tests run automatically on GitHub Actions:

- **Lint** → **API Tests** → **UI Tests** → **Visual Tests**

### View Reports

```bash
# Generate Allure report
npm run report:allure:generate

# Open Allure report in browser
npm run report:allure:open
```

---

## 💡 When Helping with Code

### API Test Writing

When writing API tests:

1. Use the builder function to create test data
2. Wrap API calls with `{ res, json, parsed }`
3. Validate status codes AND schema parsing
4. Clean up created resources in `finally` block
5. Tag with `@api` and relevant markers (`@smoke`, `@negative`)

### UI Test Writing

When writing UI tests:

1. Use Page Object Model (extend `BasePage`)
2. Keep locators **private** and methods **public**
3. Use `allure.step()` to structure test flow
4. Use context (`ctx`) for cross-step data sharing
5. Call `assertOn[Page]()` to verify page load
6. Tag with `@ui` and relevant markers (`@e2e`, `@smoke`)

### Page Class Writing

When creating new page classes:

1. Extend `BasePage`
2. Define all locators as private properties
3. Create private helper locator methods for dynamic selection
4. Expose only high-level public methods (open, assert, actions)
5. Use descriptive method names: `async add[Thing]()`, `async assert[State]()`
6. Import and initialize component classes (Header, etc.)

---

## 🔧 Best Practices

### For Developers

✅ **DO:**

- Use Zod schemas for API validation
- Create builder/factory methods for test data
- Keep pages focused on a single route
- Use context for sharing state between steps
- Wrap logical workflows in `allure.step()`
- Tag tests appropriately (`@api`, `@ui`, `@smoke`)

❌ **DON'T:**

- Hardcode test data in tests
- Make locators public in page classes
- Create monolithic test methods
- Skip response validation
- Leave created API resources uncleaned
- Use flaky CSS selectors without `data-testid`

---

## 📚 Quick Reference

| Command                          | Purpose                   |
| -------------------------------- | ------------------------- |
| `npm run test:qa:api`            | Run API tests locally     |
| `npm run test:qa:ui`             | Run UI tests locally      |
| `npm run test:qa:smoke`          | Run smoke tests           |
| `npm run report:allure:generate` | Generate Allure report    |
| `npm run lint`                   | Run ESLint                |
| `npm run format`                 | Format code with Prettier |

---

## 🆘 Getting Help

When requesting features or fixes:

- Reference the page class or API module name
- Provide the test tag (`@api`, `@ui`, `@visual`)
- Specify what assertion or action is needed
- Include example test data if relevant
