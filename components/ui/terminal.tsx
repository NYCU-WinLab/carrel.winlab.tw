import * as React from "react"

import { cn } from "@/lib/utils"

// A terminal window: a title bar with three window buttons and a body of
// monospace rows. It draws a picture of another program, so it keeps the
// terminal-* palette (dark) in every site theme. Rows are 1.25rem, about
// 1.25 times the font, and East Asian characters take two cells, the way a
// terminal lays them out.
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
        "flex flex-col overflow-hidden rounded-menu border border-terminal-line bg-terminal font-mono text-body leading-5 text-terminal-foreground",
        className
      )}
    >
      <div className="relative flex h-10 shrink-0 items-center gap-2 border-b border-terminal-line bg-terminal-bar px-4">
        <span aria-hidden className="size-3 rounded-full bg-terminal-line" />
        <span aria-hidden className="size-3 rounded-full bg-terminal-line" />
        <span aria-hidden className="size-3 rounded-full bg-terminal-line" />
        {title && (
          <span className="absolute inset-x-24 truncate text-center text-terminal-dim">
            {title}
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 py-3">{children}</div>
    </div>
  )
}

// East Asian wide characters take two cells in a terminal. Web fonts draw
// them narrower, so each one gets a two-cell box to keep the grid.
const WIDE = /([ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꥠ-꥿가-힣豈-﫿︰-﹏＀-｠￠-￦]+)/

function cells(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") {
    if (!WIDE.test(node)) return node
    return node.split(WIDE).map((part, index) =>
      index % 2 === 1
        ? Array.from(part).map((char, i) => (
            <span key={`${index}-${i}`} className="cell-wide">
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
  // Text inside a fragment is still this row's text.
  if (
    React.isValidElement<{ children?: React.ReactNode }>(node) &&
    node.type === React.Fragment
  )
    return <>{cells(node.props.children)}</>
  return node
}

const tones = {
  claude: "text-terminal-claude",
  shimmer: "text-terminal-shimmer",
  dim: "text-terminal-dim",
  soft: "text-terminal-soft",
  warn: "text-terminal-warn",
  select: "text-terminal-select",
  error: "text-terminal-error",
  white: "text-terminal-white",
  success: "text-terminal-success",
} as const

type TerminalTone = keyof typeof tones

// One run of styled text, the way a terminal writes it.
function TerminalText({
  tone,
  bold,
  italic,
  inverse,
  faint,
  className,
  children,
}: {
  tone?: TerminalTone
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
        tone && tones[tone],
        bold && "font-semibold",
        italic && "italic",
        inverse && "bg-terminal-foreground text-terminal",
        faint && "opacity-60",
        className
      )}
    >
      {cells(children)}
    </span>
  )
}

// One terminal row; text wraps the way the terminal wraps it. `indent` is in
// character cells.
function TerminalLine({
  indent = 0,
  className,
  children,
}: {
  indent?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  children?: React.ReactNode
}) {
  const pad = [
    "",
    "indent-1",
    "indent-2",
    "indent-3",
    "indent-4",
    "indent-5",
    "indent-6",
  ]
  return (
    <div
      className={cn(
        "min-h-5 break-words whitespace-pre-wrap",
        pad[indent],
        className
      )}
    >
      {cells(children)}
    </div>
  )
}

export { Terminal, TerminalLine, TerminalText, type TerminalTone }
