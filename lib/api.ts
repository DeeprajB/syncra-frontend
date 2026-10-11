import { AccessTokenError } from "@auth0/nextjs-auth0/errors"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import {
  auth0,
  BACKEND_ACCESS_TOKEN_HEADER,
  LOGIN_RETURN_TO_HEADER,
} from "@/lib/auth0"
import { readProject, readProjects } from "@/lib/projects"
import { readTaskPage, type Task } from "@/lib/tasks"
import {
  findCurrentMember,
  readMembers,
  readWorkspace,
  readWorkspaces,
  withSignedInProfile,
  type Workspace,
  type WorkspaceMember,
} from "@/lib/workspaces"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export class SyncraAuthError extends Error {
  constructor() {
    super("Sign in to continue.")
    this.name = "SyncraAuthError"
  }
}

export async function redirectToLogin() {
  const headerStore = await headers()
  const returnTo = safeReturnTo(headerStore.get(LOGIN_RETURN_TO_HEADER))
  redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)
}

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard"
  }
  return value
}

async function getBackendAccessToken() {
  const headerStore = await headers()
  const forwarded = headerStore.get(BACKEND_ACCESS_TOKEN_HEADER)
  if (forwarded) {
    return forwarded
  }

  try {
    return (
      await auth0.getAccessToken({
        audience: process.env.AUTH0_AUDIENCE,
      })
    ).token
  } catch (error) {
    if (error instanceof AccessTokenError) {
      throw new SyncraAuthError()
    }
    throw error
  }
}

export async function syncraFetch(path: string, init?: RequestInit) {
  const session = await auth0.getSession()
  if (!session) {
    return { ok: false as const, status: 401, body: null as unknown }
  }

  let token: string
  try {
    token = await getBackendAccessToken()
  } catch {
    return { ok: false as const, status: 401, body: null as unknown }
  }

  if (!API_URL) {
    return { ok: false as const, status: 500, body: null as unknown }
  }

  try {
    const headers = new Headers(init?.headers)
    headers.set("Authorization", `Bearer ${token}`)
    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    })
    const text = await response.text()
    let body: unknown = null
    if (text) {
      try {
        body = JSON.parse(text)
      } catch {
        body = null
      }
    }

    return { ok: response.ok, status: response.status, body }
  } catch {
    return { ok: false as const, status: 0, body: null as unknown }
  }
}

export async function listWorkspaces(): Promise<
  { ok: true; workspaces: Workspace[] } | { ok: false; message: string }
> {
  const result = await syncraFetch("/api/v1/workspaces")
  if (!result.ok) {
    return { ok: false, message: "Couldn't load your workspaces." }
  }

  const workspaces = readWorkspaces(result.body)
  if (!workspaces) {
    return { ok: false, message: "Couldn't load your workspaces." }
  }

  return { ok: true, workspaces }
}

export const getWorkspace = cache(async function getWorkspace(id: string) {
  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(id)}`
  )
  if (!result.ok) {
    return { ok: false as const, status: result.status }
  }

  const workspace = readWorkspace(result.body)
  if (!workspace) {
    return { ok: false as const, status: 500 }
  }

  return { ok: true as const, workspace }
})

export async function listWorkspaceMembers(id: string) {
  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(id)}/members`
  )
  if (!result.ok) {
    return { ok: false as const, message: "Couldn't load team members." }
  }

  const members = readMembers(result.body)
  if (!members) {
    return { ok: false as const, message: "Couldn't load team members." }
  }

  return { ok: true as const, members }
}

export async function listProjects(workspaceId: string) {
  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/projects`
  )
  if (!result.ok) {
    return { ok: false as const, message: "Couldn't load projects." }
  }

  const projects = readProjects(result.body)
  if (!projects) {
    return { ok: false as const, message: "Couldn't load projects." }
  }

  return { ok: true as const, projects }
}

export async function getProject(projectId: string) {
  const result = await syncraFetch(
    `/api/v1/projects/${encodeURIComponent(projectId)}`
  )
  if (!result.ok) {
    return { ok: false as const, status: result.status }
  }

  const project = readProject(result.body)
  if (!project) {
    return { ok: false as const, status: 500 }
  }

  return { ok: true as const, project }
}

export async function listProjectTasks(projectId: string) {
  const tasks: Task[] = []
  let cursor: string | null = null

  for (let page = 0; page < 40; page += 1) {
    const params = new URLSearchParams()
    if (cursor) {
      params.set("cursor", cursor)
    }
    const query = params.size ? `?${params.toString()}` : ""
    const result = await syncraFetch(
      `/api/v1/projects/${encodeURIComponent(projectId)}/tasks${query}`
    )
    if (!result.ok) {
      return { ok: false as const, message: "Couldn't load tasks." }
    }

    const parsed = readTaskPage(result.body)
    if (!parsed) {
      return { ok: false as const, message: "Couldn't load tasks." }
    }

    tasks.push(...parsed.items)
    if (!parsed.nextCursor) {
      return { ok: true as const, tasks }
    }
    cursor = parsed.nextCursor
  }

  return { ok: true as const, tasks }
}

export async function currentMember(members: WorkspaceMember[]) {
  let profileId: string | undefined
  try {
    profileId = (await syncSyncraUser()).id
  } catch (error) {
    if (error instanceof SyncraAuthError) {
      await redirectToLogin()
    }
  }

  const session = await auth0.getSession()
  return findCurrentMember(members, {
    id: profileId,
    email: session?.user.email,
  })
}

export async function personalizeMembers(members: WorkspaceMember[]) {
  let profile: SyncraUser | null = null
  try {
    profile = await syncSyncraUser()
  } catch {
    profile = null
  }

  const session = await auth0.getSession()
  return members.map((member) =>
    withSignedInProfile(member, profile, session?.user)
  )
}

export type SyncraUser = {
  id?: string
  picture?: string
  email?: string
  given_name?: string
  family_name?: string
}

export const syncSyncraUser = cache(async function syncSyncraUser(
  accessToken?: string
): Promise<SyncraUser> {
  const token = accessToken ?? (await getBackendAccessToken())

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (response.status === 401) {
    throw new SyncraAuthError()
  }

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Failed to sync user: ${response.status} ${detail}`)
  }

  const data = await response.json()
  return {
    ...data,
    id: typeof data._id === "string" ? data._id : data.id,
  }
})
