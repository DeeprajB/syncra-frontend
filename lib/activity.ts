import { isTaskStatus, taskStatusLabel } from "@/lib/tasks"

export type WorkspaceActivity = {
  id: string
  projectId: string | null
  taskId: string | null
  actorId: string
  actorName: string
  avatarUrl: string
  action: string
  summary: string
  createdAt: string
}

export function describeWorkspaceActivity(
  action: string,
  metadata: Record<string, unknown>
) {
  const title = text(metadata.title)
  const excerpt = text(metadata.excerpt)
  const status = metadata.status
  const label =
    typeof status === "string" && isTaskStatus(status)
      ? taskStatusLabel(status)
      : null

  if (action === "task.created") {
    return title ? `created "${title}"` : "created a task"
  }
  if (action === "task.deleted") {
    return title ? `deleted "${title}"` : "deleted a task"
  }
  if (action === "task.moved" || action === "task.status_changed") {
    return label ? `moved a task to ${label}` : "moved a task"
  }
  if (action === "task.assigned") {
    return "changed a task's assignee"
  }
  if (action === "task.updated") {
    return "updated a task"
  }
  if (action === "comment.created") {
    return excerpt ? `commented "${excerpt}"` : "commented on a task"
  }
  if (action === "comment.updated") {
    return "edited a comment"
  }
  if (action === "comment.deleted") {
    return "deleted a comment"
  }
  if (action === "member.joined") {
    return "joined the workspace"
  }
  if (action === "member.left") {
    return "left the workspace"
  }
  return "updated the workspace"
}

export function readWorkspaceActivityPage(body: unknown): {
  items: WorkspaceActivity[]
  nextCursor: string | null
} | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }
  const record = body as Record<string, unknown>
  if (!Array.isArray(record.items)) {
    return null
  }
  const items: WorkspaceActivity[] = []
  for (const item of record.items) {
    const activity = readWorkspaceActivity(item)
    if (activity) {
      items.push(activity)
    }
  }
  return {
    items,
    nextCursor:
      typeof record.next_cursor === "string" ? record.next_cursor : null,
  }
}

function readWorkspaceActivity(body: unknown): WorkspaceActivity | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }
  const record = body as Record<string, unknown>
  if (typeof record.id !== "string" || typeof record.action !== "string") {
    return null
  }
  const metadata =
    record.metadata &&
    typeof record.metadata === "object" &&
    !Array.isArray(record.metadata)
      ? (record.metadata as Record<string, unknown>)
      : {}
  return {
    id: record.id,
    projectId: typeof record.project_id === "string" ? record.project_id : null,
    taskId: typeof record.task_id === "string" ? record.task_id : null,
    actorId: typeof record.actor_id === "string" ? record.actor_id : "",
    actorName:
      typeof record.actor_name === "string" && record.actor_name
        ? record.actor_name
        : "Someone",
    avatarUrl: typeof record.avatar_url === "string" ? record.avatar_url : "",
    action: record.action,
    summary: describeWorkspaceActivity(record.action, metadata),
    createdAt: typeof record.created_at === "string" ? record.created_at : "",
  }
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}
