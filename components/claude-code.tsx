"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { TerminalLine as Line, TerminalText } from "@/components/ui/terminal"

// Claude Code's screen, piece by piece, for demos and install guides. Layout,
// glyphs, wording and colors follow Claude Code 2.1.296 in a fresh config
// (no plugins, settings or statusline of our own); what a demo changes is
// passed in as props. MCP servers are named the way Claude Code names them,
// such as "plugin:infrastructure:carrel".

// Claude Code's own colors (its dark theme), as claude-* tokens.
const tones = {
  claude: "text-claude",
  shimmer: "text-claude-shimmer",
  permission: "text-claude-permission",
  text: "text-claude-text",
  inactive: "text-claude-inactive",
  subtle: "text-claude-subtle",
  border: "text-claude-prompt-border",
  success: "text-claude-success",
  error: "text-claude-error",
  warning: "text-claude-warning",
} as const

type ClaudeTone = keyof typeof tones

// A run of text in one of Claude Code's colors.
function ClaudeText({
  tone,
  className,
  ...props
}: Omit<React.ComponentProps<typeof TerminalText>, "tone"> & {
  tone?: ClaudeTone
}) {
  return (
    <TerminalText className={cn(tone && tones[tone], className)} {...props} />
  )
}
const T = ClaudeText

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
      <T bold>Claude Code</T> <T tone="inactive">v{version}</T>
    </>,
    <T key="plan" tone="inactive">
      {model} · {plan}
    </T>,
    <T key="cwd" tone="inactive">
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
function Rule({ tone = "border" }: { tone?: "border" | "permission" }) {
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
      <T tone="warning">⚠ {children}</T>
      {hint && <T tone="inactive"> · {hint}</T>}
    </Line>
  )
}

// What the member typed, after they pressed Enter.
function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <Line className="bg-claude-user-message">
      <T tone="inactive">❯ </T>
      <T tone="text">{children}</T>
    </Line>
  )
}

// The result of a slash command, hanging under it.
function Output({ children }: { children: React.ReactNode }) {
  return (
    <Line indent={2} className="pb-5">
      <T tone="inactive">⎿ </T> {children}
    </Line>
  )
}

// A call to an MCP server: "Calling" while it runs, "Called" after.
function McpCall({ server, done }: { server: string; done?: boolean }) {
  return done ? (
    <Line indent={2}>
      <T tone="inactive">Called {server} (ctrl+o to expand)</T>
    </Line>
  ) : (
    <Line>
      <T tone="inactive">⏺</T> Calling {server}…{" "}
      <T tone="inactive">(ctrl+o to expand)</T>
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
            <T tone="text" className="w-cells-2 shrink-0">
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

// The verbs Claude Code 2.1.296 picks from, once per turn, for its working
// line, and the past tenses of the line a finished turn leaves behind.
const SPINNER_VERBS = [
  "Accomplishing",
  "Actioning",
  "Actualizing",
  "Architecting",
  "Baking",
  "Beaming",
  "Beboppin'",
  "Befuddling",
  "Billowing",
  "Blanching",
  "Bloviating",
  "Boogieing",
  "Boondoggling",
  "Booping",
  "Bootstrapping",
  "Brewing",
  "Bunning",
  "Burrowing",
  "Calculating",
  "Canoodling",
  "Caramelizing",
  "Cascading",
  "Catapulting",
  "Cerebrating",
  "Channeling",
  "Choreographing",
  "Churning",
  "Clauding",
  "Coalescing",
  "Cogitating",
  "Combobulating",
  "Composing",
  "Computing",
  "Concocting",
  "Considering",
  "Contemplating",
  "Cooking",
  "Crafting",
  "Creating",
  "Crunching",
  "Crystallizing",
  "Cultivating",
  "Deciphering",
  "Deliberating",
  "Determining",
  "Dilly-dallying",
  "Discombobulating",
  "Doing",
  "Doodling",
  "Drizzling",
  "Ebbing",
  "Effecting",
  "Elucidating",
  "Embellishing",
  "Enchanting",
  "Envisioning",
  "Fermenting",
  "Fiddle-faddling",
  "Finagling",
  "Flambéing",
  "Flibbertigibbeting",
  "Flowing",
  "Flummoxing",
  "Fluttering",
  "Forging",
  "Forming",
  "Frolicking",
  "Frosting",
  "Gallivanting",
  "Galloping",
  "Garnishing",
  "Generating",
  "Gesticulating",
  "Germinating",
  "Gitifying",
  "Grooving",
  "Gusting",
  "Harmonizing",
  "Hashing",
  "Hatching",
  "Herding",
  "Honking",
  "Hullaballooing",
  "Hyperspacing",
  "Ideating",
  "Imagining",
  "Improvising",
  "Incubating",
  "Inferring",
  "Infusing",
  "Ionizing",
  "Jitterbugging",
  "Julienning",
  "Kerfuffling",
  "Kneading",
  "Leavening",
  "Levitating",
  "Lollygagging",
  "Manifesting",
  "Marinating",
  "Meandering",
  "Metamorphosing",
  "Misting",
  "Moonwalking",
  "Moseying",
  "Mulling",
  "Mustering",
  "Musing",
  "Nebulizing",
  "Nesting",
  "Newspapering",
  "Noodling",
  "Nucleating",
  "Onioning",
  "Orbiting",
  "Orchestrating",
  "Osmosing",
  "Perambulating",
  "Percolating",
  "Perusing",
  "Philosophizing",
  "Photosynthesizing",
  "Polishing",
  "Pollinating",
  "Pondering",
  "Pontificating",
  "Pouncing",
  "Precipitating",
  "Prestidigitating",
  "Processing",
  "Proofing",
  "Propagating",
  "Puttering",
  "Puzzling",
  "Quantumizing",
  "Razzle-dazzling",
  "Razzmatazzing",
  "Recombobulating",
  "Reticulating",
  "Roosting",
  "Ruminating",
  "Sautéing",
  "Scampering",
  "Schlepping",
  "Scurrying",
  "Seasoning",
  "Shenaniganing",
  "Shimmying",
  "Simmering",
  "Skedaddling",
  "Sketching",
  "Slithering",
  "Smooshing",
  "Sock-hopping",
  "Spelunking",
  "Spinning",
  "Sprouting",
  "Stewing",
  "Sublimating",
  "Swirling",
  "Swooping",
  "Symbioting",
  "Synthesizing",
  "Tempering",
  "Thinking",
  "Thundering",
  "Tinkering",
  "Tomfoolering",
  "Topsy-turvying",
  "Transfiguring",
  "Transmogrifying",
  "Transmuting",
  "Twisting",
  "Undulating",
  "Unfurling",
  "Unraveling",
  "Vibing",
  "Waddling",
  "Wandering",
  "Warping",
  "Whatchamacalliting",
  "Whirlpooling",
  "Whirring",
  "Whisking",
  "Wibbling",
  "Working",
  "Wrangling",
  "Zesting",
  "Zigzagging",
]
const DONE_VERBS = [
  "Baked",
  "Brewed",
  "Churned",
  "Cogitated",
  "Cooked",
  "Crunched",
  "Sautéed",
  "Worked",
]

/** A verb for a new turn's working line, the way Claude Code picks one. */
function spinnerVerb() {
  return SPINNER_VERBS[Math.floor(Math.random() * SPINNER_VERBS.length)]
}

/** The finished line's verb: Claude Code hashes the message id into the list,
 * so the same turn always says the same word. */
function doneVerb(seed: string) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return DONE_VERBS[(hash >>> 0) % DONE_VERBS.length]
}

// A clock in milliseconds that ticks every `ms` while motion is allowed.
function useTicks(ms: number) {
  const [now, setNow] = React.useState(0)
  React.useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const start = performance.now()
    const id = setInterval(() => setNow(performance.now() - start), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

const GLYPHS = ["·", "✢", "✳", "✶", "✻", "✽"]

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function tokenCount(tokens: number) {
  return tokens < 1000 ? String(tokens) : compact.format(tokens).toLowerCase()
}

function duration(seconds: number) {
  return seconds < 60
    ? `${seconds}s`
    : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function thinkingLabel(seconds: number) {
  if (seconds < 10) return "thinking"
  if (seconds < 20) return "still thinking"
  if (seconds < 30) return "thinking more"
  if (seconds < 45) return "thinking some more"
  return "deep in thought"
}

// The working line while Claude works, as Claude Code 2.1.296 draws it:
// the glyph eases through ·✢✳✶✻✽ and back every 2 seconds; a 3-cell
// highlight sweeps right to left across the verb, one cell per 200ms
// (left to right, every 50ms, while waiting for the first token); while a
// tool runs the whole verb pulses instead. The parenthesis appears once
// there are tokens, a thinking label, or more than 16 seconds.
function Spinner({
  verb = "Thinking",
  mode = "responding",
  seconds,
  tokens = 0,
  thinking,
}: {
  /** One of Claude Code's verbs; pick a new one per turn with spinnerVerb(). */
  verb?: string
  mode?: "responding" | "requesting" | "tool-use"
  seconds: number
  tokens?: number
  /** Seconds spent thinking so far; omit when Claude is not thinking. */
  thinking?: number
}) {
  const now = useTicks(mode === "requesting" ? 50 : 100)
  const glyph =
    GLYPHS[Math.round(((1 - Math.cos((2 * Math.PI * now) / 2000)) / 2) * 5)]
  const text = Array.from(verb.endsWith("…") ? verb : `${verb}…`)
  const width = text.length
  const cycle = width + 20
  const center =
    now === 0 || mode === "tool-use"
      ? -100
      : mode === "requesting"
        ? (Math.floor(now / 50) % cycle) - 10
        : width + 10 - (Math.floor(now / 200) % cycle)
  const lit = (index: number) => index >= center - 1 && index <= center + 1

  const parts = [
    ...(tokens > 0 || thinking !== undefined || seconds > 16
      ? [duration(seconds)]
      : []),
    ...(tokens > 0
      ? [`${mode === "requesting" ? "↑" : "↓"} ${tokenCount(tokens)} tokens`]
      : []),
  ]
  const label = thinking !== undefined && (
    <T className="animate-claude-thinking">{thinkingLabel(thinking)}</T>
  )

  return (
    <Line className="pt-5">
      <T tone="claude" className="inline-block w-cells-2">
        {glyph}
      </T>
      {mode === "tool-use" ? (
        <T className="animate-claude-pulse">{text.join("")}</T>
      ) : (
        text.map((char, index) => (
          <T key={index} tone={lit(index) ? "shimmer" : "claude"}>
            {char}
          </T>
        ))
      )}
      {"  "}
      {parts.length > 0 ? (
        <T tone="inactive">
          ({parts.join(" · ")}
          {label && <> · {label}</>})
        </T>
      ) : (
        label && <>({label})</>
      )}
    </Line>
  )
}

// The line left behind when a turn ends. Without `verb` it picks one of
// Claude Code's past tenses from `seed`, so a turn keeps its word.
function Done({
  verb,
  seed = "",
  seconds,
  time,
}: {
  verb?: string
  seed?: string
  seconds: number
  time: string
}) {
  return (
    <Line className="pt-5">
      <T tone="inactive">
        <span className="inline-block w-cells-2">✻</span>
        {verb ?? doneVerb(seed + time)} for {duration(seconds)} · done {time}
      </T>
    </Line>
  )
}

// The input box at the bottom, with its status line. `value` is what is
// being typed; without it the box shows the placeholder suggestion, or
// nothing while Claude is busy.
function InputBox({
  value,
  composing,
  placeholder = 'Try "fix typecheck errors"',
  busy,
}: {
  value?: string
  /** IME text being composed, such as zhuyin, underlined before the cursor. */
  composing?: string
  placeholder?: string
  busy?: boolean
}) {
  return (
    <div className="pt-5">
      <Rule />
      <Line>
        {"❯ "}
        {value || composing ? (
          <>
            {value}
            {composing && (
              <span className="underline *:underline">{composing}</span>
            )}
            <span className="bg-terminal-foreground text-terminal"> </span>
          </>
        ) : busy ? null : (
          <>
            <T inverse>{placeholder.slice(0, 1)}</T>
            <T tone="inactive" faint>
              {placeholder.slice(1)}
            </T>
          </>
        )}
      </Line>
      <Rule />
      <Line className="flex justify-between gap-4">
        <T tone="inactive" className="truncate">
          {"  "}⏸ manual mode on ·{" "}
          {busy ? "esc to interrupt" : "? for shortcuts"} · ← for agents
        </T>
        <T tone="inactive" className="hidden shrink-0 sm:inline">
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
      <Rule tone="permission" />
      <Line indent={1}>
        <T tone="permission" bold>
          Tool use
        </T>
      </Line>
      <Line indent={1} className="pt-5">
        <T bold>
          {server} — {tool} Tool:
        </T>
        <T tone="inactive"> (MCP)</T>
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
          <T tone="inactive">│ </T>
          <T tone="inactive" italic>
            {line}
          </T>
        </Line>
      ))}
      <Line indent={1}>
        <T tone="inactive">(ctrl+o to expand description)</T>
      </Line>
      <Line indent={1} className="pt-5">
        Do you want to proceed?
      </Line>
      <Choices items={["Yes", "No"]} choice={choice} indent={1} />
      <Line indent={1} className="pt-5">
        <T tone="inactive">Esc to cancel · Tab to amend</T>
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
            {on ? <T tone="permission">❯ </T> : "  "}
            {numbered && <T tone="inactive">{index + 1}. </T>}
            {on ? <T tone="permission">{item}</T> : item}
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
      <Rule tone="permission" />
      {children}
      <Line indent={2} className="pt-5">
        <T tone="inactive" italic>
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
      <T tone="permission" bold>
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
        {selected ? <T tone="permission">❯ </T> : "  "}● <T bold>{name}</T>
      </Line>
      <Line indent={6}>
        <T tone="inactive">{source}</T>
      </Line>
      <Line indent={6}>
        <T tone="inactive">{detail}</T>
      </Line>
    </div>
  )
}

// How many monospace cells fit across `ref`: a terminal box is drawn to the
// window's width, one character per cell. The probe holds 10 cells.
function useColumns(ref: React.RefObject<HTMLDivElement | null>) {
  const [columns, setColumns] = React.useState(0)
  React.useEffect(() => {
    const row = ref.current
    const probe = row?.querySelector("[data-probe]")
    if (!row || !probe) return
    const measure = () =>
      setColumns(
        Math.floor(row.clientWidth / (probe.getBoundingClientRect().width / 10))
      )
    // The observer reports the first size as soon as it starts; the web font
    // can arrive later and change the cell width.
    const observer = new ResizeObserver(measure)
    observer.observe(row)
    document.fonts.ready.then(measure)
    return () => observer.disconnect()
  }, [ref])
  return columns
}

// A search field in a menu, such as the one in /plugins > Discover: a round
// box as wide as the screen. Each row is one string, the way the terminal
// prints it, so the box copies whole.
function SearchBox({ placeholder = "Search…" }: { placeholder?: string }) {
  const row = React.useRef<HTMLDivElement>(null)
  const columns = useColumns(row)
  const inner = Math.max(0, columns - 2)
  const text = ` ⌕ ${placeholder}`.slice(0, inner).padEnd(inner)
  return (
    <div className="pl-cells-2 pb-5">
      <div ref={row} className="relative">
        <span data-probe aria-hidden className="invisible absolute">
          0000000000
        </span>
        <Line>
          <T tone="inactive">{columns > 1 && `╭${"─".repeat(inner)}╮`}</T>
        </Line>
        <Line>
          <T tone="inactive">{columns > 1 && `│${text}│`}</T>
        </Line>
        <Line>
          <T tone="inactive">{columns > 1 && `╰${"─".repeat(inner)}╯`}</T>
        </Line>
      </div>
    </div>
  )
}

type PluginItem = {
  name: string
  description: string
  /** The version the marketplace lists, such as "v0002". */
  version: string
  installed?: boolean
}

// Claude Code cuts a description to the cells it has and ends it with "…".
function cut(text: string, width: number) {
  return text.length > width ? `${text.slice(0, width - 1)}…` : text
}

// The plugin list of /plugins > Discover: a count, the search box, then one
// row per plugin with its description cut to `width` cells and its version.
// `shown` rows are drawn; the rest sit under "more below".
function PluginList({
  items,
  choice,
  shown = items.length,
  width = 60,
}: {
  items: PluginItem[]
  choice: number
  shown?: number
  width?: number
}) {
  return (
    <>
      <Line indent={2}>
        <T bold>Install Plugins</T>{" "}
        <T tone="inactive">
          ({choice + 1}/{items.length})
        </T>
      </Line>
      <SearchBox />
      {items.slice(0, shown).map((item, index) => {
        const on = index === choice
        return (
          <div key={item.name} className="pb-5">
            <Line indent={2}>
              {on ? <T tone="permission">❯ </T> : "  "}
              {item.installed ? <T tone="success">✔ </T> : "○ "}
              <T
                tone={
                  item.installed ? "success" : on ? "permission" : undefined
                }
              >
                {item.name}
              </T>
              {item.installed && <T tone="inactive"> (installed)</T>}
            </Line>
            <Line indent={4}>
              <T tone="inactive">
                {cut(item.description, width)} · {item.version}
              </T>
            </Line>
          </div>
        )
      })}
      {shown < items.length && (
        <Line indent={2}>
          <T tone="inactive">↓ more below</T>
        </Line>
      )}
    </>
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
  PluginList,
  PluginTabs,
  Prompt,
  Reply,
  Rule,
  Screen,
  SearchBox,
  Spinner,
  ToolUse,
  ClaudeText,
  type ClaudeTone,
  type PluginItem,
  doneVerb,
  spinnerVerb,
  Welcome,
}
