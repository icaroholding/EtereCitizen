import { Hono } from 'hono';

export const searchRoutes = new Hono();

searchRoutes.get('/search', async (c) => {
  const capability = c.req.query('capability');
  const minRating = c.req.query('minRating') ? parseFloat(c.req.query('minRating')!) : undefined;
  const minLevel = c.req.query('minLevel') ? parseInt(c.req.query('minLevel')!) : undefined;
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 20;

  // The agent registry is currently local-only (SQLite).
  // A future release will add a public on-chain registry via ERC-8004.
  return c.json({
    agents: [],
    total: 0,
    filters: { capability, minRating, minLevel, limit },
    message: 'Public agent search coming soon. Use the SDK or CLI for local registry search.',
  });
});
