import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  aiReviewRecommendationSchema,
  aiReviewStatusSchema,
  createSubmissionSchema,
  reviewSubmissionSchema,
  saveAiReviewSchema,
  submissionStatusSchema,
} from '../schemas/submission.schema';
import {
  createTaskSchema,
  difficultySchema,
  listTasksQuerySchema,
  taskStatusSchema,
  updateTaskSchema,
} from '../schemas/task.schema';

// Must run before any `.openapi()` call below.
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const isoDateTime = z.string().openapi({ format: 'date-time', example: '2026-06-18T10:15:00.000Z' });

// ---------------------------------------------------------------------------
// Request bodies / query (reuse the live validation schemas)
// ---------------------------------------------------------------------------
const CreateTask = registry.register('CreateTask', createTaskSchema.openapi('CreateTask'));
const UpdateTask = registry.register('UpdateTask', updateTaskSchema.openapi('UpdateTask'));
const CreateSubmission = registry.register(
  'CreateSubmission',
  createSubmissionSchema.openapi('CreateSubmission'),
);
const ReviewSubmission = registry.register(
  'ReviewSubmission',
  reviewSubmissionSchema.openapi('ReviewSubmission'),
);
const SaveAiReview = registry.register('SaveAiReview', saveAiReviewSchema.openapi('SaveAiReview'));

// ---------------------------------------------------------------------------
// Response models (mirror the service serializers)
// ---------------------------------------------------------------------------
const PublicTask = registry.register(
  'PublicTask',
  z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string(),
      challengeRepoUrl: z.string().url(),
      baseBranch: z.string().nullable(),
      projectUrl: z.string().url().nullable(),
      instructions: z.string(),
      acceptanceCriteria: z.string().nullable(),
      hints: z.string().nullable(),
      resources: z.string().nullable(),
      difficulty: difficultySchema,
      tags: z.array(z.string()),
      status: taskStatusSchema,
      submissionCount: z.number().int(),
      createdAt: isoDateTime,
      updatedAt: isoDateTime,
    })
    .openapi('PublicTask'),
);

const ManageTask = registry.register(
  'ManageTask',
  PublicTask.extend({
    privateSourceUrl: z.string().url().nullable(),
    privateNotes: z.string().nullable(),
  }).openapi('ManageTask'),
);

const TaskListItem = registry.register(
  'TaskListItem',
  z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      challengeRepoUrl: z.string().url(),
      baseBranch: z.string().nullable(),
      difficulty: difficultySchema,
      tags: z.array(z.string()),
      status: taskStatusSchema,
      submissionCount: z.number().int(),
      createdAt: isoDateTime,
      updatedAt: isoDateTime,
    })
    .openapi('TaskListItem'),
);

const PublicSubmission = registry.register(
  'PublicSubmission',
  z
    .object({
      id: z.string().uuid(),
      submitterName: z.string(),
      prUrl: z.string().url(),
      notes: z.string().nullable(),
      status: submissionStatusSchema,
      score: z.number().int().nullable(),
      feedbackText: z.string().nullable(),
      reviewedAt: isoDateTime.nullable(),
      createdAt: isoDateTime,
      updatedAt: isoDateTime,
    })
    .openapi('PublicSubmission'),
);

const ManageSubmission = registry.register(
  'ManageSubmission',
  PublicSubmission.extend({
    reviewerNotes: z.string().nullable(),
    aiReviewStatus: aiReviewStatusSchema,
    aiReviewSummary: z.string().nullable(),
    aiReviewStrengths: z.string().nullable(),
    aiReviewConcerns: z.string().nullable(),
    aiReviewRecommendation: aiReviewRecommendationSchema.nullable(),
    aiReviewModel: z.string().nullable(),
    aiReviewError: z.string().nullable(),
    aiReviewGeneratedAt: isoDateTime.nullable(),
  }).openapi('ManageSubmission'),
);

const ErrorResponse = registry.register(
  'ErrorResponse',
  z
    .object({
      error: z.object({
        code: z.enum([
          'VALIDATION_ERROR',
          'UNAUTHORIZED',
          'FORBIDDEN',
          'NOT_FOUND',
          'CONFLICT',
          'INTERNAL_ERROR',
        ]),
        message: z.string(),
        details: z.array(z.any()),
        requestId: z.string().openapi({ description: 'Correlation id, also returned as the x-request-id header' }),
      }),
    })
    .openapi('ErrorResponse'),
);

// ---------------------------------------------------------------------------
// Reusable response helpers
// ---------------------------------------------------------------------------
const json = (schema: z.ZodTypeAny) => ({ content: { 'application/json': { schema } } });

const taskIdParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' }, example: 'task-uuid' }),
});

const submissionIdParams = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
  submissionId: z
    .string()
    .uuid()
    .openapi({ param: { name: 'submissionId', in: 'path' } }),
});

const errorResponses = {
  400: { description: 'Validation error', ...json(ErrorResponse) },
  404: { description: 'Resource not found', ...json(ErrorResponse) },
  500: { description: 'Internal server error', ...json(ErrorResponse) },
};

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
registry.registerPath({
  method: 'get',
  path: '/api/health',
  tags: ['Health'],
  summary: 'Health check',
  responses: {
    200: {
      description: 'Service is healthy',
      ...json(z.object({ status: z.literal('ok') })),
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/tasks',
  tags: ['Tasks'],
  summary: 'Create a task',
  request: { body: json(CreateTask) },
  responses: {
    201: { description: 'Task created', ...json(z.object({ task: PublicTask })) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tasks',
  tags: ['Tasks'],
  summary: 'List tasks',
  request: { query: listTasksQuerySchema },
  responses: {
    200: {
      description: 'Matching tasks',
      ...json(z.object({ tasks: z.array(TaskListItem), total: z.number().int() })),
    },
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tasks/{id}',
  tags: ['Tasks'],
  summary: 'Get task detail (public)',
  request: { params: taskIdParam },
  responses: {
    200: {
      description: 'Task with public submissions',
      ...json(z.object({ task: PublicTask, submissions: z.array(PublicSubmission) })),
    },
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tasks/{id}/manage',
  tags: ['Tasks'],
  summary: 'Get task detail (manage view, includes private fields)',
  request: { params: taskIdParam },
  responses: {
    200: {
      description: 'Task with management submissions',
      ...json(z.object({ task: ManageTask, submissions: z.array(ManageSubmission) })),
    },
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/tasks/{id}',
  tags: ['Tasks'],
  summary: 'Update a task',
  request: { params: taskIdParam, body: json(UpdateTask) },
  responses: {
    200: { description: 'Updated task', ...json(z.object({ task: PublicTask })) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/tasks/{id}',
  tags: ['Tasks'],
  summary: 'Delete a task',
  request: { params: taskIdParam },
  responses: {
    204: { description: 'Task deleted' },
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/tasks/{id}/submissions',
  tags: ['Submissions'],
  summary: 'Create a submission for a task',
  request: { params: taskIdParam, body: json(CreateSubmission) },
  responses: {
    201: { description: 'Submission created', ...json(z.object({ submission: PublicSubmission })) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tasks/{id}/submissions',
  tags: ['Submissions'],
  summary: 'List submissions for a task',
  request: { params: taskIdParam },
  responses: {
    200: {
      description: 'Submissions for the task',
      ...json(z.object({ submissions: z.array(PublicSubmission) })),
    },
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/tasks/{id}/submissions/{submissionId}',
  tags: ['Submissions'],
  summary: 'Review a submission',
  request: { params: submissionIdParams, body: json(ReviewSubmission) },
  responses: {
    200: { description: 'Reviewed submission', ...json(z.object({ submission: PublicSubmission })) },
    ...errorResponses,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/tasks/{id}/submissions/{submissionId}/ai-review',
  tags: ['Submissions'],
  summary: 'Save an AI review for a submission',
  request: { params: submissionIdParams, body: json(SaveAiReview) },
  responses: {
    200: {
      description: 'Submission with AI review',
      ...json(z.object({ submission: ManageSubmission })),
    },
    ...errorResponses,
  },
});

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------
export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'osguild-lms-web API',
      description: 'Express + TypeScript backend for the OSGuild LMS.',
    },
    servers: [{ url: '/' }],
    tags: [
      { name: 'Health', description: 'Service status' },
      { name: 'Tasks', description: 'Challenge tasks' },
      { name: 'Submissions', description: 'Task submissions and reviews' },
    ],
  });
}

export const openApiDocument = buildOpenApiDocument();
