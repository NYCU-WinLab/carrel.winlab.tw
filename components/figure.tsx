"use client"

import * as React from "react"

// The study-room figure, drawn with the anatomy kit as its own page
// (public/figure/carrel.html). It follows the system theme and reports its
// height, so the frame grows to fit it.
function Figure() {
  const [height, setHeight] = React.useState(640)
  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const next = event.data?.carrelFigure
      if (typeof next === "number" && next > 0) setHeight(next)
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])
  return (
    <iframe
      src="/figure/carrel.html"
      title="你的 8 個座位：每個座位是一台機器"
      loading="lazy"
      height={height}
      className="w-full"
    />
  )
}

export { Figure }
