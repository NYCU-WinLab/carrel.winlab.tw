import * as React from "react"

import { Button } from "@/components/ui/button"

// The page where a member lets another program act for them, such as an MCP
// client signing in to a WinLab service. Put it in app-shell's spotlight
// layout. It is a plain form that posts `allow=yes` or `allow=no` with the
// hidden `fields`, so it works the same from a server-rendered page with no
// script. The title names the service ("連接 Carrel"); `client` is the
// program asking, shown as the server received it.
function Consent({
  title,
  client,
  access,
  note,
  action,
  fields = {},
  cancel = "取消",
  allow = "允許",
}: {
  title: string
  client: string
  /** What the client may do, after "允許 {client} ". */
  access: React.ReactNode
  /** How long it lasts and where to take it back. */
  note?: React.ReactNode
  action: string
  fields?: Record<string, string>
  cancel?: string
  allow?: string
}) {
  return (
    <form
      data-slot="consent"
      method="post"
      action={action}
      className="flex flex-col items-center gap-12 text-center"
    >
      <h1 className="text-title font-medium">{title}</h1>
      <div className="flex flex-col gap-4 text-muted-foreground">
        <p className="break-words">
          允許 <span className="font-medium text-foreground">{client}</span>{" "}
          {access}
        </p>
        {note && <p>{note}</p>}
      </div>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <div className="flex gap-4">
        <Button type="submit" name="allow" value="no" variant="outline">
          {cancel}
        </Button>
        <Button type="submit" name="allow" value="yes">
          {allow}
        </Button>
      </div>
    </form>
  )
}

export { Consent }
