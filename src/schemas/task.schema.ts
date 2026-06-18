import { z } from 'zod';

const httpUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, {
    message: 'URL must use http or https',
  });

const tagSchema = z.string().trim().min(1).max(30);
const branchSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[^\s~^:?*\[\]\\]+$/, {
    message: 'Branch name cannot include spaces or Git ref control characters',
  });

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);
export const taskStatusSchema = z.enum(['open', 'closed']);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(10000),
  challengeRepoUrl: httpUrl,
  baseBranch: branchSchema.optional(),
  projectUrl: httpUrl.optional(),
  instructions: z.string().trim().min(1).max(10000),
  acceptanceCriteria: z.string().trim().max(5000).optional(),
  hints: z.string().trim().max(5000).optional(),
  resources: z.string().trim().max(5000).optional(),
  privateSourceUrl: httpUrl.optional(),
  privateNotes: z.string().trim().max(5000).optional(),
  difficulty: difficultySchema,
  tags: z.array(tagSchema).max(10).default([]),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(10000).optional(),
    challengeRepoUrl: httpUrl.optional(),
    baseBranch: branchSchema.optional(),
    projectUrl: httpUrl.optional(),
    instructions: z.string().trim().min(1).max(10000).optional(),
    acceptanceCriteria: z.string().trim().max(5000).optional(),
    hints: z.string().trim().max(5000).optional(),
    resources: z.string().trim().max(5000).optional(),
    privateSourceUrl: httpUrl.optional(),
    privateNotes: z.string().trim().max(5000).optional(),
    difficulty: difficultySchema.optional(),
    tags: z.array(tagSchema).max(10).optional(),
    status: taskStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const listTasksQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  difficulty: difficultySchema.optional(),
  tag: tagSchema.optional(),
  status: taskStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
