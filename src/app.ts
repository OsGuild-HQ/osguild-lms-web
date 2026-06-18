import cors from 'cors';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { tasksRouter } from './routes/tasks.routes';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'osguild-lms-web API is running' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', tasksRouter);

app.use(notFoundHandler);
app.use(errorHandler);
