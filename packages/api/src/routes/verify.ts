import { Hono } from 'hono';
import { verifyAgent } from '../lib/verifier.js';

export const verifyRoutes = new Hono();

verifyRoutes.get('/verify/:did', async (c) => {
  const did = decodeURIComponent(c.req.param('did'));

  try {
    const result = await verifyAgent(did);
    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Verification failed', details: message }, 500);
  }
});
