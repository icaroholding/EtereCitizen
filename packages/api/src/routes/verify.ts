import { Hono } from 'hono';
import { EtereCitizen } from '@eterecitizen/sdk';

export const verifyRoutes = new Hono();

verifyRoutes.get('/verify/:did', async (c) => {
  const did = decodeURIComponent(c.req.param('did'));

  try {
    const result = await EtereCitizen.verify(did);
    return c.json(result);
  } catch (error) {
    return c.json({ error: 'Verification failed' }, 500);
  }
});
