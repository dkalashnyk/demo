import { test, expect } from '../../../src/fixtures/api.fixtures';
import itemsApi, { buildItem } from '../../../src/api/items.api';

test('@api Get an item', async ({ api }) => {
  // Create an item
  const payload = buildItem();
  const { res: createRes, json: created } = await itemsApi.createItem(api, payload);
  try {
    expect(createRes.status()).toBe(200);
    const createdId: string = created.id;

    //Get the item
    const { res: getRes, json: item, parsed } = await itemsApi.getItem(api, createdId);
    expect(getRes.status()).toBe(200);
    expect(parsed.success, `Response did not match ItemSchema: ${JSON.stringify(parsed)}`).toBe(
      true,
    );

    expect(item.id).toBe(createdId);

    expect(item).toMatchObject({
      name: payload.name,
      data: payload.data,
    });
  } finally {
    await itemsApi.deleteItem(api, created.id);
  }
});

test('@api @negative GET /objects/:id - returns 404 for a non-existent item', async ({ api }) => {
  const { res, parsedError } = await itemsApi.getItemRaw(api, '999_999_999');

  expect(res.status()).toBe(404);

  expect(
    parsedError.success,
    `Error response did not match ErrorSchema: ${JSON.stringify(parsedError)}`,
  ).toBe(true);
});
