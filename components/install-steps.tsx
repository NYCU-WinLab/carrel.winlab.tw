import * as React from "react"

import { Line, T, Terminal } from "@/components/terminal/terminal"
import {
  Choices,
  Field,
  InputBox,
  Marketplace,
  Menu,
  Notice,
  Output,
  PluginTabs,
  Prompt,
  Screen,
  Welcome,
} from "@/components/terminal/claude-code"

// The four install screens, as Claude Code draws them. Wording comes from
// Claude Code 2.1.296; the marketplace row is the one WinLab's claude.ai
// organization syncs into every member's Claude Code.

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
    <li className="flex flex-col gap-4 border-t border-border pt-6">
      <h3 className="flex gap-4 font-medium">
        <span className="text-muted-foreground tabular-nums">{n}</span>
        <span>{title}</span>
      </h3>
      {children}
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
        <Line indent={2} className="t-blank-below">
          <T bold>Manage marketplaces</T>
        </Line>
        <Line indent={2} className="t-blank-below">
          {"  "}
          <T tone="select">+</T>{" "}
          <T tone="select" bold>
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

function PluginScreen() {
  return (
    <Terminal title="~/demo — claude">
      <Welcome />
      <Prompt>/plugins</Prompt>
      <Menu hint="Enter to select · Esc to go back">
        <PluginTabs current="Marketplaces" />
        <Line indent={2} className="t-blank-below">
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
        <Line indent={2} className="t-blank-below">
          <T tone="dim">By: NYCU WinLab</T>
        </Line>
        <Line indent={2}>
          <T bold>Will install:</T>
        </Line>
        <Line indent={2} className="t-blank-below">
          <T tone="dim">· Components will be discovered at installation</T>
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
      <div className="t-blank-below" />
      <Prompt>/mcp</Prompt>
      <Menu hint="↑/↓ to navigate · Enter to select · Esc to back">
        <Line indent={2} className="t-blank-below">
          <T tone="select" bold>
            Plugin:infrastructure:carrel MCP Server
          </T>
        </Line>
        <Field name="Status:">
          <T tone="warn">⚠ </T>needs authentication
        </Field>
        <Field name="Auth:">
          <T tone="error">✘ </T>not authenticated
        </Field>
        <Field name="URL:">
          <T tone="dim">https://carrel.winlab.tw</T>
        </Field>
        <Field name="Config location:">
          <T tone="dim">Dynamically configured</T>
        </Field>
        <div className="t-blank-below" />
        <Choices items={["Authenticate", "Disable"]} choice={0} />
      </Menu>
    </Terminal>
  )
}

// Carrel's own consent page (internal/carrel/auth.go), inside a browser.
function ConsentScreen() {
  return (
    <div className="consent c-frame flex flex-col overflow-hidden rounded-menu">
      <div className="flex h-10 items-center gap-2 px-4">
        <span aria-hidden className="c-address size-3 rounded-full" />
        <span aria-hidden className="c-address size-3 rounded-full" />
        <span aria-hidden className="c-address size-3 rounded-full" />
        <span className="c-address c-muted ml-4 flex-1 truncate rounded-control px-4">
          carrel.winlab.tw/oauth/consent
        </span>
      </div>
      <div className="flex justify-center px-6 py-16">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <h4 className="text-title font-semibold">連接 Carrel</h4>
          <p className="c-muted">
            允許{" "}
            <strong className="font-semibold">
              Claude Code ({"plugin:infrastructure:carrel"})
            </strong>{" "}
            以你的帳號權限管理 Carrel 資源。
          </p>
          <p className="c-muted">
            登入會持續保留，關閉瀏覽器後仍可使用。你可以在 WinLab
            帳號的應用程式頁面撤銷存取。
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <span className="c-button px-6 py-2">取消</span>
            <span className="c-button c-primary px-6 py-2">允許</span>
          </div>
        </div>
      </div>
    </div>
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
    <ol className="flex flex-col gap-12">
      <Step
        n={1}
        title={
          <>
            在 Claude Code 輸入 <code className={code}>/plugins</code>，切到
            Marketplaces
          </>
        }
      >
        <MarketplacesScreen />
      </Step>
      <Step
        n={2}
        title={
          <>
            選 <code className={code}>claudeai-nycu-winlab-marketplace</code>
            ，安裝 infrastructure
          </>
        }
      >
        <PluginScreen />
      </Step>
      <Step
        n={3}
        title={
          <>
            輸入 <code className={code}>/mcp</code>，選 carrel，按 Authenticate
          </>
        }
      >
        <McpScreen />
      </Step>
      <Step n={4} title="在瀏覽器用 WinLab 帳號登入，按允許">
        <ConsentScreen />
        <ConnectedScreen />
      </Step>
    </ol>
  )
}

export { InstallSteps }
