import * as React from "react"

import { cn } from "@/lib/utils"

// A browser window: a title bar with three window buttons and the address,
// over a page drawn with the site's own tokens. It frames a picture of a web
// page, such as a sign-in step in an install guide. Same edge, corners and
// bar height as terminal, so the two can follow each other.
function Browser({
  url,
  className,
  children,
}: {
  /** The address as the browser shows it, without the scheme. */
  url: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-menu border border-border bg-background",
        className
      )}
    >
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-muted px-4">
        <span aria-hidden className="size-3 rounded-full bg-border" />
        <span aria-hidden className="size-3 rounded-full bg-border" />
        <span aria-hidden className="size-3 rounded-full bg-border" />
        <span className="ml-4 min-w-0 flex-1 truncate rounded-control bg-background px-4 text-muted-foreground">
          {url}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

export { Browser }
