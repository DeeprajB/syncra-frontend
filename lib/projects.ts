import type { WorkspaceRole } from "@/lib/workspaces"

export const PROJECT_TITLE_MAX = 120
export const PROJECT_DESCRIPTION_MAX = 2000

export const PROJECT_STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["value"]

export type Project = {
  id: string
  workspaceId: string
  title: string
  description: string | null
  status: ProjectStatus
  ownerId: string
  createdBy: string
  startDate: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

const projectStatuses = new Set<ProjectStatus>(
  PROJECT_STATUSES.map((status) => status.value)
)

export function isProjectStatus(value: string): value is ProjectStatus {
  return projectStatuses.has(value as ProjectStatus)
}

export function projectStatusLabel(status: ProjectStatus) {
  return PROJECT_STATUSES.find((item) => item.value === status)?.label ?? status
}

export function canCreateProject(role?: WorkspaceRole) {
  return role === "owner" || role === "admin" || role === "member"
}

export function canManageProject(role?: WorkspaceRole) {
  return role === "owner" || role === "admin"
}

export function readProject(body: unknown): Project | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }

  const record = body as Record<string, unknown>
  const status = record.status
  if (
    typeof record.id !== "string" ||
    typeof record.workspace_id !== "string" ||
    typeof record.title !== "string" ||
    typeof status !== "string" ||
    !isProjectStatus(status)
  ) {
    return null
  }

  return {
    id: record.id,
    workspaceId: record.workspace_id,
    title: record.title,
    description:
      typeof record.description === "string" ? record.description : null,
    status,
    ownerId: typeof record.owner_id === "string" ? record.owner_id : "",
    createdBy: typeof record.created_by === "string" ? record.created_by : "",
    startDate: readDate(record.start_date),
    dueDate: readDate(record.due_date),
    createdAt: typeof record.created_at === "string" ? record.created_at : "",
    updatedAt: typeof record.updated_at === "string" ? record.updated_at : "",
  }
}

export function readProjects(body: unknown): Project[] | null {
  if (!Array.isArray(body)) {
    return null
  }

  return body.flatMap((item) => {
    const project = readProject(item)
    return project ? [project] : []
  })
}

function readDate(value: unknown) {
  if (typeof value !== "string" || !value) {
    return null
  }
  return value.slice(0, 10)
}

export function formatProjectUpdated(iso: string, now = new Date()) {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) {
    return ""
  }

  const seconds = Math.round((now.getTime() - then.getTime()) / 1000)
  if (seconds < 45) {
    return "Updated just now"
  }

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `Updated ${minutes}m ago`
  }

  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return `Updated ${hours}h ago`
  }

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfThen = new Date(then)
  startOfThen.setHours(0, 0, 0, 0)
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfThen.getTime()) / 86_400_000
  )
  if (dayDiff === 1) {
    return "Updated yesterday"
  }
  if (dayDiff > 1 && dayDiff < 7) {
    return `Updated ${dayDiff}d ago`
  }

  return `Updated ${then.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`
}
