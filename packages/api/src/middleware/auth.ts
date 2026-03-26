import type { Context, Next } from 'hono';
import { timingSafeEqual } from 'crypto';

const API_KEYS = (process.env.ETERECITIZEN_API_KEYS || '').split(',').filter(Boolean);

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function requireApiKey() {
  return async (c: Context, next: Next) => {
    // Skip auth if no API keys configured (dev mode)
    if (API_KEYS.length === 0) {
      await next();
      return;
    }

    const apiKey = c.req.header('x-api-key') || c.req.query('api_key');
    if (!apiKey || !API_KEYS.some((key) => safeCompare(key, apiKey))) {
      return c.json({ error: 'Invalid or missing API key' }, 401);
    }

    await next();
  };
}
