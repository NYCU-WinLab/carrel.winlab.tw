"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { TerminalLine as Line, Terminal } from "@/components/ui/terminal"
import {
  ClaudeText as T,
  Choices,
  Field,
  InputBox,
  Marketplace,
  Menu,
  Notice,
  Output,
  PluginList,
  PluginTabs,
  Prompt,
  Screen,
  Welcome,
} from "@/components/claude-code"
import { ConsentScreen } from "@/components/consent-screen"

// The five install screens, as Claude Code draws them. Wording comes from
// Claude Code 2.1.296; the marketplace row is the one WinLab's claude.ai
// organization syncs into every member's Claude Code.

// Each step is a title; its screen opens on a click, so the list reads as
// five short lines first.
function Step({
  n,
  title,
  children,
}: {
  n: number
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <li className="border-t border-border">
      <Collapsible>
        <CollapsibleTrigger className="group flex w-full gap-4 py-4 text-left font-medium">
          <span className="text-muted-foreground tabular-nums">{n}</span>
          <span className="flex-1">{title}</span>
          <ChevronDown
            aria-hidden
            className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-overlay group-data-panel-open:rotate-180 motion-reduce:transition-none"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 pb-6">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

const code = "rounded-control bg-muted px-2 font-mono"

function MarketplacesScreen() {
  return (
    <Terminal title="~/demo — claude">
      <Welcome />
      <Prompt>/plugins</Prompt>
      <Menu hint="Enter to select · u to update · d to remove · Esc to go back">
        <PluginTabs current="Marketplaces" />
        <Line indent={2} className="pb-5">
          <T bold>Manage marketplaces</T>
        </Line>
        <Line indent={2} className="pb-5">
          {"  "}
          <T tone="permission">+</T>{" "}
          <T tone="permission" bold>
            Add Marketplace
          </T>
        </Line>
        <Marketplace
          name="Anthropic Directory"
          source="Built in"
          detail="3248 available • Updated 10/13/2026"
        />
        <Marketplace
          name="✻ claude-plugins-official ✻"
          source="anthropics/claude-plugins-official"
          detail="315 available • Updated 10/13/2026"
        />
        <Marketplace
          selected
          name="claudeai-nycu-winlab-marketplace"
          source={
            'claude.ai (org library) · listed as "NYCU-WinLab/marketplace"'
          }
          detail="6 available • Updated 10/13/2026"
        />
      </Menu>
    </Terminal>
  )
}

// The WinLab marketplace's plugins as Discover lists them, sorted by name.
// Carrel's MCP server ships inside infrastructure.
const winlabPlugins = [
  {
    name: "academic",
    description:
      "WinLab thesis defense and graduation planning, publication venue shortlisting, lab presentations",
    version: "v0002",
  },
  {
    name: "bluefield",
    description:
      "WinLab BlueField-2 DOCA upgrade planning, scoped installation guidance and boot troubleshooting",
    version: "v0001",
  },
  {
    name: "infrastructure",
    description:
      "WinLab infrastructure: Carrel machines (VMs and CTs) through the carrel MCP server",
    version: "v0002",
  },
  {
    name: "life",
    description:
      "WinLab meeting meal coordination, restaurant order summaries and receipt checklists.",
    version: "v0001",
  },
  {
    name: "media",
    description:
      "WinLab Transcribe speech-to-text for YouTube videos and live streams",
    version: "v0001",
  },
  {
    name: "prplos",
    description:
      "prplOS / prplMesh development, AP operations, deployment and troubleshooting.",
    version: "v0001",
  },
]

function DiscoverScreen() {
  return (
    <Terminal title="~/demo — claude">
      <Welcome />
      <Prompt>/plugins</Prompt>
      <Menu hint="Type to search · Enter to view · Esc to go back">
        <PluginTabs current="Discover" />
        <PluginList items={winlabPlugins} choice={2} shown={5} />
      </Menu>
    </Terminal>
  )
}

function PluginScreen() {
  return (
    <Terminal title="~/demo — claude">
      <Welcome />
      <Prompt>/plugins</Prompt>
      <Menu hint="Enter to select · Esc to go back">
        <PluginTabs current="Discover" />
        <Line indent={2} className="pb-5">
          <T bold>Plugin Details</T>
        </Line>
        <Line indent={2}>
          <T bold>infrastructure</T>
        </Line>
        <Line indent={2}>
          WinLab infrastructure: Carrel machines (VMs and CTs) through the
          carrel MCP server, plus B09 SSH ProxyJump access, connection
          troubleshooting, port forwarding and VPN guidance.
        </Line>
        <Line indent={2} className="pb-5">
          <T tone="inactive">By: NYCU WinLab</T>
        </Line>
        <Line indent={2}>
          <T bold>Will install:</T>
        </Line>
        <Line indent={2} className="pb-5">
          <T tone="inactive">· Components will be discovered at installation</T>
        </Line>
        <Choices
          numbered={false}
          choice={0}
          items={[
            "Install for you (user scope)",
            "Install for all collaborators on this repository (project scope)",
            "Install for you, in this repo only (local scope)",
            "Back to plugin list",
          ]}
        />
      </Menu>
    </Terminal>
  )
}

function McpScreen() {
  return (
    <Terminal title="~/demo — claude">
      <Welcome />
      <Notice hint="run /mcp">1 MCP server needs authentication</Notice>
      <div className="pb-5" />
      <Prompt>/mcp</Prompt>
      <Menu hint="↑/↓ to navigate · Enter to select · Esc to back">
        <Line indent={2} className="pb-5">
          <T tone="permission" bold>
            Plugin:infrastructure:carrel MCP Server
          </T>
        </Line>
        <Field name="Status:">
          <T tone="warning">⚠ </T>needs authentication
        </Field>
        <Field name="Auth:">
          <T tone="error">✘ </T>not authenticated
        </Field>
        <Field name="URL:">
          <T tone="inactive">https://carrel.winlab.tw</T>
        </Field>
        <Field name="Config location:">
          <T tone="inactive">Dynamically configured</T>
        </Field>
        <div className="pb-5" />
        <Choices items={["Authenticate", "Disable"]} choice={0} />
      </Menu>
    </Terminal>
  )
}

function ConnectedScreen() {
  return (
    <Terminal title="~/demo — claude">
      <Welcome />
      <Prompt>/mcp</Prompt>
      <Output>
        Authentication successful. Connected to plugin:infrastructure:carrel.
      </Output>
      <Screen>
        <InputBox placeholder="幫我開一台機器" />
      </Screen>
    </Terminal>
  )
}

function InstallSteps() {
  return (
    <ol className="flex flex-col border-b border-border">
      <Step
        n={1}
        title={
          <>
            在 Claude Code 輸入 <code className={code}>/plugins</code>，切到
            Marketplaces，確認有{" "}
            <code className={code}>claudeai-nycu-winlab-marketplace</code>
          </>
        }
      >
        <MarketplacesScreen />
      </Step>
      <Step
        n={2}
        title={<>切到 Discover，選 infrastructure（Carrel 在這個 plugin 裡）</>}
      >
        <DiscoverScreen />
      </Step>
      <Step n={3} title="按 Enter，選 Install for you">
        <PluginScreen />
      </Step>
      <Step
        n={4}
        title={
          <>
            輸入 <code className={code}>/mcp</code>，選 carrel，按 Authenticate
          </>
        }
      >
        <McpScreen />
      </Step>
      <Step n={5} title="在瀏覽器用 WinLab 帳號登入，按允許">
        <ConsentScreen />
        <ConnectedScreen />
      </Step>
    </ol>
  )
}

export { InstallSteps }
