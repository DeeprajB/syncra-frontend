import Link from "next/link"
import { Activity, ListTodo, RefreshCw } from "lucide-react"

import { FlashToast } from "@/components/flash-toast"
import { ProductPreview } from "@/components/landing/product-preview"
import { SyncraMark } from "@/components/syncra-mark"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth0 } from "@/lib/auth0"
import { cn } from "@/lib/utils"

const students = [
  { initials: "A", color: "#6366F1" },
  { initials: "M", color: "#3B82F6" },
  { initials: "J", color: "#06B6D4" },
  { initials: "K", color: "#10B981" },
]

const features = [
  {
    icon: ListTodo,
    title: "Plan together",
    description:
      "Organize assignments, research, and projects in shared workspaces built for your team.",
  },
  {
    icon: RefreshCw,
    title: "Stay in sync",
    description:
      "See tasks, comments, and project changes update across your team in real time.",
  },
  {
    icon: Activity,
    title: "Know what's happening",
    description:
      "See who's online, follow project activity, and keep everyone aligned.",
  },
]

const steps = [
  {
    number: "01",
    title: "Create a workspace",
    description:
      "Create a shared space for your assignment, project, research, or team.",
  },
  {
    number: "02",
    title: "Invite your teammates",
    description: "Bring your team into the workspace and divide the work.",
  },
  {
    number: "03",
    title: "Work together in real time",
    description:
      "Manage tasks, discuss work, and see changes as they happen.",
  },
]

const footerLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#", label: "Status" },
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
]

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const params = await searchParams
  const callbackError = Array.isArray(params.error) ? params.error[0] : params.error
  const session = await auth0.getSession()

  const diveInClass = cn(
    buttonVariants(),
    "h-9 rounded-lg bg-[#3B82F6] px-4 font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(15,23,42,0.05)] hover:bg-[#2563EB]"
  )
  function DiveIn() {
    if (session) {
      return (
        <Link href="/dashboard" className={diveInClass}>
          Dive in
        </Link>
      )
    }

    return (
      <a href="/auth/login" className={diveInClass}>
        Dive in
      </a>
    )
  }

  return (
    <div className="syncra-canvas flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <SyncraMark />
            <span className="font-heading text-base font-semibold tracking-[-0.01em]">
              Syncra
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-[#475569] md:flex">
            <a href="#features" className="hover:text-[#0F172A]">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#0F172A]">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <DiveIn />
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-16 pb-10 text-center md:px-8 md:pt-20">
          {callbackError ? (
            <FlashToast
              type="error"
              title="Could not finish sign in"
              description={callbackError}
              clearErrorParam
            />
          ) : null}

          <Badge
            variant="outline"
            className="h-auto gap-2 rounded-full border-[#E2E8F0] bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#475569] uppercase"
          >
            <span className="size-1.5 rounded-full bg-[#6366F1]" />
            Real-time project collaboration
          </Badge>

          <h1 className="mt-6 max-w-3xl font-heading text-[2rem] leading-10 font-bold tracking-[-0.03em] text-balance text-[#0F172A] sm:text-5xl sm:leading-[56px]">
            Your team. Your project.
            <span className="mt-1 block bg-gradient-to-r from-[#6366F1] to-[#3B82F6] bg-clip-text text-transparent">
              Always in sync.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-6 tracking-[-0.011em] text-[#475569] text-pretty">
            Syncra gives student teams one place to plan projects, manage
            tasks, and collaborate in real time.
          </p>

          <div className="mt-8 flex justify-center">
            <DiveIn />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex -space-x-2">
              {students.map((student) => (
                <span
                  key={student.initials}
                  className="flex size-7 items-center justify-center rounded-full border-2 border-[#F8FAFC] text-[11px] font-semibold text-white"
                  style={{ backgroundColor: student.color }}
                >
                  {student.initials}
                </span>
              ))}
            </div>
            <p className="text-[13px] text-[#64748B]">Used by students</p>
          </div>

          <div className="mt-14 w-full text-left">
            <ProductPreview />
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-20 mx-auto w-full max-w-6xl px-4 py-20 md:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[#6366F1] uppercase">
              Built for student teams
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.025em] text-balance text-[#0F172A] sm:text-4xl sm:leading-[44px]">
              Everything your team needs to stay on track.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] ring-0"
              >
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#3B82F6]">
                    <feature.icon className="size-4" />
                  </div>
                  <CardTitle className="font-heading text-base font-semibold tracking-[-0.01em]">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-5 text-[#475569]">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-20 mx-auto w-full max-w-6xl px-4 py-8 pb-20 md:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[#6366F1] uppercase">
              How it works
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-[-0.025em] text-[#0F172A] sm:text-4xl sm:leading-[44px]">
              Start collaborating in minutes.
            </h2>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.number}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]"
              >
                <p className="font-heading text-4xl font-bold tracking-[-0.03em] text-[#CBD5E1]">
                  {step.number}
                </p>
                <h3 className="mt-4 font-heading text-base font-semibold tracking-[-0.01em] text-[#0F172A]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-5 text-[#475569]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:px-8 md:py-24">
          <h2 className="font-heading text-3xl font-bold tracking-[-0.025em] text-balance text-[#0F172A] sm:text-4xl sm:leading-[44px]">
            Ready to get your project in sync?
          </h2>
          <p className="mt-4 text-base text-[#475569]">
            Create a workspace and start collaborating with your team.
          </p>
          <div className="mt-8 flex justify-center">
            <DiveIn />
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <SyncraMark className="size-6" />
              <span className="font-heading text-sm font-semibold">Syncra</span>
            </Link>
            <p className="text-[13px] text-[#64748B]">
              Real-time project collaboration for student teams.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#475569]">
            {footerLinks.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-[#0F172A]">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
