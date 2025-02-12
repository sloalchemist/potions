import express from 'express';
import corsMiddleware from './corsMiddleware';
import authController from './authController';
import characterData from './characterData';
import worldController from './worldController';

const app = express();

app.use(express.json());

app.use(corsMiddleware);

app.get('/auth', authController);

app.get('/worlds', worldController);

app.put('/character/:Id', characterData);

app.listen(3000, () => {
  console.log("I'm listening yo!");
});
