/**
 * 韦特塔罗（Rider–Waite–Smith）
 * 规范：洗牌切牌、正逆位、一事一占；事不过三。
 */
(function () {
  function randInt(n) {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] % n;
    }
    return Math.floor(Math.random() * n);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const MAJORS = [
    { n: 0, name: "愚者", en: "The Fool", glyph: "0", yi: "复、无妄",
      up: "初心、跃迁、未知之旅。宜信而不盲。",
      rev: "鲁莽、停滞、惧于迈步，或愚行。" },
    { n: 1, name: "魔术师", en: "The Magician", glyph: "I", yi: "乾、巽",
      up: "意志、技能、资源在手。可主动开创。",
      rev: "技巧滥用、承诺落空、心口不一。" },
    { n: 2, name: "女祭司", en: "The High Priestess", glyph: "II", yi: "坤、坎",
      up: "内智、秘密、等待时机。宜静观。",
      rev: "直觉被忽略、隐瞒、表面信息误导。" },
    { n: 3, name: "女皇", en: "The Empress", glyph: "III", yi: "坤、临",
      up: "滋养、丰饶、感官与创造。宜生不宜杀。",
      rev: "依赖、停滞、创生受阻或溺爱。" },
    { n: 4, name: "皇帝", en: "The Emperor", glyph: "IV", yi: "乾、师",
      up: "秩序、权威、结构。宜立规矩。",
      rev: "僵化、专断、或权威真空。" },
    { n: 5, name: "教皇", en: "The Hierophant", glyph: "V", yi: "观、家人",
      up: "传统、师承、仪式与群体规范。",
      rev: "破戒、叛逆教条，或盲从。" },
    { n: 6, name: "恋人", en: "The Lovers", glyph: "VI", yi: "咸、兑",
      up: "选择、契合、价值观对齐。",
      rev: "失衡、诱惑、选择分裂。" },
    { n: 7, name: "战车", en: "The Chariot", glyph: "VII", yi: "大壮、师",
      up: "意志驾驭冲突，前进可胜。",
      rev: "失控、方向打架、蛮力。" },
    { n: 8, name: "力量", en: "Strength", glyph: "VIII", yi: "履、谦",
      up: "柔克刚、内在勇气与驯服。",
      rev: "自我怀疑、暴力或软弱。" },
    { n: 9, name: "隐者", en: "The Hermit", glyph: "IX", yi: "艮、遁",
      up: "内求、指引、独处修德。",
      rev: "孤立过度、拒绝指引。" },
    { n: 10, name: "命运之轮", en: "Wheel of Fortune", glyph: "X", yi: "复、革",
      up: "周期转动、机遇降临。",
      rev: "抗拒变化、运势下坡。" },
    { n: 11, name: "正义", en: "Justice", glyph: "XI", yi: "噬嗑、讼",
      up: "因果、公正、权衡后决断。",
      rev: "不公、自我欺骗、逃避责任。" },
    { n: 12, name: "倒吊人", en: "The Hanged Man", glyph: "XII", yi: "困、蹇",
      up: "暂停、换视角、自愿牺牲。",
      rev: "无谓拖延、殉道情结、僵持。" },
    { n: 13, name: "死神", en: "Death", glyph: "XIII", yi: "剥、革",
      up: "结束与转化，旧去新来。",
      rev: "抗拒终结、僵尸状态。" },
    { n: 14, name: "节制", en: "Temperance", glyph: "XIV", yi: "节、中孚",
      up: "调和、炼金、节奏得中。",
      rev: "失衡、过量、无法融合。" },
    { n: 15, name: "恶魔", en: "The Devil", glyph: "XV", yi: "困、姤",
      up: "束缚、欲望、物质契约。看清锁链。",
      rev: "松绑、觉察成瘾，或更深沉迷。" },
    { n: 16, name: "高塔", en: "The Tower", glyph: "XVI", yi: "震、夬",
      up: "结构崩解、真相炸开。必要的摧毁。",
      rev: "灾难延迟、内爆、拒不面对。" },
    { n: 17, name: "星星", en: "The Star", glyph: "XVII", yi: "益、晋",
      up: "希望、疗愈、远景与灵感。",
      rev: "信心不足、愿景模糊。" },
    { n: 18, name: "月亮", en: "The Moon", glyph: "XVIII", yi: "坎、睽",
      up: "潜意识、幻象、须凭直觉缓行。",
      rev: "恐惧消退，或幻觉加深。" },
    { n: 19, name: "太阳", en: "The Sun", glyph: "XIX", yi: "离、大有",
      up: "清明、成功、生命力。",
      rev: "短暂阴翳、过度曝光、童心受抑。" },
    { n: 20, name: "审判", en: "Judgement", glyph: "XX", yi: "复、无妄",
      up: "唤醒、清算、响应召唤。",
      rev: "自我批判、拒绝重生。" },
    { n: 21, name: "世界", en: "The World", glyph: "XXI", yi: "既济、泰",
      up: "完成、整全、毕业与統合。",
      rev: "未完成、差临门、循环未闭。" }
  ];

  const SUITS = [
    { id: "wands", name: "权杖", elem: "火", yi: "离、震", theme: "意志、事业、行动" },
    { id: "cups", name: "圣杯", elem: "水", yi: "坎、兑", theme: "情感、关系、直觉" },
    { id: "swords", name: "宝剑", elem: "风", yi: "巽、乾", theme: "思维、冲突、决策" },
    { id: "pentacles", name: "星币", elem: "土", yi: "坤、艮", theme: "物质、身体、工作成果" }
  ];

  const PIP = [
    ["一", "开始、种子、单纯的力量。", "延迟开始、方向空洞。"],
    ["二", "二元、选择、初步平衡。", "僵持、优柔、失衡。"],
    ["三", "成长、协作、初果。", "协作破裂、成果推迟。"],
    ["四", "稳固、边界、基础。", "停滞、封闭、不稳。"],
    ["五", "冲突、失落、挑战。", "冲突缓和或拒绝面对。"],
    ["六", "流动、往来、过渡的和谐。", "交流受阻、怀旧困住。"],
    ["七", "评估、坚持、策略。", "放弃、混乱、无策。"],
    ["八", "加速、精通在即、移动。", "迟缓、内耗、迷途。"],
    ["九", "接近完成、压力或满足。", "力竭、未满、焦虑。"],
    ["十", "周期完成、满盈或负担。", "未完、卸负、结构将散。"]
  ];

  const COURTS = [
    ["侍从", "消息、学习、初试。", "不成熟、谣言、迟迟不学。"],
    ["骑士", "行动、追求、旅途。", "冲动、耽搁、方向乱。"],
    ["皇后", "成熟之养、内在掌握。", "情绪化、控制、养分不足。"],
    ["国王", "外在权威、领域之主。", "暴政、无能、权威失落。"]
  ];

  function buildDeck() {
    const deck = [];
    MAJORS.forEach((c) => {
      deck.push({
        id: "M" + c.n,
        arcana: "major",
        name: c.name,
        en: c.en,
        glyph: c.glyph,
        suit: null,
        yi: c.yi,
        up: c.up,
        rev: c.rev
      });
    });
    const pipUp = {
      wands: ["灵感点火", "规划与选择", "初成团队", "庆祝稳固", "竞争摩擦", "胜利移动", "守住阵地", "快速进展", "强弩之末的坚持", "负担或完成"],
      cups: ["情感敞开", "连接与选择", "友谊庆贺", "冷淡或自守", "失望", "怀旧馈赠", "幻想选择", "离开旧情", "满足独处", "家庭圆满"],
      swords: ["真理之念", "僵局两难", "心碎之言", "休息疗愈", "胜而不荣", "过渡离开", "投机取巧", "束缚焦虑", "夜醒忧思", "结束刀兵"],
      pentacles: ["物质机会", "权衡资源", "技艺协作", "守财", "困顿失落", "馈赠援助", "长线耕耘", "精工勤奋", "花园自足", "家族财富"]
    };
    const pipRev = {
      wands: ["虚火", "怕选", "内讧", "根基虚", "无谓争", "途穷", "放弃", "慌乱", "崩溃", "压垮"],
      cups: ["情感封闭", "关系不稳", "庆贺成空", "开放过度", "走不出", "困在过去", "沉溺幻想", "逃而不决", "自满或空虚", "家庭裂"],
      swords: ["真相逃避", "假平衡", "言语伤人未愈", "失眠难休", "愧疚纠缠", "滞留", "诡计败露", "自我设限", "焦虑峰", "未结束的刀"],
      pentacles: ["机会流失", "财务失衡", "合作散", "吝啬或散尽", "穷途", "援助不到", "急功近利", "匠气或怠工", "安全感假象", "遗产纠葛"]
    };

    SUITS.forEach((s) => {
      for (let i = 1; i <= 10; i++) {
        deck.push({
          id: s.id + i,
          arcana: "minor",
          name: s.name + PIP[i - 1][0],
          en: `${i} of ${s.id}`,
          glyph: String(i),
          suit: s,
          yi: s.yi,
          up: pipUp[s.id][i - 1] + "。" + PIP[i - 1][1],
          rev: pipRev[s.id][i - 1] + "。" + PIP[i - 1][2]
        });
      }
      COURTS.forEach((ct, idx) => {
        deck.push({
          id: s.id + "C" + idx,
          arcana: "court",
          name: s.name + ct[0],
          en: ct[0] + " of " + s.name,
          glyph: ct[0][0],
          suit: s,
          yi: s.yi,
          up: `${s.theme}之${ct[0]}：${ct[1]}`,
          rev: `${s.theme}之${ct[0]}逆：${ct[2]}`
        });
      });
    });
    return deck;
  }

  const DECK = buildDeck();

  const SPREADS = {
    one: {
      id: "one",
      name: "单张",
      kind: "simple",
      desc: "一事一问，看核心能量。宜日常、是非之机。",
      positions: [{ id: "core", name: "核心", hint: "此事当下的主气" }]
    },
    three: {
      id: "three",
      name: "三张 · 过去现在未来",
      kind: "simple",
      desc: "线性时间轴。问一件事的来龙去脉。",
      positions: [
        { id: "past", name: "过去", hint: "根由、已发生" },
        { id: "present", name: "现在", hint: "当下态势" },
        { id: "future", name: "未来", hint: "可能走向（非宿命）" }
      ]
    },
    situation: {
      id: "situation",
      name: "三张 · 情境行动结果",
      kind: "simple",
      desc: "怎么办。宜抉择、行动。",
      positions: [
        { id: "sit", name: "情境", hint: "局面本身" },
        { id: "act", name: "行动", hint: "宜采取" },
        { id: "out", name: "结果", hint: "可能收场" }
      ]
    },
    choice: {
      id: "choice",
      name: "二选一",
      kind: "complex",
      desc: "A / B 两条路各两张（状况+结果），中间为建议。须先写明两案。",
      positions: [
        { id: "a1", name: "A·状况", hint: "方案甲之现状" },
        { id: "a2", name: "A·结果", hint: "走甲的可能" },
        { id: "adv", name: "建议", hint: "更高一层的劝告" },
        { id: "b1", name: "B·状况", hint: "方案乙之现状" },
        { id: "b2", name: "B·结果", hint: "走乙的可能" }
      ]
    },
    relationship: {
      id: "relationship",
      name: "关系六张",
      kind: "complex",
      desc: "你、对方、关系本身、助力、阻力、走向。",
      positions: [
        { id: "you", name: "我", hint: "求问者" },
        { id: "other", name: "对方", hint: "另一人" },
        { id: "bond", name: "关系", hint: "连接的性质" },
        { id: "help", name: "助力", hint: "可依靠" },
        { id: "block", name: "阻力", hint: "须正视" },
        { id: "path", name: "走向", hint: "关系可能的路" }
      ]
    },
    horseshoe: {
      id: "horseshoe",
      name: "马蹄七张",
      kind: "complex",
      desc: "过去、现在、隐因、自己、环境、建议、结果。",
      positions: [
        { id: "p", name: "过去", hint: "已种之因" },
        { id: "n", name: "现在", hint: "当前" },
        { id: "h", name: "隐因", hint: "未言之事" },
        { id: "s", name: "自身", hint: "态度与状态" },
        { id: "e", name: "环境", hint: "他人与场域" },
        { id: "a", name: "建议", hint: "宜如何" },
        { id: "o", name: "结果", hint: "可能收束" }
      ]
    },
    celtic: {
      id: "celtic",
      name: "凯尔特十字",
      kind: "complex",
      desc: "十张古典大牌阵。宜大事、复杂人事，一事一铺。",
      positions: [
        { id: "c1", name: "1 现状", hint: "此事的核心" },
        { id: "c2", name: "2 挑战", hint: "横亘其上的力量" },
        { id: "c3", name: "3 根底", hint: "深层基础、潜意识" },
        { id: "c4", name: "4 过去", hint: "刚过去、仍作用" },
        { id: "c5", name: "5 冠顶", hint: "可能的最好/意识目标" },
        { id: "c6", name: "6 近未来", hint: "即将显化" },
        { id: "c7", name: "7 自我", hint: "求问者立场" },
        { id: "c8", name: "8 环境", hint: "他人如何看、场域" },
        { id: "c9", name: "9 希望与惧", hint: "内心真正所求所怕" },
        { id: "c10", name: "10 结果", hint: "若此路径延续" }
      ]
    }
  };

  const EVENT_SPREAD = {
    career: ["three", "situation", "celtic"],
    love: ["three", "relationship", "celtic"],
    wealth: ["three", "situation", "horseshoe"],
    health: ["one", "three", "horseshoe"],
    travel: ["three", "situation", "choice"],
    lawsuit: ["situation", "horseshoe", "celtic"],
    exam: ["one", "three", "situation"],
    decision: ["situation", "choice", "celtic"]
  };

  function draw(spreadId) {
    const spread = SPREADS[spreadId];
    if (!spread) throw new Error("未知牌阵");
    const order = shuffle(DECK);
    const cards = spread.positions.map((pos, i) => {
      const card = order[i];
      const reversed = randInt(2) === 1;
      return {
        pos,
        card,
        reversed,
        text: reversed ? card.rev : card.up
      };
    });
    return { spread, cards };
  }

  function summarize(reading, question, eventId) {
    const majors = reading.cards.filter((c) => c.card.arcana === "major");
    const revs = reading.cards.filter((c) => c.reversed).length;
    const yiEcho = [...new Set(reading.cards.map((c) => c.card.yi).filter(Boolean))];
    const lines = [];
    lines.push(`牌阵「${reading.spread.name}」共 ${reading.cards.length} 张，大阿尔克那 ${majors.length} 张，逆位 ${revs} 张。`);
    if (majors.length >= Math.ceil(reading.cards.length / 2)) {
      lines.push("大事、命运级主题较重，宜看长期结构，勿只盯细节。");
    } else {
      lines.push("小牌为主，多在日常、心态与具体步骤。");
    }
    if (revs > reading.cards.length / 2) {
      lines.push("逆位偏多：内化、阻滞或需换角度看，未必皆凶。");
    }
    const core = reading.cards[0];
    if (core) {
      lines.push(`起手「${core.card.name}」${core.reversed ? "（逆）" : "（正）"}：${core.text}`);
    }
    if (yiEcho.length) {
      lines.push(`易理对照线索：${yiEcho.join("；")}。可同题起一卦，观象而不对号入座。`);
    }
    return { lines, yiEcho, majors: majors.length, revs };
  }

  function compareWithYi(tarotReading, yiResult) {
    if (!yiResult || !yiResult.bengua) return null;
    const gua = yiResult.bengua.name;
    const echo = tarotReading.cards.map((c) => c.card.yi).join("、");
    const lines = [
      `易之本卦「${gua}」：${yiResult.bengua.guaCi}`,
      `塔罗诸牌所唤易象：${echo}。`,
      "对照法：塔罗说心理与象征故事，易卦说时位与体用。二者同向则信，相悖则事体未明，宜止占。"
    ];
    if (yiResult.classical && yiResult.classical.primaryText) {
      lines.push(`易之主断辞：${yiResult.classical.primaryText}`);
    }
    return lines;
  }

  window.TarotOracle = {
    DECK,
    SPREADS,
    SUITS,
    EVENT_SPREAD,
    draw,
    summarize,
    compareWithYi,
    shuffle,
    randInt
  };
})();
