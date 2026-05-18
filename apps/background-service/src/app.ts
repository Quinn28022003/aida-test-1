import { createRequestLogger } from '@aida/shared';
import { Hono } from 'hono';

export const app = new Hono();

app.use(createRequestLogger());

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'background-service' });
});
