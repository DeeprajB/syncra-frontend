export type Workspace = {
  id: string
  title: string
  description: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
}

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer"

export type WorkspaceMember = {
  id: string
  userId: string
  name: string
  email: string
  avatarUrl: string
  role: WorkspaceRole
  joinedAt: string
}

export type WorkspaceErrorCode =
  "validation" | "invalid" | "expired" | "already_member" | "api"

export type WorkspaceError = {
  code: WorkspaceErrorCode
  message: string
  field?: "title" | "description" | "invite"
}

export const WORKSPACE_TITLE_MAX = 120
export const WORKSPACE_DESCRIPTION_MAX = 2000

export function parseInviteToken(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }

  const asUrl = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : trimmed.includes("/")
      ? `https://${trimmed}`
      : ""

  if (!asUrl) {
    return trimmed
  }

  try {
    const url = new URL(asUrl)
    const parts = url.pathname.split("/").filter(Boolean)
    const inviteIndex = parts.findIndex((part) => part === "invite")
    const token = inviteIndex >= 0 ? parts[inviteIndex + 1] : parts.at(-1)
    if (token) {
      return decodeURIComponent(token)
    }

    const fromQuery =
      url.searchParams.get("token") ??
      url.searchParams.get("invite") ??
      url.searchParams.get("code")
    return fromQuery?.trim() ?? ""
  } catch {
    return trimmed
  }
}

export function readWorkspace(body: unknown): Workspace | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null
  }

  const record = body as Record<string, unknown>
  const nested = record.workspace
  const source =
    nested && typeof nested === "object" && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : record

  if (typeof source.id !== "string" || typeof source.title !== "string") {
    return null
  }

  return {
    id: source.id,
    title: source.title,
    description:
      typeof source.description === "string" ? source.description : null,
    ownerId: typeof source.owner_id === "string" ? source.owner_id : "",
    createdAt: typeof source.created_at === "string" ? source.created_at : "",
    updatedAt: typeof source.updated_at === "string" ? source.updated_at : "",
  }
}

export function readWorkspaces(body: unknown): Workspace[] | null {
  const list = Array.isArray(body)
    ? body
    : body &&
        typeof body === "object" &&
        Array.isArray((body as { workspaces?: unknown }).workspaces)
      ? (body as { workspaces: unknown[] }).workspaces
      : null

  if (!list) {
    return null
  }

  return list.flatMap((item) => {
    const workspace = readWorkspace(item)
    return workspace ? [workspace] : []
  })
}

const workspaceRoles = new Set<WorkspaceRole>([
  "owner",
  "admin",
  "member",
  "viewer",
])

export function readMembers(body: unknown): WorkspaceMember[] | null {
  if (!Array.isArray(body)) {
    return null
  }

  return body.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return []
    }

    const record = item as Record<string, unknown>
    const role = record.role
    if (
      typeof record.id !== "string" ||
      typeof record.user_id !== "string" ||
      typeof record.name !== "string" ||
      typeof role !== "string" ||
      !workspaceRoles.has(role as WorkspaceRole)
    ) {
      return []
    }

    return [
      {
        id: record.id,
        userId: record.user_id,
        name: record.name,
        email: typeof record.email === "string" ? record.email : "",
        avatarUrl:
          typeof record.avatar_url === "string" ? record.avatar_url : "",
        role: role as WorkspaceRole,
        joinedAt: typeof record.joined_at === "string" ? record.joined_at : "",
      },
    ]
  })
}

export function roleLabel(role: WorkspaceRole) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export const ASSIGNABLE_ROLES = ["admin", "member", "viewer"] as const

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

export function isAssignableRole(role: string): role is AssignableRole {
  return ASSIGNABLE_ROLES.some((item) => item === role)
}

export function canEditWorkspace(role: WorkspaceRole) {
  return role === "owner" || role === "admin"
}

export function canRemoveMember(
  actorRole: WorkspaceRole,
  actorUserId: string,
  target: WorkspaceMember
) {
  if (target.role === "owner" || target.userId === actorUserId) {
    return false
  }

  if (actorRole === "owner") {
    return true
  }

  return (
    actorRole === "admin" &&
    (target.role === "member" || target.role === "viewer")
  )
}

export function findCurrentMember(
  members: WorkspaceMember[],
  viewer: { id?: string; email?: string | null }
) {
  if (viewer.id) {
    const byId = members.find((member) => member.userId === viewer.id)
    if (byId) {
      return byId
    }
  }

  const email = viewer.email?.trim().toLowerCase()
  if (!email) {
    return undefined
  }

  return members.find((member) => member.email.trim().toLowerCase() === email)
}

export function withSignedInProfile(
  member: WorkspaceMember,
  user?: {
    id?: string
    email?: string
    given_name?: string
    family_name?: string
    picture?: string
  } | null,
  sessionUser?: {
    name?: string | null
    email?: string | null
    picture?: string | null
  } | null
) {
  if (!user?.id || user.id !== member.userId) {
    return member
  }

  const apiName = [user.given_name, user.family_name]
    .filter(Boolean)
    .join(" ")
    .trim()
  const signedInName = sessionUser?.name?.trim() || apiName
  const email = sessionUser?.email?.trim() || user.email || ""
  const picture = user.picture || sessionUser?.picture || ""

  return {
    ...member,
    name:
      member.name && member.name !== "Unknown"
        ? member.name
        : signedInName || email || member.name,
    email: member.email || email,
    avatarUrl: member.avatarUrl || picture,
  }
}
