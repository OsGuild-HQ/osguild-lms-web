import cors from 'cors';
import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './docs/openapi';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestContext } from './middleware/requestContext';
import { tasksRouter } from './routes/tasks.routes';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(requestContext);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'osguild-lms-web API is running' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API documentation
app.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(openApiDocument);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/api/tasks', tasksRouter);

app.use(notFoundHandler);
app.use(errorHandler);
