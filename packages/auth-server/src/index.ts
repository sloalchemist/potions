import express, { Express } from 'express';
import corsMiddleware from './corsMiddleware';
import authController from './authController';
import characterData from './characterData';
import worldController from './worldController';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(corsMiddleware);

  // Routes
  app.get('/auth', authController);
  app.get('/worlds', worldController);
  app.put('/character/:Id', characterData);

  return app;
}

// Only start the server if this file is run directly
if (require.main === module) {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Auth server listening on port ${port}`);
  });
}

// Export for testing
export default createApp;
