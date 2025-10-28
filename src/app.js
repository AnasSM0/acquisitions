import express from 'express';
import logger from './config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
//import { timestamp } from 'drizzle-orm/gel-core';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan('combined', {
    stream: {
      write: message => logger.info(message.trim()),
    },
  })
);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions!');
  res.status(200).send('Hello from Acqusitions!');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res
    .status(200)
    .json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
});

app.get('api', (req, res) => {
  res.status(200).send('Acquisitions API is running');
});

export default app;
