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

export const submissionStatusSchema = z.enum([
  'submitted',
  'approved',
  'changes_requested',
  'rejected',
]);

export const aiReviewStatusSchema = z.enum([
  'not_requested',
  'pending',
  'completed',
  'failed',
]);

export const aiReviewRecommendationSchema = z.enum([
  'approve',
  'changes_requested',
  'reject',
  'manual_review',
]);

export const createSubmissionSchema = z.object({
  submitterName: z.string().trim().min(1).max(100),
  prUrl: httpUrl,
  notes: z.string().trim().max(2000).optional(),
});

export const reviewSubmissionSchema = z
  .object({
    status: submissionStatusSchema.optional(),
    score: z.number().int().min(0).max(100).optional(),
    feedbackText: z.string().trim().max(5000).optional(),
    reviewerNotes: z.string().trim().max(5000).optional(),
    reviewedAt: z.coerce.date().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const saveAiReviewSchema = z
  .object({
    aiReviewStatus: aiReviewStatusSchema.optional(),
    aiReviewSummary: z.string().trim().max(5000).optional(),
    aiReviewStrengths: z.string().trim().max(5000).optional(),
    aiReviewConcerns: z.string().trim().max(5000).optional(),
    aiReviewRecommendation: aiReviewRecommendationSchema.optional(),
    aiReviewModel: z.string().trim().max(100).optional(),
    aiReviewError: z.string().trim().max(2000).optional(),
    aiReviewGeneratedAt: z.coerce.date().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type SaveAiReviewInput = z.infer<typeof saveAiReviewSchema>;
