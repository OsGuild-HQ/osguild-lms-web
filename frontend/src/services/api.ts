import type {
  TaskListItem,
  Task,
  ManageTask,
  Submission,
  ManageSubmission,
} from "../types";

const API_BASE = "http://localhost:3000/api";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = "API Error";
    try {
      const data = await response.json();
      message = data.error?.message || message;
    } catch {
      // Ignore
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Tasks
  getTasks: () => fetcher<{ tasks: TaskListItem[]; total: number }>("/tasks"),
  getTask: (id: string) =>
    fetcher<{ task: Task; submissions: Submission[] }>(`/tasks/${id}`),
  getManageTask: (id: string) =>
    fetcher<{ task: ManageTask; submissions: ManageSubmission[] }>(
      `/tasks/${id}/manage`,
    ),
  createTask: (data: Partial<ManageTask>) =>
    fetcher<{ task: Task }>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTask: (id: string, data: Partial<ManageTask>) =>
    fetcher<{ task: Task }>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteTask: (id: string) => fetcher(`/tasks/${id}`, { method: "DELETE" }),

  // Submissions
  createSubmission: (
    taskId: string,
    data: { submitterName: string; prUrl: string; notes?: string },
  ) =>
    fetcher<{ submission: Submission }>(`/tasks/${taskId}/submissions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  reviewSubmission: (
    taskId: string,
    submissionId: string,
    data: {
      status: string;
      score?: number;
      feedbackText?: string;
      reviewerNotes?: string;
    },
  ) =>
    fetcher<{ submission: Submission }>(
      `/tasks/${taskId}/submissions/${submissionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    ),
};
