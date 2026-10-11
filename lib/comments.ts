import type { WorkspaceRole } from "@/lib/workspaces"

export const COMMENT_MAX = 4000

export type TaskComment = {
  id: string
  taskId: string
  authorId: string
  authorName: string
  avatarUrl: string
  content: string
  createdAt: string
  updatedAt: string
}

export function canEditComment(
  role: WorkspaceRole | undefined,
  authorId: string,
  actorId?: string
) {
  if (!actorId || role === "viewer" || !role) {
    return false
  }
  return authorId === actorId
}

export function canDeleteComment(
  role: WorkspaceRole | undefined,
  authorId: string,
  actorId?: string
) {
  if (!actorId || !role || role === "viewer") {
    return false
  }
  if (role === "owner" || role === "admin") {
    return true
  }
  return role === "member" && authorId === actorId
}

export function readComment(body: unknown): TaskComment | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }
  const record = body as Record<string, unknown>
  if (
    typeof record.id !== "string" ||
    typeof record.task_id !== "string" ||
    typeof record.author_id !== "string" ||
    typeof record.content !== "string"
  ) {
    return null
  }
  return {
    id: record.id,
    taskId: record.task_id,
    authorId: record.author_id,
    authorName:
      typeof record.author_name === "string" && record.author_name
        ? record.author_name
        : "Someone",
    avatarUrl: typeof record.avatar_url === "string" ? record.avatar_url : "",
    content: record.content,
    createdAt: typeof record.created_at === "string" ? record.created_at : "",
    updatedAt: typeof record.updated_at === "string" ? record.updated_at : "",
  }
}

export function readCommentPage(body: unknown): {
  items: TaskComment[]
  nextCursor: string | null
} | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }
  const record = body as Record<string, unknown>
  if (!Array.isArray(record.items)) {
    return null
  }
  const items: TaskComment[] = []
  for (const item of record.items) {
    const comment = readComment(item)
    if (comment) {
      items.push(comment)
    }
  }
  return {
    items,
    nextCursor:
      typeof record.next_cursor === "string" ? record.next_cursor : null,
  }
}
