import { AppShell } from "@/components/app-shell"
import { CarrelDemo } from "@/components/carrel-demo"
import { CarrelFigure } from "@/components/carrel-figure"
import { ClusterStatus } from "@/components/cluster-status"
import { InstallSteps } from "@/components/install-steps"

export default function Page() {
  return (
    <AppShell
      breadcrumb={[
        {
          label: "WinLab",
          href: "https://portal.winlab.tw",
          tip: "實驗室入口",
        },
        { label: "Carrel", href: "/", tip: "實驗室的機器" },
      ]}
      nav={[
        { label: "安裝", href: "#install", tip: "在 Claude Code 裝好 Carrel" },
        { label: "狀態", href: "#status", tip: "叢集用量與每人分配" },
        {
          label: "GitHub",
          href: "https://github.com/NYCU-WinLab/carrel",
          tip: "原始碼與文件",
        },
      ]}
    >
      <div className="flex flex-col gap-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-title font-medium">Carrel</h1>
          <p className="text-muted-foreground">
            跟 Claude 說要什麼機器，拿回 SSH 指令和網址。
          </p>
        </header>

        <CarrelDemo />

        <section className="flex flex-col gap-6">
          <h2 className="font-semibold">每人 8 台</h2>
          <CarrelFigure />
        </section>

        <section id="install" className="flex scroll-mt-24 flex-col gap-6">
          <h2 className="font-semibold">安裝</h2>
          <InstallSteps />
        </section>

        <section id="status" className="flex scroll-mt-24 flex-col gap-6">
          <h2 className="font-semibold">叢集狀態</h2>
          <ClusterStatus />
        </section>
      </div>
    </AppShell>
  )
}
