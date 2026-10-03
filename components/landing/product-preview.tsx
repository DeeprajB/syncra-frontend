import {
  Activity,
  Kanban,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const members = [
  { initials: "WJ", color: "#6366F1" },
  { initials: "AL", color: "#3B82F6" },
  { initials: "MK", color: "#06B6D4" },
]

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: Kanban, active: true },
  { label: "Members", icon: Users },
  { label: "Activity", icon: Activity },
]

type Priority = "High" | "Medium" | "Low"

const columns: {
  title: string
  dot: string
  cards: {
    key: string
    title: string
    priority?: Priority
    tag?: string
    meta?: string
    comments?: number
    assignee?: string
  }[]
}[] = [
  {
    title: "To do",
    dot: "#94A3B8",
    cards: [
      {
        key: "SYNC-214",
        title: "Implement model training pipeline",
        priority: "High",
        tag: "Model",
        assignee: "AL",
      },
      {
        key: "SYNC-218",
        title: "Set up PyTorch training pipeline",
        priority: "Medium",
        tag: "Model",
      },
      {
        key: "SYNC-221",
        title: "Draft methodology section",
        priority: "Low",
        tag: "Report",
      },
    ],
  },
  {
    title: "In progress",
    dot: "#3B82F6",
    cards: [
      {
        key: "SYNC-198",
        title: "Preprocessing pipeline (SAML)",
        priority: "High",
        tag: "Model",
        assignee: "WJ",
      },
      {
        key: "SYNC-205",
        title: "Hyperparameter sweep",
        meta: "Tomorrow",
        assignee: "MK",
      },
      {
        key: "SYNC-209",
        title: "Hyperparameter tuning script",
        priority: "Medium",
        tag: "Compute",
      },
    ],
  },
  {
    title: "In review",
    dot: "#6366F1",
    cards: [
      {
        key: "SYNC-176",
        title: "Write evaluation & citations section",
        priority: "High",
        tag: "Paper",
        comments: 4,
      },
    ],
  },
  {
    title: "Done",
    dot: "#10B981",
    cards: [
      {
        key: "SYNC-142",
        title: "Literature review & related work",
        tag: "Research",
      },
      {
        key: "SYNC-151",
        title: "Configure remote environment and setup",
        tag: "DevOps",
      },
    ],
  },
]

const priorityClass: Record<Priority, string> = {
  High: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
  Medium: "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
  Low: "border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]",
}

export function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#E2E8F0] bg-white shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08),0_8px_10px_-6px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
        </div>
        <p className="font-mono text-[11px] text-[#475569]">
          CS3801 · Machine Learning · Spring 2025
        </p>
        <p className="ml-auto flex items-center gap-1.5 text-[12px] font-medium text-[#047857]">
          <span className="size-1.5 rounded-full bg-[#10B981]" />
          Syncing live
        </p>
      </div>

      <div className="grid min-h-[420px] md:grid-cols-[196px_1fr]">
        <aside className="hidden flex-col border-r border-[#E2E8F0] bg-[#F8FAFC] p-3 md:flex">
          <p className="px-2 pb-2 font-mono text-[11px] text-[#64748B]">
            Workspace
          </p>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-[#475569]",
                  item.active && "bg-[#EFF6FF] font-medium text-[#1D4ED8]"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </div>
            ))}
            <div className="mt-auto flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-[#475569]">
              <Settings className="size-4" />
              Settings
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0">
              <p className="font-heading text-base font-semibold tracking-[-0.01em] text-[#0F172A]">
                Machine Learning Assignment
              </p>
              <p className="text-[13px] text-[#64748B]">
                Module 2 · The teamwork sprint
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <div className="flex h-8 items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-[12px] text-[#94A3B8]">
                <Search className="size-3.5" />
                Search tasks or members
              </div>
              <div className="flex -space-x-2">
                {members.map((member) => (
                  <span
                    key={member.initials}
                    className="flex size-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.initials}
                  </span>
                ))}
              </div>
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-[#0E7490]">
                <span className="size-1.5 animate-pulse rounded-full bg-[#06B6D4]" />
                3 members online
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {columns.map((column) => (
              <section
                key={column.title}
                className="flex min-w-0 flex-col gap-2 rounded-2xl bg-[#F8FAFC] p-2"
              >
                <header className="flex items-center justify-between px-1 py-1">
                  <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.04em] text-[#475569] uppercase">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: column.dot }}
                    />
                    {column.title}
                  </p>
                  <span className="font-mono text-[11px] text-[#94A3B8]">
                    {column.cards.length}
                  </span>
                </header>
                {column.cards.map((card) => (
                  <article
                    key={card.key}
                    className="flex flex-col gap-2 rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-[#64748B]">
                        {card.key}
                      </span>
                      {card.assignee ? (
                        <span className="flex size-5 items-center justify-center rounded-full bg-[#DBEAFE] text-[9px] font-semibold text-[#1D4ED8]">
                          {card.assignee}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[13px] leading-5 font-medium text-[#0F172A]">
                      {card.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {card.tag ? (
                        <Badge
                          variant="outline"
                          className="h-[22px] rounded-full border-[#E2E8F0] bg-[#F8FAFC] px-2 text-[11px] font-medium text-[#475569]"
                        >
                          {card.tag}
                        </Badge>
                      ) : null}
                      {card.priority ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-[22px] rounded-full px-2 text-[11px] font-semibold",
                            priorityClass[card.priority]
                          )}
                        >
                          {card.priority}
                        </Badge>
                      ) : null}
                      {card.meta ? (
                        <span className="text-[11px] text-[#64748B]">
                          {card.meta}
                        </span>
                      ) : null}
                      {card.comments ? (
                        <span className="ml-auto flex items-center gap-1 text-[11px] text-[#64748B]">
                          <MessageSquare className="size-3" />
                          {card.comments}
                        </span>
                      ) : null}
                    </div>
                  </article>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
