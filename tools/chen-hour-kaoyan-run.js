/**
 * GitHub Actions / 云端备用正占。仅 2026-09-18 中国日期起六爻。
 * node tools/chen-hour-kaoyan-run.js
 * 今晚勿加 --force。
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const GATE = { y: 2026, m: 9, d: 18, hour: 7, minute: 30, tz: "Asia/Shanghai" };
const force = process.argv.includes("--force");

const UNIVERSITIES = [
  "南京大学",
  "东南大学",
  "南京航空航天大学",
  "南京理工大学",
  "河海大学",
  "南京邮电大学",
  "南京信息工程大学",
  "中山大学",
  "华南理工大学",
  "哈尔滨工业大学（深圳）",
  "暨南大学",
  "广东工业大学",
  "广州大学",
  "深圳大学",
  "电子科技大学",
  "北京邮电大学"
];

const MAJORS = [
  { name: "信息与通信工程", code: "081000" },
  { name: "通信与信息系统", code: "081001" },
  { name: "信号与信息处理", code: "081002" },
  { name: "通信工程", code: "085402" },
  { name: "电气工程", code: "080800" },
  { name: "电气工程（专硕）", code: "085801" },
  { name: "电子科学与技术", code: "080900" },
  { name: "新一代电子信息技术", code: "085401" },
  { name: "集成电路工程", code: "085403" },
  { name: "计算机科学与技术", code: "081200" },
  { name: "计算机系统结构", code: "081201" },
  { name: "计算机软件与理论", code: "081202" },
  { name: "计算机应用技术", code: "081203" },
  { name: "软件工程", code: "083500" },
  { name: "网络空间安全", code: "083900" },
  { name: "计算机技术", code: "085404" },
  { name: "软件工程（专硕）", code: "085405" },
  { name: "人工智能", code: "085410" }
];

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

const now = chinaNow();
const onDay = now.y === GATE.y && now.m === GATE.m && now.d === GATE.d;
if (!onDay && !force) {
  console.error(
    JSON.stringify({
      stop: true,
      reason: "time-gate",
      chinaNow: now,
      message: "非 2026-09-18 中国日期，正占不起。"
    })
  );
  process.exit(2);
}

const recordedHour = now.h >= 8 ? 8 : 7;
const recordedMin = now.h >= 8 ? 20 : 30;
const castLabel = `2026-09-18 ${String(recordedHour).padStart(2, "0")}:${String(recordedMin).padStart(2, "0")} 辰时（GitHub 备用通道；以所定占时为准）`;

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

function rankItems(items, labelFn, questionFn) {
  const rows = items.map((item) => {
    const label = labelFn(item);
    const result = Yi.divinate("liuyao", "exam", {
      year: GATE.y,
      month: GATE.m,
      day: GATE.d,
      hour: recordedHour,
      personName: "张森捷",
      personAge: 19,
      place: label,
      question: questionFn(label)
    });
    return {
      label,
      item,
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
  rows.sort((a, b) => b.score - a.score || String(a.label).localeCompare(String(b.label), "zh"));
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  return rows;
}

const universities = rankItems(
  UNIVERSITIES,
  (n) => n,
  (label) => `张森捷2028跨考就读「${label}」是否有利于功名与偏东就业。大学层一案一占。`
);
const majors = rankItems(
  MAJORS,
  (m) => `${m.name}（${m.code}）`,
  (label) => `张森捷2028跨考攻读「${label}」是否有利于功名与偏东就业。专业层一案一占。`
);

const uni7 = universities.slice(0, 7);
const major7 = majors.slice(0, 7);
const combos = [];
for (let i = 0; i < 3; i++) {
  const u = uni7[i];
  const m = major7[i];
  if (u && m) combos.push(`冲：${u.label} + ${m.label}`);
}
for (let i = 3; i < 7; i++) {
  const u = uni7[i];
  const m = major7[i];
  if (u && m) combos.push(`稳：${u.label} + ${m.label}`);
}

const report = {
  channel: "github-actions",
  person: "张森捷",
  undergrad: "兰州大学水文与水资源工程（跨考）",
  method: "liuyao",
  castTimeRecorded: castLabel,
  chinaNow: now,
  forced: force,
  note: "梅花不排序。八字只缩圈。导师层不编造姓名，须用优胜院校当年公开招生名单。文化参考，不能替代分数。",
  universitiesTop7: uni7,
  majorsTop7: major7,
  stretchVsSafe: combos,
  universitiesAll: universities,
  majorsAll: majors
};

function linesFor(rows) {
  return rows
    .map(
      (r) =>
        `${r.rank}. ${r.label}　${r.bengua}之${r.biangua}　${r.score}分　${r.verdict}　体${r.tiYong && r.tiYong.ti}用${r.tiYong && r.tiYong.yong}（${r.tiYong && r.tiYong.relation}）`
    )
    .join("\n");
}

const md = `# 张森捷 2028 跨考规划（GitHub 备用辰时三筮）

占时：${castLabel}
方法：六爻三钱，朱熹动爻 + 体用。一事一占，每层留 7。

> ${report.note}

## 大学层 7 优胜

${linesFor(uni7)}

## 专业层 7 优胜

${linesFor(major7)}

## 冲 / 稳组合（人谋配对，非再起一卦）

${combos.map((c) => "- " + c).join("\n")}

## 导师层

不在此备用通道编造导师姓名。请用以上学校研究生院 / 学院当年公开招生名单核对真实导师。

## 完整排序

### 大学全表

${linesFor(universities)}

### 专业全表

${linesFor(majors)}
`;

const outDir = path.join(root, "out");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "ZhangSenjie-20260918-ChenHour-Kaoyan.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outDir, "ZhangSenjie-20260918-ChenHour-Kaoyan.md"), md, "utf8");
console.log(JSON.stringify({ ok: true, outDir, keepUnis: uni7.map((r) => r.label), keepMajors: major7.map((r) => r.label) }, null, 2));
