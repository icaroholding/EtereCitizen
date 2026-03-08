import { Hono } from 'hono';
import { EtereCitizen } from '@eterecitizen/sdk';

export const searchRoutes = new Hono();

searchRoutes.get('/search', async (c) => {
  const capability = c.req.query('capability') as any;
  const minRating = c.req.query('minRating') ? parseFloat(c.req.query('minRating')!) : undefined;
  const minLevel = c.req.query('minLevel') ? parseInt(c.req.query('minLevel')!) : undefined;
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 20;

  try {
    const result = await EtereCitizen.search({
      capability,
      minRating,
      minLevel,
      limit,
    });

    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Search failed' }, 500);
  }
});
