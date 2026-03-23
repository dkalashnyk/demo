import { APIRequestContext } from '@playwright/test';
import { z } from 'zod';
import { faker } from '@faker-js/faker';

export const UserDataSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  zip: z.string(),
  dob: z.string().optional(),
});

// Zod schemas
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  data: UserDataSchema,
});

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

export type User = z.infer<typeof UserSchema>;
export type ApiError = z.infer<typeof ErrorSchema>;

// Request payload
export type CreateUserPayload = {
  name: string;
  data: {
    firstName: string;
    lastName: string;
    zip: string;
    dob?: string;
  };
};

/**
 * Factory that produces a valid CreateUserPayload with sensible defaults.
 * Override only the fields you care about in each test.
 *
 * @example
 * buildUser()                          // fully default
 * buildUser({ name: 'Alice' })    // partial override
 */
export function buildUser(overrides: Partial<CreateUserPayload> = {}): CreateUserPayload {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName() + '_TA';
  return {
    name: `${firstName} ${lastName}`,
    data: {
      firstName,
      lastName,
      zip: faker.location.zipCode().toString(),
      dob: faker.date.past({ years: 100 }).toString(),
    },
    ...overrides,
  };
}

const usersApi = {
  async createUser(api: APIRequestContext, payload: CreateUserPayload) {
    const res = await api.post('/collections/users/objects/', { data: payload });
    const json = await res.json();
    return { res, json, parsed: UserSchema.safeParse(json) };
  },

  async getUser(api: APIRequestContext, id: number) {
    const res = await api.get(`/collections/users/objects/${id}`);
    const json = await res.json();
    return { res, json, parsed: UserSchema.safeParse(json) };
  },

  async deleteUser(api: APIRequestContext, id: number) {
    const res = await api.delete(`/collections/users/objects/${id}`);
    const json = await res.json();
    return { res, json, parsed: DeleteResponseSchema.safeParse(json) };
  },

  /**
   * Intentionally untyped — accepts any shape so negative tests can send
   * malformed / missing-field payloads without TypeScript blocking them.
   */
  async createUserRaw(api: APIRequestContext, payload: Record<string, unknown>) {
    const res = await api.post('/collections/users/objects/', { data: payload });
    const json = await res.json();
    return { res, json, parsedError: ErrorSchema.safeParse(json) };
  },

  /**
   * Accepts a string so tests can pass non-numeric IDs (e.g. "abc", "-1").
   */
  async getUserRaw(api: APIRequestContext, id: number | string) {
    const res = await api.get(`/collections/users/objects/${id}`);
    const json = await res.json();
    return { res, json, parsedError: ErrorSchema.safeParse(json) };
  },
};

export default usersApi;
