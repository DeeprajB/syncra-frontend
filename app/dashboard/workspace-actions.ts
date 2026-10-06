"use server"

import { revalidatePath } from "next/cache"

import { syncraFetch } from "@/lib/api"
import {
  isAssignableRole,
  parseInviteToken,
  readWorkspace,
  WORKSPACE_DESCRIPTION_MAX,
  WORKSPACE_TITLE_MAX,
  type AssignableRole,
  type WorkspaceError,
} from "@/lib/workspaces"

export type CreateWorkspaceState = {
  status: "idle" | "error" | "success"
  error?: WorkspaceError
  title?: string
  id?: string
}

export type UpdateWorkspaceState = {
  status: "idle" | "error" | "success"
  error?: WorkspaceError
  title?: string
}

export type JoinWorkspaceState = {
  status: "idle" | "error" | "success"
  invite?: string
  error?: WorkspaceError
  workspaceName?: string
}

function messageFromBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return ""
  }

  const detail = (body as { detail?: unknown }).detail
  if (typeof detail === "string") {
    return detail
  }

  if (Array.isArray(detail)) {
    const first = detail[0]
    if (first && typeof first === "object" && "msg" in first) {
      const msg = (first as { msg?: unknown }).msg
      if (typeof msg === "string") {
        return msg
      }
    }
  }

  return ""
}

function validationField(body: unknown): "title" | "description" {
  if (!body || typeof body !== "object") {
    return "title"
  }

  const detail = (body as { detail?: unknown }).detail
  if (!Array.isArray(detail)) {
    return "title"
  }

  for (const item of detail) {
    if (!item || typeof item !== "object" || !("loc" in item)) {
      continue
    }
    const loc = (item as { loc?: unknown }).loc
    if (Array.isArray(loc) && loc.includes("description")) {
      return "description"
    }
  }

  return "title"
}

function actionFailure(status: number, body: unknown, fallback: string) {
  if (status === 401) {
    return "Sign in to continue."
  }

  return messageFromBody(body) || fallback
}

function inviteFailure(status: number): WorkspaceError {
  if (status === 409) {
    return {
      code: "already_member",
      field: "invite",
      message: "You're already a member of this workspace.",
    }
  }

  if (status === 410) {
    return {
      code: "expired",
      field: "invite",
      message: "This invitation has expired or is no longer valid.",
    }
  }

  if (status === 404) {
    return {
      code: "invalid",
      field: "invite",
      message: "This invitation link or code is invalid.",
    }
  }

  if (status === 401) {
    return { code: "api", message: "Sign in to continue." }
  }

  return { code: "api", message: "Couldn't join this workspace. Try again." }
}

export async function createWorkspace(
  _state: CreateWorkspaceState,
  formData: FormData
): Promise<CreateWorkspaceState> {
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()

  if (!title) {
    return {
      status: "error",
      error: {
        code: "validation",
        field: "title",
        message: "Enter a workspace name.",
      },
    }
  }

  if (title.length > WORKSPACE_TITLE_MAX) {
    return {
      status: "error",
      error: {
        code: "validation",
        field: "title",
        message: `Use ${WORKSPACE_TITLE_MAX} characters or fewer.`,
      },
    }
  }

  if (description.length > WORKSPACE_DESCRIPTION_MAX) {
    return {
      status: "error",
      error: {
        code: "validation",
        field: "description",
        message: `Use ${WORKSPACE_DESCRIPTION_MAX} characters or fewer.`,
      },
    }
  }

  const result = await syncraFetch("/api/v1/workspaces", {
    method: "POST",
    body: JSON.stringify({
      title,
      ...(description ? { description } : {}),
    }),
  })

  if (!result.ok) {
    if (result.status === 401) {
      return {
        status: "error",
        error: { code: "api", message: "Sign in to continue." },
      }
    }

    if (result.status === 400 || result.status === 422) {
      const field = validationField(result.body)
      return {
        status: "error",
        error: {
          code: "validation",
          field,
          message:
            messageFromBody(result.body) ||
            (field === "description"
              ? `Use ${WORKSPACE_DESCRIPTION_MAX} characters or fewer.`
              : "Enter a workspace name."),
        },
      }
    }

    return {
      status: "error",
      error: {
        code: "api",
        message: "Couldn't create the workspace. Try again.",
      },
    }
  }

  const workspace = readWorkspace(result.body)
  revalidatePath("/dashboard", "layout")
  return {
    status: "success",
    title: workspace?.title ?? title,
    id: workspace?.id,
  }
}

export async function createWorkspaceInvite(
  workspaceId: string
): Promise<{ ok: true; inviteUrl: string } | { ok: false; message: string }> {
  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/invitations`,
    { method: "POST" }
  )

  const inviteUrl =
    result.body &&
    typeof result.body === "object" &&
    typeof (result.body as { invite_url?: unknown }).invite_url === "string"
      ? (result.body as { invite_url: string }).invite_url
      : ""

  if (!result.ok || !inviteUrl) {
    return { ok: false, message: "Couldn't create an invite link. Try again." }
  }

  return { ok: true, inviteUrl }
}

export async function joinWorkspace(
  _state: JoinWorkspaceState,
  formData: FormData
): Promise<JoinWorkspaceState> {
  const invite = String(formData.get("invite") ?? "")
  const token = parseInviteToken(invite)

  if (!invite.trim() || !token) {
    return {
      status: "error",
      invite,
      error: {
        code: "validation",
        field: "invite",
        message: "Enter an invitation link or code.",
      },
    }
  }

  const result = await syncraFetch(
    `/api/v1/invitations/${encodeURIComponent(token)}/join`,
    { method: "POST" }
  )

  if (!result.ok) {
    return { status: "error", invite, error: inviteFailure(result.status) }
  }

  revalidatePath("/dashboard", "layout")
  return {
    status: "success",
    invite,
    workspaceName: readWorkspace(result.body)?.title,
  }
}

export async function updateWorkspace(
  _state: UpdateWorkspaceState,
  formData: FormData
): Promise<UpdateWorkspaceState> {
  const workspaceId = String(formData.get("workspaceId") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()

  if (!title) {
    return {
      status: "error",
      error: {
        code: "validation",
        field: "title",
        message: "Enter a workspace name.",
      },
    }
  }

  if (title.length > WORKSPACE_TITLE_MAX) {
    return {
      status: "error",
      error: {
        code: "validation",
        field: "title",
        message: `Use ${WORKSPACE_TITLE_MAX} characters or fewer.`,
      },
    }
  }

  if (description.length > WORKSPACE_DESCRIPTION_MAX) {
    return {
      status: "error",
      error: {
        code: "validation",
        field: "description",
        message: `Use ${WORKSPACE_DESCRIPTION_MAX} characters or fewer.`,
      },
    }
  }

  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        title,
        description: description || null,
      }),
    }
  )

  if (!result.ok) {
    if (result.status === 400 || result.status === 422) {
      const field = validationField(result.body)
      return {
        status: "error",
        error: {
          code: "validation",
          field,
          message:
            messageFromBody(result.body) ||
            (field === "description"
              ? `Use ${WORKSPACE_DESCRIPTION_MAX} characters or fewer.`
              : "Enter a workspace name."),
        },
      }
    }

    return {
      status: "error",
      error: {
        code: "api",
        message: actionFailure(
          result.status,
          result.body,
          "Couldn't update the workspace. Try again."
        ),
      },
    }
  }

  revalidatePath("/dashboard", "layout")
  return {
    status: "success",
    title: readWorkspace(result.body)?.title ?? title,
  }
}

export async function archiveWorkspace(
  workspaceId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}`,
    { method: "DELETE" }
  )

  if (!result.ok) {
    return {
      ok: false,
      message: actionFailure(
        result.status,
        result.body,
        "Couldn't archive the workspace. Try again."
      ),
    }
  }

  revalidatePath("/dashboard", "layout")
  return { ok: true }
}

export async function leaveWorkspace(
  workspaceId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/leave`,
    { method: "POST" }
  )

  if (!result.ok) {
    return {
      ok: false,
      message: actionFailure(
        result.status,
        result.body,
        "Couldn't leave the workspace. Try again."
      ),
    }
  }

  revalidatePath("/dashboard", "layout")
  return { ok: true }
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  role: AssignableRole
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isAssignableRole(role)) {
    return { ok: false, message: "Choose admin, member, or viewer." }
  }

  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(memberId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }
  )

  if (!result.ok) {
    return {
      ok: false,
      message: actionFailure(
        result.status,
        result.body,
        "Couldn't update that role. Try again."
      ),
    }
  }

  revalidatePath("/dashboard", "layout")
  return { ok: true }
}

export async function removeMember(
  workspaceId: string,
  memberId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(memberId)}`,
    { method: "DELETE" }
  )

  if (!result.ok) {
    return {
      ok: false,
      message: actionFailure(
        result.status,
        result.body,
        "Couldn't remove that member. Try again."
      ),
    }
  }

  revalidatePath("/dashboard", "layout")
  return { ok: true }
}
