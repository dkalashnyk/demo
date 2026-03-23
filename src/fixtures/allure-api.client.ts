import { APIRequestContext, APIResponse } from '@playwright/test';
import * as allure from 'allure-js-commons';

// ── Types ─────────────────────────────────────────────────────────────────────

type RequestOptions = Parameters<APIRequestContext['post']>[1];

// ── Attachment helper ─────────────────────────────────────────────────────────

async function attachApiCall(
  method: string,
  url: string,
  requestBody: unknown,
  res: APIResponse,
): Promise<void> {
  const responseText = await res.text();

  await allure.attachment(
    `${method} ${url} — Request`,
    JSON.stringify(requestBody ?? null, null, 2),
    { contentType: 'application/json' },
  );
  await allure.attachment(
    `${method} ${url} — Response (${res.status()})`,
    tryPrettyPrint(responseText),
    { contentType: 'application/json' },
  );
  await allure.attachment(`${method} ${url} — Headers`, JSON.stringify(res.headers(), null, 2), {
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

// ── Wrapper ───────────────────────────────────────────────────────────────────

/**
 * Wraps a Playwright APIRequestContext so that every HTTP call is
 * automatically recorded as an Allure step with request/response attachments.
 *
 * Usage — swap `api` for `allureApi(api)` once at the fixture level;
 * all API service methods stay completely unchanged.
 */
export function allureApi(ctx: APIRequestContext): APIRequestContext {
  const wrap =
    (method: 'get' | 'post' | 'put' | 'patch' | 'delete') =>
    async (url: string, options?: RequestOptions): Promise<APIResponse> => {
      const label = `${method.toUpperCase()} ${url}`;

      return allure.step(label, async () => {
        const res = await ctx[method](url, options);
        await attachApiCall(method.toUpperCase(), url, options?.data ?? null, res);
        return res;
      });
    };

  return new Proxy(ctx, {
    get(target, prop) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(prop as string)) {
        return wrap(prop as 'get' | 'post' | 'put' | 'patch' | 'delete');
      }
      return Reflect.get(target, prop);
    },
  });
}
