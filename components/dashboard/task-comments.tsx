"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createComment,
  deleteComment,
  loadTaskComments,
  updateComment,
  type CommentFormState,
} from "@/app/dashboard/comment-actions"
import { PersonAvatar } from "@/components/dashboard/person-avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  canDeleteComment,
  canEditComment,
  COMMENT_MAX,
  type TaskComment,
} from "@/lib/comments"
import { activityKeys, commentKeys, taskKeys } from "@/lib/query"
import type { WorkspaceRole } from "@/lib/workspaces"

const idle: CommentFormState = { status: "idle" }

export function TaskComments({
  workspaceId,
  taskId,
  canPost,
  role,
  actorId,
}: {
  workspaceId: string
  taskId: string
  canPost: boolean
  role?: WorkspaceRole
  actorId?: string
}) {
  const comments = useQuery({
    queryKey: commentKeys.list(taskId),
    queryFn: () => loadTaskComments(taskId),
  })

  return (
    <section>
      <h3 className="text-sm font-semibold text-[#0F172A]">Comments</h3>
      {comments.isPending ? (
        <p className="mt-2 text-sm text-[#94A3B8]">Loading comments…</p>
      ) : comments.isError ? (
        <div className="mt-2 flex items-center gap-3 text-sm text-[#64748B]">
          <p>Couldn&apos;t load comments.</p>
          <Button
            type="button"
            variant="outline"
            className="h-8"
            onClick={() => comments.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : comments.data && !comments.data.available ? (
        <p className="mt-2 text-sm text-[#94A3B8]">
          Comments aren&apos;t available yet.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {comments.data?.comments.length ? (
            <ol className="flex flex-col gap-4">
              {comments.data.comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  workspaceId={workspaceId}
                  taskId={taskId}
                  comment={comment}
                  canEdit={canEditComment(role, comment.authorId, actorId)}
                  canDelete={canDeleteComment(role, comment.authorId, actorId)}
                />
              ))}
            </ol>
          ) : (
            <p className="text-sm text-[#94A3B8]">No comments yet.</p>
          )}
          {canPost ? (
            <CommentComposer workspaceId={workspaceId} taskId={taskId} />
          ) : (
            <p className="text-sm text-[#94A3B8]">
              Viewers can read comments, but cannot post.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function CommentComposer({
  workspaceId,
  taskId,
}: {
  workspaceId: string
  taskId: string
}) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")
  const [state, formAction, pending] = useActionState(
    createComment.bind(null, taskId),
    idle
  )
  const [seen, setSeen] = useState(state)

  if (seen !== state) {
    setSeen(state)
    if (state.status === "success") {
      setContent("")
    }
  }

  useEffect(() => {
    if (state.status !== "success") {
      return
    }
    queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) })
    queryClient.invalidateQueries({ queryKey: taskKeys.activity(taskId) })
    queryClient.invalidateQueries({
      queryKey: activityKeys.workspace(workspaceId),
    })
  }, [queryClient, state, taskId, workspaceId])

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Textarea
        name="content"
        value={content}
        maxLength={COMMENT_MAX}
        rows={2}
        placeholder="Write a comment..."
        aria-label="Comment"
        disabled={pending}
        onChange={(event) => setContent(event.target.value)}
        className="min-h-16 bg-white text-sm placeholder:text-[#94A3B8]"
      />
      {state.status === "error" ? (
        <p className="text-sm text-[#DC2626]">{state.message}</p>
      ) : null}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={pending || !content.trim()}
          className="bg-[#3B82F6] font-semibold text-white hover:bg-[#2563EB]"
        >
          {pending ? <Spinner /> : null}
          Comment
        </Button>
      </div>
    </form>
  )
}

function CommentRow({
  workspaceId,
  taskId,
  comment,
  canEdit,
  canDelete,
}: {
  workspaceId: string
  taskId: string
  comment: TaskComment
  canEdit: boolean
  canDelete: boolean
}) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(comment.content)
  const [confirming, setConfirming] = useState(false)
  const [deleting, startDelete] = useTransition()
  const [state, formAction, pending] = useActionState(
    updateComment.bind(null, comment.id),
    idle
  )
  const [seen, setSeen] = useState(state)

  if (seen !== state) {
    setSeen(state)
    if (state.status === "success") {
      setEditing(false)
    }
  }

  useEffect(() => {
    if (state.status !== "success") {
      return
    }
    queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) })
    queryClient.invalidateQueries({ queryKey: taskKeys.activity(taskId) })
    queryClient.invalidateQueries({
      queryKey: activityKeys.workspace(workspaceId),
    })
  }, [queryClient, state, taskId, workspaceId])

  return (
    <li className="flex gap-2.5">
      <PersonAvatar
        name={comment.authorName}
        avatarUrl={comment.avatarUrl}
        className="mt-0.5 size-7"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="text-sm font-medium text-[#0F172A]">
            {comment.authorName}
          </p>
          <time dateTime={comment.createdAt} className="text-xs text-[#94A3B8]">
            {formatCommentTime(comment.createdAt)}
          </time>
          {edited(comment) ? (
            <span className="text-xs text-[#94A3B8]">Edited</span>
          ) : null}
        </div>
        {editing ? (
          <form action={formAction} className="mt-2 flex flex-col gap-2">
            <Textarea
              name="content"
              value={content}
              maxLength={COMMENT_MAX}
              rows={2}
              disabled={pending}
              aria-label="Edit comment"
              onChange={(event) => setContent(event.target.value)}
              className="min-h-16 bg-white text-sm"
            />
            {state.status === "error" ? (
              <p className="text-sm text-[#DC2626]">{state.message}</p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setContent(comment.content)
                  setEditing(false)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending || !content.trim()}
                className="bg-[#3B82F6] font-semibold text-white hover:bg-[#2563EB]"
              >
                {pending ? <Spinner /> : null}
                Save
              </Button>
            </div>
          </form>
        ) : (
          <>
            <p className="mt-1 text-sm leading-5 break-words whitespace-pre-wrap text-[#0F172A]">
              {comment.content}
            </p>
            {canEdit || canDelete ? (
              <div className="mt-1 flex gap-2">
                {canEdit ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
                    onClick={() => {
                      setContent(comment.content)
                      setEditing(true)
                    }}
                  >
                    Edit
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-[#DC2626] hover:text-[#B91C1C]"
                    onClick={() => setConfirming(true)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
      {canDelete ? (
        <AlertDialog open={confirming} onOpenChange={setConfirming}>
          <AlertDialogContent className="syncra-canvas bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the comment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleting}
                variant="destructive"
                onClick={() => {
                  startDelete(async () => {
                    const result = await deleteComment(comment.id)
                    if (!result.ok) {
                      toast.error(result.message)
                      return
                    }
                    queryClient.invalidateQueries({
                      queryKey: commentKeys.list(taskId),
                    })
                    queryClient.invalidateQueries({
                      queryKey: taskKeys.activity(taskId),
                    })
                    queryClient.invalidateQueries({
                      queryKey: activityKeys.workspace(workspaceId),
                    })
                    setConfirming(false)
                  })
                }}
              >
                Delete comment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </li>
  )
}

function edited(comment: TaskComment) {
  const created = new Date(comment.createdAt).getTime()
  const updated = new Date(comment.updatedAt).getTime()
  if (Number.isNaN(created) || Number.isNaN(updated)) {
    return false
  }
  return updated - created > 1000
}

function formatCommentTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  const now = new Date()
  if (sameDay(date, now)) {
    return time
  }
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
  return `${day}, ${time}`
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}
