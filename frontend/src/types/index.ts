export type TaskStatus = 'open' | 'closed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SubmissionStatus = 'submitted' | 'approved' | 'changes_requested' | 'rejected';
export type AiReviewStatus = 'not_requested' | 'pending' | 'completed' | 'failed';

export interface Task {
  id: string;
  title: string;
  description: string;
  challengeRepoUrl: string;
  baseBranch: string | null;
  projectUrl: string | null;
  instructions: string;
  acceptanceCriteria: string | null;
  hints: string | null;
  resources: string | null;
  difficulty: Difficulty;
  tags: string[];
  status: TaskStatus;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManageTask extends Task {
  privateSourceUrl: string | null;
  privateNotes: string | null;
}

export interface TaskListItem {
  id: string;
  title: string;
  challengeRepoUrl: string;
  baseBranch: string | null;
  difficulty: Difficulty;
  tags: string[];
  status: TaskStatus;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  submitterName: string;
  prUrl: string;
  notes: string | null;
  status: SubmissionStatus;
  score: number | null;
  feedbackText: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ManageSubmission extends Submission {
  reviewerNotes: string | null;
  aiReviewStatus: AiReviewStatus;
  aiReviewSummary: string | null;
  aiReviewStrengths: string | null;
  aiReviewConcerns: string | null;
  aiReviewRecommendation: string | null;
  aiReviewModel: string | null;
  aiReviewError: string | null;
  aiReviewGeneratedAt: string | null;
}
