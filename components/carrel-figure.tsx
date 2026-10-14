"use client"

import * as React from "react"

import { figure, figureSvg } from "@/figure/art"

// The study room: 8 carrels are a member's 8 machines. The drawing comes from
// figure/build.mjs (the anatomy kit); this component plays the story on it.

type Projection = {
  origin: [number, number]
  scale: number
  azimuth?: number
  elevation?: number
}

// The kit's translateAlong: a world offset as an SVG translate.
function translateAlong(P: Projection, [dx, dy, dz]: [number, number, number]) {
  const a = ((P.azimuth ?? 45) * Math.PI) / 180
  const e = ((P.elevation ?? 30) * Math.PI) / 180
  const k = P.scale * Math.sqrt(1.6)
  const x = (dx * Math.sin(a) - dy * Math.cos(a)) * k
  const y =
    ((dx * Math.cos(a) + dy * Math.sin(a)) * Math.sin(e) - dz * Math.cos(e)) * k
  return `translate(${Math.round(x * 100) / 100} ${Math.round(y * 100) / 100})`
}

type Seat = {
  light: number
  lightT: number
  key: boolean
  sign: number
  signT: number
  drawer: number
  drawerT: number
  card: boolean
}
type Line = {
  you: string
  agent: string
  act: (s: Seat[]) => void
  after?: (s: Seat[]) => void
}

const STORY: Line[] = [
  {
    you: "幫我開一台機器，叫 demo",
    agent: "好了，打 ssh demo.alice 就能連",
    act: (s) => {
      s[0].lightT = 1
      s[0].key = true
    },
  },
  {
    you: "把 demo 發布成網址",
    agent: "https://demo.alice.winlab.tw 已上線",
    act: (s) => {
      s[0].signT = 1
    },
  },
  {
    you: "升級前先存個快照",
    agent: "快照存好了，壞了可以還原",
    act: (s) => {
      s[0].drawerT = 1
      s[0].card = true
    },
    after: (s) => {
      s[0].drawerT = 0
    },
  },
  {
    you: "再開一台給資料庫用",
    agent: "db 開好了，只讓 demo 連得到",
    act: (s) => {
      s[1].lightT = 1
      s[1].key = true
    },
  },
  {
    you: "demo 今晚先暫停",
    agent: "已暫停，記憶體和檔案都保留",
    act: (s) => {
      s[0].lightT = 0.35
    },
  },
  {
    you: "db 不用了，刪掉",
    agent: "刪好了，額度還你 1 台",
    act: (s) => {
      s[1].lightT = 0
      s[1].key = false
    },
  },
  {
    you: "早上了，叫醒 demo",
    agent: "demo 回來了，網址照舊",
    act: (s) => {
      s[0].lightT = 1
    },
  },
]
const ASK = 1.3
const ACT = 1.1
const HOLD = 2.6
const REST = "8 個座位都是你的"

function CarrelFigure() {
  const host = React.useRef<HTMLDivElement>(null)
  const [you, setYou] = React.useState("")
  const [agent, setAgent] = React.useState("")
  const [used, setUsed] = React.useState(0)
  const next = React.useRef<() => void>(() => {})

  React.useEffect(() => {
    const root = host.current
    if (!root) return
    const P = figure.P as Projection
    const all = (s: string) => [...root.querySelectorAll<SVGElement>(s)]
    const keys = all("[data-key]"),
      signs = all("[data-sign]"),
      drawers = all("[data-drawer]"),
      cards = all("[data-slip]")
    const glows = all("[data-glow]"),
      bulbs = all("[data-bulb]")
    const chatYou = root.querySelector('[data-chat="you"]'),
      chatAgent = root.querySelector('[data-chat="agent"]')
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    const seats: Seat[] = Array.from({ length: figure.N }, () => ({
      light: 0,
      lightT: 0,
      key: false,
      sign: 0,
      signT: 0,
      drawer: 0,
      drawerT: 0,
      card: false,
    }))
    let idx = -1,
      phase: "rest" | "ask" | "act" | "reply" = "rest",
      since = performance.now()
    let touring = !still,
      frame = 0,
      last = 0,
      visible = false
    let idle: ReturnType<typeof setTimeout> | undefined
    let wake: ReturnType<typeof setTimeout> | undefined
    // The last value written to each attribute, so a frame writes only what
    // changed: every write makes the browser repaint the whole drawing.
    const written = new Map<Element, Record<string, string>>()
    const write = (el: Element, name: string, value: string) => {
      const seen = written.get(el) ?? {}
      if (seen[name] === value) return
      seen[name] = value
      written.set(el, seen)
      if (name === "transform") el.setAttribute(name, value)
      else (el as SVGElement).style.setProperty(name, value)
    }

    const say = () => {
      setUsed(seats.filter((s) => s.key).length)
      if (phase === "rest") {
        setYou("")
        setAgent("")
      } else {
        setYou(STORY[idx].you)
        setAgent(phase === "reply" ? STORY[idx].agent : "")
      }
      chatYou?.toggleAttribute("data-on", phase !== "rest")
      chatAgent?.toggleAttribute("data-on", phase === "reply")
    }
    const begin = (i: number) => {
      idx = i
      phase = "ask"
      since = performance.now()
      say()
    }
    const advance = () => {
      if (phase === "rest") return begin(0)
      if (phase === "ask") {
        STORY[idx].act(seats)
        phase = "act"
        since = performance.now()
        return
      }
      if (phase === "act") {
        phase = "reply"
        since = performance.now()
        say()
        return
      }
      STORY[idx].after?.(seats)
      if (idx === STORY.length - 1) {
        seats.forEach((s) => {
          s.lightT = 0
          s.key = false
          s.signT = 0
          s.drawerT = 0
          s.card = false
        })
        phase = "rest"
        since = performance.now()
        say()
        return
      }
      begin(idx + 1)
    }
    const draw = () => {
      seats.forEach((s, i) => {
        write(keys[i], "display", s.key ? "" : "none")
        write(glows[i], "opacity", (0.55 * s.light).toFixed(2))
        write(bulbs[i], "opacity", (0.18 + 0.82 * s.light).toFixed(2))
        write(signs[i], "display", s.sign > 0.01 ? "" : "none")
        write(
          signs[i],
          "transform",
          translateAlong(P, [0, 0, figure.SIGN_Z - 8 * (1 - s.sign)])
        )
        write(signs[i], "opacity", s.sign.toFixed(2))
        write(
          drawers[i],
          "transform",
          translateAlong(P, [0, figure.DRAWER_OUT * s.drawer, 0])
        )
        write(cards[i], "display", s.card && s.drawer > 0.05 ? "" : "none")
      })
    }
    const settle = () =>
      seats.forEach((s) => {
        s.light = s.lightT
        s.sign = s.signT
        s.drawer = s.drawerT
      })
    // How long the current phase lasts before the story moves on, or null
    // when it waits for a click.
    const hold = () => {
      if (touring) {
        if (phase === "rest") return 2.2
        if (phase === "ask") return ASK
        if (phase === "act") return ACT
        return HOLD
      }
      return phase === "act" ? ACT : null
    }
    // Frames run only while a part is still easing to its target; between
    // moves a timer wakes the figure for the next line of the story.
    const tick = (now: number) => {
      frame = 0
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60
      last = now
      const e = (sec: number) => 1 - Math.exp(-dt / sec)
      let moving = false
      seats.forEach((s) => {
        s.light += (s.lightT - s.light) * e(0.25)
        s.sign += (s.signT - s.sign) * e(0.2)
        s.drawer += (s.drawerT - s.drawer) * e(0.18)
        if (
          Math.abs(s.lightT - s.light) > 0.004 ||
          Math.abs(s.signT - s.sign) > 0.004 ||
          Math.abs(s.drawerT - s.drawer) > 0.004
        )
          moving = true
      })
      if (!moving) settle()
      const limit = hold()
      if (limit !== null && (now - since) / 1000 > limit) {
        advance()
        moving = true
      }
      draw()
      if (!visible) return
      if (moving) {
        frame = requestAnimationFrame(tick)
        return
      }
      last = 0
      const next = hold()
      if (next !== null)
        wake = setTimeout(
          run,
          Math.max(0, next * 1000 - (performance.now() - since))
        )
    }
    const run = () => {
      clearTimeout(wake)
      if (!frame && visible && !still) frame = requestAnimationFrame(tick)
    }
    next.current = () => {
      touring = false
      clearTimeout(idle)
      idle = setTimeout(() => {
        touring = !still
        run()
      }, 12000)
      advance()
      if (still) {
        while (phase === "act") advance()
        settle()
        draw()
      }
      run()
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) run()
      },
      { rootMargin: "120px 0px" }
    )
    observer.observe(root)
    if (still) {
      STORY.slice(0, 4).forEach((l) => l.act(seats))
      seats[0].drawerT = 0
      settle()
      idx = 3
      phase = "reply"
    }
    say()
    draw()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      clearTimeout(idle)
      clearTimeout(wake)
    }
  }, [])

  return (
    <figure className="flex flex-col gap-4">
      <div
        ref={host}
        role="button"
        tabIndex={0}
        aria-label="下一句"
        onClick={() => next.current()}
        onKeyDown={(event) => {
          if (event.key !== " " && event.key !== "Enter") return
          event.preventDefault()
          next.current()
        }}
        className="carrel-figure cursor-pointer will-change-transform outline-none"
        dangerouslySetInnerHTML={{ __html: figureSvg }}
      />
      <figcaption className="flex min-h-12 flex-col gap-1">
        <span className="flex justify-between gap-4">
          <span>{you ? `你：${you}` : REST}</span>
          <span className="text-muted-foreground tabular-nums">
            已用 {used}/8
          </span>
        </span>
        <span className="text-muted-foreground">
          {agent ? `Claude：${agent}` : " "}
        </span>
      </figcaption>
    </figure>
  )
}

export { CarrelFigure }
