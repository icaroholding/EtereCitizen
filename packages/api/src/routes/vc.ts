import { Hono } from 'hono';

export const vcRoutes = new Hono();

vcRoutes.post('/vc/verify', async (c) => {
  try {
    const body = await c.req.json();

    if (!body || !body.type || !body.credentialSubject) {
      return c.json({ error: 'Invalid VC format' }, 400);
    }

    // Basic structural validation
    const isValid =
      Array.isArray(body['@context']) &&
      Array.isArray(body.type) &&
      body.type.includes('VerifiableCredential') &&
      typeof body.credentialSubject === 'object';

    return c.json({
      verified: isValid,
      type: body.type,
      issuer: typeof body.issuer === 'string' ? body.issuer : body.issuer?.id,
      subject: body.credentialSubject?.id,
    });
  } catch (error) {
    console.error('[vc] Failed to verify credential:', error);
    return c.json({ error: 'Failed to verify credential' }, 500);
  }
});
