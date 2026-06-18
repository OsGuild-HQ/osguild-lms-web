import { Prisma } from '@prisma/client';
import { notFound } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from '../schemas/task.schema';
import { toManageSubmission, toPublicSubmission } from './submissions.service';

type TaskWithCount = Prisma.TaskGetPayload<{ include: { _count: { select: { submissions: true } } } }>;

function serializeTags(tags: string[]): string {
  return tags.map((tag) => tag.trim()).filter(Boolean).join(',');
}

function deserializeTags(tags: string): string[] {
  if (!tags) {
    return [];
  }

  return tags.split(',').filter(Boolean);
}

function toPublicTask(task: TaskWithCount) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    challengeRepoUrl: task.challengeRepoUrl,
    baseBranch: task.baseBranch,
    projectUrl: task.projectUrl,
    instructions: task.instructions,
    acceptanceCriteria: task.acceptanceCriteria,
    hints: task.hints,
    resources: task.resources,
    difficulty: task.difficulty,
    tags: deserializeTags(task.tags),
    status: task.status,
    submissionCount: task._count.submissions,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function toManageTask(task: TaskWithCount) {
  return {
    ...toPublicTask(task),
    privateSourceUrl: task.privateSourceUrl,
    privateNotes: task.privateNotes,
  };
}

function toTaskListItem(task: TaskWithCount) {
  return {
    id: task.id,
    title: task.title,
    challengeRepoUrl: task.challengeRepoUrl,
    baseBranch: task.baseBranch,
    difficulty: task.difficulty,
    tags: deserializeTags(task.tags),
    status: task.status,
    submissionCount: task._count.submissions,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function createTask(input: CreateTaskInput) {
  const task = await prisma.task.create({
    data: {
      ...input,
      tags: serializeTags(input.tags),
    },
    include: { _count: { select: { submissions: true } } },
  });

  return { task: toPublicTask(task) };
}

export async function listTasks(query: ListTasksQuery) {
  const and: Prisma.TaskWhereInput[] = [];

  if (query.q) {
    and.push({
      OR: [
        { title: { contains: query.q } },
        { description: { contains: query.q } },
      ],
    });
  }

  if (query.difficulty) {
    and.push({ difficulty: query.difficulty });
  }

  if (query.status) {
    and.push({ status: query.status });
  }

  if (query.tag) {
    and.push({
      OR: [
        { tags: query.tag },
        { tags: { startsWith: `${query.tag},` } },
        { tags: { endsWith: `,${query.tag}` } },
        { tags: { contains: `,${query.tag},` } },
      ],
    });
  }

  const where: Prisma.TaskWhereInput = and.length > 0 ? { AND: and } : {};

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      include: { _count: { select: { submissions: true } } },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.offset,
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks: tasks.map(toTaskListItem), total };
}

export async function getTaskDetail(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      submissions: { orderBy: { createdAt: 'desc' } },
      _count: { select: { submissions: true } },
    },
  });

  if (!task) {
    throw notFound('Task not found');
  }

  return {
    task: toPublicTask(task),
    submissions: task.submissions.map(toPublicSubmission),
  };
}

export async function getTaskManageDetail(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      submissions: { orderBy: { createdAt: 'desc' } },
      _count: { select: { submissions: true } },
    },
  });

  if (!task) {
    throw notFound('Task not found');
  }

  return {
    task: toManageTask(task),
    submissions: task.submissions.map(toManageSubmission),
  };
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findUnique({ where: { id } });

  if (!existing) {
    throw notFound('Task not found');
  }

  const { tags, ...rest } = input;
  const data: Prisma.TaskUpdateInput = { ...rest };

  if (tags) {
    data.tags = serializeTags(tags);
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: { _count: { select: { submissions: true } } },
  });

  return toPublicTask(task);
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
}
