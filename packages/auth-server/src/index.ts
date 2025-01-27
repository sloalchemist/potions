import express from 'express';
import corsMiddleware from './corsMiddleware';
import authController from './authController';
import characterData from './characterData';

const app = express();

app.use(corsMiddleware);

app.get('/auth', authController);

app.put('/character/:Id', characterData); // PUT

app.listen(3000, () => {
  console.log("I'm listening yo!");
});
