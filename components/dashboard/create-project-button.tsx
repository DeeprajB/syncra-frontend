"use client"

import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function CreateProjectButton() {
  return (
    <Button
      type="button"
      className="h-9 bg-[#3B82F6] px-3 font-semibold text-white hover:bg-[#2563EB]"
      onClick={() =>
        toast.info("Projects aren't available yet", {
          id: "create-project",
        })
      }
    >
      <Plus className="size-4" />
      Create project
    </Button>
  )
}
