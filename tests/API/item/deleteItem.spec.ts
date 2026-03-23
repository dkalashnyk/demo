import { test, expect } from '../../../src/fixtures/api.fixtures';
import itemsApi, { buildItem } from '../../../src/api/items.api';

test('@api @smoke Delete an item', async ({ api }) => {
  // Create an item
  const payload = buildItem();
  const { res: createRes, json: created } = await itemsApi.createItem(api, payload);
  expect(createRes.status()).toBe(200);
  const createdId: string = created.id;

  // Delete the item
  const { res: deleteRes, json: deleted } = await itemsApi.deleteItem(api, createdId);
  expect(deleteRes.status()).toBe(200);
  expect(deleted.message).toContain(createdId);

  // Try to get the deleted item
  const { res: getRes, parsedError } = await itemsApi.getItemRaw(api, createdId);
  expect(getRes.status()).toBe(404);
  expect(
    parsedError.success,
    `Error response did not match ErrorSchema: ${JSON.stringify(parsedError)}`,
  ).toBe(true);
});

test('@api @negative DELETE /objects/:id - returns 404 for a non-existent item', async ({
  api,
}) => {
  const { res, parsedError } = await itemsApi.deleteItemRaw(api, '999_999_999');
  expect(res.status()).toBe(404);
  expect(
    parsedError.success,
    `Error response did not match ErrorSchema: ${JSON.stringify(parsedError)}`,
  ).toBe(true);
});
