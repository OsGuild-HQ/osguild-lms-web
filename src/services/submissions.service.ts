import { Submission } from '@prisma/client';
import { AppError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import {
  CreateSubmissionInput,
  ReviewSubmissionInput,
  SaveAiReviewInput,
} from '../schemas/submission.schema';

function githubRepoKey(value: string) {
  const url = new URL(value);
  const [owner, repo] = url.pathname.split('/').filter(Boolean);

  return `${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

function toPublicSubmission(submission: Submission) {
  return {
    id: submission.id,
    submitterName: submission.submitterName,
    prUrl: submission.prUrl,
    notes: submission.notes,
    status: submission.status,
    score: submission.score,
    feedbackText: submission.feedbackText,
    reviewedAt: submission.reviewedAt?.toISOString() ?? null,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
  };
}

function toManageSubmission(submission: Submission) {
  return {
    ...toPublicSubmission(submission),
    reviewerNotes: submission.reviewerNotes,
    aiReviewStatus: submission.aiReviewStatus,
    aiReviewSummary: submission.aiReviewSummary,
    aiReviewStrengths: submission.aiReviewStrengths,
    aiReviewConcerns: submission.aiReviewConcerns,
    aiReviewRecommendation: submission.aiReviewRecommendation,
    aiReviewModel: submission.aiReviewModel,
    aiReviewError: submission.aiReviewError,
    aiReviewGeneratedAt: submission.aiReviewGeneratedAt?.toISOString() ?? null,
  };
}

async function getTaskForSubmission(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, challengeRepoUrl: true },
  });

  if (!task) {
    throw new AppError(404, 'NOT_FOUND', 'Task not found');
  }

  return task;
}

function assertSubmissionTargetsChallengeRepo(challengeRepoUrl: string, prUrl: string) {
  if (githubRepoKey(challengeRepoUrl) !== githubRepoKey(prUrl)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Submission PR must target the task challenge repository',
    );
  }
}

export async function createSubmission(taskId: string, input: CreateSubmissionInput) {
  const task = await getTaskForSubmission(taskId);
  assertSubmissionTargetsChallengeRepo(task.challengeRepoUrl, input.prUrl);

  const submission = await prisma.submission.create({
    data: {
      ...input,
      taskId,
    },
  });

  return toPublicSubmission(submission);
}

export async function listSubmissions(taskId: string) {
  await getTaskForSubmission(taskId);

  const submissions = await prisma.submission.findMany({
    where: { taskId },
    orderBy: { createdAt: 'desc' },
  });

  return { submissions: submissions.map(toPublicSubmission) };
}

export async function reviewSubmission(taskId: string, submissionId: string, input: ReviewSubmissionInput) {
  const existing = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      taskId,
    },
  });

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Submission not found');
  }

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      ...input,
      reviewedAt: input.reviewedAt ?? new Date(),
    },
  });

  return toPublicSubmission(submission);
}

export async function saveAiReview(taskId: string, submissionId: string, input: SaveAiReviewInput) {
  const existing = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      taskId,
    },
  });

  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Submission not found');
  }

  const hasAiContent = Boolean(
    input.aiReviewSummary ||
      input.aiReviewStrengths ||
      input.aiReviewConcerns ||
      input.aiReviewRecommendation,
  );

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      ...input,
      aiReviewStatus: input.aiReviewStatus ?? (hasAiContent ? 'completed' : undefined),
      aiReviewGeneratedAt: input.aiReviewGeneratedAt ?? (hasAiContent ? new Date() : undefined),
    },
  });

  return toManageSubmission(submission);
}

export { toManageSubmission, toPublicSubmission };
