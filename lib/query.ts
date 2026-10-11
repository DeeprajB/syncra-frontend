export const projectKeys = {
  detail: (projectId: string) => ["project", projectId] as const,
}

export const taskKeys = {
  list: (projectId: string) => ["tasks", projectId] as const,
  activity: (taskId: string) => ["task-activity", taskId] as const,
}
