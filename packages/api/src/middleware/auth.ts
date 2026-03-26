import type { Context, Next } from 'hono';

const API_KEYS = new Set(
  (process.env.ETERECITIZEN_API_KEYS || '').split(',').filter(Boolean)
);

export function requireApiKey() {
  return async (c: Context, next: Next) => {
    // Skip auth if no API keys configured (dev mode)
    if (API_KEYS.size === 0) {
      await next();
      return;
    }

    const apiKey = c.req.header('x-api-key') || c.req.query('api_key');
    if (!apiKey || !API_KEYS.has(apiKey)) {
      return c.json({ error: 'Invalid or missing API key' }, 401);
    }

    await next();
  };
}
