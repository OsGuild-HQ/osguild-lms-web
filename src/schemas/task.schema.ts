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

const githubRepoUrl = httpUrl.refine((value) => {
  try {
    const url = new URL(value);
    const parts = url.pathname.split('/').filter(Boolean);

    return url.hostname === 'github.com' && parts.length === 2;
  } catch {
    return false;
  }
}, {
  message: 'Repository URL must be a GitHub repository URL like https://github.com/owner/repo',
});

const githubPullRequestUrl = httpUrl.refine((value) => {
  try {
    const url = new URL(value);
    const parts = url.pathname.split('/').filter(Boolean);

    return (
      url.hostname === 'github.com' &&
      parts.length === 4 &&
      parts[2] === 'pull' &&
      /^\d+$/.test(parts[3])
    );
  } catch {
    return false;
  }
}, {
  message: 'Source URL must be a GitHub pull request URL like https://github.com/owner/repo/pull/123',
});

function githubRepoKey(value: string) {
  const url = new URL(value);
  const [owner, repo] = url.pathname.split('/').filter(Boolean);

  return `${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

function hasMatchingSourceRepo(value: { projectUrl?: string; privateSourceUrl?: string }) {
  if (!value.projectUrl || !value.privateSourceUrl) {
    return true;
  }

  return githubRepoKey(value.projectUrl) === githubRepoKey(value.privateSourceUrl);
}

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
  challengeRepoUrl: githubRepoUrl,
  baseBranch: branchSchema.optional(),
  projectUrl: githubRepoUrl.optional(),
  instructions: z.string().trim().min(1).max(10000),
  acceptanceCriteria: z.string().trim().max(5000).optional(),
  hints: z.string().trim().max(5000).optional(),
  resources: z.string().trim().max(5000).optional(),
  privateSourceUrl: githubPullRequestUrl.optional(),
  privateNotes: z.string().trim().max(5000).optional(),
  difficulty: difficultySchema,
  tags: z.array(tagSchema).max(10).default([]),
}).refine(hasMatchingSourceRepo, {
  message: 'Private source PR must belong to the same repository as projectUrl',
  path: ['privateSourceUrl'],
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(10000).optional(),
    challengeRepoUrl: githubRepoUrl.optional(),
    baseBranch: branchSchema.optional(),
    projectUrl: githubRepoUrl.optional(),
    instructions: z.string().trim().min(1).max(10000).optional(),
    acceptanceCriteria: z.string().trim().max(5000).optional(),
    hints: z.string().trim().max(5000).optional(),
    resources: z.string().trim().max(5000).optional(),
    privateSourceUrl: githubPullRequestUrl.optional(),
    privateNotes: z.string().trim().max(5000).optional(),
    difficulty: difficultySchema.optional(),
    tags: z.array(tagSchema).max(10).optional(),
    status: taskStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  })
  .refine(hasMatchingSourceRepo, {
    message: 'Private source PR must belong to the same repository as projectUrl',
    path: ['privateSourceUrl'],
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
