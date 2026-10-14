import * as React from "react"

import { cn } from "@/lib/utils"
import {
  TerminalLine as Line,
  TerminalText as T,
} from "@/components/ui/terminal"

// Claude Code's screen, piece by piece, for demos and install guides. Layout,
// glyphs, wording and colors follow Claude Code 2.1.296 in a fresh config
// (no plugins, settings or statusline of our own); what a demo changes is
// passed in as props. MCP servers are named the way Claude Code names them,
// such as "plugin:infrastructure:carrel".

// The welcome block: the logo, the version, the model and plan, the folder.
// The logo is Claude Code's three rows of block characters, as it prints
// them; every row is padded to the logo's 9 cells.
const LOGO = [" ▐▛███▛█ ", "▝▜██████▀", " ▝▝   ▝▝ "]

function Welcome({
  version = "2.1.296",
  model = "Opus 5.5",
  plan = "Claude Team",
  cwd = "~/demo",
}: {
  version?: string
  model?: string
  plan?: string
  cwd?: string
}) {
  const text = [
    <>
      <T bold>Claude Code</T> <T tone="dim">v{version}</T>
    </>,
    <T key="plan" tone="dim">
      {model} · {plan}
    </T>,
    <T key="cwd" tone="dim">
      {cwd}
    </T>,
  ]
  return (
    <div className="pb-5">
      {LOGO.map((row, index) => (
        <Line key={index}>
          <T tone="claude">{row}</T>
          {"  "}
          {text[index]}
        </Line>
      ))}
    </div>
  )
}

// A full-width rule of box-drawing characters, cut at the window's edge the
// way the terminal cuts it at its last column.
function Rule({ tone = "rule" }: { tone?: "rule" | "select" }) {
  return (
    <Line className="overflow-hidden whitespace-nowrap">
      <T tone={tone}>{"─".repeat(240)}</T>
    </Line>
  )
}

// A warning under the welcome block, such as the MCP sign-in reminder.
function Notice({
  children,
  hint,
}: {
  children: React.ReactNode
  hint?: string
}) {
  return (
    <Line>
      <T tone="warn">⚠ {children}</T>
      {hint && <T tone="dim"> · {hint}</T>}
    </Line>
  )
}

// What the member typed, after they pressed Enter.
function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <Line className="bg-terminal-prompt">
      <T tone="dim">❯ </T>
      <T tone="white">{children}</T>
    </Line>
  )
}

// The result of a slash command, hanging under it.
function Output({ children }: { children: React.ReactNode }) {
  return (
    <Line indent={2} className="pb-5">
      <T tone="dim">⎿ </T> {children}
    </Line>
  )
}

// A call to an MCP server: "Calling" while it runs, "Called" after.
function McpCall({ server, done }: { server: string; done?: boolean }) {
  return done ? (
    <Line indent={2}>
      <T tone="dim">Called {server} (ctrl+o to expand)</T>
    </Line>
  ) : (
    <Line>
      <T tone="dim">⏺</T> Calling {server}… <T tone="dim">(ctrl+o to expand)</T>
    </Line>
  )
}

// Claude's answer: a white dot, then the text; later lines hang under it.
function Reply({ lines }: { lines: React.ReactNode[] }) {
  return (
    <div className="pt-5">
      {lines.map((line, index) =>
        index === 0 ? (
          // The dot hangs in the first two cells, so a wrapped line lines
          // up under the text, not under the dot.
          <Line key={index} className="flex">
            <T tone="white" className="w-cells-2 shrink-0">
              ⏺
            </T>
            <T className="min-w-0">{line}</T>
          </Line>
        ) : (
          <Line key={index} indent={2}>
            {line}
          </Line>
        )
      )}
    </div>
  )
}

// The working line while Claude thinks.
function Spinner({
  glyph = "✽",
  verb,
  seconds,
  tokens,
}: {
  glyph?: string
  verb: string
  seconds: number
  tokens: number
}) {
  const cut = Math.max(0, verb.length - 3)
  return (
    <Line className="pt-5">
      <T tone="claude">
        {glyph} {verb.slice(0, cut)}
      </T>
      <T tone="shimmer">{verb.slice(cut)}…</T>{" "}
      <T tone="dim">
        ({seconds}s · ↓ {tokens} tokens · <T tone="soft">thinking</T>)
      </T>
    </Line>
  )
}

// The line left behind when a turn ends.
function Done({
  verb,
  seconds,
  time,
}: {
  verb: string
  seconds: number
  time: string
}) {
  return (
    <Line className="pt-5">
      <T tone="dim">
        ✻ {verb} for {seconds}s · done {time}
      </T>
    </Line>
  )
}

// The input box at the bottom, with its status line. `value` is what is
// being typed; without it the box shows the placeholder suggestion.
function InputBox({
  value,
  placeholder = 'Try "fix typecheck errors"',
  busy,
}: {
  value?: string
  placeholder?: string
  busy?: boolean
}) {
  return (
    <div className="pt-5">
      <Rule />
      <Line>
        {"❯ "}
        {value ? (
          <>
            {value}
            <span className="bg-terminal-foreground text-terminal"> </span>
          </>
        ) : (
          <>
            <T inverse>{placeholder.slice(0, 1)}</T>
            <T tone="dim" faint>
              {placeholder.slice(1)}
            </T>
          </>
        )}
      </Line>
      <Rule />
      <Line className="flex justify-between gap-4">
        <T tone="dim" className="truncate">
          {"  "}⏸ manual mode on ·{" "}
          {busy ? "esc to interrupt" : "? for shortcuts"} · ← for agents
        </T>
        <T tone="dim" className="hidden shrink-0 sm:inline">
          ◐ medium · /effort
        </T>
      </Line>
    </div>
  )
}

// The question Claude Code asks before it runs a tool in manual mode.
function ToolUse({
  server,
  tool,
  about,
  choice = 0,
}: {
  /** The MCP server, such as "plugin:infrastructure:carrel". */
  server: string
  /** The tool's name as Claude Code shows it, such as "Machine Create". */
  tool: string
  /** The tool's description; Claude Code shows its first two rows, each
   * cut with an ellipsis. */
  about: string | string[]
  choice?: 0 | 1
}) {
  return (
    <div className="pt-5">
      <Rule tone="select" />
      <Line indent={1}>
        <T tone="select" bold>
          Tool use
        </T>
      </Line>
      <Line indent={1} className="pt-5">
        <T bold>
          {server} — {tool} Tool:
        </T>
        <T tone="dim"> (MCP)</T>
      </Line>
      <Line indent={1} className="pt-5">
        <T italic>
          About the{" "}
          <T bold>
            {server} — {tool}
          </T>{" "}
          Tool:
        </T>
      </Line>
      {(Array.isArray(about) ? about : [about]).map((line, index) => (
        <Line key={index} indent={1} className="truncate">
          <T tone="dim">│ </T>
          <T tone="dim" italic>
            {line}
          </T>
        </Line>
      ))}
      <Line indent={1}>
        <T tone="dim">(ctrl+o to expand description)</T>
      </Line>
      <Line indent={1} className="pt-5">
        Do you want to proceed?
      </Line>
      <Choices items={["Yes", "No"]} choice={choice} indent={1} />
      <Line indent={1} className="pt-5">
        <T tone="dim">Esc to cancel · Tab to amend</T>
      </Line>
    </div>
  )
}

// A numbered or plain list with the ❯ on the chosen row.
function Choices({
  items,
  choice,
  numbered = true,
  indent = 2,
}: {
  items: string[]
  choice: number
  numbered?: boolean
  indent?: 0 | 1 | 2
}) {
  return (
    <>
      {items.map((item, index) => {
        const on = index === choice
        return (
          <Line key={item} indent={indent}>
            {on ? <T tone="select">❯ </T> : "  "}
            {numbered && <T tone="dim">{index + 1}. </T>}
            {on ? <T tone="select">{item}</T> : item}
          </Line>
        )
      })}
    </>
  )
}

// The frame of a full-screen menu such as /plugins or /mcp: a blue rule,
// then the menu, then its key hints.
function Menu({ hint, children }: { hint: string; children: React.ReactNode }) {
  return (
    <div>
      <Rule tone="select" />
      {children}
      <Line indent={2} className="pt-5">
        <T tone="dim" italic>
          {hint}
        </T>
      </Line>
    </div>
  )
}

const pluginTabs = [
  "Discover",
  "Installed",
  "Marketplaces",
  "Errors",
  "Stats",
] as const

// The tab row of /plugins.
function PluginTabs({ current }: { current: (typeof pluginTabs)[number] }) {
  return (
    <Line indent={2} className="pb-5">
      <T tone="select" bold>
        Plugins
      </T>
      {"  "}
      {pluginTabs.map((tab) => (
        <React.Fragment key={tab}>
          {tab === current ? (
            <T bold inverse>
              {" "}
              {tab}{" "}
            </T>
          ) : (
            <span>{tab}</span>
          )}
          {"   "}
        </React.Fragment>
      ))}
    </Line>
  )
}

// One marketplace row in /plugins > Marketplaces.
function Marketplace({
  name,
  source,
  detail,
  selected,
}: {
  name: string
  source: string
  detail: string
  selected?: boolean
}) {
  return (
    <div className="pb-5">
      <Line indent={2}>
        {selected ? <T tone="select">❯ </T> : "  "}● <T bold>{name}</T>
      </Line>
      <Line indent={6}>
        <T tone="dim">{source}</T>
      </Line>
      <Line indent={6}>
        <T tone="dim">{detail}</T>
      </Line>
    </div>
  )
}

// A key: value row in a detail screen.
function Field({
  name,
  children,
}: {
  name: string
  children: React.ReactNode
}) {
  return (
    <Line indent={2} className="flex">
      <T bold className="w-cells-18 shrink-0">
        {name}
      </T>
      <span>{children}</span>
    </Line>
  )
}

// A block of lines that fills the space above the input box, so the box
// stays at the bottom like it does in the real window.
function Screen({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col justify-end overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  )
}

export {
  Choices,
  Done,
  Field,
  InputBox,
  Marketplace,
  McpCall,
  Menu,
  Notice,
  Output,
  PluginTabs,
  Prompt,
  Reply,
  Rule,
  Screen,
  Spinner,
  ToolUse,
  Welcome,
}
