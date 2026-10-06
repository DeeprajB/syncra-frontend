"use client"

import { useActionState, useEffect, useState } from "react"
import { CircleAlert, Link2, UserPlus, X } from "lucide-react"
import { toast } from "sonner"

import {
  joinWorkspace,
  type JoinWorkspaceState,
} from "@/app/dashboard/workspace-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

const initialState: JoinWorkspaceState = { status: "idle" }

const dialogClassName =
  "syncra-canvas gap-0 bg-white p-0 shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12),0_8px_10px_-6px_rgba(15,23,42,0.04)] ring-[#E2E8F0] sm:max-w-[28rem]"

export function JoinWorkspaceDialog({
  defaultOpen = false,
  defaultInvite = "",
  hideTrigger = false,
  open,
  onOpenChange,
}: {
  defaultOpen?: boolean
  defaultInvite?: string
  hideTrigger?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const [formKey, setFormKey] = useState(0)
  const [inviteSeed, setInviteSeed] = useState(defaultInvite)
  const dialogOpen = open ?? uncontrolledOpen

  function setDialogOpen(next: boolean) {
    if (open === undefined) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next)
    if (next) {
      setFormKey((key) => key + 1)
      return
    }
    setInviteSeed("")
  }

  useEffect(() => {
    if (!defaultInvite) {
      return
    }

    const url = new URL(window.location.href)
    if (!url.searchParams.has("invite")) {
      return
    }

    url.searchParams.delete("invite")
    const query = url.searchParams.toString()
    window.history.replaceState(
      null,
      "",
      query ? `${url.pathname}?${query}` : url.pathname
    )
  }, [defaultInvite])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {hideTrigger ? null : (
        <DialogTrigger
          render={
            <Button
              variant="outline"
              className="h-9 border-[#E2E8F0] bg-white px-3 font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
            />
          }
        >
          <UserPlus className="size-4" />
          Join a workspace
        </DialogTrigger>
      )}
      <DialogContent showCloseButton={false} className={dialogClassName}>
        <JoinWorkspaceForm
          key={formKey}
          defaultInvite={inviteSeed}
          onSuccess={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function JoinWorkspaceForm({
  defaultInvite,
  onSuccess,
}: {
  defaultInvite: string
  onSuccess: () => void
}) {
  const [invite, setInvite] = useState(defaultInvite)
  const [state, formAction, pending] = useActionState(
    joinWorkspace,
    initialState
  )
  const activeError = state.invite === invite ? state.error : undefined
  const fieldError = activeError?.code === "api" ? null : (activeError ?? null)
  const apiError = activeError?.code === "api" ? activeError.message : null
  const blocked =
    fieldError?.code === "invalid" ||
    fieldError?.code === "expired" ||
    fieldError?.code === "already_member"

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    toast.success("Joined workspace", {
      id: "join-workspace",
      description: state.workspaceName,
    })
    onSuccess()
  }, [onSuccess, state.status, state.workspaceName])

  return (
    <form action={formAction} noValidate className="flex flex-col">
      <div className="relative flex flex-col gap-4 px-5 pt-5 pb-4">
        <DialogHeader className="gap-1 pr-8">
          <DialogTitle className="font-semibold tracking-[-0.01em] text-[#0F172A]">
            Join a workspace
          </DialogTitle>
          <DialogDescription className="text-[#64748B]">
            Enter the invite link or code shared by your teammate.
          </DialogDescription>
        </DialogHeader>
        <DialogClose
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-3.5 right-3 text-[#64748B]"
            />
          }
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <Field data-invalid={fieldError ? true : undefined}>
          <FieldLabel htmlFor="workspace-invite" className="gap-1">
            Invitation link or code
            <span className="text-[#EF4444]" aria-hidden="true">
              *
            </span>
          </FieldLabel>
          <div className="relative">
            <Link2 className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              id="workspace-invite"
              name="invite"
              value={invite}
              onChange={(event) => setInvite(event.target.value)}
              placeholder="Paste invite link or enter code"
              autoComplete="off"
              autoFocus
              spellCheck={false}
              disabled={pending}
              aria-invalid={fieldError ? true : undefined}
              className="h-9 pl-8 placeholder:text-[#94A3B8]"
            />
          </div>
          <FieldError>{fieldError?.message}</FieldError>
        </Field>
        {apiError ? (
          <Alert
            variant="destructive"
            className="border-[#FECACA] bg-[#FEF2F2]"
          >
            <CircleAlert />
            <AlertTitle>Couldn&apos;t join this workspace</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        ) : null}
      </div>
      <DialogFooter className="mx-0 mb-0 bg-white">
        <DialogClose
          render={
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              className="font-semibold text-[#0F172A]"
            />
          }
        >
          Cancel
        </DialogClose>
        <Button
          type="submit"
          size="lg"
          disabled={pending || blocked}
          className="bg-[#3B82F6] font-semibold text-white hover:bg-[#2563EB]"
        >
          {pending ? <Spinner /> : null}
          Join workspace
        </Button>
      </DialogFooter>
    </form>
  )
}
