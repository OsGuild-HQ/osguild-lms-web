import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  createSubmissionSchema,
  reviewSubmissionSchema,
  saveAiReviewSchema,
} from '../schemas/submission.schema';
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from '../schemas/task.schema';
import {
  createSubmission,
  listSubmissions,
  reviewSubmission,
  saveAiReview,
} from '../services/submissions.service';
import {
  createTask,
  deleteTask,
  getTaskDetail,
  getTaskManageDetail,
  listTasks,
  updateTask,
} from '../services/tasks.service';

export const tasksRouter = Router();

tasksRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = createTaskSchema.parse(req.body);
    const result = await createTask(input);

    res.status(201).json(result);
  }),
);

tasksRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = listTasksQuerySchema.parse(req.query);
    const result = await listTasks(query);

    res.json(result);
  }),
);

tasksRouter.get(
  '/:id/manage',
  asyncHandler(async (req, res) => {
    const result = await getTaskManageDetail(req.params.id);

    res.json(result);
  }),
);

tasksRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const result = await getTaskDetail(req.params.id);

    res.json(result);
  }),
);

tasksRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = updateTaskSchema.parse(req.body);
    const task = await updateTask(req.params.id, input);

    res.json({ task });
  }),
);

tasksRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteTask(req.params.id);

    res.status(204).send();
  }),
);

tasksRouter.post(
  '/:id/submissions',
  asyncHandler(async (req, res) => {
    const input = createSubmissionSchema.parse(req.body);
    const submission = await createSubmission(req.params.id, input);

    res.status(201).json({ submission });
  }),
);

tasksRouter.get(
  '/:id/submissions',
  asyncHandler(async (req, res) => {
    const result = await listSubmissions(req.params.id);

    res.json(result);
  }),
);

tasksRouter.patch(
  '/:id/submissions/:submissionId',
  asyncHandler(async (req, res) => {
    const input = reviewSubmissionSchema.parse(req.body);
    const submission = await reviewSubmission(req.params.id, req.params.submissionId, input);

    res.json({ submission });
  }),
);

tasksRouter.patch(
  '/:id/submissions/:submissionId/ai-review',
  asyncHandler(async (req, res) => {
    const input = saveAiReviewSchema.parse(req.body);
    const submission = await saveAiReview(req.params.id, req.params.submissionId, input);

    res.json({ submission });
  }),
);
