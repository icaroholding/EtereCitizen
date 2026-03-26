import { Hono } from 'hono';
import { verifyAgent, getOnChainIdentity } from '../lib/verifier.js';

export const identityCardRoutes = new Hono();

identityCardRoutes.get('/card/:did', async (c) => {
  const did = decodeURIComponent(c.req.param('did'));

  try {
    // Get trust data from SDK + on-chain identity from contract
    const [trustResult, identity] = await Promise.all([
      verifyAgent(did),
      getOnChainIdentity(did),
    ]);

    // Merge into enriched response matching the web frontend's expected format
    const categoryRatings = trustResult.categoryRatings.map((cr) => ({
      category: cr.category,
      score: cr.decayedScore ?? cr.rawScore ?? 0,
      reviews: cr.reviewCount ?? 0,
      rawScore: cr.rawScore ?? 0,
      decayedScore: cr.decayedScore ?? 0,
      reviewCount: cr.reviewCount ?? 0,
    }));

    return c.json({
      ...trustResult,
      name: identity?.name || '',
      registered: identity?.registered || false,
      capabilities: identity?.capabilities || [],
      status: identity?.active ? 'active' : 'inactive',
      createdAt: identity?.createdAt || '',
      categoryRatings,
    });
  } catch (error) {
    console.error('[card] Failed to fetch identity card:', did, error);
    return c.json({ error: 'Failed to fetch identity card' }, 500);
  }
});
