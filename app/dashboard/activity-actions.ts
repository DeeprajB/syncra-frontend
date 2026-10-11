"use server"

import { listWorkspaceActivity } from "@/lib/api"

export async function loadWorkspaceActivity(
  workspaceId: string,
  cursor: string | null
) {
  const result = await listWorkspaceActivity(workspaceId, cursor)
  if (!result.ok) {
    throw new Error(result.message)
  }
  return {
    available: result.available,
    items: result.items,
    nextCursor: result.nextCursor,
  }
}
