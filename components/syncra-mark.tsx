import Image from "next/image"

import { cn } from "@/lib/utils"

export function SyncraMark({ className }: { className?: string }) {
  return (
    <Image
      src="/syncra-mark.png"
      alt=""
      width={28}
      height={28}
      className={cn("size-7", className)}
    />
  )
}
