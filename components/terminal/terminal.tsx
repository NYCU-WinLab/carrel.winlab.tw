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

// East Asian wide characters take two cells in a terminal. Web fonts draw
// them narrower, so each one gets a two-cell box to keep the grid.
const WIDE =
  /([\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]+)/

function cells(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") {
    if (!WIDE.test(node)) return node
    return node.split(WIDE).map((part, index) =>
      index % 2 === 1
        ? Array.from(part).map((char, i) => (
            <span key={`${index}-${i}`} className="t-wide">
              {char}
            </span>
          ))
        : part
    )
  }
  if (Array.isArray(node))
    return node.map((child, index) => (
      <React.Fragment key={index}>{cells(child)}</React.Fragment>
    ))
  return node
}

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
      {cells(children)}
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
        "t-row break-words whitespace-pre-wrap",
        indent > 0 && `t-i${indent}`,
        className
      )}
    >
      {cells(children)}
    </div>
  )
}

export { Line, T, Terminal, type Tone }
