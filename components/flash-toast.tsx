"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"

const toastByType = {
  success: toast.success,
  error: toast.error,
  info: toast.info,
  warning: toast.warning,
} as const

export function FlashToast({
  type,
  title,
  description,
  clearErrorParam = false,
}: {
  type: keyof typeof toastByType
  title: string
  description?: string
  clearErrorParam?: boolean
}) {
  const shown = useRef(false)

  useEffect(() => {
    if (shown.current) {
      return
    }

    shown.current = true
    toastByType[type](title, {
      id: `${type}:${title}:${description ?? ""}`,
      description,
    })

    if (!clearErrorParam) {
      return
    }

    const url = new URL(window.location.href)
    if (!url.searchParams.has("error")) {
      return
    }

    url.searchParams.delete("error")
    const query = url.searchParams.toString()
    window.history.replaceState(null, "", query ? `${url.pathname}?${query}` : url.pathname)
  }, [clearErrorParam, description, title, type])

  return null
}
