/**
 * 辰时三筮云端正占入口。
 * 默认硬时门：仅北京时间 2026-09-18 才起六爻。
 * 用法：node tools/chen-hour-cloud-run.js --layer universities --names "东南大学,深圳大学,..."
 * 今晚勿跑正占。自检请用 tools/verify-cloud-ready.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const GATE = { y: 2026, m: 9, d: 18, hour: 7, minute: 30, tz: "Asia/Shanghai" };

function chinaNow(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: GATE.tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date || new Date());
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour"), min: get("minute") };
}

function parseArgs(argv) {
  const out = { layer: "custom", names: [], force: false, question: "" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") out.force = true;
    else if (a === "--layer") out.layer = argv[++i];
    else if (a === "--names") out.names = String(argv[++i] || "").split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
    else if (a === "--question") out.question = argv[++i];
  }
  return out;
}

const args = parseArgs(process.argv);
const now = chinaNow();
const onDay = now.y === GATE.y && now.m === GATE.m && now.d === GATE.d;
if (!onDay && !args.force) {
  console.error(
    JSON.stringify({
      stop: true,
      reason: "time-gate",
      chinaNow: now,
      required: GATE,
      message: "非 2026-09-18 中国日期，正占不起。引擎自检请跑 verify-cloud-ready.js"
    })
  );
  process.exit(2);
}

if (!args.names.length) {
  console.error("需要 --names 候选列表，一案一卦。");
  process.exit(1);
}

const root = path.join(__dirname, "..");
const ctx = { console, module: { exports: {} }, window: {}, document: undefined };
ctx.window = ctx;
ctx.globalThis = ctx;
function load(rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), "utf8"), ctx, { filename: rel });
}
load("js/hexagrams.js");
load("js/divination.js");
load("js/bazi.js");
load("js/kaoyan-catalog.js");

const Yi = ctx.window.YiDivination;
const ranked = args.names.map((name) => {
  const question =
    args.question ||
    `张森捷于2028跨考就「${name}」是否有利于功名与偏东就业。此为同一规划之事的一案一占。`;
  const result = Yi.divinate("liuyao", "exam", {
    year: GATE.y,
    month: GATE.m,
    day: GATE.d,
    hour: GATE.hour,
    personName: "张森捷",
    personAge: 19,
    place: name,
    question
  });
  return {
    name,
    score: result.reading.score,
    verdict: result.reading.verdict,
    bengua: result.bengua && result.bengua.name,
    biangua: result.biangua && result.biangua.name,
    moving: result.moving,
    tiYong: result.tiYong && {
      ti: result.tiYong.tiName,
      yong: result.tiYong.yongName,
      relation: result.tiYong.relation
    },
    rule: result.classical && result.classical.rule,
    primaryText: result.classical && result.classical.primaryText
  };
});

ranked.sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name), "zh"));
ranked.forEach((r, i) => {
  r.rank = i + 1;
});

const out = {
  castTimeRecorded: "2026-09-18 07:30 辰时（以所定占时为准，不以虚拟机启动迟到改时辰）",
  chinaNow: now,
  method: "liuyao",
  layer: args.layer,
  keep: ranked.slice(0, 7),
  all: ranked
};
console.log(JSON.stringify(out, null, 2));
