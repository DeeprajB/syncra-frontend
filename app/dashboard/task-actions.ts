"use server"

import { revalidatePath } from "next/cache"

import { listProjectTasks, syncraFetch } from "@/lib/api"
import {
  dateInputToIso,
  isoToDateInput,
  isTaskPriority,
  isTaskStatus,
  readTask,
  readTaskActivity,
  TASK_DESCRIPTION_MAX,
  TASK_TITLE_MAX,
  type Task,
  type TaskActivity,
  type TaskStatus,
} from "@/lib/tasks"

export type TaskField =
  | "title"
  | "description"
  | "assignee_id"
  | "priority"
  | "status"
  | "start_date"
  | "due_date"

export type TaskFormState = {
  status: "idle" | "error" | "success"
  field?: TaskField
  message?: string
  title?: string
  conflict?: boolean
}

export type TaskActionResult = {
  ok: boolean
  message?: string
  conflict?: boolean
}

const formFields = [
  "title",
  "description",
  "assignee_id",
  "priority",
  "status",
  "start_date",
  "due_date",
] as const

function validationError(body: unknown): {
  field?: TaskField
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
    const field = formFields.find((name) => loc.includes(name))
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
): TaskFormState {
  if (status === 401) {
    return { status: "error", message: "Sign in to continue." }
  }

  const parsed = validationError(body)
  return {
    status: "error",
    field: status === 422 || status === 400 ? parsed.field : undefined,
    message: parsed.message || fallback,
    conflict: status === 409,
  }
}

function actionFailure(status: number, body: unknown, fallback: string) {
  const parsed = validationError(body)
  return {
    ok: false as const,
    message:
      status === 401 ? "Sign in to continue." : parsed.message || fallback,
    conflict: status === 409,
  }
}

function readChoice<T extends string>(
  value: FormDataEntryValue | null,
  matches: (value: string) => value is T
) {
  const text = String(value ?? "")
  return matches(text) ? text : null
}

export async function createTask(
  projectId: string,
  _state: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const priority =
    readChoice(formData.get("priority"), isTaskPriority) ?? "medium"
  const status = readChoice(formData.get("status"), isTaskStatus) ?? "todo"
  const assignee = String(formData.get("assignee_id") ?? "")
  const startDate = String(formData.get("start_date") ?? "")
  const dueDate = String(formData.get("due_date") ?? "")

  const invalid = validateTaskFields(title, description, startDate, dueDate)
  if (invalid) {
    return invalid
  }

  const result = await syncraFetch(
    `/api/v1/projects/${encodeURIComponent(projectId)}/tasks`,
    {
      method: "POST",
      body: JSON.stringify({
        title,
        description: description || null,
        priority,
        assignee_id: assignee && assignee !== "unassigned" ? assignee : null,
        start_date: dateInputToIso(startDate),
        due_date: dateInputToIso(dueDate),
      }),
    }
  )

  if (!result.ok) {
    return failure(
      result.status,
      result.body,
      "Couldn't create the task. Try again."
    )
  }

  const task = readTask(result.body)
  if (task && status !== "todo") {
    const moved = await syncraFetch(
      `/api/v1/tasks/${encodeURIComponent(task.id)}/move`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
          position: 10000,
          version: task.version,
        }),
      }
    )
    if (!moved.ok) {
      revalidatePath("/dashboard", "layout")
      return failure(
        moved.status,
        moved.body,
        "The task was created in To do, but it couldn't be moved."
      )
    }
  }

  revalidatePath("/dashboard", "layout")
  return { status: "success", title: task?.title ?? title }
}

export async function updateTask(
  task: Task,
  _state: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const priority =
    readChoice(formData.get("priority"), isTaskPriority) ?? task.priority
  const status = readChoice(formData.get("status"), isTaskStatus) ?? task.status
  const assignee = String(formData.get("assignee_id") ?? "")
  const startDate = String(formData.get("start_date") ?? "")
  const dueDate = String(formData.get("due_date") ?? "")

  const invalid = validateTaskFields(title, description, startDate, dueDate)
  if (invalid) {
    return invalid
  }

  const changes: Record<string, string | null> = {}
  if (title !== task.title) {
    changes.title = title
  }
  const nextDescription = description || null
  if (nextDescription !== task.description) {
    changes.description = nextDescription
  }
  if (priority !== task.priority) {
    changes.priority = priority
  }
  if (status !== task.status) {
    changes.status = status
  }
  const nextAssignee = assignee && assignee !== "unassigned" ? assignee : null
  if (nextAssignee !== task.assigneeId) {
    changes.assignee_id = nextAssignee
  }
  if (startDate !== isoToDateInput(task.startDate)) {
    changes.start_date = dateInputToIso(startDate)
  }
  if (dueDate !== isoToDateInput(task.dueDate)) {
    changes.due_date = dateInputToIso(dueDate)
  }

  if (Object.keys(changes).length === 0) {
    return { status: "success", title }
  }

  const result = await syncraFetch(
    `/api/v1/tasks/${encodeURIComponent(task.id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ ...changes, version: task.version }),
    }
  )

  if (!result.ok) {
    return failure(
      result.status,
      result.body,
      "Couldn't update the task. Try again."
    )
  }

  revalidatePath("/dashboard", "layout")
  return { status: "success", title }
}

export async function moveTask(
  taskId: string,
  status: TaskStatus,
  position: number,
  version: number
): Promise<TaskActionResult> {
  const result = await syncraFetch(
    `/api/v1/tasks/${encodeURIComponent(taskId)}/move`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, position, version }),
    }
  )

  if (!result.ok) {
    return actionFailure(result.status, result.body, "Couldn't move the task.")
  }

  revalidatePath("/dashboard", "layout")
  return { ok: true }
}

export async function deleteTask(taskId: string): Promise<TaskActionResult> {
  const result = await syncraFetch(
    `/api/v1/tasks/${encodeURIComponent(taskId)}`,
    { method: "DELETE" }
  )

  if (!result.ok) {
    return actionFailure(
      result.status,
      result.body,
      "Couldn't delete the task."
    )
  }

  revalidatePath("/dashboard", "layout")
  return { ok: true }
}

export async function loadProjectTasks(projectId: string) {
  const result = await listProjectTasks(projectId)
  if (!result.ok) {
    throw new Error(result.message)
  }
  return result.tasks
}

export async function loadTaskActivity(taskId: string): Promise<{
  available: boolean
  items: TaskActivity[]
}> {
  const result = await syncraFetch(
    `/api/v1/tasks/${encodeURIComponent(taskId)}/activity`
  )
  if (result.status === 404) {
    return { available: false, items: [] }
  }
  if (!result.ok) {
    throw new Error("Couldn't load activity.")
  }

  const items = readTaskActivity(result.body)
  if (!items) {
    throw new Error("Couldn't load activity.")
  }
  return { available: true, items }
}

function validateTaskFields(
  title: string,
  description: string,
  startDate: string,
  dueDate: string
): TaskFormState | null {
  if (!title) {
    return { status: "error", field: "title", message: "Enter a task title." }
  }
  if (title.length > TASK_TITLE_MAX) {
    return {
      status: "error",
      field: "title",
      message: `Title must be ${TASK_TITLE_MAX} characters or less.`,
    }
  }
  if (description.length > TASK_DESCRIPTION_MAX) {
    return {
      status: "error",
      field: "description",
      message: `Description must be ${TASK_DESCRIPTION_MAX} characters or less.`,
    }
  }
  if (startDate && !dateInputToIso(startDate)) {
    return {
      status: "error",
      field: "start_date",
      message: "Enter a valid start date.",
    }
  }
  if (dueDate && !dateInputToIso(dueDate)) {
    return {
      status: "error",
      field: "due_date",
      message: "Enter a valid due date.",
    }
  }
  const start = dateInputToIso(startDate)
  const due = dateInputToIso(dueDate)
  if (start && due && start > due) {
    return {
      status: "error",
      field: "start_date",
      message: "Start date cannot be after the due date.",
    }
  }
  return null
}
