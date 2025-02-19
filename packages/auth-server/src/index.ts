import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import corsMiddleware from './corsMiddleware';
import authController from './authController';
import characterData from './characterData';
import worldController from './worldController';

export function createApp(): Express {
  const app = express();

  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });

  // Middleware
  app.use(express.json());
  app.use(corsMiddleware);
  app.use('/auth', limiter); // Apply rate limiting to auth endpoint

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
