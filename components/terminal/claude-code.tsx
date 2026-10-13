import * as React from "react"

import { cn } from "@/lib/utils"
import { Line, T } from "@/components/terminal/terminal"

// Claude Code's screen, piece by piece. Layout, glyphs, wording and colors
// follow Claude Code 2.1.296 in a fresh config (no plugins, settings or
// statusline of our own); what a demo changes is passed in as props.

const MCP = "plugin:infrastructure:carrel"

// The welcome block: the logo, the version, the model and plan, the folder.
// The logo is Claude Code's three rows of quadrant blocks, drawn as pixels so
// web fonts and line height cannot pull the rows apart.
const LOGO =
  "M3 0h1v1h-1zM3 1h1v1h-1zM4 0h1v1h-1zM5 0h1v1h-1zM4 1h1v1h-1zM6 0h1v1h-1zM7 0h1v1h-1zM6 1h1v1h-1zM7 1h1v1h-1zM8 0h1v1h-1zM9 0h1v1h-1zM8 1h1v1h-1zM9 1h1v1h-1zM10 0h1v1h-1zM11 0h1v1h-1zM10 1h1v1h-1zM11 1h1v1h-1zM12 0h1v1h-1zM13 0h1v1h-1zM12 1h1v1h-1zM14 0h1v1h-1zM15 0h1v1h-1zM14 1h1v1h-1zM15 1h1v1h-1zM1 2h1v1h-1zM2 2h1v1h-1zM3 2h1v1h-1zM3 3h1v1h-1zM4 2h1v1h-1zM5 2h1v1h-1zM4 3h1v1h-1zM5 3h1v1h-1zM6 2h1v1h-1zM7 2h1v1h-1zM6 3h1v1h-1zM7 3h1v1h-1zM8 2h1v1h-1zM9 2h1v1h-1zM8 3h1v1h-1zM9 3h1v1h-1zM10 2h1v1h-1zM11 2h1v1h-1zM10 3h1v1h-1zM11 3h1v1h-1zM12 2h1v1h-1zM13 2h1v1h-1zM12 3h1v1h-1zM13 3h1v1h-1zM14 2h1v1h-1zM15 2h1v1h-1zM14 3h1v1h-1zM15 3h1v1h-1zM16 2h1v1h-1zM17 2h1v1h-1zM3 4h1v1h-1zM5 4h1v1h-1zM13 4h1v1h-1zM15 4h1v1h-1z"

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
  return (
    <div className="t-gap3 t-blank-below flex items-center">
      <svg
        aria-hidden
        viewBox="0 0 18 6"
        preserveAspectRatio="none"
        className="t-logo shrink-0"
        shapeRendering="crispEdges"
      >
        <path d={LOGO} />
      </svg>
      <div>
        <Line>
          <T bold>Claude Code</T> <T tone="dim">v{version}</T>
        </Line>
        <Line>
          <T tone="dim">
            {model} · {plan}
          </T>
        </Line>
        <Line>
          <T tone="dim">{cwd}</T>
        </Line>
      </div>
    </div>
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
    <Line className="t-prompt-row">
      <T tone="dim">❯ </T>
      <T tone="white">{children}</T>
    </Line>
  )
}

// The result of a slash command, hanging under it.
function Output({ children }: { children: React.ReactNode }) {
  return (
    <Line indent={2} className="t-blank-below">
      <T tone="dim">⎿ </T> {children}
    </Line>
  )
}

// A call to the Carrel MCP server: "Calling" while it runs, "Called" after.
function McpCall({ done }: { done?: boolean }) {
  return done ? (
    <Line indent={2}>
      <T tone="dim">Called {MCP} (ctrl+o to expand)</T>
    </Line>
  ) : (
    <Line>
      <T tone="dim">⏺</T> Calling {MCP}… <T tone="dim">(ctrl+o to expand)</T>
    </Line>
  )
}

// Claude's answer: a white dot, then the text; later lines hang under it.
function Reply({ lines }: { lines: React.ReactNode[] }) {
  return (
    <div className="t-blank-above">
      {lines.map((line, index) => (
        <Line key={index} indent={index === 0 ? 0 : 2}>
          {index === 0 && <T tone="white">⏺ </T>}
          {line}
        </Line>
      ))}
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
    <Line className="t-blank-above">
      <T tone="accent">
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
    <Line className="t-blank-above">
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
    <div className="t-blank-above">
      <div className="t-rule" />
      <Line>
        {"❯ "}
        {value ? (
          <>
            {value}
            <span className="t-cursor"> </span>
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
      <div className="t-rule" />
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
  tool,
  about,
  choice = 0,
}: {
  /** The tool's name as Claude Code shows it, such as "Machine Create". */
  tool: string
  about: string
  choice?: 0 | 1
}) {
  return (
    <div className="t-blank-above">
      <div className="t-rule-select" />
      <Line indent={1}>
        <T tone="select" bold>
          Tool use
        </T>
      </Line>
      <Line indent={1} className="t-blank-above">
        <T bold>
          {MCP} — {tool} Tool:
        </T>
        <T tone="dim"> (MCP)</T>
      </Line>
      <Line indent={1} className="t-blank-above">
        <T italic>
          About the{" "}
          <T bold>
            {MCP} — {tool}
          </T>{" "}
          Tool:
        </T>
      </Line>
      <Line indent={1}>
        <span className="t-quote t-pad1 inline-block">
          <T tone="dim" italic>
            {about}
          </T>
        </span>
      </Line>
      <Line indent={1}>
        <T tone="dim">(ctrl+o to expand description)</T>
      </Line>
      <Line indent={1} className="t-blank-above">
        Do you want to proceed?
      </Line>
      <Choices items={["Yes", "No"]} choice={choice} indent={1} />
      <Line indent={1} className="t-blank-above">
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
      <div className="t-rule-select" />
      {children}
      <Line indent={2} className="t-blank-above">
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
    <Line indent={2} className="t-blank-below">
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
    <div className="t-blank-below">
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
      <T bold className="t-key shrink-0">
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
  Screen,
  Spinner,
  ToolUse,
  Welcome,
}
