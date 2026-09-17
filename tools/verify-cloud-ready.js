/**
 * 云端可跑性自检：引擎、时辰、6 案上限、六爻入口。
 * 不含跨考正占，今晚可跑。
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

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
load("js/complex.js");

const Yi = ctx.window.YiDivination;
const Cx = ctx.window.YiComplex;
const BaZi = ctx.window.BaZiLite;
const fails = [];
function ok(cond, msg) {
  if (!cond) fails.push(msg);
}

const chen = Yi.hourToShichen(7);
const chen8 = Yi.hourToShichen(8);
const zi = Yi.hourToShichen(23);
ok(Yi.SHICHEN_NAMES[chen - 1] === "辰", "07 时应为辰，实际 " + Yi.SHICHEN_NAMES[chen - 1]);
ok(Yi.SHICHEN_NAMES[chen8 - 1] === "辰", "08 时应为辰");
ok(Yi.SHICHEN_NAMES[zi - 1] === "子", "23 时应为子");

const chartCivil = BaZi.chart({ year: 2006, month: 11, day: 4, hour: 23 });
const chartLateZi = BaZi.chart({ year: 2006, month: 11, day: 5, hour: 0 });
ok(chartCivil && chartCivil.pillars.hour.endsWith("子"), "晚子时应柱须为子时");

const dummy = Yi.divinate("liuyao", "exam", {
  year: 2026,
  month: 9,
  day: 17,
  hour: 22,
  personName: "引擎自检",
  question: "engine-self-test-only"
});
ok(dummy && dummy.bengua && dummy.tiYong && dummy.classical && dummy.reading, "六爻须出本卦、体用、朱熹玩辞、分数");

let threw = false;
try {
  Cx.compareComplex("kaoyan", {
    personName: "张三",
    personAge: 19,
    year: 2026,
    month: 9,
    day: 17,
    hour: 22,
    pickedMajors: [1, 2, 3, 4, 5, 6, 7].map((i) => ({
      name: "案" + i,
      code: "08" + i,
      field: "工学",
      first: "计算机科学与技术",
      degreeName: "学术型硕士",
      dir: "南",
      wx: "火"
    }))
  });
} catch (e) {
  threw = /6/.test(String(e && e.message));
}
ok(threw, "站点 compareComplex 对 7 案应拒绝；云端正占不可调用该函数，须直接 Yi.divinate('liuyao')");

if (fails.length) {
  console.error("FAIL\n" + fails.map((f) => "- " + f).join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      chenHour: "07:00-09:00 → " + Yi.SHICHEN_NAMES[chen - 1],
      lateZiHour: Yi.SHICHEN_NAMES[zi - 1],
      baziCivil: chartCivil.summary,
      baziLateZiNextDay: chartLateZi.summary,
      liuyaoSmoke: dummy.bengua.name + "/" + dummy.reading.score,
      compareComplexMax: 6,
      note: "正占须绕开 compareComplex，逐案六爻后取每层 7 优胜"
    },
    null,
    2
  )
);
