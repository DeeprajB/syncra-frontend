export const projectKeys = {
  detail: (projectId: string) => ["project", projectId] as const,
}

export const taskKeys = {
  list: (projectId: string) => ["tasks", projectId] as const,
  activity: (taskId: string) => ["task-activity", taskId] as const,
}

export const commentKeys = {
  list: (taskId: string) => ["task-comments", taskId] as const,
}

export const activityKeys = {
  workspace: (workspaceId: string) =>
    ["workspace-activity", workspaceId] as const,
}

export const notificationKeys = {
  all: ["notifications"] as const,
  unread: ["notifications", "unread"] as const,
  list: ["notifications", "list"] as const,
}

export const presenceKeys = {
  members: (workspaceId: string) => ["presence", workspaceId] as const,
  self: (workspaceId: string) => ["presence-self", workspaceId] as const,
}
