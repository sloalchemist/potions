import express from 'express';
import corsMiddleware from './corsMiddleware';
import authController from './authController';

const app = express();

app.use(corsMiddleware);

app.get('/auth', authController);

app.listen(3000, () => {
  console.log("I'm listening yo!");
});
