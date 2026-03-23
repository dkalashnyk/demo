import { APIRequestContext } from '@playwright/test';
import { z } from 'zod';
import { faker } from '@faker-js/faker';

export const ItemDataSchema = z
  .object({
    year: z.number().int().optional(),
    Color: z.string().optional(),
    Price: z.number().optional(),
    Description: z.string().optional(),
  })
  .optional()
  .nullable();

// Base zod schema
export const ItemBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  data: ItemDataSchema,
});

// POST response includes createdAt
export const CreatedItemSchema = ItemBaseSchema.extend({
  createdAt: z.number(),
});

// GET response does not
export const ItemSchema = ItemBaseSchema;

export const DeleteResponseSchema = z.object({
  message: z.string(),
});

/**
 * Schema for 4xx error responses.
 * Adjust the shape to match what your API actually returns.
 */
export const ErrorSchema = z.object({
  error: z.string(),
});

export type Item = z.infer<typeof ItemSchema>;
export type CreatedItem = z.infer<typeof CreatedItemSchema>;
export type ApiError = z.infer<typeof ErrorSchema>;

// Request payload
export type CreateItemPayload = {
  name: string;
  data: {
    year?: number;
    Color?: string;
    Price?: number;
    Description?: string;
  };
};

/**
 * Factory that produces a valid CreateItemPayload with sensible defaults.
 * Override only the fields you care about in each test.
 *
 * @example
 * buildItem()                          // fully default
 * buildItem({ name: 'Test' })    // partial override
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

const itemsApi = {
  async createItem(api: APIRequestContext, payload: CreateItemPayload) {
    const res = await api.post('/objects', { data: payload });
    const json = await res.json();
    return { res, json, parsed: CreatedItemSchema.safeParse(json) };
  },

  async getItem(api: APIRequestContext, id: string) {
    const res = await api.get(`/objects/${id}`);
    const json = await res.json();
    return { res, json, parsed: ItemSchema.safeParse(json) };
  },

  async deleteItem(api: APIRequestContext, id: string) {
    const res = await api.delete(`/objects/${id}`);
    const json = await res.json();
    return { res, json, parsed: DeleteResponseSchema.safeParse(json) };
  },

  /**
   * Intentionally untyped — accepts any shape so negative tests can send
   * malformed / missing-field payloads without TypeScript blocking them.
   */
  async createItemRaw(api: APIRequestContext, payload: Record<string, unknown>) {
    const res = await api.post('/objects', { data: payload });
    const json = await res.json();
    return { res, json, parsedError: ErrorSchema.safeParse(json) };
  },

  async getItemRaw(api: APIRequestContext, id: string) {
    const res = await api.get(`/objects/${id}`);
    const json = await res.json();
    return { res, json, parsedError: ErrorSchema.safeParse(json) };
  },

  async deleteItemRaw(api: APIRequestContext, id: string) {
    const res = await api.delete(`/objects/${id}`);
    const json = await res.json();
    return { res, json, parsedError: ErrorSchema.safeParse(json) };
  },
};

export default itemsApi;
