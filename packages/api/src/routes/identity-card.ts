import { Hono } from 'hono';
import { verifyAgent } from '../lib/verifier.js';

export const identityCardRoutes = new Hono();

identityCardRoutes.get('/card/:did', async (c) => {
  const did = decodeURIComponent(c.req.param('did'));

  try {
    const result = await verifyAgent(did);
    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Failed to fetch identity card', details: message }, 500);
  }
});
