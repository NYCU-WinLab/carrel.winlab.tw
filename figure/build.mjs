// Carrel from the member's side: a row of 8 study carrels (your 8 machines).
// You talk to your agent on the laptop; a key appears on the key board (ssh alias),
// a carrel's lamp turns on (running), a sign goes up (published HTTPS), a drawer
// slides out (snapshot), the lamp dims (paused) or goes dark (deleted).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const KIT = process.env.ANATOMY_KIT || "/Users/loki/.claude/skills/anatomy";
const k = await import(`${KIT}/kit/iso-kit.mjs`);
const { kitScript } = await import(`${KIT}/scripts/inline-kit.mjs`);

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const WIDTH = 640;
const HEIGHT = 400;

const PLATE = { x: -176, y: -42, w: 330, d: 84, r: 8 };
const PLATE_H = 10;
const FOOT_H = 5;

const COUNTER = { x: -168, y: -22, w: 54, d: 34, r: 2.5 };
const COUNTER_H = 22;
const BOARD = { x: -104, y: -30, w: 34, d: 2.4, r: 0.6 };
const BOARD_Z = [6, 44];

const N = 8;
const CW = 24; // carrel pitch
const X0 = -54;
const BACK_Y = -18;
const FRONT_Y = 4;
const PART_H = 30;
const DESK_Z = 15;
const DESK_T = 1.8;
const DESK_TOP = DESK_Z + DESK_T;
const SIGN_Z = PART_H;
const DRAWER_OUT = 7;

const cx = (i) => X0 + CW * i + CW / 2;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [X0, BACK_Y, PART_H + 14], [X0 + CW * N, BACK_Y, PART_H + 14], [-104, -30, BOARD_Z[1] + 2]],
  WIDTH,
  HEIGHT,
  { pad: 30, azimuth: 57, elevation: 36 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const post = (x, y, r, z0, z1, tone = "mid") => S(k.cylinder(x, y, r, z0, z1 - z0, P, 20), { tone, crease: "none" });
const face = (pts) => k.pathOf(pts.map(at), true);

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -4, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // a floor runner in front of the carrels
  const rug = { x: X0 + 2, y: 20, w: CW * N - 4, d: 12, r: 2 };
  out.push(S(k.slabOf(rug, 0, 0.5, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(rug, 2), 0.5, P, 4), { tone: "faint" }));
  const label = { x: -160, y: 20, w: 46, d: 13, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 5, label.y + 6.4], 0.8, P, "x"), "CARREL", { size: 4, tone: "mid" }));
  for (const [dy, len] of [[4.2, 10], [6.6, 8], [9, 6]]) out.push(L(k.lineOnTop([label.x + 31, label.y + dy], [label.x + 31 + len, label.y + dy], 0.8, P), { tone: "lo", free: true }));
  out.push(D([at([label.x + 2.6, label.y + label.d / 2, 0.8]), at([label.x + label.w - 2.6, label.y + label.d / 2, 0.8])], { size: 0.45 }));
  return out.join("");
}

// ---------- your desk: counter, laptop, mug ----------
function counter() {
  const out = [`<path class="iso-halo" d="${k.haloOf(COUNTER, 0, COUNTER_H, P)}" style="filter:blur(5px)"/>`];
  out.push(S(k.slabOf(COUNTER, 0, COUNTER_H - 2, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(COUNTER, 6, P, 4), { tone: "faint" }) }));
  const top = k.insetPlan(COUNTER, -1.5);
  out.push(S(k.slabOf(top, COUNTER_H - 2, 2, P, 4, 0.6), { tone: "mid" }));
  // two cabinet doors on the front face with pulls
  const fy = COUNTER.y + COUNTER.d;
  for (const [x0, x1] of [[-165, -142], [-140, -117]]) {
    out.push(L(face([[x0, fy, 3], [x1, fy, 3], [x1, fy, 17], [x0, fy, 17]]), { tone: "lo" }));
    out.push(D([at([x0 === -165 ? x1 - 2.4 : x0 + 2.4, fy, 12])], { size: 0.6, tone: "mid" }));
  }
  return out.join("");
}
function laptop() {
  const z = COUNTER_H;
  const out = [];
  const baseP = { x: -158, y: -8, w: 26, d: 16, r: 1.2 };
  out.push(S(k.slabOf(baseP, z, 1.2, P, 3, 0.4), { tone: "mid" }));
  const keys = [];
  for (let r = 0; r < 3; r++) keys.push(k.planOutline({ x: -155, y: -6 + r * 3.2, w: 20, d: 2.4, r: 0.4 }, z + 1.2, P, 2));
  out.push(L(keys.join(""), { tone: "faint" }));
  out.push(L(k.planOutline({ x: -149, y: 4.2, w: 8, d: 3, r: 0.6 }, z + 1.2, P, 2), { tone: "lo" }));
  const lid = { x: -158, y: -9.2, w: 26, d: 1.2, r: 0.4 };
  out.push(S(k.slabOf(lid, z + 1.2, 18, P, 2, 0.3), { tone: "mid" }));
  const fy = lid.y + lid.d;
  const win = [[-156, fy, z + 3], [-134, fy, z + 3], [-134, fy, z + 17.4], [-156, fy, z + 17.4]];
  out.push(`<path class="cl-screen" d="${face(win)}"/>`, L(face(win), { tone: "lo" }));
  // chat lines: yours on the right, the agent's on the left
  out.push(`<g data-chat="you">${L(k.segment([-150, fy, z + 14.6], [-136, fy, z + 14.6], P) + k.segment([-144, fy, z + 12.6], [-136, fy, z + 12.6], P), { tone: "hi", free: true })}</g>`);
  out.push(`<g data-chat="agent">${L(k.segment([-154, fy, z + 9], [-140, fy, z + 9], P) + k.segment([-154, fy, z + 7], [-145, fy, z + 7], P) + k.segment([-154, fy, z + 5], [-142, fy, z + 5], P), { tone: "mid", free: true })}</g>`);
  // mug
  out.push(S(k.cylinder(-124, 4, 3, z, 6, P, 24, 0.3), { tone: "mid", inner: L(k.sideArc(-124, 4, 3, z + 4.4, P, 16), { tone: "faint" }) }));
  out.push(L(k.ring(-124, 4, 2.3, z + 6, P, 20), { tone: "lo" }));
  return out.join("");
}

// ---------- key board ----------
const HOOKS = Array.from({ length: N }, (_, i) => [BOARD.x + 5 + (i % 4) * 8, i < 4 ? 38 : 24]);
function board() {
  const out = [];
  for (const x of [BOARD.x + 3, BOARD.x + BOARD.w - 3]) out.push(S(k.slabOf({ x: x - 3, y: BOARD.y - 2, w: 6, d: 6, r: 1 }, 0, 2.5, P, 3, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf(BOARD, BOARD_Z[0], BOARD_Z[1] - BOARD_Z[0], P, 2, 0.4), { tone: "mid", inner: L(k.sideSeam(BOARD, 14, P, 2), { tone: "faint" }) }));
  for (const x of [BOARD.x + 3, BOARD.x + BOARD.w - 3]) out.push(post(x, BOARD.y + 1.2, 1, 2.5, BOARD_Z[0]));
  const fy = BOARD.y + BOARD.d;
  out.push(D(HOOKS.map(([x, z]) => at([x, fy, z])), { size: 0.7, tone: "mid" }));
  return out.join("");
}
function keyAt(i) {
  const [x, z] = HOOKS[i];
  const fy = BOARD.y + BOARD.d + 0.3;
  const c = [x, fy, z - 2.4];
  return `<g data-key="${i}" style="display:none">${L(k.sideRing(c, 2, "y", P, 18), { tone: "hi" })}` +
    L(k.segment([x, fy, z - 4.4], [x, fy, z - 10], P), { tone: "hi" }) +
    L(k.segment([x, fy, z - 8.2], [x + 1.6, fy, z - 8.2], P) + k.segment([x, fy, z - 9.8], [x + 1.2, fy, z - 9.8], P), { tone: "hi" }) +
    `</g>`;
}

// ---------- carrels ----------
function backPanels() {
  const plan = { x: X0, y: BACK_Y - 1.4, w: CW * N, d: 1.4, r: 0.4 };
  const out = [S(k.slabOf(plan, 0, PART_H, P, 2, 0.4), { tone: "lo", inner: L(k.sideSeam(plan, 4, P, 2), { tone: "faint" }) })];
  // a pinboard on each carrel's back wall
  for (let i = 0; i < N; i++) {
    const x = cx(i);
    out.push(L(face([[x - 7, BACK_Y, 21], [x + 1, BACK_Y, 21], [x + 1, BACK_Y, 27], [x - 7, BACK_Y, 27]]), { tone: "faint" }));
  }
  return out.join("");
}
function partition(j) {
  const x = X0 + CW * j;
  const plan = { x: x - 0.7, y: BACK_Y, w: 1.4, d: FRONT_Y - BACK_Y, r: 0.4 };
  return S(k.slabOf(plan, 0, PART_H, P, 2, 0.4), { tone: "mid" }) + D([at([x, FRONT_Y - 1.5, PART_H])], { size: 0.4 });
}
function desk(i) {
  const x0 = X0 + CW * i + 0.7;
  const plan = { x: x0, y: BACK_Y, w: CW - 1.4, d: FRONT_Y - BACK_Y, r: 0.4 };
  const out = [];
  // modesty panel under the desk at the back, then the top
  out.push(S(k.slabOf(plan, DESK_Z, DESK_T, P, 2, 0.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plan, 2), DESK_TOP, P, 2), { tone: "faint" }));
  return out.join("");
}
function drawerAt0(i) {
  // drawer under the desk, built closed; a snapshot card rides inside
  const x = cx(i);
  const plan = { x: x - 7, y: BACK_Y + 4, w: 14, d: FRONT_Y - BACK_Y - 4, r: 0.4 };
  const out = [S(k.slabOf(plan, DESK_Z - 4.4, 4.2, P, 2, 0.3), { tone: "mid" })];
  out.push(`<g data-card="${i}" style="display:none">${S(k.slabOf({ x: x - 4, y: FRONT_Y - 7, w: 8, d: 5, r: 0.3 }, DESK_Z - 0.2, 0.5, P, 2), { tone: "hi" })}</g>`);
  out.push(D([at([x, FRONT_Y, DESK_Z - 2.3])], { size: 0.7, tone: "mid" }));
  return out.join("");
}
function lamp(i) {
  const x = cx(i);
  const px = x + 7, py = BACK_Y + 4;
  const out = [];
  out.push(`<path class="cl-glow" data-glow="${i}" d="${k.planOutline({ x: x - 9, y: BACK_Y + 2, w: 14, d: 15, r: 7 }, DESK_TOP + 0.05, P, 8)}Z"/>`);
  out.push(S(k.cylinder(px, py, 2.4, DESK_TOP, 1, P, 20), { tone: "mid" }));
  out.push(post(px, py, 0.7, DESK_TOP + 1, 27));
  out.push(L(k.segment([px, py, 27], [x - 1, py + 3, 27], P), { tone: "mid" }));
  out.push(S(k.cylinder(x - 1, py + 3, 2.6, 23.6, 3.4, P, 24), { tone: "mid" }));
  out.push(`<g class="cl-bulb" data-bulb="${i}">${D([at([x - 1, py + 3, 23.4])], { size: 1.1, tone: "hi" })}</g>`);
  return out.join("");
}
function signAt0(i) {
  // the published address: a sign on a stem on top of the back panel
  const x = cx(i);
  const out = [post(x - 3, BACK_Y - 0.7, 0.6, 0, 6)];
  const plan = { x: x - 8, y: BACK_Y - 1.2, w: 16, d: 1, r: 0.3 };
  out.push(S(k.slabOf(plan, 6, 6, P, 2, 0.3), { tone: "hi", lit: true }));
  const fy = plan.y + plan.d;
  out.push(L(k.segment([x - 6, fy, 10], [x + 5, fy, 10], P) + k.segment([x - 6, fy, 8], [x + 1, fy, 8], P), { tone: "lo", free: true }));
  return `<g data-sign="${i}" style="display:none" transform="${k.translateAlong(P, [0, 0, SIGN_Z])}">${out.join("")}</g>`;
}
function stool(i) {
  const x = cx(i) - 1, y = FRONT_Y + 12;
  return S(k.cylinder(x, y, 4, 0, 1, P, 24), { tone: "lo" }) + post(x, y, 0.9, 1, 9.4) + S(k.cylinder(x, y, 4.4, 9.4, 1.8, P, 28, 0.3), { tone: "mid" });
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Carrel from the member's side, drawn as a study room. On the left your desk with a laptop where you talk to your agent, and a key board with 8 hooks. On the right a row of 8 study carrels, your 8 machines. When a machine is created a key appears on the board and its carrel's lamp turns on; publishing it puts a sign on top of the carrel; a snapshot slides its drawer out with a card; pausing dims the lamp; deleting turns it off and takes the key away.",
  body: [
    `<style>
      .cl-screen{fill:var(--anatomy-paper);opacity:.9}
      .cl-glow{fill:var(--cl-light);opacity:0;stroke:none;filter:blur(2.5px);transition:opacity .6s}
      .cl-bulb{opacity:.18;transition:opacity .6s}
      [data-chat]{opacity:0;transition:opacity .35s}
      [data-chat][data-on]{opacity:1}
      .iso{--cl-light:#ffd27a}
      .iso[data-theme="light"]{--cl-light:#f0a92e}
    </style>`,
    base(),
    board(),
    Array.from({ length: N }, (_, i) => keyAt(i)).join(""),
    counter(),
    laptop(),
    backPanels(),
    Array.from({ length: N }, (_, i) => signAt0(i)).join(""),
    Array.from({ length: N }, (_, i) =>
      partition(i) + desk(i) + `<g data-drawer="${i}">${drawerAt0(i)}</g>` + lamp(i),
    ).join(""),
    partition(N),
    Array.from({ length: N }, (_, i) => stool(i)).join(""),
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const N = ${N}, DRAWER_OUT = ${DRAWER_OUT}, SIGN_Z = ${SIGN_Z};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const all = (s) => [...svg.querySelectorAll(s)];
const keys = all("[data-key]"), signs = all("[data-sign]"), drawers = all("[data-drawer]"), cards = all("[data-card]");
const glows = all("[data-glow]"), bulbs = all("[data-bulb]");
const you = svg.querySelector('[data-chat="you"]'), agent = svg.querySelector('[data-chat="agent"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");

// state per carrel: light 0 off, 0.35 paused, 1 on
const st = Array.from({ length: N }, () => ({ light: 0, lightT: 0, key: false, sign: 0, signT: 0, drawer: 0, drawerT: 0, card: false }));
const STORY = [
  { you: "幫我開一台機器，叫 demo", agent: "好了，打 ssh demo.alice 就能連", act: () => { st[0].lightT = 1; st[0].key = true; } },
  { you: "把 demo 發布成網址", agent: "https://demo.alice.winlab.tw 已上線", act: () => { st[0].signT = 1; } },
  { you: "升級前先存個快照", agent: "快照存好了，壞了可以還原", act: () => { st[0].drawerT = 1; st[0].card = true; }, after: () => { st[0].drawerT = 0; } },
  { you: "再開一台給資料庫用", agent: "db 開好了，只讓 demo 連得到", act: () => { st[1].lightT = 1; st[1].key = true; } },
  { you: "demo 今晚先暫停", agent: "已暫停，記憶體和檔案都保留", act: () => { st[0].lightT = 0.35; } },
  { you: "db 不用了，刪掉", agent: "刪好了，額度還你 1 台", act: () => { st[1].lightT = 0; st[1].key = false; } },
  { you: "早上了，叫醒 demo", agent: "demo 回來了，網址照舊", act: () => { st[0].lightT = 1; } },
];
let idx = -1, phase = "rest", t = 0, touring = !still.matches, frame = 0, last = 0, visible = false, idleTimer = 0;
const ASK = 1.3, ACT = 1.1, HOLD = 2.6;

function used() { return st.filter((s) => s.key).length; }
function say(text) { if (readout.textContent !== text) readout.textContent = text; stage.setAttribute("aria-valuetext", text); }
function begin(i) {
  idx = i; phase = "ask"; t = 0;
  you.setAttribute("data-on", ""); agent.removeAttribute("data-on");
  say("你：" + STORY[idx].you);
}
function resetAll() { st.forEach((s) => { s.lightT = 0; s.key = false; s.signT = 0; s.drawerT = 0; s.card = false; }); }
function advance() {
  if (phase === "ask") { STORY[idx].act(); phase = "act"; t = 0; return; }
  if (phase === "act") { phase = "reply"; t = 0; agent.setAttribute("data-on", ""); say("agent：" + STORY[idx].agent + "(已用 " + used() + "/8)"); return; }
  if (STORY[idx]?.after) STORY[idx].after();
  if (idx === STORY.length - 1) { resetAll(); phase = "rest"; t = 0; you.removeAttribute("data-on"); agent.removeAttribute("data-on"); say("8 個座位都是你的：最多 8 台"); return; }
  begin(idx + 1);
}
function draw() {
  st.forEach((s, i) => {
    keys[i].style.display = s.key ? "" : "none";
    glows[i].style.opacity = String(0.55 * s.light);
    bulbs[i].style.opacity = String(0.18 + 0.82 * s.light);
    signs[i].style.display = s.sign > 0.01 ? "" : "none";
    signs[i].setAttribute("transform", translateAlong(P, [0, 0, SIGN_Z - 8 * (1 - s.sign)]));
    signs[i].style.opacity = String(s.sign);
    drawers[i].setAttribute("transform", translateAlong(P, [0, DRAWER_OUT * s.drawer, 0]));
    cards[i].style.display = s.card && s.drawer > 0.05 ? "" : "none";
  });
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  t += dt;
  const e = (sec) => 1 - Math.exp(-dt / sec);
  st.forEach((s) => { s.light += (s.lightT - s.light) * e(0.25); s.sign += (s.signT - s.sign) * e(0.2); s.drawer += (s.drawerT - s.drawer) * e(0.18); });
  if (touring) {
    if (phase === "rest" && t > 2.2) begin(0);
    else if (phase === "ask" && t > ASK) advance();
    else if (phase === "act" && t > ACT) advance();
    else if (phase === "reply" && t > HOLD) advance();
  } else if (phase === "act" && t > ACT) advance();
  draw();
  const settled = !touring && phase !== "act" && st.every((s) => Math.abs(s.light - s.lightT) < 0.002 && Math.abs(s.sign - s.signT) < 0.002 && Math.abs(s.drawer - s.drawerT) < 0.002);
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
function next() {
  touring = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { touring = !still.matches; run(); }, 12000);
  if (phase === "rest") begin(0); else advance();
  if (still.matches) { while (phase === "act") advance(); st.forEach((s) => { s.light = s.lightT; s.sign = s.signT; s.drawer = s.drawerT; }); draw(); return; }
  run();
}
stage.addEventListener("click", next);
stage.addEventListener("keydown", (ev) => { if (ev.key !== " " && ev.key !== "Enter" && ev.key !== "ArrowRight") return; ev.preventDefault(); next(); });
new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) { touring = false; STORY.slice(0, 4).forEach((s) => s.act()); st[0].drawerT = 0; st.forEach((s) => { s.light = s.lightT; s.sign = s.signT; s.drawer = s.drawerT; }); }
say("8 個座位都是你的：最多 8 台");
draw();
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "用 Carrel",
  hint: "點一下或按空白鍵看下一句",
  readout: "8 個座位都是你的：最多 8 台",
  keys: [
    { mark: "lit", label: "門牌：發布成網址" },
    { mark: "raised", label: "座位：你的一台機器，燈亮是在跑" },
    { mark: "edge", label: "鑰匙：開好就能 ssh" },
  ],
  caption:
    "你不用碰伺服器，只要跟自己的 agent 講話。說要一台機器，鑰匙就掛上板子，打 ssh demo.alice 就能進去，別人(包括管理員)進不去。要網址就掛門牌，給 <名稱>.<你的帳號>.winlab.tw。升級前存快照，壞了就還原。暫停會保留記憶體與檔案，但座位還是你的，額度不會還回來；刪掉才會。",
  body: `<div class="iso-stage" tabindex="0" role="button" aria-label="用 Carrel：按空白鍵看下一句對話">${svg}</div>`,
});

// --site writes one page for carrel.winlab.tw: it follows the system theme,
// has no page background or margins, and tells the parent page its height.
const SITE = process.argv.includes("--site");
const embed = `
const root = document.body;
const scheme = matchMedia("(prefers-color-scheme: dark)");
const setTheme = () => { const t = scheme.matches ? "dark" : "light"; root.setAttribute("data-theme", t); document.documentElement.style.colorScheme = t; };
setTheme(); scheme.addEventListener("change", setTheme);
const report = () => parent.postMessage({ carrelFigure: document.documentElement.scrollHeight }, "*");
new ResizeObserver(report).observe(document.body); report();
`;
const siteCss = `<style>html,body{background:transparent!important}.iso-page{width:100%!important;margin:0!important}</style>`;
if (SITE) {
  const out = process.argv[process.argv.indexOf("--site") + 1];
  writeFileSync(out, k.pageHtml({ title: "用 Carrel", theme: "light", body: siteCss + body, script: embed + kitScript() + live, width: 720 }));
  console.log("wrote", out);
} else {
  const file = theme === "light" ? "carrel-user-light.html" : "carrel-user.html";
  writeFileSync(join(HERE, file), k.pageHtml({ title: "用 Carrel", theme, body, script: kitScript() + live, width: 720 }));
  console.log("wrote", file);
}
