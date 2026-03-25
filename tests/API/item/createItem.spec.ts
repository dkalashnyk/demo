import { test, expect } from '../../../src/fixtures/api.fixtures';
import itemsApi, { buildItem } from '../../../src/api/items.api';

test('@api @smoke Create an item', async ({ api }) => {
  const payload = buildItem();
  const { res, json, parsed } = await itemsApi.createItem(api, payload);

  try {
    expect(res.status()).toBe(200);
    expect(parsed.success, `Response did not match ItemSchema: ${JSON.stringify(parsed)}`).toBe(
      true,
    );
    expect(json).toMatchObject({
      name: payload.name,
      data: payload.data,
    });
  } finally {
    await itemsApi.deleteItem(api, json.id);
  }
});

// test('@api @negative POST /objects - returns 400 when name is missing', async ({ api }) => {
//   const { res, json, parsedError } = await itemsApi.createItemRaw(api, {
//     data: {
//       year: 2020,
//       Color: 'red',
//     },
//   });

//   expect(res.status()).toBe(400);

//   expect(
//     parsedError.success,
//     `Error response did not match ErrorSchema: ${JSON.stringify(parsedError)}`,
//   ).toBe(true);

//   expect(typeof json.message).toBe('string');
//   expect(json.message.length).toBeGreaterThan(0);
// });

// test('@api @negative POST /users/add - returns 400 when body is completely empty', async ({
//   api,
// }) => {
//   const { res, parsedError } = await itemsApi.createItemRaw(api, {});

//   expect(res.status()).toBe(400);

//   expect(
//     parsedError.success,
//     `Error response did not match ErrorSchema: ${JSON.stringify(parsedError)}`,
//   ).toBe(true);
// });

// test('@api @negative POST /objects - returns 400 when year is not a number', async ({ api }) => {
//   const { res, parsedError } = await itemsApi.createItemRaw(api, {
//     ...buildItem(),
//     data: {
//       ...buildItem().data,
//       year: 'not a number',
//     },
//   });

//   expect(res.status()).toBe(400);

//   expect(
//     parsedError.success,
//     `Error response did not match ErrorSchema: ${JSON.stringify(parsedError)}`,
//   ).toBe(true);
// });
