import { createApp, startServer } from './src/server.js';

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  startServer(app);
}

export default app;
