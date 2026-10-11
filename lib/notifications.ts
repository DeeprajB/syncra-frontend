export type InboxNotification = {
  id: string
  workspaceId: string
  projectId: string
  taskId: string
  actorId: string
  type: string
  title: string
  body: string
  createdAt: string
  readAt: string | null
}

export function readNotification(body: unknown): InboxNotification | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }
  const record = body as Record<string, unknown>
  if (
    typeof record.id !== "string" ||
    typeof record.workspace_id !== "string" ||
    typeof record.project_id !== "string" ||
    typeof record.task_id !== "string" ||
    typeof record.title !== "string"
  ) {
    return null
  }
  return {
    id: record.id,
    workspaceId: record.workspace_id,
    projectId: record.project_id,
    taskId: record.task_id,
    actorId: typeof record.actor_id === "string" ? record.actor_id : "",
    type: typeof record.type === "string" ? record.type : "",
    title: record.title,
    body: typeof record.body === "string" ? record.body : "",
    createdAt: typeof record.created_at === "string" ? record.created_at : "",
    readAt: typeof record.read_at === "string" ? record.read_at : null,
  }
}

export function readNotificationPage(body: unknown): {
  items: InboxNotification[]
  nextCursor: string | null
} | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }
  const record = body as Record<string, unknown>
  if (!Array.isArray(record.items)) {
    return null
  }
  const items: InboxNotification[] = []
  for (const item of record.items) {
    const notification = readNotification(item)
    if (notification) {
      items.push(notification)
    }
  }
  return {
    items,
    nextCursor:
      typeof record.next_cursor === "string" ? record.next_cursor : null,
  }
}
