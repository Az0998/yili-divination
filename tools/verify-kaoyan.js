/**
 * 考研择专：目录覆盖 + 人物梅花一事一占 + 追问池。象数自检，非官方研招审核。
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const ctx = {
  console,
  module: { exports: {} },
  window: {},
  document: undefined
};
ctx.window = ctx;
ctx.globalThis = ctx;

function load(rel) {
  const file = path.join(root, rel);
  vm.runInNewContext(fs.readFileSync(file, "utf8"), ctx, { filename: rel });
}

load("js/hexagrams.js");
load("js/divination.js");
load("js/bazi.js");
load("js/kaoyan-catalog.js");
load("js/complex.js");

const Cat = ctx.window.KaoyanCatalog;
const Yi = ctx.window.YiDivination;
const Cx = ctx.window.YiComplex;
const fails = [];

function ok(cond, msg) {
  if (!cond) fails.push(msg);
}

const st = Cat.stats();
ok(st.理学一级 === 14, "理学一级应为 14，实际 " + st.理学一级);
ok(st.工学一级 === 39, "工学一级应为 39，实际 " + st.工学一级);
ok(st.理学二级 >= 50, "理学二级应覆盖常用分支，实际 " + st.理学二级);
ok(st.工学二级 >= 120, "工学二级应覆盖常用分支，实际 " + st.工学二级);

const gong = Cat.GROUPS.工学.map((g) => g.id);
ok(gong.includes("xinxi") && gong.includes("tumu") && gong.includes("nengyuan"), "工学大组应含信息电子、土木水利、能源电气");
ok(Cat.GROUPS.理学.some((g) => g.id === "shuli"), "理学应有数理大组");

const xinxi = Cat.firstOf("xueshuo", "工学", "xinxi").map((d) => d.name);
ok(xinxi.includes("计算机科学与技术") && xinxi.includes("软件工程") && xinxi.includes("网络空间安全"), "信息电子组应含计算机、软件、网安");

const codes = new Set();
let dup = 0;
Cat.treeOf("xueshuo").工学.forEach((disc) => {
  (disc.kids || []).forEach((k) => {
    if (codes.has(k.code)) dup += 1;
    codes.add(k.code);
  });
});
Cat.treeOf("xueshuo").理学.forEach((disc) => {
  (disc.kids || []).forEach((k) => {
    if (codes.has(k.code)) dup += 1;
    codes.add(k.code);
  });
});
ok(dup === 0, "工学理学二级代码不应重复，重复 " + dup);

const cs = Cat.firstOf("xueshuo", "工学").find((d) => d.name === "计算机科学与技术");
ok(cs && cs.kids.map((k) => k.code).join(",") === "081200,081201,081202,081203", "计算机二级应为 081200–081203");

const phy = Cat.firstOf("xueshuo", "理学").find((d) => d.name === "物理学");
ok(phy && phy.kids.some((k) => k.code === "070206") && phy.kids.some((k) => k.code === "070208"), "物理学应含声学、无线电物理");
ok(Cat.firstOf("xueshuo", "理学").some((d) => d.code === "0712"), "理学应含科学技术史 0712");
ok(Cat.firstOf("xueshuo", "理学").some((d) => d.code === "0713"), "理学应含生态学 0713");

const groupOpts = Cat.collectGroupOptions("xueshuo", "工学", "xinxi", "学术型硕士");
ok(groupOpts.length >= 2 && groupOpts.length <= 6, "信息电子纳入一级应为 2–6，实际 " + groupOpts.length);
ok(groupOpts.every((o) => o.code && o.wx && o.dir), "大组一级须有代码与方位五行");

const follow = Cat.expandFollowPool(groupOpts);
const followCodes = follow.map((o) => o.code);
ok(followCodes.includes("081201") && followCodes.includes("081203") && followCodes.includes("083500"), "追问池应纳入计算机与软件全部分支");
ok(follow.length > groupOpts.length, "追问池应大于初筮一级数量");

const person = "张三";
const hour = 10;
const seeds = ["081200计算机科学与技术", "081201计算机系统结构", "081202计算机软件与理论", "081203计算机应用技术"];
const casts = seeds.map((seed) => Yi.divinate("meihua_person", "exam", {
  year: 2026,
  month: 9,
  day: 15,
  hour,
  personName: person,
  personAge: 22,
  otherName: seed,
  question: "考研攻读" + seed + "是否有利"
}));
const uppers = new Set(casts.map((c) => c.upper));
const lowers = new Set(casts.map((c) => c.lower + "/" + (c.movingLine || c.moving && c.moving[0])));
ok(uppers.size === 1, "人物梅花上卦应同（己为上），实际上卦种数 " + uppers.size);
ok(lowers.size >= 3, "专业成数不同，下卦或动爻应能分开，实际 " + lowers.size);
ok(new Set(casts.map((c) => c.binary)).size >= 3, "四细分不应完全同卦，实际本卦种数 " + new Set(casts.map((c) => c.binary)).size);

const form = {
  personName: person,
  personAge: 22,
  goal: "就业",
  birth: { year: 1998, month: 6, day: 15, hour: 10 },
  year: 2026,
  month: 9,
  day: 15,
  hour: 10,
  pickedMajors: [
    Cat.toOption({ name: "计算机系统结构", code: "081201", field: "工学", first: "计算机科学与技术", degreeName: "学术型硕士", dir: "南", wx: "火" }),
    Cat.toOption({ name: "水利水电工程", code: "081504", field: "工学", first: "水利工程", degreeName: "学术型硕士", dir: "北", wx: "水" }),
    Cat.toOption({ name: "基础数学", code: "070101", field: "理学", first: "数学", degreeName: "学术型硕士", dir: "北", wx: "水" })
  ]
};
const out = Cx.compareComplex("kaoyan", form);
ok(out.guaOnly === true, "已立专业名次应以卦象为准，guaOnly 应为 true");
ok(out.ranked.every((r) => r.finalScore === r.guaScore), "已立专业综合分应等于卦象分，不得再掺八字");
ok(out.ranked.length === 3, "三案应各起一卦");
ok(out.ranked[0].result.bengua && out.ranked[0].result.tiYong, "须有本卦与体用");

const short = Cx.shortlist("kaoyan", form);
ok(short.pool.length === 3 && short.guaOnly, "缩圈不得丢掉已勾选专业");

const stem = Cat.stemLibrary("xueshuo");
ok(stem.length === st.理学一级 + st.工学一级, "无勾选时的理工一级库应覆盖理学+工学全部一级");

if (fails.length) {
  console.error("FAIL\n" + fails.map((f) => "- " + f).join("\n"));
  process.exit(1);
}
console.log("OK");
console.log(JSON.stringify({
  理学: { 一级: st.理学一级, 二级: st.理学二级 },
  工学: { 一级: st.工学一级, 二级: st.工学二级 },
  信息电子一级: groupOpts.map((o) => o.name + o.code),
  追问池: follow.length,
  人物上卦: Array.from(uppers).join(","),
  四细分本卦: casts.map((c) => c.bengua && c.bengua.name).join("、"),
  已立三案: out.ranked.map((r) => r.rank + r.option.name + "卦" + r.guaScore).join("；")
}, null, 2));
