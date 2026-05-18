import 'dotenv/config';
import { getServerEnv } from '@aida/config/server';
import { serve } from '@hono/node-server';

import { app } from './app';

// Validate server environment variables before starting
const env = getServerEnv();

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`💻 api-gateway listening on http://localhost:${info.port}`);
  },
);
