/**
 * 复杂问事：严格一事一占
 * 流程：立问定界 → 八字/方位五行缩圈 → 候选各起一卦 → 体用玩辞排序
 */
(function () {
  const Yi = () => window.YiDivination;
  const BaZi = () => window.BaZiLite;

  /** 城市库：先天方位 + 五行场 + 标签（缩圈用，非穷尽全球） */
  const CITIES = [
    { id: "hangzhou", name: "杭州", region: "国内", dir: "东", wx: "木", tags: ["数字", "文教", "宜居"] },
    { id: "shanghai", name: "上海", region: "国内", dir: "东", wx: "木", tags: ["金融", "国际化", "综合"] },
    { id: "shenzhen", name: "深圳", region: "国内", dir: "南", wx: "火", tags: ["科技", "创业", "年轻"] },
    { id: "guangzhou", name: "广州", region: "国内", dir: "南", wx: "火", tags: ["商贸", "枢纽"] },
    { id: "beijing", name: "北京", region: "国内", dir: "北", wx: "水", tags: ["政务", "文教", "资源"] },
    { id: "chengdu", name: "成都", region: "国内", dir: "西南", wx: "土", tags: ["宜居", "文创", "节奏稳"] },
    { id: "chongqing", name: "重庆", region: "国内", dir: "西南", wx: "土", tags: ["制造", "枢纽"] },
    { id: "wuhan", name: "武汉", region: "国内", dir: "中", wx: "土", tags: ["交通", "教育", "枢纽"], dirAlias: "西南" },
    { id: "nanjing", name: "南京", region: "国内", dir: "东", wx: "木", tags: ["文教", "稳"] },
    { id: "suzhou", name: "苏州", region: "国内", dir: "东", wx: "木", tags: ["制造", "宜居"] },
    { id: "xian", name: "西安", region: "国内", dir: "西", wx: "金", tags: ["文教", "军工", "历史"] },
    { id: "chengdu_north", name: "天津", region: "国内", dir: "北", wx: "水", tags: ["港口", "制造"] },
    { id: "qingdao", name: "青岛", region: "国内", dir: "东", wx: "木", tags: ["港口", "宜居"] },
    { id: "xiamen", name: "厦门", region: "国内", dir: "东南", wx: "木", tags: ["宜居", "外贸"] },
    { id: "changsha", name: "长沙", region: "国内", dir: "南", wx: "火", tags: ["文娱", "宜居"] },
    { id: "singapore", name: "新加坡", region: "海外", dir: "南", wx: "火", tags: ["金融", "国际化", "规则"] },
    { id: "tokyo", name: "东京", region: "海外", dir: "东", wx: "木", tags: ["科技", "文化", "精细"] },
    { id: "hongkong", name: "香港", region: "国内", dir: "南", wx: "火", tags: ["金融", "国际化"] },
    { id: "taipei", name: "台北", region: "国内", dir: "东南", wx: "木", tags: ["科技", "文创"] },
    { id: "seoul", name: "首尔", region: "海外", dir: "东", wx: "木", tags: ["科技", "文娱"] },
    { id: "sydney", name: "悉尼", region: "海外", dir: "东南", wx: "木", tags: ["宜居", "留学"] },
    { id: "toronto", name: "多伦多", region: "海外", dir: "北", wx: "水", tags: ["移民", "多元"] },
    { id: "vancouver", name: "温哥华", region: "海外", dir: "西北", wx: "金", tags: ["宜居", "移民"] },
    { id: "london", name: "伦敦", region: "海外", dir: "西", wx: "金", tags: ["金融", "文教"] },
    { id: "berlin", name: "柏林", region: "海外", dir: "西", wx: "金", tags: ["工业", "学术"] },
    { id: "paris", name: "巴黎", region: "海外", dir: "西", wx: "金", tags: ["文化", "设计"] },
    { id: "newyork", name: "纽约", region: "海外", dir: "东", wx: "木", tags: ["金融", "国际化"] },
    { id: "sf", name: "旧金山湾区", region: "海外", dir: "西", wx: "金", tags: ["科技", "创业"] },
    { id: "dubai", name: "迪拜", region: "海外", dir: "西", wx: "金", tags: ["商贸", "枢纽"] },
    { id: "bangkok", name: "曼谷", region: "海外", dir: "南", wx: "火", tags: ["生活成本", "旅游"] }
  ];

  const CAREERS = [
    { id: "tech", name: "互联网/软件", dir: "南", wx: "火", tags: ["创新", "节奏快"] },
    { id: "finance", name: "金融/投资", dir: "西", wx: "金", tags: ["规则", "数字"] },
    { id: "edu", name: "教育/科研", dir: "东", wx: "木", tags: ["文教", "长线"] },
    { id: "gov", name: "公务员/事业单位", dir: "北", wx: "水", tags: ["稳定", "体制"] },
    { id: "manu", name: "先进制造/工程", dir: "西", wx: "金", tags: ["实业", "技术"] },
    { id: "media", name: "传媒/内容/设计", dir: "南", wx: "火", tags: ["表达", "创意"] },
    { id: "medical", name: "医疗/生物", dir: "东", wx: "木", tags: ["专业", "责任"] },
    { id: "legal", name: "法律/咨询", dir: "西", wx: "金", tags: ["规则", "分析"] },
    { id: "trade", name: "贸易/跨境", dir: "东南", wx: "木", tags: ["流动", "人际"] },
    { id: "energy", name: "能源/土木/水利", dir: "北", wx: "水", tags: ["工程", "公共"] },
    { id: "startup", name: "自主创业", dir: "南", wx: "火", tags: ["风险", "自主"] },
    { id: "art", name: "艺术/自由职业", dir: "东", wx: "木", tags: ["自由", "表达"] }
  ];

  const SCHOOLS = [
    { id: "cs", name: "计算机/人工智能", dir: "南", wx: "火", tags: ["就业", "热"] },
    { id: "hydro", name: "水利/土木/环境", dir: "北", wx: "水", tags: ["工程", "稳定"] },
    { id: "finance_m", name: "经济/金融", dir: "西", wx: "金", tags: ["商科"] },
    { id: "medicine", name: "医学/护理", dir: "东", wx: "木", tags: ["长学制"] },
    { id: "law", name: "法学", dir: "西", wx: "金", tags: ["规则"] },
    { id: "edu_m", name: "师范/教育", dir: "东", wx: "木", tags: ["稳定"] },
    { id: "design", name: "设计/艺术", dir: "南", wx: "火", tags: ["创意"] },
    { id: "lang", name: "外语/国际关系", dir: "东南", wx: "木", tags: ["涉外"] },
    { id: "basic", name: "数理化基础学科", dir: "北", wx: "水", tags: ["深造"] },
    { id: "biz", name: "工商管理", dir: "西南", wx: "土", tags: ["综合"] }
  ];

  const INVEST = [
    { id: "save", name: "稳健储蓄/国债", dir: "北", wx: "水", tags: ["防守"] },
    { id: "index", name: "宽基指数定投", dir: "东", wx: "木", tags: ["长线"] },
    { id: "equity", name: "个股/主动权益", dir: "南", wx: "火", tags: ["进取"] },
    { id: "estate", name: "房产配置", dir: "西南", wx: "土", tags: ["重资产"] },
    { id: "gold", name: "贵金属", dir: "西", wx: "金", tags: ["避险"] },
    { id: "startup_inv", name: "创业/合伙生意", dir: "南", wx: "火", tags: ["高波动"] },
    { id: "cash", name: "持币观望", dir: "北", wx: "水", tags: ["伺机"] }
  ];

  const SCENARIOS = {
    relocate: {
      id: "relate",
      name: "迁居择城",
      icon: "◎",
      desc: "国内外宜居发展之城：先八字方位缩圈，再对候选城一事一占。",
      eventId: "travel",
      optionSource: "cities",
      questionTpl: (opt, goal) => `我迁往${opt.name}发展${goal || "事业与生活"}，是否有利？`,
      tips: [
        "严禁一卦点尽天下城；必先缩圈再逐城起卦。",
        "城名成数入梅花，合生辰喜用与先天方位。",
        "签证、收入、家庭为人谋，象数只助决疑。"
      ]
    },
    career_path: {
      id: "career_path",
      name: "职业赛道",
      icon: "⚔",
      desc: "多条事业方向对比：缩圈后各起一卦，观体用与动爻。",
      eventId: "career",
      optionSource: "careers",
      questionTpl: (opt) => `我选择「${opt.name}」赛道深耕，是否有利？`,
      tips: ["一赛道一占", "喜用生扶之业象更顺", "变卦看三年内趋势"]
    },
    school: {
      id: "school",
      name: "升学择途",
      icon: "✎",
      desc: "专业/路径对比，离巽主文书，仍须一事一占。",
      eventId: "exam",
      optionSource: "schools",
      questionTpl: (opt) => `我攻读或从事「${opt.name}」方向，是否有利？`,
      tips: ["填志愿前逐项占", "勿因一卦改全部志愿"]
    },
    partner: {
      id: "partner",
      name: "合作/共事人选",
      icon: "☯",
      desc: "多人备选：每人一占，己体彼用。",
      eventId: "decision",
      optionSource: "custom",
      questionTpl: (opt) => `与「${opt.name}」合作共事，是否相宜？`,
      tips: ["必须填写对方称呼", "人物梅花更切", "体用看彼我强弱与生克"]
    },
    love_choice: {
      id: "love_choice",
      name: "姻缘对象比较",
      icon: "◇",
      desc: "婚恋对象对比：一人一占，兑坤主情。",
      eventId: "love",
      optionSource: "custom",
      questionTpl: (opt) => `与「${opt.name}」发展长期姻缘，是否相宜？`,
      tips: ["勿连占同一人", "感情事更重大，人谋与沟通优先"]
    },
    invest: {
      id: "invest",
      name: "投资取向",
      icon: "◈",
      desc: "配置方向对比：财为用，体克用则财可得。",
      eventId: "wealth",
      optionSource: "invest",
      questionTpl: (opt) => `近期以「${opt.name}」为主配置，是否有利？`,
      tips: ["不构成投资建议", "一事一占，忌同事连占"]
    },
    multi: {
      id: "multi",
      name: "多方案决择",
      icon: "◆",
      desc: "自定义 A/B/C… 方案，逐案起卦排序。",
      eventId: "decision",
      optionSource: "custom",
      questionTpl: (opt) => `采用方案「${opt.name}」，是否有利？`,
      tips: ["方案名宜具体", "最多比较 6 案，免渎"]
    }
  };

  // fix typo in relocate id
  SCENARIOS.relocate.id = "relocate";

  function getLibrary(source) {
    switch (source) {
      case "cities":
        return CITIES;
      case "careers":
        return CAREERS;
      case "schools":
        return SCHOOLS;
      case "invest":
        return INVEST;
      default:
        return [];
    }
  }

  function parseCustomOptions(text) {
    return String(text || "")
      .split(/[,，、\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6)
      .map((name, i) => ({
        id: "c" + i,
        name,
        dir: "",
        wx: "",
        tags: ["自定义"]
      }));
  }

  /**
   * 缩圈：按区域 + 八字喜用五行/方位过滤，保证留下可占候选
   */
  function shortlist(scenarioId, opts) {
    const sc = SCENARIOS[scenarioId];
    if (!sc) throw new Error("未知场景");

    let pool =
      sc.optionSource === "custom"
        ? parseCustomOptions(opts.customText)
        : getLibrary(sc.optionSource).slice();

    if (!pool.length) throw new Error("请至少提供 2 个候选");

    // 区域过滤（仅城市）
    if (scenarioId === "relocate" && opts.region && opts.region !== "all") {
      pool = pool.filter((c) => c.region === opts.region);
    }

    // 行业关键词（城市）
    if (opts.focusTag) {
      const tagged = pool.filter((c) => (c.tags || []).some((t) => t.includes(opts.focusTag) || opts.focusTag.includes(t)));
      if (tagged.length >= 2) pool = tagged;
    }

    let chart = null;
    if (opts.birth && opts.birth.year) {
      try {
        chart = BaZi().chart(opts.birth);
      } catch (e) {
        chart = null;
      }
    }

    // 八字喜用缩圈
    if (chart && sc.optionSource !== "custom") {
      const scored = pool.map((o) => {
        const dir = o.dirAlias || o.dir;
        let s = 0;
        s += BaZi().scoreOptionWuxing(o.wx, chart.gods);
        s += BaZi().scoreOptionDirection(dir === "中" ? "西南" : dir, chart.xiDirs);
        return { o, s };
      });
      scored.sort((a, b) => b.s - a.s);
      const positive = scored.filter((x) => x.s >= 0).map((x) => x.o);
      const top = (positive.length >= 3 ? positive : scored.map((x) => x.o)).slice(0, opts.maxCandidates || 5);
      pool = top;
    } else {
      pool = pool.slice(0, opts.maxCandidates || 5);
    }

    if (pool.length < 2) {
      // 保底
      pool = getLibrary(sc.optionSource).slice(0, 3);
    }

    return { pool, chart, scenario: sc };
  }

  /**
   * 对每一候选一事一占（梅花：人名成数 + 选项成数 + 时）
   */
  function castOneOption(scenario, option, ctx, chart) {
    const Y = Yi();
    const question = scenario.questionTpl(option, ctx.goal);
    const personNum = Y.stringToNumber(ctx.personName || "某人");
    const optNum = Y.stringToNumber(option.name);
    const age = parseInt(ctx.personAge, 10) || 0;

    // 人物+对象梅花：上卦取人，下卦取人+对象+时
    const raw = {
      year: ctx.year,
      month: ctx.month,
      day: ctx.day,
      hour: ctx.hour,
      personName: ctx.personName || "某人",
      personAge: age,
      otherName: option.name,
      question,
      direction: option.dirAlias || option.dir || ctx.direction || "",
      place: option.name
    };

    // 优先人物梅花；有方位则再参考方位信息入上下文
    const result = Y.divinate("meihua_person", scenario.eventId, raw);

    // 附加缩圈分
    let preScore = 0;
    if (chart) {
      preScore += BaZi().scoreOptionWuxing(option.wx, chart.gods);
      const dir = option.dirAlias || option.dir;
      preScore += BaZi().scoreOptionDirection(dir === "中" ? "西南" : dir, chart.xiDirs);
    }

    const guaScore = result.reading.score;
    // 综合：易卦为主（70%），命理缩圈为辅（30% 映射到 0-100）
    const preNorm = Math.max(0, Math.min(100, 50 + preScore * 2));
    const finalScore = Math.round(guaScore * 0.7 + preNorm * 0.3);

    return {
      option,
      question,
      result,
      preScore,
      guaScore,
      finalScore,
      personNum,
      optNum
    };
  }

  function compareComplex(scenarioId, form) {
    const { pool, chart, scenario } = shortlist(scenarioId, form);
    if (pool.length > 6) {
      throw new Error("一次最多比较 6 个候选，以合「再三渎则不告」");
    }

    const ctx = {
      year: form.year,
      month: form.month,
      day: form.day,
      hour: form.hour,
      personName: form.personName,
      personAge: form.personAge,
      goal: form.goal || "",
      direction: form.direction || ""
    };

    const rows = pool.map((opt) => castOneOption(scenario, opt, ctx, chart));
    rows.sort((a, b) => b.finalScore - a.finalScore);

    // 名次与间距
    const ranked = rows.map((r, i) => ({
      ...r,
      rank: i + 1,
      verdict:
        r.finalScore >= 72 ? "较宜" : r.finalScore >= 55 ? "可考虑" : r.finalScore >= 40 ? "欠稳" : "宜缓"
    }));

    return {
      scenario,
      chart,
      castTime: `${ctx.year}-${ctx.month}-${ctx.day} ${ctx.hour}时`,
      principle:
        "复杂事拆为「缩圈 + 一事一占」。八字/方位仅辅助筛选候选；每一候选单独起卦，以本卦、之卦、动爻玩辞与体用生克正断。",
      ranked,
      top: ranked[0] || null,
      caution: "象数助缘，不替代签证、合同、健康与现金流等人事决策。"
    };
  }

  window.YiComplex = {
    SCENARIOS,
    CITIES,
    CAREERS,
    SCHOOLS,
    INVEST,
    getLibrary,
    shortlist,
    compareComplex,
    parseCustomOptions
  };
})();
