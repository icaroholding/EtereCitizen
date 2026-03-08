import { Hono } from 'hono';
import { EtereCitizen } from '@eterecitizen/sdk';

export const identityCardRoutes = new Hono();

identityCardRoutes.get('/card/:did', async (c) => {
  const did = decodeURIComponent(c.req.param('did'));

  try {
    const result = await EtereCitizen.verify(did);

    const card = {
      did: result.did,
      verificationLevel: result.verificationLevel,
      categoryRatings: result.categoryRatings,
      overallScore: result.reputationScore,
      reviewCount: result.reviewCount,
      walletConnected: result.walletConnected,
      agentAge: result.agentAge,
      verified: result.verified,
      flags: result.flags,
    };

    return c.json(card);
  } catch (error) {
    return c.json({ error: 'Failed to fetch identity card' }, 500);
  }
});
