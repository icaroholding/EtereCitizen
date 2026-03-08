import { Hono } from 'hono';
import { EtereCitizen } from '@eterecitizen/sdk';

export const didRoutes = new Hono();

didRoutes.get('/did/:did', async (c) => {
  const did = decodeURIComponent(c.req.param('did'));

  try {
    const document = await EtereCitizen.resolve(did);
    if (!document) {
      return c.json({ error: 'DID not found' }, 404);
    }
    return c.json(document);
  } catch (error) {
    return c.json({ error: 'Resolution failed' }, 500);
  }
});
