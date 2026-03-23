import { test, expect } from '../../../src/fixtures/api.fixtures';

test('@api @smoke env - API base URL is defined and reachable', async ({ api }) => {
  // A simple health-check / root request.
  const res = await api.get('/');

  expect(
    res.status(),
    `API base URL appears unreachable — check env.apiBaseUrl in your config. Status: ${res.status()}`,
  ).toBeLessThan(500);
});
