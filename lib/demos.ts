// What the terminal demo plays. Each demo is one turn: the member's prompt,
// the Carrel tool Claude asks to run, and the answer. Tool descriptions are
// the start of Carrel's real ones, cut where Claude Code cuts them.

type Run = {
  text: string
  tone?: "permission" | "inactive" | "success"
  bold?: boolean
}

type Demo = {
  id: string
  label: string
  prompt: string
  /** The tool as Claude Code names it in the permission question. */
  tool: string
  about: string
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
      [{ text: "ssh sandbox.alice", tone: "permission" }],
    ],
  },
  {
    id: "web",
    label: "開網頁",
    prompt: "開一台機器跑我的網站，給我一個網址",
    tool: "Domain Add",
    about:
      "Publish HTTPS at <sub>.<tenant>.winlab.tw. DNS and TLS are automatic; the operation waits until routing is configured. Application responses require an external check.",
    seconds: 52,
    tokens: 731,
    reply: [
      [{ text: "web 開好了，網站已經發布成 HTTPS：" }],
      [],
      [{ text: "https://web.alice.winlab.tw", tone: "permission" }],
      [],
      [
        { text: "憑證和 DNS 都自動設好。程式部署上去後，用 " },
        { text: "ssh web.alice", tone: "permission" },
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
      [{ text: "ssh db.alice", tone: "permission" }],
    ],
  },
  {
    id: "k8s",
    label: "玩 k8s",
    prompt: "開三台機器，架一個 k3s 叢集給我玩",
    tool: "Deployment Apply",
    about:
      "Create a group of machines, connections and publications in one call when authorized. Use deployment_plan only when a preview is wanted, then apply the same specification…",
    seconds: 96,
    tokens: 1384,
    reply: [
      [
        { text: "k3s 叢集好了：" },
        { text: "1 台 server、2 台 agent", bold: true },
        { text: "，各 2 vCPU、2 GiB，swap 關掉。" },
      ],
      [{ text: "3 個節點都 Ready。kubectl 和 k9s 裝在 k3s-server 上。" }],
      [{ text: "6443 不對外開，kubeconfig 走 SSH 通道：" }],
      [],
      [{ text: "ssh k3s-server.alice", tone: "permission" }],
    ],
  },
  {
    id: "deploy",
    label: "自動部署",
    prompt: "我的 repo 每次 push 就自動部署到 web",
    tool: "App Link",
    about:
      "Bind a GitHub repository branch to a machine so every push deploys (PLAN 7.9). GitHub Actions builds; carrel stores the release; carrel-deployd in the machine switches it…",
    seconds: 41,
    tokens: 812,
    reply: [
      [
        { text: "web 綁好了 " },
        { text: "alice/site", tone: "permission" },
        { text: " 的 main 分支。" },
      ],
      [{ text: "部署程式裝在 web 上，workflow 也提交進 repo 了。" }],
      [
        { text: "之後每次 push 都會自動上線；健康檢查沒過就" },
        { text: "退回上一版", bold: true },
        { text: "。" },
      ],
    ],
  },
  {
    id: "vpn",
    label: "連內網",
    prompt: "讓我的筆電直接連進內網",
    tool: "Vpn Client Add",
    about:
      "Connect a device or an agent to the tenant's network over WireGuard, for traffic SSH port forwarding does not cover: UDP, many ports, a browser on internal services…",
    seconds: 14,
    tokens: 329,
    reply: [
      [
        { text: "筆電加進 " },
        { text: "WireGuard", bold: true },
        { text: " 了，私鑰只留在你的筆電上。" },
      ],
      [{ text: "設定檔存在 ~/carrel-alice.conf，匯入 WireGuard 後，" }],
      [{ text: "瀏覽器就能直接開 db、k3s-server 這些內網機器。" }],
    ],
  },
  {
    id: "snapshot",
    label: "存快照",
    prompt: "升級前幫 sandbox 存個快照",
    tool: "Snapshot Create",
    about:
      "Create a disk snapshot. Reserves its worst-case size in the separate snapshot_gb quota, not disk_gb. Actual retained blocks are reported separately when available.",
    seconds: 9,
    tokens: 214,
    reply: [
      [
        { text: "快照 " },
        { text: "before-upgrade", tone: "permission" },
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
    seconds: 6,
    tokens: 168,
    reply: [
      [{ text: "sandbox 暫停了，記憶體和檔案都原樣保留。" }],
      [{ text: "明天跟我說「叫醒 sandbox」就會從這裡繼續。" }],
    ],
  },
]

// Each prompt's characters as typed with a Zhuyin IME (Taiwan readings).
const zhuyin: Record<string, string> = {
  幫: "ㄅㄤ",
  我: "ㄨㄛˇ",
  開: "ㄎㄞ",
  一: "ㄧ",
  台: "ㄊㄞˊ",
  機: "ㄐㄧ",
  器: "ㄑㄧˋ",
  叫: "ㄐㄧㄠˋ",
  跑: "ㄆㄠˇ",
  的: "ㄉㄜ˙",
  網: "ㄨㄤˇ",
  站: "ㄓㄢˋ",
  給: "ㄍㄟˇ",
  個: "ㄍㄜˋ",
  址: "ㄓˇ",
  再: "ㄗㄞˋ",
  只: "ㄓˇ",
  讓: "ㄖㄤˋ",
  連: "ㄌㄧㄢˊ",
  得: "ㄉㄜˊ",
  到: "ㄉㄠˋ",
  升: "ㄕㄥ",
  級: "ㄐㄧˊ",
  前: "ㄑㄧㄢˊ",
  存: "ㄘㄨㄣˊ",
  快: "ㄎㄨㄞˋ",
  照: "ㄓㄠˋ",
  今: "ㄐㄧㄣ",
  晚: "ㄨㄢˇ",
  先: "ㄒㄧㄢ",
  暫: "ㄓㄢˋ",
  停: "ㄊㄧㄥˊ",
  明: "ㄇㄧㄥˊ",
  天: "ㄊㄧㄢ",
  醒: "ㄒㄧㄥˇ",
  三: "ㄙㄢ",
  架: "ㄐㄧㄚˋ",
  叢: "ㄘㄨㄥˊ",
  集: "ㄐㄧˊ",
  玩: "ㄨㄢˊ",
  每: "ㄇㄟˇ",
  次: "ㄘˋ",
  就: "ㄐㄧㄡˋ",
  自: "ㄗˋ",
  動: "ㄉㄨㄥˋ",
  部: "ㄅㄨˋ",
  署: "ㄕㄨˇ",
  筆: "ㄅㄧˇ",
  電: "ㄉㄧㄢˋ",
  直: "ㄓˊ",
  接: "ㄐㄧㄝ",
  進: "ㄐㄧㄣˋ",
  內: "ㄋㄟˋ",
}

export { demos, type Demo, type Run, zhuyin }
