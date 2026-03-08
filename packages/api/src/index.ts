import { serve } from '@hono/node-server';
import { createApp } from './app.js';

const app = createApp();
const port = parseInt(process.env.PORT || '3000');

console.log(`EtereCitizen API starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`EtereCitizen API running at http://localhost:${port}`);
