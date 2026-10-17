import type { Metadata } from "next"
import { Activity, Bell, Eye, Kanban, MessageSquare, Users } from "lucide-react"

import { DiveIn, MarketingShell } from "@/components/landing/marketing-shell"

export const metadata: Metadata = {
  title: "Features · Syncra",
  description:
    "What a Syncra workspace includes: projects, a task board, comments, activity, notifications, and live presence.",
}

const parts = [
  {
    icon: Users,
    title: "A workspace for the team",
    body: "The workspace is the home for one group. You invite the people on the project and give each person a role. Owners and admins look after the space. Members do the work. Viewers can follow the board and read the discussion without changing it.",
  },
  {
    icon: Kanban,
    title: "Projects, then a board of tasks",
    body: "A workspace can hold more than one project. Open a project and the work is a board with four columns: To do, In progress, Review, and Done. A task has a title, a description, a priority, an assignee, and dates. Drag a card into the column that matches where the work actually is.",
  },
  {
    icon: MessageSquare,
    title: "Comments on the task",
    body: "The conversation about a piece of work stays on that card. Someone opening it later can read what was decided, edit their own comment, and see the comment in the task's history. Viewers can read. The people doing the work can write.",
  },
  {
    icon: Activity,
    title: "Activity when you have been away",
    body: "The workspace activity page groups what happened by day. You can see who created a task, moved it, changed the assignee, or left a comment, and open the project it belongs to.",
  },
  {
    icon: Bell,
    title: "Notifications for the work that involves you",
    body: "Syncra notifies you when someone assigns you a task, and when someone else comments on a task you are assigned to or have already talked on. Opening the notification takes you to that task. You do not get a notification for something you just did yourself.",
  },
  {
    icon: Eye,
    title: "A name on the card someone is using",
    body: "The Live mark in the corner shows who else is in the workspace. On the board, a small chip with their photo and first name sits on the card they are pointing at, or beside the column if they are in that column but not on a card. Opening a task keeps their chip on that card. Your own face stays the assignee, so the same person is not drawn twice.",
  },
]

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-[#6366F1] uppercase">
          Features
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-[-0.025em] text-balance text-[#0F172A] sm:text-4xl sm:leading-[44px]">
          What is inside a Syncra workspace.
        </h1>
        <p className="mt-5 text-base leading-7 text-[#475569]">
          Syncra is the shared place a student team uses to run one project.
          These are the parts you will actually use.
        </p>
        <ol className="mt-12 space-y-8">
          {parts.map((part, index) => (
            <li
              key={part.title}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#3B82F6]">
                  <part.icon className="size-4" />
                </span>
                <p className="text-xs font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold tracking-[-0.02em] text-[#0F172A]">
                {part.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#475569]">
                {part.body}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-12">
          <DiveIn>Open Syncra</DiveIn>
        </div>
      </article>
    </MarketingShell>
  )
}
