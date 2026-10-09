"use server"

import { revalidatePath } from "next/cache"

import { syncraFetch } from "@/lib/api"
import {
  isProjectStatus,
  PROJECT_DESCRIPTION_MAX,
  PROJECT_TITLE_MAX,
  readProject,
  type Project,
  type ProjectStatus,
} from "@/lib/projects"

export type ProjectField = "title" | "description" | "status"

export type ProjectFormState = {
  status: "idle" | "error" | "success"
  field?: ProjectField
  message?: string
  title?: string
}

const initialFields = ["title", "description", "status"] as const

function validationError(body: unknown): {
  field?: ProjectField
  message: string
} {
  if (!body || typeof body !== "object") {
    return { message: "" }
  }

  const detail = (body as { detail?: unknown }).detail
  if (typeof detail === "string") {
    return { message: detail }
  }

  if (!Array.isArray(detail)) {
    return { message: "" }
  }

  for (const item of detail) {
    if (!item || typeof item !== "object") {
      continue
    }

    const record = item as { loc?: unknown; msg?: unknown }
    const message = typeof record.msg === "string" ? record.msg : ""
    const loc = Array.isArray(record.loc) ? record.loc : []
    const field = initialFields.find((name) => loc.includes(name))
    if (message) {
      return { field, message }
    }
  }

  return { message: "" }
}

function failure(
  status: number,
  body: unknown,
  fallback: string
): ProjectFormState {
  if (status === 401) {
    return { status: "error", message: "Sign in to continue." }
  }

  const parsed = validationError(body)
  if (status === 422 || status === 400) {
    return {
      status: "error",
      field: parsed.field,
      message: parsed.message || fallback,
    }
  }

  return { status: "error", message: parsed.message || fallback }
}

function readStatus(value: FormDataEntryValue | null): ProjectStatus | null {
  const status = String(value ?? "")
  return isProjectStatus(status) ? status : null
}

export async function createProject(
  workspaceId: string,
  _state: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const status = readStatus(formData.get("status")) ?? "planning"

  const invalid = validateProjectFields(title, description, status)
  if (invalid) {
    return invalid
  }

  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/projects`,
    {
      method: "POST",
      body: JSON.stringify({
        title,
        description: description || null,
        status,
        start_date: null,
        due_date: null,
      }),
    }
  )

  if (!result.ok) {
    return failure(
      result.status,
      result.body,
      "Couldn't create the project. Try again."
    )
  }

  const project = readProject(result.body)
  revalidatePath("/dashboard", "layout")
  return { status: "success", title: project?.title ?? title }
}

export async function updateProject(
  project: Project,
  _state: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const status = readStatus(formData.get("status")) ?? project.status

  const invalid = validateProjectFields(title, description, status)
  if (invalid) {
    return invalid
  }

  const changes: Record<string, string | null> = {}
  if (title !== project.title) {
    changes.title = title
  }
  const nextDescription = description || null
  if (nextDescription !== project.description) {
    changes.description = nextDescription
  }
  if (status !== project.status) {
    changes.status = status
  }

  if (Object.keys(changes).length === 0) {
    return { status: "success", title }
  }

  const result = await syncraFetch(
    `/api/v1/projects/${encodeURIComponent(project.id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(changes),
    }
  )

  if (!result.ok) {
    return failure(
      result.status,
      result.body,
      "Couldn't update the project. Try again."
    )
  }

  revalidatePath("/dashboard", "layout")
  return { status: "success", title }
}

export async function archiveProject(projectId: string) {
  const result = await syncraFetch(
    `/api/v1/projects/${encodeURIComponent(projectId)}`,
    { method: "DELETE" }
  )

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false as const, message: "Sign in to continue." }
    }
    return {
      ok: false as const,
      message:
        validationError(result.body).message || "Couldn't archive the project.",
    }
  }

  revalidatePath("/dashboard", "layout")
  return { ok: true as const }
}

function validateProjectFields(
  title: string,
  description: string,
  status: ProjectStatus
): ProjectFormState | null {
  if (!title) {
    return { status: "error", field: "title", message: "Enter a project name." }
  }

  if (title.length > PROJECT_TITLE_MAX) {
    return {
      status: "error",
      field: "title",
      message: `Use ${PROJECT_TITLE_MAX} characters or fewer.`,
    }
  }

  if (description.length > PROJECT_DESCRIPTION_MAX) {
    return {
      status: "error",
      field: "description",
      message: `Use ${PROJECT_DESCRIPTION_MAX} characters or fewer.`,
    }
  }

  if (!isProjectStatus(status)) {
    return { status: "error", field: "status", message: "Choose a status." }
  }

  return null
}
