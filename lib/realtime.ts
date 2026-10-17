export type PresenceMember = {
  userId: string
  name: string
  avatarUrl: string
  taskId: string | null
  projectId: string | null
}

export type PresenceCursor = {
  userId: string
  name: string
  avatarUrl: string
  projectId: string | null
  taskId: string | null
  column: string | null
}

export type CursorTarget = {
  projectId: string
  taskId: string | null
  column: string | null
}

export type RealtimeEnvelope = {
  type: string
  workspaceId: string
  projectId: string | null
  taskId: string | null
  actorId: string
  data: Record<string, unknown>
}

const desiredTask = new Map<string, string | null>()
const watchers = new Map<string, () => void>()
const desiredCursor = new Map<string, CursorTarget | null>()
const cursorSyncs = new Map<string, () => void>()

const CURSOR_COLUMNS = new Set(["todo", "in_progress", "review", "done"])

export function workspaceSocketUrl(workspaceId: string) {
  const api = process.env.NEXT_PUBLIC_API_URL
  if (!api) {
    return null
  }
  let url: URL
  try {
    url = new URL(api)
  } catch {
    return null
  }
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  url.pathname = `/ws/workspaces/${encodeURIComponent(workspaceId)}`
  url.search = ""
  url.hash = ""
  return url.toString()
}

export function setWatchedTask(workspaceId: string, taskId: string | null) {
  desiredTask.set(workspaceId, taskId)
  watchers.get(workspaceId)?.()
}

export function watchedTask(workspaceId: string) {
  return desiredTask.get(workspaceId) ?? null
}

export function bindWatchSync(workspaceId: string, sync: () => void) {
  watchers.set(workspaceId, sync)
  return () => {
    if (watchers.get(workspaceId) === sync) {
      watchers.delete(workspaceId)
    }
  }
}

export function setCursorTarget(
  workspaceId: string,
  target: CursorTarget | null
) {
  const current = desiredCursor.get(workspaceId) ?? null
  if (desiredCursor.has(workspaceId) && sameCursor(current, target)) {
    return
  }
  desiredCursor.set(workspaceId, target)
  cursorSyncs.get(workspaceId)?.()
}

export function cursorTarget(workspaceId: string) {
  return desiredCursor.get(workspaceId) ?? null
}

export function bindCursorSync(workspaceId: string, sync: () => void) {
  cursorSyncs.set(workspaceId, sync)
  return () => {
    if (cursorSyncs.get(workspaceId) === sync) {
      cursorSyncs.delete(workspaceId)
    }
  }
}

export function readEnvelope(value: unknown): RealtimeEnvelope | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  const record = value as Record<string, unknown>
  if (
    typeof record.type !== "string" ||
    typeof record.workspace_id !== "string"
  ) {
    return null
  }
  const data =
    record.data &&
    typeof record.data === "object" &&
    !Array.isArray(record.data)
      ? (record.data as Record<string, unknown>)
      : {}
  return {
    type: record.type,
    workspaceId: record.workspace_id,
    projectId: typeof record.project_id === "string" ? record.project_id : null,
    taskId: typeof record.task_id === "string" ? record.task_id : null,
    actorId: typeof record.actor_id === "string" ? record.actor_id : "",
    data,
  }
}

export function applyPresence(
  members: PresenceMember[],
  event: RealtimeEnvelope
) {
  if (event.type === "presence.snapshot") {
    return readPresenceList(event.data.members)
  }
  if (event.type === "presence.joined") {
    const member = readPresenceMember(event.data)
    if (!member) {
      return members
    }
    const existing = members.find((item) => item.userId === member.userId)
    if (!existing) {
      return [...members, member]
    }
    return members.map((item) =>
      item.userId === member.userId
        ? { ...member, taskId: item.taskId, projectId: item.projectId }
        : item
    )
  }
  if (event.type === "presence.left") {
    const userId = stringValue(event.data.user_id) ?? event.actorId
    if (!userId) {
      return members
    }
    return members.filter((item) => item.userId !== userId)
  }
  if (event.type === "task.viewing") {
    const member = readPresenceMember({
      ...event.data,
      user_id: stringValue(event.data.user_id) ?? event.actorId,
    })
    if (!member) {
      return members
    }
    const existing = members.some((item) => item.userId === member.userId)
    if (!existing) {
      return [...members, member]
    }
    return members.map((item) =>
      item.userId === member.userId ? member : item
    )
  }
  if (event.type === "task.stopped_viewing") {
    const userId = stringValue(event.data.user_id) ?? event.actorId
    const taskId = stringValue(event.data.task_id) ?? event.taskId
    return members.map((item) => {
      if (item.userId !== userId) {
        return item
      }
      if (taskId && item.taskId && item.taskId !== taskId) {
        return item
      }
      return { ...item, taskId: null, projectId: null }
    })
  }
  return null
}

export function applyCursors(
  cursors: PresenceCursor[],
  event: RealtimeEnvelope
) {
  if (event.type === "presence.snapshot") {
    return readSnapshotCursors(event.data.members)
  }
  if (event.type === "presence.left") {
    const userId = stringValue(event.data.user_id) ?? event.actorId
    if (!userId) {
      return cursors
    }
    return cursors.filter((cursor) => cursor.userId !== userId)
  }
  if (event.type === "presence.cursor") {
    const userId = stringValue(event.data.user_id) ?? event.actorId
    if (!userId) {
      return cursors
    }
    const cursor = readCursor(event.data, userId)
    const rest = cursors.filter((item) => item.userId !== userId)
    if (!cursor) {
      return rest
    }
    return [...rest, cursor]
  }
  return null
}

export function isDomainEvent(type: string) {
  if (type === "task.viewing" || type === "task.stopped_viewing") {
    return false
  }
  return (
    type.startsWith("task.") ||
    type.startsWith("comment.") ||
    type === "member.joined" ||
    type === "member.left"
  )
}

function readPresenceList(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }
  const members: PresenceMember[] = []
  for (const item of value) {
    const member = readPresenceMember(item)
    if (member) {
      members.push(member)
    }
  }
  return members
}

function readPresenceMember(value: unknown): PresenceMember | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  const record = value as Record<string, unknown>
  const userId = stringValue(record.user_id)
  if (!userId) {
    return null
  }
  return {
    userId,
    name: stringValue(record.name) ?? "Someone",
    avatarUrl: stringValue(record.avatar_url) ?? "",
    taskId: stringValue(record.task_id),
    projectId: stringValue(record.project_id),
  }
}

function sameCursor(left: CursorTarget | null, right: CursorTarget | null) {
  if (left === right) {
    return true
  }
  if (!left || !right) {
    return false
  }
  return (
    left.projectId === right.projectId &&
    left.taskId === right.taskId &&
    left.column === right.column
  )
}

function readSnapshotCursors(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }
  const cursors: PresenceCursor[] = []
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue
    }
    const record = item as Record<string, unknown>
    const userId = stringValue(record.user_id)
    if (!userId) {
      continue
    }
    const cursor = readCursor(
      {
        user_id: userId,
        name: record.name,
        avatar_url: record.avatar_url,
        project_id: record.cursor_project_id,
        task_id: record.cursor_task_id,
        column: record.cursor_column,
      },
      userId
    )
    if (cursor) {
      cursors.push(cursor)
    }
  }
  return cursors
}

function readCursor(
  value: Record<string, unknown>,
  userId: string
): PresenceCursor | null {
  const taskId = stringValue(value.task_id)
  const column = readColumn(value.column)
  if (!taskId && !column) {
    return null
  }
  return {
    userId,
    name: stringValue(value.name) ?? "Someone",
    avatarUrl: stringValue(value.avatar_url) ?? "",
    projectId: stringValue(value.project_id),
    taskId,
    column: taskId ? null : column,
  }
}

function readColumn(value: unknown) {
  return typeof value === "string" && CURSOR_COLUMNS.has(value) ? value : null
}

function stringValue(value: unknown) {
  return typeof value === "string" && value ? value : null
}
