"use server"

import { revalidatePath } from "next/cache"

import { listTaskComments, syncraFetch } from "@/lib/api"
import { COMMENT_MAX } from "@/lib/comments"

export type CommentFormState = {
  status: "idle" | "error" | "success"
  message?: string
}

const initialFailure = "Couldn't save the comment. Try again."

export async function loadTaskComments(taskId: string) {
  const result = await listTaskComments(taskId)
  if (!result.ok) {
    throw new Error(result.message)
  }
  return { available: result.available, comments: result.comments }
}

export async function createComment(
  taskId: string,
  _state: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const content = String(formData.get("content") ?? "").trim()
  const invalid = validateContent(content)
  if (invalid) {
    return invalid
  }
  const result = await syncraFetch(
    `/api/v1/tasks/${encodeURIComponent(taskId)}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  )
  if (!result.ok) {
    return failure(result.status, result.body, "Couldn't post the comment.")
  }
  revalidatePath("/dashboard", "layout")
  return { status: "success" }
}

export async function updateComment(
  commentId: string,
  _state: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const content = String(formData.get("content") ?? "").trim()
  const invalid = validateContent(content)
  if (invalid) {
    return invalid
  }
  const result = await syncraFetch(
    `/api/v1/comments/${encodeURIComponent(commentId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }
  )
  if (!result.ok) {
    return failure(result.status, result.body, "Couldn't update the comment.")
  }
  revalidatePath("/dashboard", "layout")
  return { status: "success" }
}

export async function deleteComment(commentId: string) {
  const result = await syncraFetch(
    `/api/v1/comments/${encodeURIComponent(commentId)}`,
    { method: "DELETE" }
  )
  if (!result.ok) {
    const message = detailMessage(result.body) || "Couldn't delete the comment."
    return { ok: false as const, message }
  }
  revalidatePath("/dashboard", "layout")
  return { ok: true as const }
}

function validateContent(content: string): CommentFormState | null {
  if (!content) {
    return { status: "error", message: "Comment cannot be empty" }
  }
  if (content.length > COMMENT_MAX) {
    return {
      status: "error",
      message: `Comment must be ${COMMENT_MAX} characters or less.`,
    }
  }
  return null
}

function failure(
  status: number,
  body: unknown,
  fallback: string
): CommentFormState {
  if (status === 401) {
    return { status: "error", message: "Sign in to continue." }
  }
  return {
    status: "error",
    message: detailMessage(body) || fallback || initialFailure,
  }
}

function detailMessage(body: unknown) {
  if (!body || typeof body !== "object") {
    return ""
  }
  const detail = (body as { detail?: unknown }).detail
  if (typeof detail === "string") {
    return detail
  }
  if (!Array.isArray(detail)) {
    return ""
  }
  for (const item of detail) {
    if (!item || typeof item !== "object") {
      continue
    }
    const message = (item as { msg?: unknown }).msg
    if (typeof message === "string" && message) {
      return message
    }
  }
  return ""
}
