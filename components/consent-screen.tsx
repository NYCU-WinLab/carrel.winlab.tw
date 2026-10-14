"use client"

import { Consent } from "@/components/consent"
import { Browser } from "@/components/ui/browser"

// Carrel's consent page (internal/carrel/auth.go draws the same block) in a
// browser. It is a picture, so the form stays on this page.
function ConsentScreen() {
  return (
    <Browser url="carrel.winlab.tw/oauth/consent">
      <div
        className="px-6 py-16"
        onSubmitCapture={(event) => event.preventDefault()}
      >
        <Consent
          title="連接 Carrel"
          client="Claude Code (plugin:infrastructure:carrel)"
          access="以你的帳號權限管理 Carrel 資源。"
          note="登入會持續保留，關閉瀏覽器後仍可使用。你可以在 WinLab 帳號的應用程式頁面撤銷存取。"
          action="/oauth/consent"
        />
      </div>
    </Browser>
  )
}

export { ConsentScreen }
