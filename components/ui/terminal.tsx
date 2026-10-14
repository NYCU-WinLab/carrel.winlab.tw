import * as React from "react"

import { cn } from "@/lib/utils"

// A terminal window: a title bar with three window buttons and a body of
// monospace rows. It draws a picture of another program, so it keeps the
// terminal-* palette (dark) in every site theme; only the outer edge is the
// page's border, the same as browser's, so the two frames sit side by side. Rows are 1.25rem, about
// 1.25 times the font, and East Asian characters take two cells, the way a
// terminal lays them out. The window is its own layer, so a demo that
// redraws its rows repaints only the window, not the page around it.
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
        "flex flex-col overflow-hidden rounded-menu border border-border bg-terminal font-mono text-body leading-5 text-terminal-foreground will-change-transform",
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
const WIDE = /([ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꥠ-꥿가-힣豈-﫿︰-﹏＀-｠￠-￦]+)/

// Block and box-drawing characters fill their whole cell in a terminal,
// which draws them itself instead of taking them from the font (web fonts
// often lack them or leave gaps between rows). Each quadrant block is the
// four quarters it fills (top left, top right, bottom left, bottom right).
const QUADRANTS: Record<string, string> = {
  "▘": "1000",
  "▝": "0100",
  "▖": "0010",
  "▗": "0001",
  "▌": "1010",
  "▐": "0101",
  "▀": "1100",
  "▄": "0011",
  "█": "1111",
  "▛": "1110",
  "▜": "1101",
  "▙": "1011",
  "▟": "0111",
  "▚": "1001",
  "▞": "0110",
}
const DRAWN = /([─│╭╮╰╯▘▝▖▗▌▐▀▄█▛▜▙▟▚▞])/
// A round corner is a quarter of an ellipse centred on the cell corner its
// two lines point away from.
const ARCS: Record<string, string> = {
  "╭": "cell-arc-tl",
  "╮": "cell-arc-tr",
  "╰": "cell-arc-bl",
  "╯": "cell-arc-br",
}

// One drawn cell: the character stays in the text for copying and screen
// readers; its glyph is hidden and the cell's background draws the shape in
// the text color.
const QUARTERS = ["cell-tl", "cell-tr", "cell-bl", "cell-br"]

function DrawnCell({ char }: { char: string }) {
  const quarters = QUADRANTS[char]
  return (
    <span
      className={cn(
        "cell-drawn",
        char === "─" && "cell-hline",
        char === "│" && "cell-vline",
        ARCS[char] && ["cell-arc", ARCS[char]],
        quarters && [
          "cell-quad",
          ...QUARTERS.filter((_, index) => quarters[index] === "1"),
        ]
      )}
    >
      {char}
    </span>
  )
}

function drawn(text: string): React.ReactNode {
  if (!DRAWN.test(text)) return text
  return text
    .split(DRAWN)
    .map((part, index) =>
      index % 2 === 1 ? <DrawnCell key={index} char={part} /> : part
    )
}

function cells(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") {
    if (!WIDE.test(node)) return drawn(node)
    return node.split(WIDE).map((part, index) =>
      index % 2 === 1 ? (
        Array.from(part).map((char, i) => (
          <span key={`${index}-${i}`} className="cell-wide">
            {char}
          </span>
        ))
      ) : (
        <React.Fragment key={index}>{drawn(part)}</React.Fragment>
      )
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
  dim: "text-terminal-dim",
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
