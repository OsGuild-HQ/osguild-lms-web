-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "challengeRepoUrl" TEXT NOT NULL,
    "baseBranch" TEXT,
    "projectUrl" TEXT,
    "instructions" TEXT NOT NULL,
    "acceptanceCriteria" TEXT,
    "hints" TEXT,
    "resources" TEXT,
    "privateSourceUrl" TEXT,
    "privateNotes" TEXT,
    "difficulty" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "submitterName" TEXT NOT NULL,
    "prUrl" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "score" INTEGER,
    "feedbackText" TEXT,
    "reviewerNotes" TEXT,
    "aiReviewStatus" TEXT NOT NULL DEFAULT 'not_requested',
    "aiReviewSummary" TEXT,
    "aiReviewStrengths" TEXT,
    "aiReviewConcerns" TEXT,
    "aiReviewRecommendation" TEXT,
    "aiReviewModel" TEXT,
    "aiReviewError" TEXT,
    "aiReviewGeneratedAt" DATETIME,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Submission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
