"use server"

import { syncraFetch } from "@/lib/api"

export async function issueWorkspaceTicket(workspaceId: string) {
  const result = await syncraFetch(
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/ws-ticket`,
    { method: "POST" }
  )
  if (!result.ok || !result.body || typeof result.body !== "object") {
    return { ok: false as const, status: result.status }
  }
  const ticket = (result.body as { ticket?: unknown }).ticket
  if (typeof ticket !== "string" || !ticket) {
    return { ok: false as const, status: result.status || 500 }
  }
  return { ok: true as const, ticket }
}
