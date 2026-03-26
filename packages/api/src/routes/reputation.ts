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
    console.error('[reputation] Failed to fetch reputation:', did, error);
    return c.json({ error: 'Failed to fetch reputation' }, 500);
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
    console.error('[reputation] Failed to fetch reputation:', did, category, error);
    return c.json({ error: 'Failed to fetch reputation' }, 500);
  }
});
