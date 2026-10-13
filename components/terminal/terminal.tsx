import * as React from "react"

import { cn } from "@/lib/utils"

// A terminal window: a title bar with the three window buttons and a body of
// monospace lines. It draws a picture of another program, so it keeps that
// program's dark palette in every site theme (app/terminal.css).
function Terminal({
  title,
  className,
  children,
}: {
  title?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "terminal t-frame flex flex-col overflow-hidden rounded-menu font-mono text-body",
        className
      )}
    >
      <div className="t-bar relative flex h-10 shrink-0 items-center gap-2 px-4">
        <span aria-hidden className="t-dot size-3 rounded-full" />
        <span aria-hidden className="t-dot size-3 rounded-full" />
        <span aria-hidden className="t-dot size-3 rounded-full" />
        {title && (
          <span className="t-dim absolute inset-x-24 truncate text-center">
            {title}
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 py-3">{children}</div>
    </div>
  )
}

type Tone =
  | "accent"
  | "shimmer"
  | "dim"
  | "soft"
  | "warn"
  | "select"
  | "error"
  | "white"
  | "success"

// One run of styled text, the way a terminal writes it.
function T({
  tone,
  bold,
  italic,
  inverse,
  faint,
  className,
  children,
}: {
  tone?: Tone
  bold?: boolean
  italic?: boolean
  inverse?: boolean
  faint?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        tone && `t-${tone}`,
        bold && "font-semibold",
        italic && "italic",
        inverse && "t-inverse",
        faint && "t-faint",
        className
      )}
    >
      {children}
    </span>
  )
}

// One terminal line; text wraps the way the terminal wraps it.
function Line({
  indent = 0,
  className,
  children,
}: {
  indent?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "min-h-6 break-words whitespace-pre-wrap",
        indent > 0 && `t-i${indent}`,
        className
      )}
    >
      {children}
    </div>
  )
}

export { Line, T, Terminal, type Tone }
