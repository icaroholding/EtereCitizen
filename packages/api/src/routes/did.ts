import { Hono } from 'hono';
import { resolveDID } from '../lib/verifier.js';

export const didRoutes = new Hono();

didRoutes.get('/did/:did', async (c) => {
  const did = decodeURIComponent(c.req.param('did'));

  try {
    const result = await resolveDID(did);
    if (!result.didDocument) {
      return c.json({ error: 'DID not found' }, 404);
    }
    return c.json(result.didDocument);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Resolution failed', details: message }, 500);
  }
});
