"use client"

import * as React from "react"

import { demos, type Demo, type Run } from "@/lib/demos"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal } from "@/components/ui/terminal"
import {
  ClaudeText as T,
  Done,
  InputBox,
  McpCall,
  Prompt,
  Reply,
  Screen,
  Spinner,
  ToolUse,
  Welcome,
  spinnerVerb,
} from "@/components/claude-code"

const MCP = "plugin:infrastructure:carrel"

// One turn, as a timeline. Each step lasts `ms`; the screen is a function of
// the step and how far into it we are.
type Step = "type" | "think" | "ask" | "call" | "answer" | "rest"
const timing: Record<Step, number> = {
  type: 0, // set from the prompt length
  think: 1400,
  ask: 2200,
  call: 2600,
  answer: 0, // set from the reply length
  rest: 5200,
}
const TYPE_MS = 70
const LINE_MS = 260
const order: Step[] = ["type", "think", "ask", "call", "answer", "rest"]

function lengthOf(step: Step, demo: Demo) {
  if (step === "type") return demo.prompt.length * TYPE_MS + 500
  if (step === "answer") return demo.reply.length * LINE_MS + 300
  return timing[step]
}

function runs(line: Run[]) {
  return line.map((run, index) => (
    <T key={index} tone={run.tone} bold={run.bold}>
      {run.text}
    </T>
  ))
}

function Turn({
  demo,
  verb,
  step,
  t,
}: {
  demo: Demo
  verb: string
  step: Step
  t: number
}) {
  const at = order.indexOf(step)
  const typed =
    step === "type" ? demo.prompt.slice(0, Math.floor(t / TYPE_MS)) : ""
  // The spinner's clock runs to the demo's real duration over the turn.
  const working: Step[] = ["think", "ask", "call"]
  const total = working.reduce((sum, s) => sum + lengthOf(s, demo), 0)
  const elapsed = working.reduce((sum, s) => {
    const i = order.indexOf(s)
    return sum + (i < at ? lengthOf(s, demo) : i === at ? t : 0)
  }, 0)
  const spent = Math.min(1, elapsed / total)
  const seconds = Math.max(1, Math.round(spent * demo.seconds))
  const tokens = Math.round(spent * demo.tokens)
  const shown =
    step === "answer" ? Math.floor(t / LINE_MS) + 1 : demo.reply.length

  return (
    <>
      {at >= 1 && <Prompt>{demo.prompt}</Prompt>}
      {at >= 2 && at !== 2 && <McpCall server={MCP} done={at >= 4} />}
      {at >= 4 && <Reply lines={demo.reply.slice(0, shown).map(runs)} />}
      {at === 1 && (
        <Spinner
          verb={verb}
          seconds={seconds}
          tokens={tokens}
          thinking={seconds}
        />
      )}
      {at === 3 && (
        <Spinner
          verb={verb}
          mode="tool-use"
          seconds={seconds}
          tokens={tokens}
        />
      )}
      {at === 5 && (
        <Done seed={demo.id} seconds={demo.seconds} time="10:18 PM" />
      )}
      {at === 2 ? (
        <ToolUse server={MCP} tool={demo.tool} about={demo.about} />
      ) : (
        <InputBox
          value={typed || undefined}
          busy={at >= 1 && at <= 4}
          placeholder={at === 5 ? 'Try "fix typecheck errors"' : undefined}
        />
      )}
    </>
  )
}

function CarrelDemo() {
  const [index, setIndex] = React.useState(0)
  const [step, setStep] = React.useState<Step>("type")
  const [t, setT] = React.useState(0)
  const [still, setStill] = React.useState(false)
  // Claude Code picks a new verb for each turn.
  const [verb, setVerb] = React.useState("Thinking")
  const root = React.useRef<HTMLDivElement>(null)
  const demo = demos[index]

  React.useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setStill(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  React.useEffect(() => {
    if (still) return
    let frame = 0
    let last = performance.now()
    let visible = true
    let local = { index, step, t: 0 }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    if (root.current) observer.observe(root.current)
    const tick = (now: number) => {
      const dt = now - last
      last = now
      if (visible && !document.hidden) {
        local.t += dt
        const d = demos[local.index]
        if (local.t >= lengthOf(local.step, d)) {
          const next = order.indexOf(local.step) + 1
          if (next < order.length) {
            local = { ...local, step: order[next], t: 0 }
            if (local.step === "think") setVerb(spinnerVerb())
          } else {
            // Another demo, never the same one twice in a row.
            const pick =
              (local.index +
                1 +
                Math.floor(Math.random() * (demos.length - 1))) %
              demos.length
            local = { index: pick, step: "type", t: 0 }
          }
          setIndex(local.index)
          setStep(local.step)
        }
        setT(local.t)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
    // A new choice restarts the clock from that demo's first step.
  }, [index, still]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={root} className="flex flex-col gap-6">
      {/* Five tabs are wider than a phone; the row scrolls on its own. */}
      <div className="-mx-6 overflow-x-auto px-6">
        <Tabs
          value={demo.id}
          onValueChange={(value) => {
            setIndex(demos.findIndex((d) => d.id === value))
            setStep("type")
            setT(0)
          }}
        >
          <TabsList>
            {demos.map((d) => (
              <TabsTrigger key={d.id} value={d.id}>
                {d.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Terminal title="~/demo — claude" className="h-144 sm:h-160">
        <Welcome />
        <Screen>
          <Turn
            demo={demo}
            verb={verb}
            step={still ? "rest" : step}
            t={still ? 0 : t}
          />
        </Screen>
      </Terminal>
    </div>
  )
}

export { CarrelDemo }
