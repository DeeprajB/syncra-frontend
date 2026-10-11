"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Ellipsis, Folder, Plus } from "lucide-react"
import { toast } from "sonner"

import { archiveProject } from "@/app/dashboard/project-actions"
import { ProjectFormDialog } from "@/components/dashboard/project-form-dialog"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  formatProjectUpdated,
  projectStatusLabel,
  type Project,
  type ProjectStatus,
} from "@/lib/projects"

const statusTone: Record<ProjectStatus, string> = {
  planning: "bg-[#EEF2FF] text-[#6366F1]",
  active: "bg-[#ECFDF5] text-[#059669]",
  completed: "bg-[#F1F5F9] text-[#475569]",
  archived: "bg-[#F8FAFC] text-[#64748B]",
}

const statusDot: Record<ProjectStatus, string> = {
  planning: "bg-[#6366F1]",
  active: "bg-[#10B981]",
  completed: "bg-[#64748B]",
  archived: "bg-[#94A3B8]",
}

export function ProjectBoard({
  workspaceId,
  workspaceTitle,
  projects: initialProjects,
  error,
  canCreate,
  canManage,
  variant,
}: {
  workspaceId: string
  workspaceTitle: string
  projects: Project[]
  error?: string
  canCreate: boolean
  canManage: boolean
  variant: "page" | "section"
}) {
  const [projects, setProjects] = useState(initialProjects)
  const [seen, setSeen] = useState(initialProjects)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  if (seen !== initialProjects) {
    setSeen(initialProjects)
    setProjects(initialProjects)
  }

  return (
    <div className="@container flex flex-1 flex-col">
      {variant === "page" ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-[1.75rem] leading-9 font-bold tracking-[-0.025em] text-[#0F172A]">
              Projects
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Manage and track your team&apos;s projects.
            </p>
          </div>
          {canCreate ? (
            <Button
              type="button"
              className="h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Create project
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex h-8 items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Projects ({projects.length})
          </h2>

          {canCreate && projects.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="h-8 border-[#E2E8F0] bg-white px-2.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-3.5" />
              Create
            </Button>
          ) : null}
        </div>
      )}

      {error ? (
        <p
          className={
            variant === "page"
              ? "mt-6 text-sm text-[#64748B]"
              : "mt-3 text-sm text-[#64748B]"
          }
        >
          {error}
        </p>
      ) : projects.length === 0 ? (
        <EmptyProjects
          canCreate={canCreate}
          onCreate={() => setCreateOpen(true)}
          variant={variant}
        />
      ) : (
        <ul
          className={
            variant === "page"
              ? "mt-6 grid gap-4 @min-[680px]:grid-cols-2 @min-[1040px]:grid-cols-3"
              : "mt-3 flex flex-col gap-2"
          }
        >
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard
                workspaceId={workspaceId}
                project={project}
                canManage={canManage}
                compact={variant === "section"}
                onEdit={() => setEditing(project)}
                onArchived={() =>
                  setProjects((current) =>
                    current.filter((item) => item.id !== project.id)
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}

      {canCreate ? (
        <ProjectFormDialog
          mode="create"
          workspaceId={workspaceId}
          workspaceTitle={workspaceTitle}
          hideTrigger
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      ) : null}
      {canManage && editing ? (
        <ProjectFormDialog
          mode="edit"
          workspaceId={workspaceId}
          workspaceTitle={workspaceTitle}
          project={editing}
          hideTrigger
          open
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null)
            }
          }}
        />
      ) : null}
    </div>
  )
}

function EmptyProjects({
  canCreate,
  onCreate,
  variant,
}: {
  canCreate: boolean
  onCreate: () => void
  variant: "page" | "section"
}) {
  return (
    <div
      className={
        variant === "page"
          ? "flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
          : "mt-3 flex flex-col items-center rounded-xl border border-[#E2E8F0] bg-white px-4 py-8 text-center"
      }
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6366F1]">
        <Folder className="size-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-[#0F172A]">
        No projects yet
      </h2>
      <p className="mt-1 max-w-xs text-sm leading-6 text-[#64748B]">
        {canCreate
          ? "Create your first project to start organizing your team's work."
          : "Projects will show up here when someone on the team creates one."}
      </p>
      {canCreate ? (
        <Button
          type="button"
          className="mt-5 h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]"
          onClick={onCreate}
        >
          <Plus className="size-4" />
          Create project
        </Button>
      ) : null}
    </div>
  )
}

function ProjectCard({
  workspaceId,
  project,
  canManage,
  compact = false,
  onEdit,
  onArchived,
}: {
  workspaceId: string
  project: Project
  canManage: boolean
  compact?: boolean
  onEdit: () => void
  onArchived: () => void
}) {
  const [archiveOpen, setArchiveOpen] = useState(false)

  if (compact) {
    return (
      <article className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#6366F1]">
          <Folder className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/workspaces/${workspaceId}/projects/${project.id}`}
            className="block truncate text-sm font-semibold text-[#0F172A] hover:text-[#1D4ED8]"
          >
            {project.title}
          </Link>
          <p className="truncate text-xs text-[#64748B]">
            {project.description || formatProjectUpdated(project.updatedAt)}
          </p>
        </div>
        <ProjectStatusBadge project={project} quiet />
        {canManage ? (
          <ProjectMenu
            project={project}
            onEdit={onEdit}
            onArchive={() => setArchiveOpen(true)}
          />
        ) : null}
        <ArchiveProjectDialog
          project={project}
          open={archiveOpen}
          onOpenChange={setArchiveOpen}
          onArchived={onArchived}
        />
      </article>
    )
  }

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/dashboard/workspaces/${workspaceId}/projects/${project.id}`}
          className="min-w-0 font-semibold text-[#0F172A] hover:text-[#1D4ED8]"
        >
          {project.title}
        </Link>
        {canManage ? (
          <ProjectMenu
            project={project}
            onEdit={onEdit}
            onArchive={() => setArchiveOpen(true)}
          />
        ) : null}
      </div>
      {project.description ? (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#64748B]">
          {project.description}
        </p>
      ) : (
        <p className="mt-2 text-sm leading-6 text-[#94A3B8]">No description</p>
      )}
      <div className="mt-4 flex items-center justify-between gap-3">
        <ProjectStatusBadge project={project} />
        <span className="text-xs text-[#94A3B8]">
          {formatProjectUpdated(project.updatedAt)}
        </span>
      </div>
      <ArchiveProjectDialog
        project={project}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        onArchived={onArchived}
      />
    </article>
  )
}

export function ProjectStatusBadge({
  project,
  quiet = false,
}: {
  project: Project
  quiet?: boolean
}) {
  return (
    <span
      className={
        quiet
          ? "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-2 text-[11px] font-medium text-[#475569]"
          : `inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium ${statusTone[project.status]}`
      }
    >
      <span className={`size-1.5 rounded-full ${statusDot[project.status]}`} />
      {projectStatusLabel(project.status)}
    </span>
  )
}

function ProjectMenu({
  project,
  onEdit,
  onArchive,
}: {
  project: Project
  onEdit: () => void
  onArchive: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#64748B] outline-none hover:bg-[#F1F5F9]"
        aria-label={`Actions for ${project.title}`}
      >
        <Ellipsis className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="syncra-canvas w-40 bg-white">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onArchive}>
            Archive
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ArchiveProjectDialog({
  project,
  open,
  onOpenChange,
  onArchived,
}: {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onArchived?: () => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="syncra-canvas bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {project.title}?</AlertDialogTitle>
          <AlertDialogDescription>
            Hides this project for everyone in the workspace. It leaves the
            project list, and it does not delete tasks you add later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            variant="destructive"
            onClick={() => {
              startTransition(async () => {
                const result = await archiveProject(project.id)
                if (!result.ok) {
                  toast.error(result.message)
                  return
                }
                toast.success("Project archived")
                onArchived?.()
                onOpenChange(false)
                router.refresh()
              })
            }}
          >
            Archive project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
