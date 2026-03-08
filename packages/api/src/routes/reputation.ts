import { Hono } from 'hono';
import { verifyAgent } from '../lib/verifier.js';

export const reputationRoutes = new Hono();

reputationRoutes.get('/reputation/:did', async (c) => {
  const did = decodeURIComponent(c.req.param('did'));

  try {
    const result = await verifyAgent(did);
    return c.json({
      did: result.did,
      overallScore: result.reputationScore,
      categoryRatings: result.categoryRatings,
      reviewCount: result.reviewCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Failed to fetch reputation', details: message }, 500);
  }
});

reputationRoutes.get('/reputation/:did/:category', async (c) => {
  const did = decodeURIComponent(c.req.param('did'));
  const category = c.req.param('category');

  try {
    const result = await verifyAgent(did);
    const categoryRating = result.categoryRatings.find((r) => r.category === category);

    if (!categoryRating) {
      return c.json({ error: 'Category not found' }, 404);
    }

    return c.json(categoryRating);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Failed to fetch reputation', details: message }, 500);
  }
});
