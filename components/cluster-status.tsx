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

// Live use of the Carrel cluster from Carrel's public GET /status: for CPU,
// memory and disk, one ring whose full circle is what Carrel may hand out,
// with what it has handed out and what is in use on it; then the default
// budget and each member's share. Polls every 30 seconds while the page is
// visible.

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
  /** Members whose username is already public through a published domain. */
  tenants: Share[]
  /** Everyone else, summed without names. */
  others: Omit<Share, "name"> & { tenants: number }
  /** The default budget of a member, and the one each project group gets on
   * top. Older Carrel versions leave it out. */
  quota?: { member: Budget; project: Budget }
}
type Budget = Omit<Share, "name">
type Share = {
  name: string
  machines: number
  vcpu: number
  memory_gib: number
  disk_gib: number
}

const POLL_MS = 30_000
const gib = (n: number) => `${Math.round(n)} GiB`

// One resource as a ring: the full circle is Carrel's limit, the primary arc
// what is allocated, the gray arc what is in use. The shorter arc is drawn
// on top so both stay visible.
function Ring({
  label,
  limit,
  allocated,
  used,
  allocatedText,
  usedText,
}: {
  label: string
  limit: number
  allocated: number
  used: number
  allocatedText: string
  usedText: string
}) {
  const share = (n: number) => Math.min(100, Math.max(0, (n / limit) * 100))
  const arcs = [
    { value: share(allocated), className: "stroke-primary" },
    { value: share(used), className: "stroke-muted-foreground" },
  ].sort((a, b) => b.value - a.value)
  return (
    <div className="flex items-center gap-6 sm:flex-col sm:gap-4">
      <div className="relative size-24 shrink-0 sm:size-36">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            strokeWidth="10"
            className="stroke-muted"
          />
          {arcs.map((arc) =>
            arc.value > 0 ? (
              <circle
                key={arc.className}
                cx="60"
                cy="60"
                r="52"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${arc.value} 100`}
                className={arc.className}
              />
            ) : null
          )}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-semibold tabular-nums">
          {Math.round(share(allocated))}%
        </span>
      </div>
      <div className="flex flex-col gap-1 sm:items-center sm:text-center">
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums">{allocatedText}</span>
        <span className="text-muted-foreground tabular-nums">{usedText}</span>
      </div>
    </div>
  )
}

function Swatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className={`size-2 rounded-full ${className}`} />
      {label}
    </span>
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

  const { node, allocated, tenants, others, quota } = status
  const time = new Date(status.checked_at).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const threads = node.cpu.logical_cpus

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-3 sm:gap-12">
          <Ring
            label="CPU"
            limit={allocated.vcpu.limit}
            allocated={allocated.vcpu.committed}
            used={node.cpu.utilization * threads}
            allocatedText={`已分配 ${allocated.vcpu.committed} / ${allocated.vcpu.limit} vCPU`}
            usedText={`使用中 ${Math.round(node.cpu.utilization * 100)}%，${threads} 執行緒`}
          />
          <Ring
            label="記憶體"
            limit={allocated.memory_gib.limit}
            allocated={allocated.memory_gib.committed}
            used={node.memory_gib.used}
            allocatedText={`已分配 ${gib(allocated.memory_gib.committed)} / ${gib(allocated.memory_gib.limit)}`}
            usedText={`使用中 ${gib(node.memory_gib.used)} / ${gib(node.memory_gib.total)}`}
          />
          <Ring
            label="硬碟"
            limit={allocated.disk_gib.limit}
            allocated={allocated.disk_gib.committed}
            used={node.disk_gib.used}
            allocatedText={`已分配 ${gib(allocated.disk_gib.committed)} / ${gib(allocated.disk_gib.limit)}`}
            usedText={`使用中 ${gib(node.disk_gib.used)} / ${gib(node.disk_gib.total)}`}
          />
        </div>
        <div className="flex flex-wrap gap-6 text-muted-foreground sm:justify-center">
          <Swatch className="bg-primary" label="已分配" />
          <Swatch className="bg-muted-foreground" label="使用中" />
          <Swatch className="bg-muted" label="可分配上限" />
        </div>
      </div>

      {quota && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>預算</TableHead>
              <TableHead className="text-right">機器</TableHead>
              <TableHead className="text-right">vCPU</TableHead>
              <TableHead className="text-right">記憶體</TableHead>
              <TableHead className="text-right">硬碟</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(
              [
                ["每人", quota.member],
                ["計畫群組，另計", quota.project],
              ] as const
            ).map(([name, b]) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {b.machines}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {b.vcpu}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {gib(b.memory_gib)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {gib(b.disk_gib)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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
          {others.tenants > 0 && (
            <TableRow>
              <TableCell className="text-muted-foreground">
                其他 {others.tenants} 人
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {others.machines}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {others.vcpu}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {gib(others.memory_gib)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {gib(others.disk_gib)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p className="text-muted-foreground">更新於 {time}</p>
    </div>
  )
}

export { ClusterStatus }
