/**
 * 占筮核心：多算法 · 体用生克 · 事件适配
 * 依《周易》象数与《梅花易数》体用之理
 */
(function () {
  const GUA_DATA = window.GUA_DATA;
  const TRIGRAM_ORDER = window.TRIGRAM_ORDER;
  const TRIGRAM_BINARIES = window.TRIGRAM_BINARIES;

  if (!GUA_DATA) throw new Error("GUA_DATA 未加载");

  /* ========== 五行 / 八卦基础 ========== */
  const WUXING = ["木", "火", "土", "金", "水"];
  const TRIGRAM_WUXING = {
    乾: "金", 兑: "金", 离: "火", 震: "木",
    巽: "木", 坎: "水", 艮: "土", 坤: "土"
  };
  const TRIGRAM_NATURE = {
    乾: "天·健", 兑: "泽·悦", 离: "火·丽", 震: "雷·动",
    巽: "风·入", 坎: "水·陷", 艮: "山·止", 坤: "地·顺"
  };
  const DIRECTION_TRIGRAM = {
    北: "坎", 东北: "艮", 东: "震", 东南: "巽",
    南: "离", 西南: "坤", 西: "兑", 西北: "乾"
  };
  const SHICHEN_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const SHICHEN_WUXING = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"];
  const MONTH_WUXING = [null, "木", "木", "木", "火", "火", "火", "土", "金", "金", "金", "水", "水"];

  /* ========== 事件类型（不同事配不同易理侧重） ========== */
  const EVENT_TYPES = {
    career: {
      id: "career", name: "事业功名", icon: "⚔",
      desc: "升迁、求职、创业、功名",
      preferred: ["liuyao", "meihua_time"],
      focus: "体用生克论成败；看变卦趋向与动爻位次。乾、离旺则利于进取。",
      bodyRole: "求问者自身为体",
      tips: ["宜详问一时一事", "动爻多则事机复杂", "体强用弱利于我"]
    },
    love: {
      id: "love", name: "婚恋感情", icon: "☯",
      desc: "姻缘、恋爱、复合、婚姻",
      preferred: ["meihua_person", "liuyao", "meihua_time"],
      focus: "兑、坤主情；体用比和或相生则情顺，相克则阻隔。",
      bodyRole: "自己为体，对方为用",
      tips: ["问己方心境取自己信息", "问对方态度取对方姓名/生辰", "兑卦动多主口舌或情变"]
    },
    wealth: {
      id: "wealth", name: "财运交易", icon: "◈",
      desc: "投资、买卖、偏财、合作",
      preferred: ["liuyao", "meihua_number"],
      focus: "体克用则财可得；用克体则财耗。兑、坤与财象相关。",
      bodyRole: "求财者为体，标的为用",
      tips: ["一事一占", "变卦示结果", "忌连占同事"]
    },
    health: {
      id: "health", name: "健康安危", icon: "✚",
      desc: "身体、疾病、康愈",
      preferred: ["liuyao", "meihua_time"],
      focus: "坎为水肾、离为心目、震为肝足；体弱用强需谨慎。",
      bodyRole: "人为体，病为用",
      tips: ["仅供象数参考，就医为先", "动爻位可参考部位", "坤艮土象脾胃"]
    },
    travel: {
      id: "travel", name: "出行方位", icon: "⇄",
      desc: "远行、迁居、方位选择",
      preferred: ["meihua_direction", "meihua_time"],
      focus: "方位配先天八卦；体生用则利往，用克体则宜止。",
      bodyRole: "人为体，目的地为用",
      tips: ["必填方位或目的地", "震巽利东行", "坎险宜慎水途"]
    },
    lawsuit: {
      id: "lawsuit", name: "官非争讼", icon: "⚖",
      desc: "诉讼、纠纷、是非",
      preferred: ["liuyao", "meihua_time"],
      focus: "讼卦本象；体强能胜，用强则对方势盛。",
      bodyRole: "己方为体，对方为用",
      tips: ["动在上卦多主对方", "离明则事理易清", "宜和解看变卦"]
    },
    exam: {
      id: "exam", name: "学业考试", icon: "✎",
      desc: "考试、升学、文书",
      preferred: ["meihua_time", "meihua_person", "liuyao"],
      focus: "离主文书光明；体旺生用或比和则利。",
      bodyRole: "考生为体，考事为用",
      tips: ["取开考时间起卦更切", "离巽动利文思", "勿反复重占"]
    },
    decision: {
      id: "decision", name: "抉择进退", icon: "◆",
      desc: "可否、进退、时机",
      preferred: ["meihua_time", "meihua_number", "liuyao"],
      focus: "本卦为现状，变卦为走向；体用定利害。",
      bodyRole: "问事者为体，所抉之事为用",
      tips: ["问题宜明确可答", "无动则看本卦卦辞", "有动则重动爻与变卦"]
    }
  };

  const METHOD_META = {
    liuyao: { id: "liuyao", name: "六爻·三钱卦", short: "六爻", reason: "一事一占，爻动见机，宜详断复杂人事。" },
    meihua_time: { id: "meihua_time", name: "梅花·时间起卦", short: "时间梅花", reason: "感于天时，适合问时机、考试、出行时点。" },
    meihua_person: { id: "meihua_person", name: "梅花·人物起卦", short: "人物梅花", reason: "以姓名、年龄成数，适合问感情、人际关系。" },
    meihua_direction: { id: "meihua_direction", name: "梅花·方位起卦", short: "方位梅花", reason: "方位配八卦，适合问出行、迁居、风水方位。" },
    meihua_number: { id: "meihua_number", name: "梅花·报数起卦", short: "报数梅花", reason: "触机取数，适合财运、抉择等随机感发。" }
  };

  /* ========== 工具 ========== */
  function randInt(max) {
    const n = max | 0;
    if (n <= 0) return 0;
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] % n;
    }
    return Math.floor(Math.random() * n);
  }

  function mod8(n) {
    const r = ((n % 8) + 8) % 8;
    return r === 0 ? 8 : r;
  }

  function mod6(n) {
    const r = ((n % 6) + 6) % 6;
    return r === 0 ? 6 : r;
  }

  function hourToShichen(hour) {
    const h = ((hour | 0) % 24 + 24) % 24;
    return Math.floor((h + 1) / 2) % 12 + 1;
  }

  function getTrigramByIndex(idx) {
    return TRIGRAM_ORDER[idx - 1];
  }

  function lookupHexagram(binary) {
    return GUA_DATA[binary] || null;
  }

  function applyMovingLine(binary, movingLine) {
    const arr = binary.split("");
    const idx = movingLine - 1;
    arr[idx] = arr[idx] === "1" ? "0" : "1";
    return arr.join("");
  }

  function applyMovingLines(binary, movingList) {
    let b = binary;
    for (const pos of movingList) b = applyMovingLine(b, pos);
    return b;
  }

  function linesToBinary(lines) {
    return lines.map((l) => (l.yin ? "0" : "1")).join("");
  }

  function binaryToLines(binary, movingSet) {
    const set = movingSet || new Set();
    return binary.split("").map((ch, i) => {
      const yin = ch === "0";
      const moving = set.has(i);
      let type = yin ? "少阴" : "少阳";
      if (moving) type = yin ? "老阴" : "老阳";
      return { yin, moving, type };
    });
  }

  function lineLabel(index, yin) {
    return ["初", "二", "三", "四", "五", "上"][index] + (yin ? "六" : "九");
  }

  /** 汉字简易笔画估算（文化近似，非康熙字典精确） */
  function estimateStrokes(str) {
    if (!str) return 0;
    let total = 0;
    for (const ch of str) {
      const code = ch.codePointAt(0);
      if (code >= 0x4e00 && code <= 0x9fff) {
        // 用码位分布近似笔画 2–16
        total += 2 + (code % 15);
      } else if (/[0-9]/.test(ch)) {
        total += parseInt(ch, 10) || 10;
      } else if (/[a-zA-Z]/.test(ch)) {
        total += (ch.toUpperCase().charCodeAt(0) - 64);
      }
    }
    return total || 1;
  }

  function stringToNumber(str) {
    return estimateStrokes(String(str || "").trim()) || 1;
  }

  /* ========== 五行生克 ========== */
  function wuxingRelation(a, b) {
    if (a === b) return "比和";
    const ai = WUXING.indexOf(a);
    const bi = WUXING.indexOf(b);
    if (ai < 0 || bi < 0) return "未知";
    if ((ai + 1) % 5 === bi) return "我生"; // a 生 b
    if ((bi + 1) % 5 === ai) return "生我"; // b 生 a
    if ((ai + 2) % 5 === bi) return "我克";
    if ((bi + 2) % 5 === ai) return "克我";
    return "未知";
  }

  function relationLuck(rel) {
    switch (rel) {
      case "比和": return { level: "平", score: 60, text: "体用比和，势力相当，事可平稳推进。" };
      case "生我": return { level: "吉", score: 85, text: "用生体，得外力相助，事多顺遂。" };
      case "我克": return { level: "吉", score: 80, text: "体克用，我能制彼，主动权在我。" };
      case "我生": return { level: "耗", score: 45, text: "体生用，心力外泄，宜量力而行。" };
      case "克我": return { level: "凶", score: 25, text: "用克体，外力侵凌，宜守不宜进。" };
      default: return { level: "平", score: 50, text: "生克不明，宜参卦辞爻辞。" };
    }
  }

  /**
   * 梅花体用：动爻所在单卦为用，另一单卦为体
   * 六爻无单动时：以下卦为体、上卦为用（问己）
   */
  function analyzeTiYong(binary, movingLines, eventType) {
    const lower = getTrigramFromBinary(binary.slice(0, 3));
    const upper = getTrigramFromBinary(binary.slice(3, 6));
    const lowerWx = TRIGRAM_WUXING[lower];
    const upperWx = TRIGRAM_WUXING[upper];

    let ti, yong, tiName, yongName, rule;
    const movings = movingLines || [];

    if (movings.length === 0) {
      ti = lowerWx; yong = upperWx; tiName = lower; yongName = upper;
      rule = "无动爻：取下卦为体、上卦为用（问己之常法）。";
    } else {
      // 取动爻所在卦为用（若上下皆有动，取初动所在）
      const first = movings[0];
      const inLower = first <= 3;
      if (inLower) {
        yong = lowerWx; ti = upperWx; yongName = lower; tiName = upper;
        rule = "动在下卦：下卦为用，上卦为体。";
      } else {
        yong = upperWx; ti = lowerWx; yongName = upper; tiName = lower;
        rule = "动在上卦：上卦为用，下卦为体。";
      }
      if (movings.some((m) => m <= 3) && movings.some((m) => m > 3)) {
        rule += " 上下皆动，以初动所在为用，余动参详。";
      }
    }

    // 感情类：强调自己为体（若用户指定角色可在外层覆盖，这里按事件默认）
    if (eventType === "love" || eventType === "lawsuit") {
      // 仍按动爻体用，但文案提示己体彼用
    }

    const rel = wuxingRelation(ti, yong);
    const luck = relationLuck(rel);

    return {
      ti, yong, tiName, yongName, lower, upper, lowerWx, upperWx,
      relation: rel, luck, rule,
      tiNature: TRIGRAM_NATURE[tiName],
      yongNature: TRIGRAM_NATURE[yongName]
    };
  }

  function getTrigramFromBinary(bin3) {
    for (const [name, b] of Object.entries(TRIGRAM_BINARIES)) {
      if (b === bin3) return name;
    }
    return "?";
  }

  /* ========== 六爻三钱 ========== */
  function tossCoin() {
    return randInt(2) === 0 ? 2 : 3;
  }

  function castLine() {
    const coins = [tossCoin(), tossCoin(), tossCoin()];
    const sum = coins[0] + coins[1] + coins[2];
    const map = {
      6: { type: "老阴", yin: true, moving: true },
      7: { type: "少阳", yin: false, moving: false },
      8: { type: "少阴", yin: true, moving: false },
      9: { type: "老阳", yin: false, moving: true }
    };
    const m = map[sum];
    if (!m) throw new Error("掷钱异常: " + sum);
    return { ...m, sum, coins, label: sum + (m.moving ? "（变）" : "") };
  }

  function castLiuYao() {
    return Array.from({ length: 6 }, castLine);
  }

  /* ========== 梅花：时间 ========== */
  function castMeiHuaTime(year, month, day, hour24) {
    const shichen = hourToShichen(hour24);
    const s1 = year + month + day;
    const s2 = s1 + shichen;
    const upperIdx = mod8(s1);
    const lowerIdx = mod8(s2);
    const upper = getTrigramByIndex(upperIdx);
    const lower = getTrigramByIndex(lowerIdx);
    const movingLine = mod6(s2);
    const binary = TRIGRAM_BINARIES[lower] + TRIGRAM_BINARIES[upper];
    return {
      method: "meihua_time",
      year, month, day, hour24, shichen,
      upperIdx, lowerIdx, upper, lower, movingLine, binary,
      numbers: { s1, s2 },
      detail: `年${year}+月${month}+日${day}=${s1}→上${upper}；加${SHICHEN_NAMES[shichen - 1]}时(${shichen})=${s2}→下${lower}，动第${movingLine}爻`
    };
  }

  /* ========== 梅花：人物（姓名笔画 + 年龄 + 时） ========== */
  function castMeiHuaPerson(personName, age, hour24, otherName) {
    const shichen = hourToShichen(hour24);
    const n1 = stringToNumber(personName) + (parseInt(age, 10) || 0);
    const n2 = otherName ? stringToNumber(otherName) : n1 + shichen;
    const s1 = n1;
    const s2 = n1 + (otherName ? stringToNumber(otherName) : 0) + shichen;
    const upperIdx = mod8(s1);
    const lowerIdx = mod8(s2);
    const upper = getTrigramByIndex(upperIdx);
    const lower = getTrigramByIndex(lowerIdx);
    const movingLine = mod6(s2);
    const binary = TRIGRAM_BINARIES[lower] + TRIGRAM_BINARIES[upper];
    return {
      method: "meihua_person",
      personName, otherName, age, hour24, shichen,
      upperIdx, lowerIdx, upper, lower, movingLine, binary,
      numbers: { n1, n2: s2 },
      detail: `主事人「${personName}」数${n1}→上${upper}；合对方/时辰得${s2}→下${lower}，动第${movingLine}爻`
    };
  }

  /* ========== 梅花：方位 ========== */
  function castMeiHuaDirection(direction, year, month, day, hour24) {
    const shichen = hourToShichen(hour24);
    const dirGua = DIRECTION_TRIGRAM[direction];
    if (!dirGua) throw new Error("未知方位: " + direction);
    const upperIdx = TRIGRAM_ORDER.indexOf(dirGua) + 1;
    const s2 = year + month + day + shichen;
    const lowerIdx = mod8(s2);
    const upper = dirGua;
    const lower = getTrigramByIndex(lowerIdx);
    const movingLine = mod6(s2);
    const binary = TRIGRAM_BINARIES[lower] + TRIGRAM_BINARIES[upper];
    return {
      method: "meihua_direction",
      direction, year, month, day, hour24, shichen,
      upperIdx, lowerIdx, upper, lower, movingLine, binary,
      numbers: { upperIdx, s2 },
      detail: `方位「${direction}」先天为${upper}作上卦；年月日时之和${s2}→下${lower}，动第${movingLine}爻`
    };
  }

  /* ========== 梅花：报数 ========== */
  function castMeiHuaNumber(num1, num2, hour24) {
    const shichen = hourToShichen(hour24 == null ? new Date().getHours() : hour24);
    const a = Math.abs(parseInt(num1, 10) || 1);
    const b = Math.abs(parseInt(num2, 10) || shichen);
    const upperIdx = mod8(a);
    const lowerIdx = mod8(a + b);
    const movingLine = mod6(a + b + shichen);
    const upper = getTrigramByIndex(upperIdx);
    const lower = getTrigramByIndex(lowerIdx);
    const binary = TRIGRAM_BINARIES[lower] + TRIGRAM_BINARIES[upper];
    return {
      method: "meihua_number",
      num1: a, num2: b, hour24, shichen,
      upperIdx, lowerIdx, upper, lower, movingLine, binary,
      numbers: { a, b, sum: a + b + shichen },
      detail: `报数上${a}→${upper}，下用${a}+${b}=${a + b}→${lower}，加时辰动第${movingLine}爻`
    };
  }

  /* ========== 天时地利人和上下文 ========== */
  function buildContext(ctx) {
    const year = parseInt(ctx.year, 10);
    const month = parseInt(ctx.month, 10);
    const day = parseInt(ctx.day, 10);
    const hour = parseInt(ctx.hour, 10);
    const shichen = hourToShichen(hour);
    const monthWx = MONTH_WUXING[month] || "土";
    const hourWx = SHICHEN_WUXING[shichen - 1];
    return {
      year, month, day, hour, shichen,
      shichenName: SHICHEN_NAMES[shichen - 1],
      monthWx, hourWx,
      place: ctx.place || "",
      direction: ctx.direction || "",
      personName: ctx.personName || "",
      personAge: ctx.personAge || "",
      personRole: ctx.personRole || "self",
      otherName: ctx.otherName || "",
      gender: ctx.gender || "",
      question: ctx.question || "",
      seasonNote: `月令属${monthWx}，${SHICHEN_NAMES[shichen - 1]}时属${hourWx}`
    };
  }

  function seasonInfluence(tiYong, context) {
    const ti = tiYong.ti;
    const monthRel = wuxingRelation(context.monthWx, ti);
    const hourRel = wuxingRelation(context.hourWx, ti);
    let scoreAdj = 0;
    const notes = [];
    if (monthRel === "生我" || monthRel === "比和") {
      scoreAdj += 8;
      notes.push(`月令${context.monthWx}助体，体气得时。`);
    } else if (monthRel === "克我") {
      scoreAdj -= 8;
      notes.push(`月令${context.monthWx}克体，体气失时，宜谨慎。`);
    }
    if (hourRel === "生我" || hourRel === "比和") {
      scoreAdj += 4;
      notes.push(`${context.shichenName}时${context.hourWx}与体相得。`);
    } else if (hourRel === "克我") {
      scoreAdj -= 4;
      notes.push(`${context.shichenName}时${context.hourWx}克体，时辰不利。`);
    }
    if (context.direction && DIRECTION_TRIGRAM[context.direction]) {
      const dg = DIRECTION_TRIGRAM[context.direction];
      const dw = TRIGRAM_WUXING[dg];
      const dr = wuxingRelation(dw, ti);
      if (dr === "生我" || dr === "比和") {
        scoreAdj += 5;
        notes.push(`方位${context.direction}（${dg}·${dw}）与体相宜。`);
      } else if (dr === "克我") {
        scoreAdj -= 5;
        notes.push(`方位${context.direction}（${dg}·${dw}）克体，地利有阻。`);
      }
    }
    return { scoreAdj, notes };
  }

  /**
   * 朱熹《易学启蒙》动爻占法（通行）
   * 0静看本卦辞；1动看本卦动爻；2动看两爻以上爻为主；
   * 3动本之卦辞以本为主；4动看之卦两静爻以下为主；
   * 5动看之卦静爻；6全动乾用九坤用六，余看之卦辞
   */
  function classicalMovingReading(bengua, biangua, moving) {
    const mov = (moving || []).slice().sort((a, b) => a - b);
    const n = mov.length;
    const focus = [];
    let rule = "";
    let primaryText = "";

    if (!bengua) {
      return { rule: "卦象未备", focus, primaryText: "", count: n };
    }

    if (n === 0) {
      rule = "六爻安静：以本卦卦辞为主，参大象。";
      primaryText = bengua.guaCi;
      focus.push({ kind: "本卦卦辞", text: bengua.guaCi });
      focus.push({ kind: "大象", text: bengua.daXiang });
    } else if (n === 1) {
      const i = mov[0] - 1;
      rule = "一爻动：以本卦动爻爻辞为主。";
      primaryText = bengua.yaoCi[i];
      focus.push({
        kind: `本卦${LINE_NAMES_SAFE(i)}`,
        text: bengua.yaoCi[i]
      });
    } else if (n === 2) {
      const upper = Math.max(...mov) - 1;
      const lower = Math.min(...mov) - 1;
      rule = "二爻动：看本卦两动爻爻辞，以上爻为主。";
      primaryText = bengua.yaoCi[upper];
      focus.push({ kind: `本卦${LINE_NAMES_SAFE(upper)}（主）`, text: bengua.yaoCi[upper] });
      focus.push({ kind: `本卦${LINE_NAMES_SAFE(lower)}（辅）`, text: bengua.yaoCi[lower] });
    } else if (n === 3) {
      rule = "三爻动：本卦为贞（始），之卦为悔（终），卦辞兼参，以本卦为主。";
      primaryText = bengua.guaCi;
      focus.push({ kind: "本卦卦辞（贞·主）", text: bengua.guaCi });
      if (biangua) focus.push({ kind: "之卦卦辞（悔）", text: biangua.guaCi });
      const mid = mov[1] - 1;
      focus.push({ kind: `中间动爻${LINE_NAMES_SAFE(mid)}可参`, text: bengua.yaoCi[mid] });
    } else if (n === 4) {
      const staticIdx = [1, 2, 3, 4, 5, 6].filter((p) => !mov.includes(p));
      rule = "四爻动：看之卦两静爻爻辞，以下爻为主。";
      if (biangua && staticIdx.length === 2) {
        const low = Math.min(...staticIdx) - 1;
        const high = Math.max(...staticIdx) - 1;
        primaryText = biangua.yaoCi[low];
        focus.push({ kind: `之卦${LINE_NAMES_SAFE(low)}（主）`, text: biangua.yaoCi[low] });
        focus.push({ kind: `之卦${LINE_NAMES_SAFE(high)}（辅）`, text: biangua.yaoCi[high] });
      }
    } else if (n === 5) {
      const staticPos = [1, 2, 3, 4, 5, 6].find((p) => !mov.includes(p));
      rule = "五爻动：以之卦静爻爻辞为主。";
      if (biangua && staticPos) {
        const i = staticPos - 1;
        primaryText = biangua.yaoCi[i];
        focus.push({ kind: `之卦${LINE_NAMES_SAFE(i)}`, text: biangua.yaoCi[i] });
      }
    } else {
      if (bengua.name === "乾") {
        rule = "六爻皆动：乾卦用「用九」。";
        primaryText = "见群龙无首，吉。";
        focus.push({ kind: "用九", text: primaryText });
      } else if (bengua.name === "坤") {
        rule = "六爻皆动：坤卦用「用六」。";
        primaryText = "利永贞。";
        focus.push({ kind: "用六", text: primaryText });
      } else {
        rule = "六爻皆动：以之卦卦辞为主。";
        primaryText = biangua ? biangua.guaCi : bengua.guaCi;
        if (biangua) focus.push({ kind: "之卦卦辞", text: biangua.guaCi });
      }
    }

    return { rule, focus, primaryText, count: n };
  }

  function LINE_NAMES_SAFE(i) {
    return ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][i] || `第${i + 1}爻`;
  }

  /* ========== 事件断语生成 ========== */
  function interpretEvent(eventId, tiYong, bengua, biangua, moving, season, classical, context) {
    const ev = EVENT_TYPES[eventId] || EVENT_TYPES.decision;
    let score = tiYong.luck.score + (season ? season.scoreAdj : 0);
    score = Math.max(5, Math.min(95, score));

    const movingCount = (moving || []).length;
    if (movingCount === 0) score = Math.round(score * 0.95 + 2);
    if (movingCount >= 3) score = Math.round(score * 0.9);

    let verdict;
    if (score >= 75) verdict = "较为有利";
    else if (score >= 55) verdict = "平中带机";
    else if (score >= 40) verdict = "多有波折";
    else verdict = "宜守缓图";

    const lines = [
      `【${ev.name}】体${tiYong.tiName}（${tiYong.ti}）·用${tiYong.yongName}（${tiYong.yong}），${tiYong.relation}。`,
      tiYong.luck.text,
      classical ? `【玩辞法则】${classical.rule}` : "",
      classical && classical.primaryText ? `【主断辞】${classical.primaryText}` : "",
      ev.focus
    ].filter(Boolean);

    if (bengua) lines.push(`本卦「${bengua.name}」：${bengua.guaCi}`);
    if (biangua && biangua.name !== bengua?.name) {
      lines.push(`之卦「${biangua.name}」：${biangua.guaCi}`);
    }

    const Oracle = window.YiOracleText;
    let local = null;
    let localBian = null;
    if (Oracle && bengua) {
      local = Oracle.getLocalOracle(bengua, eventId, context);
      if (local) {
        lines.push(`【因地制宜】${local.eventText}`);
        (local.localNotes || []).forEach((n) => lines.push(n));
      }
      if (biangua && biangua.name !== bengua.name) {
        localBian = Oracle.getLocalOracle(biangua, eventId, context);
        if (localBian) lines.push(`【之卦因地】${localBian.eventText}`);
      }
    }

    if (season && season.notes.length) lines.push(...season.notes);

    const askIndex = context && context.askIndex;
    if (askIndex === 1) lines.push("【筮次】初筮。象已告，宜玩辞自警。");
    if (askIndex === 2) lines.push("【筮次】再筮。只为澄清初象，不可推翻前断。");
    if (askIndex >= 3) lines.push("【筮次】三筮已终。《蒙》曰再三渎则不告。此事宜止占。");

    lines.push("《系辞》云：君子居则观其象而玩其辞，动则观其变而玩其占。");
    lines.push(...ev.tips.map((t) => "· " + t));

    return { score, verdict, lines, event: ev, classical, local, localBian };
  }

  /* ========== 统一起卦入口 ========== */
  function finalizeCast(cast, eventId, context) {
    const moving = cast.moving
      ? cast.moving
      : cast.movingLine
        ? [cast.movingLine]
        : [];
    const binary = cast.binary || cast.benguaBinary;
    const bianguaBinary = cast.bianguaBinary || applyMovingLines(binary, moving);
    const bengua = cast.bengua || lookupHexagram(binary);
    const biangua = cast.biangua || lookupHexagram(bianguaBinary);
    const lines = cast.lines || binaryToLines(binary, new Set(moving.map((m) => m - 1)));
    const tiYong = analyzeTiYong(binary, moving, eventId);
    const season = seasonInfluence(tiYong, context);
    const classical = classicalMovingReading(bengua, biangua, moving);
    const reading = interpretEvent(eventId, tiYong, bengua, biangua, moving, season, classical, context);

    return {
      ...cast,
      binary,
      benguaBinary: binary,
      bianguaBinary,
      bengua,
      biangua,
      moving,
      lines,
      tiYong,
      season,
      classical,
      reading,
      context,
      eventId,
      methodMeta: METHOD_META[cast.method] || METHOD_META.liuyao
    };
  }

  function divinateLiuYao(eventId, context, existingLines) {
    const lines = existingLines || castLiuYao();
    const binary = linesToBinary(lines);
    const moving = lines.map((l, i) => (l.moving ? i + 1 : null)).filter(Boolean);
    return finalizeCast(
      { method: "liuyao", lines, binary, moving, detail: "三钱六掷，老变少不变" },
      eventId,
      context
    );
  }

  function divinate(method, eventId, rawContext, extra) {
    const context = buildContext(rawContext);
    switch (method) {
      case "liuyao":
        return divinateLiuYao(eventId, context, extra && extra.lines);
      case "meihua_time":
        return finalizeCast(
          castMeiHuaTime(context.year, context.month, context.day, context.hour),
          eventId,
          context
        );
      case "meihua_person":
        return finalizeCast(
          castMeiHuaPerson(
            context.personName || "某人",
            context.personAge,
            context.hour,
            context.otherName
          ),
          eventId,
          context
        );
      case "meihua_direction":
        return finalizeCast(
          castMeiHuaDirection(
            context.direction || "东",
            context.year,
            context.month,
            context.day,
            context.hour
          ),
          eventId,
          context
        );
      case "meihua_number":
        return finalizeCast(
          castMeiHuaNumber(extra?.num1 || rawContext.num1, extra?.num2 || rawContext.num2, context.hour),
          eventId,
          context
        );
      default:
        throw new Error("未知算法: " + method);
    }
  }

  function recommendMethods(eventId) {
    const ev = EVENT_TYPES[eventId] || EVENT_TYPES.decision;
    return ev.preferred.map((id) => METHOD_META[id]);
  }

  window.YiDivination = {
    EVENT_TYPES,
    METHOD_META,
    DIRECTION_TRIGRAM,
    SHICHEN_NAMES,
    TRIGRAM_WUXING,
    TRIGRAM_NATURE,
    WUXING,
    castLine,
    castLiuYao,
    divinateLiuYao,
    divinate,
    recommendMethods,
    buildContext,
    analyzeTiYong,
    classicalMovingReading,
    wuxingRelation,
    lookupHexagram,
    applyMovingLine,
    applyMovingLines,
    linesToBinary,
    binaryToLines,
    lineLabel,
    hourToShichen,
    stringToNumber,
    estimateStrokes,
    mod8,
    mod6
  };
})();
