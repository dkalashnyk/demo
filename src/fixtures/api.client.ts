import { APIRequestContext, APIResponse, test } from '@playwright/test';

type RequestOptions = Parameters<APIRequestContext['get']>[1];

async function attachApiCall(method: string, url: string, requestBody: unknown, res: APIResponse) {
  const info = test.info();
  const responseText = await res.text();
  await info.attach(`${method} ${url} — Request`, {
    body: JSON.stringify(requestBody ?? null, null, 2),
    contentType: 'application/json',
  });
  await info.attach(`${method} ${url} — Response (${res.status()})`, {
    body: tryPrettyPrint(responseText),
    contentType: 'application/json',
  });
  await info.attach(`${method} ${url} — Headers`, {
    body: JSON.stringify(res.headers(), null, 2),
    contentType: 'application/json',
  });
}

function tryPrettyPrint(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function playwrightApi(ctx: APIRequestContext): APIRequestContext {
  const wrap =
    (method: 'get' | 'post' | 'put' | 'patch' | 'delete') =>
    async (url: string, options?: RequestOptions): Promise<APIResponse> =>
      test.step(`${method.toUpperCase()} ${url}`, async () => {
        const res = await ctx[method](url, options);
        await attachApiCall(method.toUpperCase(), url, options?.data ?? null, res);
        return res;
      });

  return new Proxy(ctx, {
    get(target, prop) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(prop as string))
        return wrap(prop as 'get' | 'post' | 'put' | 'patch' | 'delete');
      return Reflect.get(target, prop);
    },
  });
}
