// What the terminal demo plays. Each demo is one turn: the member's prompt,
// the Carrel tool Claude asks to run, and the answer. Tool descriptions are
// the start of Carrel's real ones, cut where Claude Code cuts them.

type Run = { text: string; tone?: "select" | "dim" | "success"; bold?: boolean }

type Demo = {
  id: string
  label: string
  prompt: string
  /** The tool as Claude Code names it in the permission question. */
  tool: string
  about: string
  /** Spinner and finish words, the way Claude Code pairs them. */
  verb: [string, string]
  seconds: number
  tokens: number
  reply: Run[][]
}

const demos: Demo[] = [
  {
    id: "machine",
    label: "開機器",
    prompt: "幫我開一台機器，叫 sandbox",
    tool: "Machine Create",
    about:
      "Create one VM/CT directly when the user asks for a machine. Defaults: Debian 13 minimal VM, 1 vCPU, 1 GiB RAM, 10 GiB disk, 1 GiB swap. Supply an SSH public key inline…",
    verb: ["Creating", "Baked"],
    seconds: 34,
    tokens: 486,
    reply: [
      [
        { text: "sandbox 開好了：" },
        { text: "Debian 13 minimal", bold: true },
        { text: "，1 vCPU、1 GiB RAM、10 GiB 硬碟。" },
      ],
      [{ text: "SSH 設定已寫進 ~/.ssh/config，直接連：" }],
      [],
      [{ text: "ssh sandbox.alice", tone: "select" }],
    ],
  },
  {
    id: "web",
    label: "開網頁",
    prompt: "開一台機器跑我的網站，給我一個網址",
    tool: "Domain Add",
    about:
      "Publish HTTPS at <sub>.<tenant>.winlab.tw. DNS and TLS are automatic; the operation waits until routing is configured. Application responses require an external check.",
    verb: ["Cooking", "Cooked"],
    seconds: 52,
    tokens: 731,
    reply: [
      [{ text: "web 開好了，網站已經發布成 HTTPS：" }],
      [],
      [{ text: "https://web.alice.winlab.tw", tone: "select" }],
      [],
      [
        { text: "憑證和 DNS 都自動設好。程式部署上去後，用 " },
        { text: "ssh web.alice", tone: "select" },
        { text: " 進去啟動。" },
      ],
    ],
  },
  {
    id: "db",
    label: "開資料庫",
    prompt: "再開一台 Postgres，只讓 web 連得到",
    tool: "Deployment Apply",
    about:
      "Create a group of machines, connections and publications in one call when authorized. Use deployment_plan only when a preview is wanted, then apply the same specification…",
    verb: ["Brewing", "Brewed"],
    seconds: 47,
    tokens: 902,
    reply: [
      [
        { text: "db 開好了，網路設成 " },
        { text: "restricted", bold: true },
        { text: "：只有 web 能連 5432，其他機器都擋掉。" },
      ],
      [{ text: "Postgres 在開機時裝好並啟動，健康檢查通過。" }],
      [],
      [{ text: "ssh db.alice", tone: "select" }],
    ],
  },
  {
    id: "snapshot",
    label: "存快照",
    prompt: "升級前幫 sandbox 存個快照",
    tool: "Snapshot Create",
    about:
      "Create a disk snapshot. Reserves its worst-case size in the separate snapshot_gb quota, not disk_gb. Actual retained blocks are reported separately when available.",
    verb: ["Churning", "Churned"],
    seconds: 9,
    tokens: 214,
    reply: [
      [
        { text: "快照 " },
        { text: "before-upgrade", tone: "select" },
        { text: " 存好了。" },
      ],
      [
        {
          text: "升級出問題就跟我說「還原 sandbox」，硬碟會回到現在這個樣子。",
        },
      ],
    ],
  },
  {
    id: "pause",
    label: "暫停",
    prompt: "sandbox 今晚先暫停，明天再叫醒",
    tool: "Machine Power",
    about:
      "Control an existing machine by name in one call; no preliminary lookup or preview is required. start starts or resumes; shutdown gracefully turns off; stop force-powers off…",
    verb: ["Crunching", "Crunched"],
    seconds: 6,
    tokens: 168,
    reply: [
      [{ text: "sandbox 暫停了，記憶體和檔案都原樣保留。" }],
      [{ text: "明天跟我說「叫醒 sandbox」就會從這裡繼續。" }],
    ],
  },
]

export { demos, type Demo, type Run }
