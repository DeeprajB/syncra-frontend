import type { WorkspaceRole } from "@/lib/workspaces"

export const TASK_TITLE_MAX = 200
export const TASK_DESCRIPTION_MAX = 5000

export const TASK_COLUMNS = [
  { value: "todo", label: "To do", dot: "bg-[#94A3B8]" },
  { value: "in_progress", label: "In progress", dot: "bg-[#3B82F6]" },
  { value: "review", label: "Review", dot: "bg-[#8B5CF6]" },
  { value: "done", label: "Done", dot: "bg-[#10B981]" },
] as const

export const TASK_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const

export type TaskStatus = (typeof TASK_COLUMNS)[number]["value"]
export type TaskPriority = (typeof TASK_PRIORITIES)[number]["value"]

export type Task = {
  id: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  createdBy: string
  startDate: string | null
  dueDate: string | null
  position: number
  parentTaskId: string | null
  estimatedHours: number | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  version: number
}

const statuses = new Set<TaskStatus>(TASK_COLUMNS.map((column) => column.value))
const priorities = new Set<TaskPriority>(
  TASK_PRIORITIES.map((priority) => priority.value)
)

export function isTaskStatus(value: string): value is TaskStatus {
  return statuses.has(value as TaskStatus)
}

export function isTaskPriority(value: string): value is TaskPriority {
  return priorities.has(value as TaskPriority)
}

export function taskStatusLabel(status: TaskStatus) {
  return TASK_COLUMNS.find((column) => column.value === status)?.label ?? status
}

export function taskPriorityLabel(priority: TaskPriority) {
  return (
    TASK_PRIORITIES.find((item) => item.value === priority)?.label ?? priority
  )
}

export function canEditTasks(role?: WorkspaceRole) {
  return role === "owner" || role === "admin" || role === "member"
}

export function canDeleteTask(
  role: WorkspaceRole | undefined,
  createdBy: string,
  actorId?: string
) {
  if (role === "owner" || role === "admin") {
    return true
  }
  return role === "member" && Boolean(actorId) && createdBy === actorId
}

export function readTask(body: unknown): Task | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }

  const record = body as Record<string, unknown>
  const status = record.status
  const priority = record.priority
  if (
    typeof record.id !== "string" ||
    typeof record.project_id !== "string" ||
    typeof record.title !== "string" ||
    typeof record.created_by !== "string" ||
    typeof status !== "string" ||
    !isTaskStatus(status) ||
    typeof priority !== "string" ||
    !isTaskPriority(priority) ||
    typeof record.position !== "number" ||
    typeof record.version !== "number"
  ) {
    return null
  }

  return {
    id: record.id,
    projectId: record.project_id,
    title: record.title,
    description:
      typeof record.description === "string" ? record.description : null,
    status,
    priority,
    assigneeId:
      typeof record.assignee_id === "string" ? record.assignee_id : null,
    createdBy: record.created_by,
    startDate: readTimestamp(record.start_date),
    dueDate: readTimestamp(record.due_date),
    position: record.position,
    parentTaskId:
      typeof record.parent_task_id === "string" ? record.parent_task_id : null,
    estimatedHours: readHours(record.estimated_hours),
    createdAt: typeof record.created_at === "string" ? record.created_at : "",
    updatedAt: typeof record.updated_at === "string" ? record.updated_at : "",
    completedAt: readTimestamp(record.completed_at),
    version: record.version,
  }
}

export function readTaskPage(body: unknown): {
  items: Task[]
  nextCursor: string | null
} | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }

  const record = body as Record<string, unknown>
  if (!Array.isArray(record.items)) {
    return null
  }

  const items: Task[] = []
  for (const item of record.items) {
    const task = readTask(item)
    if (task) {
      items.push(task)
    }
  }

  return {
    items,
    nextCursor:
      typeof record.next_cursor === "string" ? record.next_cursor : null,
  }
}

export function isoToDateInput(value: string | null) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${date.getUTCFullYear()}-${month}-${day}`
}

export function dateInputToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }
  return `${value}T09:00:00.000Z`
}

export type TaskActivity = {
  id: string
  actorId: string
  action: string
  summary: string
  createdAt: string
}

export function describeActivity(
  action: string,
  metadata: Record<string, unknown>
) {
  const status = metadata.status
  const label =
    typeof status === "string" && isTaskStatus(status)
      ? taskStatusLabel(status)
      : null

  if (action === "task.created") {
    return "created this task"
  }
  if (action === "task.assigned") {
    return "changed the assignee"
  }
  if (action === "task.status_changed" || action === "task.moved") {
    return label ? `moved this task to ${label}` : "moved this task"
  }
  if (action === "task.deleted") {
    return "deleted this task"
  }
  if (action === "comment.created") {
    const excerpt = metadata.excerpt
    return typeof excerpt === "string" && excerpt
      ? `commented "${excerpt}"`
      : "commented"
  }
  if (action === "comment.updated") {
    return "edited a comment"
  }
  if (action === "comment.deleted") {
    return "deleted a comment"
  }
  return "updated this task"
}

export function readTaskActivity(body: unknown): TaskActivity[] | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }

  const items = (body as { items?: unknown }).items
  if (!Array.isArray(items)) {
    return null
  }

  const activities: TaskActivity[] = []
  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue
    }
    const record = item as Record<string, unknown>
    if (typeof record.id !== "string" || typeof record.action !== "string") {
      continue
    }
    const metadata =
      record.metadata &&
      typeof record.metadata === "object" &&
      !Array.isArray(record.metadata)
        ? (record.metadata as Record<string, unknown>)
        : {}
    activities.push({
      id: record.id,
      actorId: typeof record.actor_id === "string" ? record.actor_id : "",
      action: record.action,
      summary: describeActivity(record.action, metadata),
      createdAt: typeof record.created_at === "string" ? record.created_at : "",
    })
  }
  return activities
}

export function formatTaskDue(value: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function readTimestamp(value: unknown) {
  return typeof value === "string" && value ? value : null
}

function readHours(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null
}
