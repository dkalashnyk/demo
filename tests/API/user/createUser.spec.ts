import { test, expect } from '../../../src/fixtures/api.fixtures';
import usersApi, { buildUser } from '../../../src/api/users.api';

test('@api @smoke Create a user', async ({ api }) => {
  const payload = buildUser();
  const { res, json, parsed } = await usersApi.createUser(api, payload);

  expect(res.status()).toBe(200);

  expect(parsed.success, `Response did not match UserSchema: ${JSON.stringify(parsed)}`).toBe(true);

  expect(json).toMatchObject({
    name: payload.name,
    data: payload.data,
  });
});
