/**
 * 八字简盘（公历近似）
 * 用于复杂问事「缩圈」：定日主、月令、喜用大致方向。
 * 说明：节气取近似，不作命理馆级精盘；正断仍以一事一占之易卦为准。
 */
(function () {
  const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const STEM_WX = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
  const BRANCH_WX = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"];
  const STEM_YINYANG = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]; // 1阳 0阴

  // 生助顺序：木火土金水
  const WX = ["木", "火", "土", "金", "水"];

  function wxIndex(w) {
    return WX.indexOf(w);
  }

  function relation(a, b) {
    if (a === b) return "比和";
    const ai = wxIndex(a);
    const bi = wxIndex(b);
    if (ai < 0 || bi < 0) return "未知";
    if ((ai + 1) % 5 === bi) return "我生";
    if ((bi + 1) % 5 === ai) return "生我";
    if ((ai + 2) % 5 === bi) return "我克";
    if ((bi + 2) % 5 === ai) return "克我";
    return "未知";
  }

  /** 儒略日（简化） */
  function julianDay(y, m, d) {
    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;
    return (
      d +
      Math.floor((153 * m2 + 2) / 5) +
      365 * y2 +
      Math.floor(y2 / 4) -
      Math.floor(y2 / 100) +
      Math.floor(y2 / 400) -
      32045
    );
  }

  /** 立春近似：公历 2 月 4 日 */
  function yearPillar(y, m, d) {
    let yy = y;
    if (m < 2 || (m === 2 && d < 4)) yy -= 1;
    // 1984 甲子年为基准
    const offset = yy - 1984;
    const idx = ((offset % 60) + 60) % 60;
    return { stem: STEMS[idx % 10], branch: BRANCHES[idx % 12], idx };
  }

  /** 日柱：以已知基准推算 */
  function dayPillar(y, m, d) {
    // 公式常用：JD + 49 对应甲子修正；取与公开对照表相近的偏移
    const jd = julianDay(y, m, d);
    const idx = (((jd + 49) % 60) + 60) % 60;
    return { stem: STEMS[idx % 10], branch: BRANCHES[idx % 12], idx };
  }

  /** 月柱：以节月近似（寅月≈立春后） */
  function monthPillar(y, m, d, yearStem) {
    // 节气月：寅=1 … 丑=12；公历粗分
    // 2/4后寅, 3/6后卯, 4/5后辰, 5/6后巳, 6/6后午, 7/7后未,
    // 8/8后申, 9/8后酉, 10/8后戌, 11/7后亥, 12/7后子, 1/6后丑
    const edges = [
      [2, 4],
      [3, 6],
      [4, 5],
      [5, 6],
      [6, 6],
      [7, 7],
      [8, 8],
      [9, 8],
      [10, 8],
      [11, 7],
      [12, 7],
      [1, 6]
    ];
    // 找当前节月 0=寅 ... 11=丑
    let jieMonth = 11; // 默认丑
    for (let i = 0; i < 12; i++) {
      const [em, ed] = edges[i];
      const next = edges[(i + 1) % 12];
      const afterStart =
        m > em || (m === em && d >= ed) || (em === 1 && (m > 1 || (m === 1 && d >= ed)));
      // 简化：按公历月映射
    }
    // 更稳的近似映射（立春后）
    const map = [
      null,
      11, // 1月多属丑（立春前）/寅（后）——下面修正
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10
    ];
    jieMonth = map[m];
    if (m === 1) jieMonth = d >= 6 ? 11 : 10; // 小寒后亥/大寒后丑 近似
    if (m === 2 && d < 4) jieMonth = 11;

    const yearStemIdx = STEMS.indexOf(yearStem);
    // 五虎遁：甲己丙作首…
    const start = [2, 4, 6, 8, 0][yearStemIdx % 5]; // 寅月干
    const stemIdx = (start + jieMonth) % 10;
    const branchIdx = (2 + jieMonth) % 12; // 寅起
    return {
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      jieMonth: jieMonth + 1
    };
  }

  /** 时柱 */
  function hourPillar(dayStem, hour24) {
    const h = ((hour24 % 24) + 24) % 24;
    const zhi = Math.floor((h + 1) / 2) % 12; // 子0
    const dayIdx = STEMS.indexOf(dayStem);
    // 五鼠遁
    const start = [0, 2, 4, 6, 8][dayIdx % 5];
    const stemIdx = (start + zhi) % 10;
    return { stem: STEMS[stemIdx], branch: BRANCHES[zhi], zhi };
  }

  /**
   * 日主旺衰粗判：得月令本气为旺；得生助为相；否则偏弱
   */
  function dayMasterStrength(dayWx, monthBranchWx) {
    const rel = relation(monthBranchWx, dayWx);
    if (monthBranchWx === dayWx) return { level: "旺", score: 2 };
    if (rel === "生我") return { level: "相", score: 1 };
    if (rel === "克我") return { level: "弱", score: -2 };
    if (rel === "我生") return { level: "泄", score: -1 };
    if (rel === "我克") return { level: "耗", score: -1 };
    return { level: "平", score: 0 };
  }

  /**
   * 喜用简局：
   * 日主偏弱 → 喜生扶（生我、比和）
   * 日主偏旺 → 喜克泄耗（克我、我生、我克）
   */
  function usefulGods(dayWx, strengthScore) {
    const weak = strengthScore <= 0;
    if (weak) {
      return {
        weak: true,
        xi: [dayWx, WX[(wxIndex(dayWx) + 4) % 5]], // 比劫、印
        ji: [WX[(wxIndex(dayWx) + 2) % 5], WX[(wxIndex(dayWx) + 1) % 5]], // 财、食伤粗分
        note: "日主偏弱/失令，缩圈时优先生扶日主之五行场域。"
      };
    }
    return {
      weak: false,
      xi: [WX[(wxIndex(dayWx) + 1) % 5], WX[(wxIndex(dayWx) + 2) % 5], WX[(wxIndex(dayWx) + 3) % 5]],
      ji: [dayWx, WX[(wxIndex(dayWx) + 4) % 5]],
      note: "日主偏旺/得令，缩圈时优先克泄耗日主之五行场域。"
    };
  }

  /** 喜用对应先天方位 */
  const WX_DIRS = {
    木: ["东", "东南"],
    火: ["南"],
    土: ["东北", "西南"],
    金: ["西", "西北"],
    水: ["北"]
  };

  function chart(birth) {
    const y = parseInt(birth.year, 10);
    const m = parseInt(birth.month, 10);
    const d = parseInt(birth.day, 10);
    const h = parseInt(birth.hour, 10);
    if (!y || !m || !d || isNaN(h)) throw new Error("生辰不完整");

    const year = yearPillar(y, m, d);
    const month = monthPillar(y, m, d, year.stem);
    const day = dayPillar(y, m, d);
    const hour = hourPillar(day.stem, h);

    const dayWx = STEM_WX[STEMS.indexOf(day.stem)];
    const monthWx = BRANCH_WX[BRANCHES.indexOf(month.branch)];
    const strength = dayMasterStrength(dayWx, monthWx);
    const gods = usefulGods(dayWx, strength.score);

    const xiDirs = [];
    gods.xi.forEach((w) => {
      (WX_DIRS[w] || []).forEach((dir) => {
        if (!xiDirs.includes(dir)) xiDirs.push(dir);
      });
    });

    return {
      pillars: {
        year: `${year.stem}${year.branch}`,
        month: `${month.stem}${month.branch}`,
        day: `${day.stem}${day.branch}`,
        hour: `${hour.stem}${hour.branch}`
      },
      dayMaster: day.stem,
      dayWx,
      monthWx,
      strength,
      gods,
      xiDirs,
      yinyang: STEM_YINYANG[STEMS.indexOf(day.stem)] ? "阳" : "阴",
      summary: `日主${day.stem}（${dayWx}），月令${month.branch}（${monthWx}），日主${strength.level}。${gods.note}`
    };
  }

  function scoreOptionWuxing(optionWx, gods) {
    if (!optionWx || !gods) return 0;
    if (gods.xi.includes(optionWx)) return 12;
    if (gods.ji.includes(optionWx)) return -10;
    return 0;
  }

  function scoreOptionDirection(optionDir, xiDirs) {
    if (!optionDir || !xiDirs || !xiDirs.length) return 0;
    return xiDirs.includes(optionDir) ? 10 : -4;
  }

  window.BaZiLite = {
    STEMS,
    BRANCHES,
    STEM_WX,
    BRANCH_WX,
    WX,
    WX_DIRS,
    chart,
    relation,
    scoreOptionWuxing,
    scoreOptionDirection
  };
})();
