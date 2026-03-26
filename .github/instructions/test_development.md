# Test Development Guide — Demo Test Automation Framework

This guide provides step-by-step instructions for developing new tests following the project structure, code conventions, and best practices.

---

## 📖 Table of Contents

1. [Before You Start](#before-you-start)
2. [API Test Development](#api-test-development)
3. [UI Test Development](#ui-test-development)
4. [Test Data & Factories](#test-data--factories)
5. [Common Scenarios](#common-scenarios)
6. [Debugging & Troubleshooting](#debugging--troubleshooting)

---

## Before You Start

### Understanding Test Types

| Test Type        | Purpose                                       | Framework            | Location                |
| ---------------- | --------------------------------------------- | -------------------- | ----------------------- |
| **API Tests**    | Test backend endpoints with schema validation | Playwright + Zod     | `tests/API/[resource]/` |
| **UI Tests**     | Test user workflows with page interactions    | Playwright + POM     | `tests/UI/`             |
| **Visual Tests** | Detect visual regressions                     | Playwright snapshots | `tests/UI/Visual/`      |

### Test Naming Conventions

```
Test Files:        [operation].spec.ts (e.g., createItem.spec.ts)
Test Names:        @tag Scenario description (e.g., @api @smoke Create an item)
Folder Structure:  tests/[Type]/[Resource]/[operation].spec.ts
```

### Required Imports

```typescript
// For API tests
import { test, expect } from '../../../src/fixtures/api.fixtures';
import itemsApi, { buildItem } from '../../../src/api/items.api';

// For UI tests
import { test } from '../../src/fixtures/test';
import allure from '../../src/utils/allure';
import { ProductsPage } from '../../src/pages/ProductsPage';
```

---

## API Test Development

### Step 1: Define API Module (if new resource)

**File**: `src/api/[resource].api.ts`

Create a new API module with:

- Zod schemas for request/response
- Type definitions
- Builder function for test data
- API methods

```typescript
// src/api/orders.api.ts
import { APIRequestContext } from '@playwright/test';
import { z } from 'zod';
import { faker } from '@faker-js/faker';
import { ENDPOINTS } from './endpoints';

// ===== ZOOD SCHEMAS =====
export const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

export const CreateOrderPayloadSchema = z.object({
  customerId: z.string(),
  items: z.array(OrderItemSchema),
  deliveryDate: z.string().date().optional(),
  notes: z.string().optional(),
});

export const OrderSchema = CreateOrderPayloadSchema.extend({
  id: z.string(),
  createdAt: z.number(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered']),
  total: z.number().positive(),
});

export const DeleteResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
});

// ===== TYPE DEFINITIONS =====
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CreateOrderPayload = z.infer<typeof CreateOrderPayloadSchema>;
export type Order = z.infer<typeof OrderSchema>;

// ===== TEST DATA BUILDER =====
/**
 * Creates valid order payload with sensible defaults.
 * Override only the fields you need.
 */
export function buildOrder(overrides: Partial<CreateOrderPayload> = {}): CreateOrderPayload {
  return {
    customerId: faker.string.uuid(),
    items: [
      {
        productId: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
      },
    ],
    deliveryDate: faker.date.future().toISOString().split('T')[0],
    notes: faker.lorem.sentence(),
    ...overrides,
  };
}

// ===== API METHODS =====
const ordersApi = {
  async createOrder(api: APIRequestContext, payload: CreateOrderPayload) {
    const res = await api.post(ENDPOINTS.orders, { data: payload });
    const json = await res.json();
    return { res, json, parsed: OrderSchema.safeParse(json) };
  },

  async getOrder(api: APIRequestContext, id: string) {
    const res = await api.get(`${ENDPOINTS.orders}/${id}`);
    const json = await res.json();
    return { res, json, parsed: OrderSchema.safeParse(json) };
  },

  async updateOrder(api: APIRequestContext, id: string, payload: Partial<CreateOrderPayload>) {
    const res = await api.put(`${ENDPOINTS.orders}/${id}`, { data: payload });
    const json = await res.json();
    return { res, json, parsed: OrderSchema.safeParse(json) };
  },

  async deleteOrder(api: APIRequestContext, id: string) {
    const res = await api.delete(`${ENDPOINTS.orders}/${id}`);
    const json = await res.json();
    return { res, json, parsed: DeleteResponseSchema.safeParse(json) };
  },

  async listOrders(api: APIRequestContext) {
    const res = await api.get(ENDPOINTS.orders);
    const json = await res.json();
    return { res, json, parsed: z.array(OrderSchema).safeParse(json) };
  },
};

export default ordersApi;
```

### Step 2: Update Endpoints (if new resource)

**File**: `src/api/endpoints.ts`

```typescript
export const ENDPOINTS = {
  root: '/',
  items: '/objects',
  users: '/users',
  orders: '/orders', // New endpoint
};
```

### Step 3: Write API Test

**File**: `tests/API/[resource]/[operation].spec.ts`

**Pattern**: SETUP → EXECUTE → VERIFY → CLEANUP

```typescript
// tests/API/order/createOrder.spec.ts
import { test, expect } from '../../../src/fixtures/api.fixtures';
import ordersApi, { buildOrder } from '../../../src/api/orders.api';

test.describe('Orders API', () => {
  test('@api @smoke Create an order with valid data', async ({ api }) => {
    // ===== SETUP =====
    const payload = buildOrder({
      notes: 'Rush delivery requested',
    });

    // ===== EXECUTE =====
    const { res, json, parsed } = await ordersApi.createOrder(api, payload);

    // ===== VERIFY =====
    try {
      expect(res.status()).toBe(201);
      expect(parsed.success, `Schema validation failed: ${JSON.stringify(parsed)}`).toBe(true);
      expect(json.id).toBeDefined();
      expect(json.status).toBe('pending');
      expect(json).toMatchObject({
        customerId: payload.customerId,
        notes: payload.notes,
      });
    } finally {
      // ===== CLEANUP =====
      if (json.id) {
        await ordersApi.deleteOrder(api, json.id);
      }
    }
  });

  test('@api @negative Create order fails without customerId', async ({ api }) => {
    // ===== EXECUTE & VERIFY =====
    const { res, json } = await ordersApi.createOrder(api, {
      customerId: '', // Invalid
      items: [],
    });

    expect(res.status()).toBe(400);
    expect(json.error || json.message).toBeDefined();
  });

  test('@api Get existing order', async ({ api }) => {
    // ===== SETUP =====
    const createPayload = buildOrder();
    const { json: createdOrder } = await ordersApi.createOrder(api, createPayload);

    // ===== EXECUTE =====
    const { res, json, parsed } = await ordersApi.getOrder(api, createdOrder.id);

    // ===== VERIFY =====
    try {
      expect(res.status()).toBe(200);
      expect(parsed.success).toBe(true);
      expect(json.id).toBe(createdOrder.id);
    } finally {
      // ===== CLEANUP =====
      await ordersApi.deleteOrder(api, createdOrder.id);
    }
  });

  test('@api Update order status', async ({ api }) => {
    // ===== SETUP =====
    const payload = buildOrder();
    const { json: createdOrder } = await ordersApi.createOrder(api, payload);

    // ===== EXECUTE =====
    const { res, json, parsed } = await ordersApi.updateOrder(api, createdOrder.id, {
      status: 'processing',
    });

    // ===== VERIFY =====
    try {
      expect(res.status()).toBe(200);
      expect(parsed.success).toBe(true);
      expect(json.status).toBe('processing');
    } finally {
      // ===== CLEANUP =====
      await ordersApi.deleteOrder(api, createdOrder.id);
    }
  });
});
```

### API Test Checklist

- ✅ Create Zod schemas for request/response
- ✅ Define TypeScript types inferred from Zod
- ✅ Create builder function with Faker.js
- ✅ Implement API methods returning `{ res, json, parsed }`
- ✅ Tag tests with `@api` and operation type (`@smoke`, `@negative`)
- ✅ Validate status codes AND schema parsing
- ✅ Clean up resources in `finally` block
- ✅ Use descriptive test names

---

## UI Test Development

### Step 1: Create Page Class (if new page)

**File**: `src/pages/[PageName]Page.ts`

```typescript
// src/pages/OrderDetailsPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrderDetailsPage extends BasePage {
  // ===== LOCATORS (Private) =====
  private readonly orderId = this.page.locator('[data-testid="order-id"]');
  private readonly orderStatus = this.page.locator('[data-testid="order-status"]');
  private readonly itemsList = this.page.getByTestId('order-items');
  private readonly totalPrice = this.page.locator('[data-testid="total-price"]');
  private readonly editButton = this.page.getByRole('button', { name: 'Edit Order' });
  private readonly cancelButton = this.page.getByRole('button', { name: 'Cancel Order' });
  private readonly backButton = this.page.getByRole('button', { name: 'Back' });

  constructor(page: Page) {
    super(page);
  }

  // ===== HELPER METHODS (Private) =====
  private getItemByProductName(name: string): Locator {
    return this.itemsList.getByTestId('order-item').filter({
      has: this.page.getByTestId('product-name').filter({ hasText: name }),
    });
  }

  private getItemQuantity(name: string): Locator {
    return this.getItemByProductName(name).getByTestId('item-quantity');
  }

  private getItemPrice(name: string): Locator {
    return this.getItemByProductName(name).getByTestId('item-price');
  }

  // ===== PUBLIC METHODS =====
  async open(orderId: string): Promise<void> {
    await this.page.goto(`/orders/${orderId}`);
  }

  async assertOnOrderDetailsPage(): Promise<void> {
    await this.expectUrlContains('/orders/');
    await expect(this.orderId).toBeVisible();
    await expect(this.orderStatus).toBeVisible();
  }

  async expectOrderId(expected: string): Promise<void> {
    await expect(this.orderId).toContainText(expected);
  }

  async expectOrderStatus(status: string): Promise<void> {
    await expect(this.orderStatus).toContainText(status);
  }

  async expectItemInOrder(
    name: string,
    expected: { quantity: string; price: string },
  ): Promise<void> {
    await expect(this.getItemQuantity(name)).toContainText(expected.quantity);
    await expect(this.getItemPrice(name)).toContainText(expected.price);
  }

  async expectTotalPrice(price: string): Promise<void> {
    await expect(this.totalPrice).toContainText(price);
  }

  async clickEditOrder(): Promise<void> {
    await this.editButton.click();
  }

  async clickCancelOrder(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickBack(): Promise<void> {
    await this.backButton.click();
  }
}
```

### Step 2: Write UI Test

**File**: `tests/UI/[feature]/[scenario].spec.ts`

**Pattern**: METADATA → SETUP → ACT & VERIFY with STEPS

```typescript
// tests/UI/orders/orderDetails.spec.ts
import { test } from '../../src/fixtures/test';
import allure from '../../src/utils/allure';
import { OrderDetailsPage } from '../../src/pages/OrderDetailsPage';
import { OrderListPage } from '../../src/pages/OrderListPage';

test.describe('Order Details Page', () => {
  test('@ui TC010 View order details and items', async ({ page }) => {
    // ===== METADATA =====
    await allure.epic('Orders');
    await allure.feature('Order Management');
    await allure.story('User views order details');

    // ===== SETUP =====
    const orderListPage = new OrderListPage(page);
    const orderDetailsPage = new OrderDetailsPage(page);

    // ===== ACT & VERIFY =====
    await allure.step('Open Orders list page', async () => {
      await orderListPage.open();
      await orderListPage.assertOnOrderListPage();
    });

    await allure.step('Select first order', async () => {
      await orderListPage.clickOrderByIndex(0);
      await orderDetailsPage.assertOnOrderDetailsPage();
    });

    await allure.step('Verify order details are displayed', async () => {
      await orderDetailsPage.expectOrderId(/ORD-\d+/);
      await orderDetailsPage.expectOrderStatus('Pending');
      await orderDetailsPage.expectItemInOrder('Widget Pro', {
        quantity: '2',
        price: '$99.99',
      });
    });

    await allure.step('Take screenshot for visual regression', async () => {
      await page.screenshot({ path: 'order-details.png' });
    });
  });

  test('@ui TC011 Cancel order from details page', async ({ page, ctx }) => {
    // ===== METADATA =====
    await allure.epic('Orders');
    await allure.feature('Order Management');
    await allure.story('User cancels order');
    await allure.severity('normal');

    // ===== SETUP =====
    const orderDetailsPage = new OrderDetailsPage(page);
    const orderId = 'ORD-123456'; // From setup or context

    // ===== ACT & VERIFY =====
    await allure.step('Navigate to order details', async () => {
      await orderDetailsPage.open(orderId);
      await orderDetailsPage.assertOnOrderDetailsPage();
    });

    await allure.step('Verify order is cancellable', async () => {
      await orderDetailsPage.expectOrderStatus('Pending');
    });

    await allure.step('Click Cancel Order button', async () => {
      await orderDetailsPage.clickCancelOrder();
    });

    await allure.step('Confirm cancellation dialog', async () => {
      await page.getByRole('button', { name: 'Confirm' }).click();
    });

    await allure.step('Verify order status changed', async () => {
      await page.waitForLoadState('networkidle');
      await orderDetailsPage.expectOrderStatus('Cancelled');
    });
  });
});
```

### UI Test Checklist

- ✅ Create page class extending `BasePage`
- ✅ Define all locators as `private`
- ✅ Create private helper locator methods
- ✅ Expose high-level public methods
- ✅ Use descriptive method names (action verbs: `open`, `click`, `expect`)
- ✅ Tag with `@ui` and scenario type (`@e2e`, `@smoke`)
- ✅ Use `allure.step()` to structure test flow
- ✅ Use context for data sharing across steps
- ✅ Call `assertOn[Page]()` to verify page load
- ✅ No hardcoded waits — use `waitForLoadState()`, `toBeVisible()`, etc.

---

## Test Data & Factories

### Creating Test Data Builders

**File**: `src/test-data/[resource]Factory.ts`

```typescript
// src/test-data/orderFactory.ts
import { faker } from '@faker-js/faker';

export type OrderFormData = {
  customerId: string;
  deliveryDate: string;
  specialInstructions: string;
  expressShipping: boolean;
};

export class OrderFactory {
  /**
   * Creates valid order form data with sensible defaults.
   * Override only the fields you need.
   */
  static create(overrides: Partial<OrderFormData> = {}): OrderFormData {
    return {
      customerId: faker.string.uuid(),
      deliveryDate: faker.date.future().toISOString().split('T')[0],
      specialInstructions: faker.lorem.sentence(),
      expressShipping: faker.datatype.boolean(),
      ...overrides,
    };
  }

  /**
   * Create multiple orders with variations
   */
  static createMultiple(count: number, overrides?: Partial<OrderFormData>) {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Create with specific business scenario
   */
  static createUrgent(): OrderFormData {
    return this.create({
      expressShipping: true,
      deliveryDate: faker.date.soon().toISOString().split('T')[0],
    });
  }
}
```

### Using Test Data

```typescript
// Default data
const order = OrderFactory.create();

// Override specific fields
const order = OrderFactory.create({
  customerId: 'CUST-12345',
  expressShipping: true,
});

// Scenario-based
const urgentOrder = OrderFactory.createUrgent();

// Multiple
const orders = OrderFactory.createMultiple(5);
```

---

## Common Scenarios

### Scenario 1: Testing CRUD Operations

```typescript
// ===== CREATE =====
test('@api Create resource with valid data', async ({ api }) => {
  const payload = buildOrder();
  const { res, json, parsed } = await ordersApi.createOrder(api, payload);

  try {
    expect(res.status()).toBe(201);
    expect(parsed.success).toBe(true);
  } finally {
    await ordersApi.deleteOrder(api, json.id);
  }
});

// ===== READ =====
test('@api Retrieve created resource', async ({ api }) => {
  const payload = buildOrder();
  const { json: created } = await ordersApi.createOrder(api, payload);

  try {
    const { res, parsed } = await ordersApi.getOrder(api, created.id);
    expect(res.status()).toBe(200);
    expect(parsed.success).toBe(true);
  } finally {
    await ordersApi.deleteOrder(api, created.id);
  }
});

// ===== UPDATE =====
test('@api Update resource field', async ({ api }) => {
  const payload = buildOrder();
  const { json: created } = await ordersApi.createOrder(api, payload);

  try {
    const { res, parsed } = await ordersApi.updateOrder(api, created.id, {
      notes: 'Updated notes',
    });
    expect(res.status()).toBe(200);
    expect(parsed.data?.notes).toBe('Updated notes');
  } finally {
    await ordersApi.deleteOrder(api, created.id);
  }
});

// ===== DELETE =====
test('@api Delete resource', async ({ api }) => {
  const payload = buildOrder();
  const { json: created } = await ordersApi.createOrder(api, payload);

  const { res, parsed } = await ordersApi.deleteOrder(api, created.id);
  expect(res.status()).toBe(200);
  expect(parsed.success).toBe(true);
});
```

### Scenario 2: Complex UI Workflow with Data Sharing

```typescript
test('@ui @e2e Complete order checkout workflow', async ({ page, ctx }) => {
  // ===== SETUP & DATA SHARING =====
  const orderData = OrderFactory.create();
  ctx.set('orderData', orderData);

  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const confirmationPage = new ConfirmationPage(page);

  // ===== STEP 1: CHECKOUT WITH DATA =====
  await allure.step('Fill checkout form', async () => {
    const data = ctx.require<OrderFormData>('orderData');
    await checkoutPage.open();
    await checkoutPage.fillForm(data);
  });

  // ===== STEP 2: VERIFY & SUBMIT =====
  await allure.step('Review and submit order', async () => {
    await checkoutPage.expectFormFilled();
    await checkoutPage.clickPlaceOrder();
  });

  // ===== STEP 3: VERIFY CONFIRMATION =====
  await allure.step('Verify order confirmation', async () => {
    await confirmationPage.assertOnPage();
    const orderId = await confirmationPage.getOrderId();
    ctx.set('orderId', orderId);

    // Store for cleanup or next test
    expect(orderId).toBeDefined();
  });
});
```

### Scenario 3: Parameterized Tests

```typescript
const testCases = [
  { status: 'pending', expected: 'Pending', color: 'yellow' },
  { status: 'processing', expected: 'Processing', color: 'blue' },
  { status: 'delivered', expected: 'Delivered', color: 'green' },
];

testCases.forEach(({ status, expected, color }) => {
  test(`@ui Order status ${status} displays correctly`, async ({ page }) => {
    const orderPage = new OrderDetailsPage(page);
    await orderPage.open('ORDER-123');

    // Simulate status change or use test data
    await page.evaluate((s) => {
      document.querySelector('[data-testid="order-status"]').textContent = s;
    }, expected);

    await orderPage.expectOrderStatus(expected);
    // Optionally verify styling
    const statusElement = page.locator('[data-testid="order-status"]');
    await expect(statusElement).toHaveClass(new RegExp(color));
  });
});
```

### Scenario 4: Error Handling & Edge Cases

```typescript
test.describe('Order API - Error Cases', () => {
  test('@api @negative Missing required field validation', async ({ api }) => {
    const { res, json } = await ordersApi.createOrder(api, {
      // Missing customerId
      items: [],
      deliveryDate: faker.date.future().toISOString(),
    });

    expect(res.status()).toBe(400);
    expect(json.error || json.message).toContain('customerId');
  });

  test('@api @negative Invalid data type handling', async ({ api }) => {
    const { res, json } = await ordersApi.createOrder(api, {
      customerId: 'CUST-123',
      items: [
        {
          quantity: 'not-a-number', // Invalid
          price: 99.99,
        },
      ],
    });

    expect(res.status()).toBe(400);
  });

  test('@api @negative Resource not found', async ({ api }) => {
    const { res, json } = await ordersApi.getOrder(api, 'NON-EXISTENT-ID');

    expect(res.status()).toBe(404);
    expect(json.error || json.message).toBeDefined();
  });
});
```

---

## Debugging & Troubleshooting

### Enable Debug Mode

```bash
# Run tests with debug output
npm run test:qa:api -- --debug

# Or with verbose logging
npm run test:qa:ui -- --verbose
```

### Common Issues & Solutions

#### Issue: Schema Validation Fails

```typescript
// ❌ BEFORE: Unclear error
expect(parsed.success).toBe(true);

// ✅ AFTER: Clear error message
expect(
  parsed.success,
  `Schema validation failed. Errors: ${JSON.stringify(parsed.error?.errors)}`,
).toBe(true);
```

#### Issue: Flaky Tests with Waits

```typescript
// ❌ AVOID: Hard-coded wait
await page.waitForTimeout(2000);

// ✅ PREFER: Conditional wait
await page.waitForLoadState('networkidle');
await expect(locator).toBeVisible();
```

#### Issue: Unclean Test Data

```typescript
// ❌ BAD: Cleanup is optional
let createdId;
try {
  createdId = await createResource();
} catch (e) {
  // May skip cleanup if error occurs
}

// ✅ GOOD: Guaranteed cleanup
let createdId;
try {
  createdId = await createResource();
  // assertions
} finally {
  // Always runs, even if error
  if (createdId) await deleteResource(createdId);
}
```

#### Issue: Page Not Ready

```typescript
// ❌ WRONG: Method called before page load
const page = new ProductsPage(page);
page.addProduct(); // Might fail - page not loaded yet

// ✅ CORRECT: Always call open() first
const page = new ProductsPage(page);
await page.open();
await page.assertOnProductsPage();
await page.addProduct();
```

### Debugging with Screenshots

```typescript
test('@ui Debug screenshot on failure', async ({ page }) => {
  try {
    await page.goto('/some-page');
    await expect(page.locator('[data-testid="element"]')).toBeVisible();
  } catch (e) {
    // Capture debug info on failure
    await page.screenshot({ path: `debug-${Date.now()}.png` });
    console.error('Page HTML:', await page.content());
    throw e;
  }
});
```

### Debugging API Responses

```typescript
test('@api Log response for debugging', async ({ api }) => {
  const { res, json, parsed } = await ordersApi.getOrder(api, 'ORDER-123');

  // Log raw response
  console.log('Status:', res.status());
  console.log('Headers:', res.headers());
  console.log('Body:', json);
  console.log('Parsed:', parsed);

  // Use this info to update Zod schema if needed
  expect(parsed.success).toBe(true);
});
```

---

## Best Practices Summary

### ✅ DO

- Use builder functions for test data
- Wrap API calls with `{ res, json, parsed }`
- Always validate schema AND status codes
- Use `finally` blocks for cleanup
- Keep page methods small and focused
- Use `allure.step()` for readability
- Tag tests appropriately
- Use context for data sharing
- Make locators private in page classes

### ❌ DON'T

- Hardcode test data in tests
- Skip schema validation
- Use hard `waitForTimeout()`
- Leave created resources uncleaned
- Mix business logic in page classes
- Ignore error responses in API tests
- Make all Page class properties public
- Create monolithic test methods
- Use unreliable CSS selectors

---

## Project Commands Reference

```bash
# Run by test type
npm run test:qa:api             # API tests only
npm run test:qa:ui              # UI tests only
npm run test:qa:smoke           # Smoke tests (@smoke tag)
npm run test:qa:visual          # Visual regression

# Run specific test
npm run test:qa -- tests/API/order/createOrder.spec.ts

# Filter by tag
npm run test:qa -- --grep "@api"
npm run test:qa -- --grep "@negative"

# Update visual snapshots
npm run test:qa:update-snapshots

# View reports
npm run report:allure:generate
npm run report:allure:open
```

---

## Next Steps

1. **Review existing tests** in `tests/API/` and `tests/UI/` for patterns
2. **Identify new test scenarios** from requirements
3. **Create API modules** if testing new resources
4. **Create page classes** if testing new UI pages
5. **Write test data factories** for reusable test data
6. **Implement tests** following SETUP → EXECUTE → VERIFY pattern
7. **Run tests locally** before pushing to CI/CD
8. **Generate reports** to verify test coverage

---

## Additional Resources

- **Playwright Docs**: https://playwright.dev/docs/intro
- **Zod Docs**: https://zod.dev/
- **Allure Docs**: https://allurereport.org/docs/
- **Faker.js Docs**: https://fakerjs.dev/
- **Project README**: See project root for project-specific setup
