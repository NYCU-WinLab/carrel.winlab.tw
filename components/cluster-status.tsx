"use client"

import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Live use of the Carrel cluster from Carrel's public GET /status: how busy
// the node is, how much Carrel machines have taken of what it admits, and
// each member's share. Polls every 30 seconds while the page is visible.

type Pair = { total: number; used: number }
type Allocation = { committed: number; limit: number }
type Status = {
  checked_at: string
  node: {
    cpu: { logical_cpus: number; utilization: number }
    memory_gib: Pair
    disk_gib: Pair
  }
  allocated: { vcpu: Allocation; memory_gib: Allocation; disk_gib: Allocation }
  tenants: {
    name: string
    machines: number
    vcpu: number
    memory_gib: number
    disk_gib: number
  }[]
}

const POLL_MS = 30_000
const gib = (n: number) => `${Math.round(n)} GiB`

function Meter({
  label,
  value,
  max,
  text,
}: {
  label: string
  value: number
  max: number
  text: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-4">
        <span>{label}</span>
        <span className="text-muted-foreground tabular-nums">{text}</span>
      </div>
      <progress
        className="status-meter"
        value={Math.min(value, max)}
        max={max}
        aria-label={label}
      />
    </div>
  )
}

function ClusterStatus() {
  const [status, setStatus] = React.useState<Status | null>(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    let alive = true
    const load = async () => {
      if (document.hidden) return
      try {
        const res = await fetch("/status", { cache: "no-store" })
        if (!res.ok) throw new Error(String(res.status))
        const body = (await res.json()) as Status
        if (alive) {
          setStatus(body)
          setFailed(false)
        }
      } catch {
        if (alive) setFailed(true)
      }
    }
    load()
    const timer = setInterval(load, POLL_MS)
    document.addEventListener("visibilitychange", load)
    return () => {
      alive = false
      clearInterval(timer)
      document.removeEventListener("visibilitychange", load)
    }
  }, [])

  if (!status) {
    return (
      <p className="text-muted-foreground">
        {failed ? "暫時讀不到叢集狀態" : "讀取中…"}
      </p>
    )
  }

  const { node, allocated, tenants } = status
  const time = new Date(status.checked_at).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-6 sm:grid-cols-3">
        <Meter
          label="CPU"
          value={node.cpu.utilization}
          max={1}
          text={`${Math.round(node.cpu.utilization * 100)}%，${node.cpu.logical_cpus} 執行緒`}
        />
        <Meter
          label="記憶體"
          value={node.memory_gib.used}
          max={node.memory_gib.total}
          text={`${gib(node.memory_gib.used)} / ${gib(node.memory_gib.total)}`}
        />
        <Meter
          label="硬碟"
          value={node.disk_gib.used}
          max={node.disk_gib.total}
          text={`${gib(node.disk_gib.used)} / ${gib(node.disk_gib.total)}`}
        />
        <Meter
          label="已分配 vCPU"
          value={allocated.vcpu.committed}
          max={allocated.vcpu.limit}
          text={`${allocated.vcpu.committed} / ${allocated.vcpu.limit}`}
        />
        <Meter
          label="已分配記憶體"
          value={allocated.memory_gib.committed}
          max={allocated.memory_gib.limit}
          text={`${gib(allocated.memory_gib.committed)} / ${gib(allocated.memory_gib.limit)}`}
        />
        <Meter
          label="已分配硬碟"
          value={allocated.disk_gib.committed}
          max={allocated.disk_gib.limit}
          text={`${gib(allocated.disk_gib.committed)} / ${gib(allocated.disk_gib.limit)}`}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>帳號</TableHead>
            <TableHead className="text-right">機器</TableHead>
            <TableHead className="text-right">vCPU</TableHead>
            <TableHead className="text-right">記憶體</TableHead>
            <TableHead className="text-right">硬碟</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((t) => (
            <TableRow key={t.name}>
              <TableCell className="font-mono">{t.name}</TableCell>
              <TableCell className="text-right tabular-nums">
                {t.machines}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {t.vcpu}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {gib(t.memory_gib)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {gib(t.disk_gib)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-muted-foreground">更新於 {time}</p>
    </div>
  )
}

export { ClusterStatus }
