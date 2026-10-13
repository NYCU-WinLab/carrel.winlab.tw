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
      t = 0
    let touring = !still,
      frame = 0,
      last = 0,
      visible = false
    let idle: ReturnType<typeof setTimeout> | undefined

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
      t = 0
      say()
    }
    const advance = () => {
      if (phase === "rest") return begin(0)
      if (phase === "ask") {
        STORY[idx].act(seats)
        phase = "act"
        t = 0
        return
      }
      if (phase === "act") {
        phase = "reply"
        t = 0
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
        t = 0
        say()
        return
      }
      begin(idx + 1)
    }
    const draw = () => {
      seats.forEach((s, i) => {
        keys[i].style.display = s.key ? "" : "none"
        glows[i].style.opacity = String(0.55 * s.light)
        bulbs[i].style.opacity = String(0.18 + 0.82 * s.light)
        signs[i].style.display = s.sign > 0.01 ? "" : "none"
        signs[i].setAttribute(
          "transform",
          translateAlong(P, [0, 0, figure.SIGN_Z - 8 * (1 - s.sign)])
        )
        signs[i].style.opacity = String(s.sign)
        drawers[i].setAttribute(
          "transform",
          translateAlong(P, [0, figure.DRAWER_OUT * s.drawer, 0])
        )
        cards[i].style.display = s.card && s.drawer > 0.05 ? "" : "none"
      })
    }
    const settle = () =>
      seats.forEach((s) => {
        s.light = s.lightT
        s.sign = s.signT
        s.drawer = s.drawerT
      })
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60
      last = now
      t += dt
      const e = (sec: number) => 1 - Math.exp(-dt / sec)
      seats.forEach((s) => {
        s.light += (s.lightT - s.light) * e(0.25)
        s.sign += (s.signT - s.sign) * e(0.2)
        s.drawer += (s.drawerT - s.drawer) * e(0.18)
      })
      if (touring) {
        if (phase === "rest" && t > 2.2) begin(0)
        else if (phase === "ask" && t > ASK) advance()
        else if (phase === "act" && t > ACT) advance()
        else if (phase === "reply" && t > HOLD) advance()
      } else if (phase === "act" && t > ACT) advance()
      draw()
      frame = visible ? requestAnimationFrame(tick) : 0
    }
    const run = () => {
      if (!frame && visible && !still) {
        last = 0
        frame = requestAnimationFrame(tick)
      }
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
        className="carrel-figure cursor-pointer outline-none"
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
