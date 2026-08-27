(function () {
  const Yi = window.YiDivination;
  const Viz = window.YiViz;
  const LINE_NAMES = window.LINE_NAMES;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  let selectedEvent = "decision";
  let selectedMethod = null;
  let yiSession = window.YiSession.create("yi");
  let tarotSession = window.YiSession.create("tarot");
  let lastYiResult = null;
  let lastTarot = null;
  let selectedTarotEvent = "decision";
  let selectedSpreadKind = "simple";
  let selectedSpread = "three";

  function setRitualStep(n) {
    $$("#ritual-steps li").forEach((li) => {
      const s = Number(li.dataset.step);
      li.classList.toggle("active", s === n);
      li.classList.toggle("done", s < n);
    });
  }

  function updateShichenHint() {
    const h = parseInt($("#ctx-hour").value, 10);
    if (isNaN(h)) {
      $("#shichen-hint").textContent = "";
      return;
    }
    const sc = Yi.hourToShichen(h);
    const name = Yi.SHICHEN_NAMES[sc - 1];
    $("#shichen-hint").textContent = `对应十二时辰：${name}时（序 ${sc}）`;
  }

  function initAtmosphere() {
    if (window.BaguaField) {
      window.BaguaField.createBaguaField($("#bagua-field"));
    }
  }

  function initTabs() {
    $$(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        $$(".tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const id = tab.dataset.panel;
        $$(".panel").forEach((p) => p.classList.remove("active"));
        $(`#${id}-panel`).classList.add("active");
      });
    });
  }

  function fillNow(prefix) {
    const now = new Date();
    if (prefix === "ctx") {
      $("#ctx-year").value = now.getFullYear();
      $("#ctx-month").value = now.getMonth() + 1;
      $("#ctx-day").value = now.getDate();
      $("#ctx-hour").value = now.getHours();
      updateShichenHint();
    } else {
      $("#mh-year").value = now.getFullYear();
      $("#mh-month").value = now.getMonth() + 1;
      $("#mh-day").value = now.getDate();
      $("#mh-hour").value = now.getHours();
    }
  }

  function readContext() {
    return {
      year: $("#ctx-year").value,
      month: $("#ctx-month").value,
      day: $("#ctx-day").value,
      hour: $("#ctx-hour").value,
      place: $("#ctx-place").value.trim(),
      direction: $("#ctx-direction").value,
      personName: $("#ctx-person").value.trim(),
      personAge: $("#ctx-age").value,
      personRole: $("#ctx-role").value,
      otherName: $("#ctx-other").value.trim(),
      question: $("#ctx-question").value.trim(),
      num1: $("#ctx-num1").value,
      num2: $("#ctx-num2").value
    };
  }

  function initEvents() {
    const grid = $("#event-grid");
    grid.innerHTML = Object.values(Yi.EVENT_TYPES)
      .map(
        (ev) => `
      <button type="button" class="event-card ${ev.id === selectedEvent ? "selected" : ""}" data-id="${ev.id}">
        <span class="event-icon">${ev.icon}</span>
        <span class="event-name">${ev.name}</span>
        <span class="event-desc">${ev.desc}</span>
      </button>`
      )
      .join("");

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".event-card");
      if (!card) return;
      selectedEvent = card.dataset.id;
      $$(".event-card").forEach((c) => c.classList.toggle("selected", c === card));
      setRitualStep(1);
      renderMethods();
    });
  }

  function renderMethods() {
    const preferred = Yi.recommendMethods(selectedEvent);
    const preferredIds = preferred.map((m) => m.id);
    if (!selectedMethod || !preferredIds.includes(selectedMethod)) {
      selectedMethod = preferredIds[0];
    }

    const all = Object.values(Yi.METHOD_META);
    $("#method-list").innerHTML = all
      .map((m) => {
        const rec = preferredIds.includes(m.id);
        return `
        <button type="button" class="method-item ${m.id === selectedMethod ? "selected" : ""} ${rec ? "recommended" : ""}" data-id="${m.id}">
          <span class="method-radio"></span>
          <span class="method-body">
            <strong>${m.name}${rec ? '<span class="tag">宜此法</span>' : ""}</strong>
            <span>${m.reason}</span>
          </span>
        </button>`;
      })
      .join("");

    const ev = Yi.EVENT_TYPES[selectedEvent];
    $("#method-hint").textContent = `问「${ev.name}」：${ev.focus}`;
    $("#number-fields").classList.toggle("hidden", selectedMethod !== "meihua_number");

    $("#method-list").onclick = (e) => {
      const item = e.target.closest(".method-item");
      if (!item) return;
      selectedMethod = item.dataset.id;
      $$(".method-item").forEach((el) => el.classList.toggle("selected", el === item));
      $("#number-fields").classList.toggle("hidden", selectedMethod !== "meihua_number");
      setRitualStep(3);
    };
  }

  function renderYao(line, moving) {
    const cls = ["yao", line.yin ? "yin" : "yang"];
    if (moving) cls.push("moving");
    return `<span class="${cls.join(" ")}"></span>`;
  }

  function renderGuaTextCard(title, hex, binary, lines, movingSet, showMoving) {
    if (!hex) {
      return `<div class="result-card"><h3>${title}</h3><p>未匹配卦象 ${binary}</p></div>`;
    }
    const actual = lines || Yi.binaryToLines(binary, movingSet);
    let movingHtml = "";
    if (showMoving) {
      const mov = [];
      actual.forEach((l, i) => {
        if (l.moving || (movingSet && movingSet.has(i))) mov.push({ idx: i, line: l });
      });
      if (mov.length) {
        movingHtml = `
          <div class="divider"></div>
          <div class="text-block">
            <h4>动爻爻辞</h4>
            <ul class="yao-list">
              ${mov
                .map(
                  (m) => `<li>
                <span class="yao-highlight">${LINE_NAMES[m.idx]} ${Yi.lineLabel(m.idx, m.line.yin)}</span>
                ：${hex.yaoCi[m.idx]}
              </li>`
                )
                .join("")}
            </ul>
          </div>`;
      }
    }
    return `
      <div class="result-card">
        <h3>${title} · ${hex.no}. ${hex.name}</h3>
        <p class="verdict-sub">${hex.fullName} · 上${hex.upper}下${hex.lower}</p>
        <div class="text-block"><h4>卦辞</h4><p>${hex.guaCi}</p></div>
        <div class="text-block"><h4>大象</h4><p>${hex.daXiang}</p></div>
        ${movingHtml}
      </div>`;
  }

  function renderAskDots(session) {
    return `<div class="ask-meter" aria-label="筮次">${[1, 2, 3]
      .map(
        (i) =>
          `<span class="ask-dot ${i <= session.count ? "on" : ""} ${
            session.locked && i === 3 ? "lock" : ""
          }"></span>`
      )
      .join("")}</div>`;
  }

  function renderLocalOracleCard(result) {
    const loc = result.reading && result.reading.local;
    if (!loc) return "";
    const notes = (loc.localNotes || []).map((n) => `<p class="verdict-sub">${n}</p>`).join("");
    const bian =
      result.reading.localBian && result.biangua
        ? `<p class="verdict-sub">之卦「${result.biangua.name}」：${result.reading.localBian.eventText}</p>`
        : "";
    return `
      <div class="result-card local-oracle">
        <h3>因地制宜 · ${result.bengua ? result.bengua.name : ""}</h3>
        <p class="event-line">${loc.eventText}</p>
        ${bian}
        ${notes}
        <p class="hint">辞随事类与风土而转，不可执死辞以概天下。</p>
      </div>`;
  }

  function renderFollowUpCard(session) {
    if (!session || session.count < 1) return "";
    const hist = `<ol class="followup-history">${session.history
      .map(
        (q, i) =>
          `<li>${i === 0 ? "初筮" : i === 1 ? "再筮" : "三筮"}：${q}</li>`
      )
      .join("")}</ol>`;
    if (session.locked || session.count >= 3) {
      return `
        <div class="result-card followup-card locked">
          <h3>渎则不告</h3>
          <p>《蒙》：初筮告，再三渎，渎则不告。此事三筮已终，宜玩已得之象，勿再占。</p>
          ${renderAskDots(session)}
          ${hist}
        </div>`;
    }
    const nextLabel = session.count === 1 ? "再筮" : "三筮（末）";
    return `
      <div class="result-card followup-card">
        <h3>追问 · ${nextLabel} <span class="session-label">事不过三</span></h3>
        <p>若象未明，可就<strong>同一件事</strong>再问一层。再筮只为澄清，不可推翻初象。</p>
        ${renderAskDots(session)}
        ${hist}
        <label class="sincerity">
          <input type="checkbox" class="fu-same">
          <span>此问仍属「${session.rootQuestion}」同一件事，不为另事。</span>
        </label>
        <label class="q-label">追问（换一层问法，勿复述原句）
          <input type="text" class="fu-q" placeholder="例：对方态度如何？ / 宜守还是宜进？">
        </label>
        <div class="cast-actions">
          <button type="button" class="btn primary fu-go">${nextLabel}</button>
          <button type="button" class="btn ghost fu-seal">了结此事</button>
        </div>
      </div>`;
  }
  function renderClassicalCard(classical) {
    if (!classical) return "";
    return `
      <div class="result-card">
        <h3>观象玩辞 · 动爻法则</h3>
        <p>${classical.rule}</p>
        ${
          classical.primaryText
            ? `<div class="text-block"><h4>主断辞</h4><p>${classical.primaryText}</p></div>`
            : ""
        }
        <div class="text-block">
          <h4>所重之辞</h4>
          ${(classical.focus || [])
            .map(
              (f) =>
                `<div class="focus-item"><span class="focus-kind">${f.kind}</span><span>${f.text}</span></div>`
            )
            .join("")}
        </div>
      </div>`;
  }

  function renderFullResult(result, mount) {
    const ctx = result.context;
    const ty = result.tiYong;
    const rd = result.reading;
    const movingSet = new Set((result.moving || []).map((m) => m - 1));
    const bianguaLines = Yi.binaryToLines(result.bianguaBinary);

    mount.innerHTML = `
      <div class="result-card oracle-banner">
        <div>
          <p class="eyebrow">${result.methodMeta.name} · ${rd.event.name}${
            result.context && result.context.askLabel
              ? ` · ${result.context.askLabel}`
              : ""
          }</p>
          <h2 class="verdict-title">${rd.verdict}</h2>
          <p class="verdict-sub">${ctx.question ? "所问：" + ctx.question + " · " : ""}${ctx.seasonNote}</p>
          <div class="chips">
            <span class="chip">${ctx.year}-${ctx.month}-${ctx.day} ${ctx.shichenName}时</span>
            ${ctx.place ? `<span class="chip">地：${ctx.place}</span>` : ""}
            ${ctx.direction ? `<span class="chip">方：${ctx.direction}</span>` : ""}
            ${ctx.personName ? `<span class="chip">人：${ctx.personName}</span>` : ""}
            ${ctx.otherName ? `<span class="chip">彼：${ctx.otherName}</span>` : ""}
            <span class="chip">动爻 ${result.moving.length} 处</span>
          </div>
        </div>
        <div id="meter-host"></div>
      </div>

      <div class="result-card">
        <h3>卦气显现</h3>
        <div class="gua-pair">
          <div class="gua-viz-card">
            <div id="svg-ben"></div>
            <div class="name">本卦（贞）· ${result.bengua ? result.bengua.name : "?"}</div>
            <div class="meta">${result.bengua ? result.bengua.fullName : ""}</div>
          </div>
          <div class="gua-viz-card">
            <div id="svg-bian"></div>
            <div class="name">之卦（悔）· ${result.biangua ? result.biangua.name : "?"}</div>
            <div class="meta">${result.biangua ? result.biangua.fullName : ""}</div>
          </div>
        </div>
        ${result.detail ? `<p class="verdict-sub" style="margin-top:12px">起卦：${result.detail}</p>` : ""}
      </div>

      ${renderClassicalCard(result.classical)}

      ${renderLocalOracleCard(result)}

      <div class="result-card">
        <h3>体用生克</h3>
        <p>体 <strong style="color:#fff">${ty.tiName}</strong>（${ty.ti}·${ty.tiNature}）
           · 用 <strong style="color:#bbb">${ty.yongName}</strong>（${ty.yong}·${ty.yongNature}）
           → <strong>${ty.relation}</strong></p>
        <p class="verdict-sub">${ty.rule}</p>
        <p>${ty.luck.text}</p>
        <p class="verdict-sub">${rd.event.bodyRole}</p>
      </div>

      <div class="result-card">
        <h3>事类断语</h3>
        <ul class="reading-list">
          ${rd.lines.map((l) => `<li>${l}</li>`).join("")}
        </ul>
      </div>

      ${renderGuaTextCard("本卦详解", result.bengua, result.binary, result.lines, movingSet, true)}
      ${renderGuaTextCard("之卦详解", result.biangua, result.bianguaBinary, bianguaLines, new Set(), false)}
      ${mount.id === "cast-result" ? renderFollowUpCard(yiSession) : ""}
    `;

    const meter = mount.querySelector("#meter-host");
    const svgBen = mount.querySelector("#svg-ben");
    const svgBian = mount.querySelector("#svg-bian");
    Viz.renderWuXingMeter(meter, ty, rd.score);
    Viz.renderHexagramSVG(svgBen, result.lines, { movingSet, width: 140, height: 180 });
    Viz.renderHexagramSVG(svgBian, bianguaLines, {
      movingSet: new Set(),
      width: 140,
      height: 180,
      color: "#9a9a9a"
    });

    bindYiFollowUp(mount);
    setRitualStep(4);
    mount.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindYiFollowUp(mount) {
    const box = mount.querySelector(".followup-card");
    if (!box) return;
    const sealBtn = box.querySelector(".fu-seal");
    const goBtn = box.querySelector(".fu-go");
    if (sealBtn) {
      sealBtn.onclick = () => {
        window.YiSession.seal(yiSession);
        if (lastYiResult) renderFullResult(lastYiResult, mount);
      };
    }
    if (goBtn) {
      goBtn.onclick = () => {
        const q = (box.querySelector(".fu-q") || {}).value || "";
        const same = !!(box.querySelector(".fu-same") && box.querySelector(".fu-same").checked);
        runYiFollowUp(q.trim(), same);
      };
    }
  }

  function validateForMethod(method, ctx, opts) {
    if (!(opts && opts.skipSincerity) && !$("#sincerity-check").checked) {
      return "请先勾选「净心立问」诚意确认（一事一占）。";
    }
    if (!ctx.question) {
      return "请写下所问之事，问事宜专一明确。";
    }
    if (!ctx.year || !ctx.month || !ctx.day || ctx.hour === "" || isNaN(Number(ctx.hour))) {
      return "请完整填写天时（年月日时）。";
    }
    if (method === "meihua_person" && !ctx.personName) {
      return "人物梅花需填写求问者姓名。";
    }
    if (method === "meihua_direction" && !ctx.direction) {
      return "方位梅花需选择方位。";
    }
    if (method === "meihua_number" && (!ctx.num1 || !ctx.num2)) {
      return "报数梅花请填写两个数字。";
    }
    return null;
  }

  function performYiCast(ctx) {
    const stage = $("#coin-stage");
    const mount = $("#cast-result");
    mount.innerHTML = "";
    Viz.playRitual(async () => {
      let result;
      if (selectedMethod === "liuyao") {
        stage.hidden = false;
        stage.innerHTML = "";
        const lines = [];
        for (let i = 0; i < 6; i++) {
          const line = Yi.castLine();
          await Viz.animateCoins(stage, line, 750);
          lines.push(line);
          await new Promise((r) => setTimeout(r, 180));
        }
        result = Yi.divinate("liuyao", selectedEvent, ctx, { lines });
        setTimeout(() => {
          stage.hidden = true;
        }, 600);
      } else {
        stage.hidden = true;
        result = Yi.divinate(selectedMethod, selectedEvent, ctx);
      }
      lastYiResult = result;
      renderFullResult(result, mount);
    });
  }

  async function runCast() {
    if (yiSession.count > 0) {
      alert("此事已起卦。请用结果下方追问澄清，或重置后另立新问。");
      return;
    }
    const ctx = readContext();
    const err = validateForMethod(selectedMethod, ctx);
    if (err) {
      alert(err);
      return;
    }
    const gate = window.YiSession.ask(yiSession, ctx.question, selectedEvent);
    if (!gate.ok) {
      alert(gate.message);
      return;
    }
    ctx.askIndex = gate.index;
    ctx.askLabel = gate.label;
    setRitualStep(3);
    performYiCast(ctx);
  }

  function runYiFollowUp(question, sameMatter) {
    const ctx = readContext();
    ctx.question = question;
    const err = validateForMethod(selectedMethod, ctx, { skipSincerity: true });
    if (err) {
      alert(err);
      return;
    }
    const gate = window.YiSession.ask(yiSession, question, selectedEvent, {
      sameMatterConfirmed: sameMatter
    });
    if (!gate.ok) {
      alert(gate.message);
      return;
    }
    ctx.askIndex = gate.index;
    ctx.askLabel = gate.label;
    setRitualStep(3);
    performYiCast(ctx);
  }

  function resetCast() {
    selectedEvent = "decision";
    selectedMethod = null;
    yiSession = window.YiSession.create("yi");
    lastYiResult = null;
    $("#cast-result").innerHTML = "";
    $("#coin-stage").hidden = true;
    $("#sincerity-check").checked = false;
    $("#ctx-question").value = "";
    $("#context-form").reset();
    fillNow("ctx");
    initEvents();
    renderMethods();
    setRitualStep(1);
  }

  let liuYaoLines = [];

  function resetLiuYao() {
    liuYaoLines = [];
    $("#liuyao-tbody").innerHTML = "";
    $("#liuyao-result").innerHTML = "";
    $("#liuyao-status").textContent = "尚未起卦";
    $("#btn-throw-one").disabled = false;
    $("#btn-throw-one").textContent = "逐次手动掷出";
  }

  function addLiuYaoRow(line, position) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${LINE_NAMES[position]}</td>
      <td>${line.coins[0] === 2 ? "字" : "背"}</td>
      <td>${line.coins[1] === 2 ? "字" : "背"}</td>
      <td>${line.coins[2] === 2 ? "字" : "背"}</td>
      <td>${line.sum}</td>
      <td>${renderYao(line, line.moving)}</td>
      <td>${line.type}</td>`;
    $("#liuyao-tbody").appendChild(tr);
  }

  function showClassicLiuYao() {
    const now = new Date();
    const ctx = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      question: "古典六爻"
    };
    const result = Yi.divinate("liuyao", "decision", ctx, { lines: liuYaoLines });
    renderFullResult(result, $("#liuyao-result"));
  }

  function initClassic() {
    $("#btn-throw-all").addEventListener("click", () => {
      resetLiuYao();
      liuYaoLines = Yi.castLiuYao();
      liuYaoLines.forEach((l, i) => addLiuYaoRow(l, i));
      $("#liuyao-status").textContent = "六次已毕";
      showClassicLiuYao();
    });

    $("#btn-throw-one").addEventListener("click", () => {
      if (liuYaoLines.length >= 6) return;
      const line = Yi.castLine();
      liuYaoLines.push(line);
      addLiuYaoRow(line, liuYaoLines.length - 1);
      $("#liuyao-status").textContent = `已掷 ${liuYaoLines.length}/6`;
      if (liuYaoLines.length >= 6) {
        $("#btn-throw-one").disabled = true;
        $("#btn-throw-one").textContent = "已完成";
        showClassicLiuYao();
      }
    });

    $("#btn-reset-liuyao").addEventListener("click", resetLiuYao);

    fillNow("mh");
    $("#btn-now").addEventListener("click", () => fillNow("mh"));
    $("#meihua-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const ctx = {
        year: $("#mh-year").value,
        month: $("#mh-month").value,
        day: $("#mh-day").value,
        hour: $("#mh-hour").value,
        question: $("#mh-question").value.trim() || "时间梅花"
      };
      const result = Yi.divinate("meihua_time", "decision", ctx);
      renderFullResult(result, $("#meihua-result"));
    });
  }

  /* ---------- 复杂问事 ---------- */
  let selectedScenario = "relocate";

  function syncComplexFields() {
    const sc = window.YiComplex.SCENARIOS[selectedScenario];
    const isCustom = sc.optionSource === "custom";
    $("#cx-custom-wrap").classList.toggle("hidden", !isCustom);
    // 迁居显示区域；自定义名单隐藏缩圈区；其余保留标签/上限
    if (isCustom) {
      $("#cx-region-wrap").classList.add("hidden");
    } else {
      $("#cx-region-wrap").classList.remove("hidden");
    }
  }

  function fillComplexNow() {
    const now = new Date();
    $("#cx-y").value = now.getFullYear();
    $("#cx-m").value = now.getMonth() + 1;
    $("#cx-d").value = now.getDate();
    $("#cx-h").value = now.getHours();
    if (!$("#cx-by").value) {
      $("#cx-by").value = 1998;
      $("#cx-bm").value = 6;
      $("#cx-bd").value = 15;
      $("#cx-bh").value = 10;
    }
  }

  function renderScenarioGrid() {
    const Cx = window.YiComplex;
    const grid = $("#complex-scenario-grid");
    grid.innerHTML = Object.values(Cx.SCENARIOS)
      .map(
        (sc) => `
      <button type="button" class="event-card ${sc.id === selectedScenario ? "selected" : ""}" data-id="${sc.id}">
        <span class="event-icon">${sc.icon}</span>
        <span class="event-name">${sc.name}</span>
        <span class="event-desc">${sc.desc}</span>
      </button>`
      )
      .join("");
  }

  function initComplex() {
    const Cx = window.YiComplex;
    if (!Cx) return;

    renderScenarioGrid();
    fillComplexNow();
    syncComplexFields();

    $("#complex-scenario-grid").addEventListener("click", (e) => {
      const card = e.target.closest(".event-card");
      if (!card) return;
      selectedScenario = card.dataset.id;
      $$("#complex-scenario-grid .event-card").forEach((c) =>
        c.classList.toggle("selected", c === card)
      );
      syncComplexFields();
    });

    $("#cx-fill-now").addEventListener("click", fillComplexNow);
    $("#cx-reset").addEventListener("click", () => {
      $("#complex-form").reset();
      $("#complex-bazi").innerHTML = "";
      $("#complex-result").innerHTML = "";
      selectedScenario = "relocate";
      renderScenarioGrid();
      fillComplexNow();
      syncComplexFields();
    });

    $("#complex-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!$("#cx-sincerity").checked) {
        alert("请先确认：每一候选单独起卦。");
        return;
      }
      const name = $("#cx-name").value.trim();
      if (!name) {
        alert("请填写姓名（入梅花成数）。");
        return;
      }
      const sc = Cx.SCENARIOS[selectedScenario];
      if (sc.optionSource === "custom" && !$("#cx-custom").value.trim()) {
        alert("请填写自定义候选名单（至少 2 个）。");
        return;
      }

      const form = {
        personName: name,
        personAge: $("#cx-age").value,
        goal: $("#cx-goal").value.trim(),
        birth: {
          year: $("#cx-by").value,
          month: $("#cx-bm").value,
          day: $("#cx-bd").value,
          hour: $("#cx-bh").value
        },
        year: $("#cx-y").value,
        month: $("#cx-m").value,
        day: $("#cx-d").value,
        hour: $("#cx-h").value,
        region: $("#cx-region").value,
        focusTag: $("#cx-tag").value.trim(),
        maxCandidates: parseInt($("#cx-max").value, 10) || 5,
        customText: $("#cx-custom").value
      };

      Viz.playRitual(() => {
        try {
          const out = Cx.compareComplex(selectedScenario, form);
          renderComplexBazi(out.chart);
          renderComplexResult(out);
        } catch (err) {
          alert(err.message || String(err));
        }
      });
    });
  }

  function renderComplexBazi(chart) {
    const mount = $("#complex-bazi");
    if (!chart) {
      mount.innerHTML = "";
      return;
    }
    mount.innerHTML = `
      <div class="result-card">
        <h3>八字简盘（缩圈辅助）</h3>
        <p>${chart.summary}</p>
        <div class="bazi-pillars">
          <span>年 ${chart.pillars.year}</span>
          <span>月 ${chart.pillars.month}</span>
          <span>日 ${chart.pillars.day}</span>
          <span>时 ${chart.pillars.hour}</span>
        </div>
        <p class="verdict-sub" style="margin-top:10px">喜用五行：${chart.gods.xi.join("、")} · 宜方：${chart.xiDirs.join("、") || "不拘"}</p>
        <p class="hint">此盘节气取近似，只用于筛候选；各案吉凶以卦象体用与玩辞为准。</p>
      </div>`;
  }

  function renderComplexResult(out) {
    const mount = $("#complex-result");
    const top = out.top;
    const cards = out.ranked
      .map((row) => {
        const r = row.result;
        const ty = r.tiYong;
        const cl = r.classical;
        return `
        <div class="rank-card ${row.rank === 1 ? "top" : ""}">
          <div class="rank-head">
            <div class="rank-title">第 ${row.rank} · ${row.option.name}
              <span class="tag">${row.verdict}</span>
            </div>
            <div class="rank-score">综合 ${row.finalScore}（卦 ${row.guaScore}）</div>
          </div>
          <div class="rank-meta">
            ${(row.option.region ? row.option.region + " · " : "")}${row.option.dir || ""}${row.option.wx ? " · " + row.option.wx : ""}
            ${(row.option.tags || []).length ? " · " + row.option.tags.join("/") : ""}
          </div>
          <p class="verdict-sub">所问：${row.question}</p>
          <div class="text-block">
            <h4>本卦 → 之卦</h4>
            <p>${r.bengua ? r.bengua.name + "（" + r.bengua.fullName + "）" : "?"}
              → ${r.biangua ? r.biangua.name + "（" + r.biangua.fullName + "）" : "?"}</p>
          </div>
          <div class="text-block">
            <h4>体用</h4>
            <p>体 ${ty.tiName}（${ty.ti}）· 用 ${ty.yongName}（${ty.yong}）→ ${ty.relation}。${ty.luck.text}</p>
          </div>
          <div class="text-block">
            <h4>玩辞</h4>
            <p>${cl ? cl.rule : ""}</p>
            <p>${cl && cl.primaryText ? "主断辞：" + cl.primaryText : ""}</p>
          </div>
          ${
            window.YiOracleText && r.bengua
              ? `<div class="text-block"><h4>因地制宜</h4><p>${
                  (window.YiOracleText.getLocalOracle(r.bengua, out.scenario.eventId || "decision", {
                    place: row.option.name,
                    direction: row.option.dir
                  }) || {}).eventText || ""
                }</p></div>`
              : ""
          }
        </div>`;
      })
      .join("");

    mount.innerHTML = `
      <div class="result-card">
        <h3>${out.scenario.name} · 逐案比较结果</h3>
        <p>${out.principle}</p>
        <p class="verdict-sub">起卦天时：${out.castTime}</p>
        ${
          top
            ? `<p class="verdict-title" style="font-size:1.6rem;margin-top:10px">首选倾向：${top.option.name}</p>`
            : ""
        }
        <p class="hint">${out.caution}</p>
        <div class="chips" style="margin-top:10px">
          ${(out.scenario.tips || []).map((t) => `<span class="chip">${t}</span>`).join("")}
        </div>
      </div>
      <div class="rank-list">${cards}</div>
    `;
    mount.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- 塔罗 ---------- */
  function setTarotStep(n) {
    $$("#tarot-steps li").forEach((li) => {
      const s = Number(li.dataset.step);
      li.classList.toggle("active", s === n);
      li.classList.toggle("done", s < n);
    });
  }

  function renderTarotEvents() {
    const grid = $("#tarot-event-grid");
    if (!grid) return;
    grid.innerHTML = Object.values(Yi.EVENT_TYPES)
      .map(
        (ev) => `
      <button type="button" class="event-card ${ev.id === selectedTarotEvent ? "selected" : ""}" data-id="${ev.id}">
        <span class="event-icon">${ev.icon}</span>
        <span class="event-name">${ev.name}</span>
        <span class="event-desc">${ev.desc}</span>
      </button>`
      )
      .join("");
  }

  function recommendedSpreads() {
    const T = window.TarotOracle;
    const rec = T.EVENT_SPREAD[selectedTarotEvent] || ["three", "situation", "celtic"];
    return rec;
  }

  function renderTarotSpreads() {
    const T = window.TarotOracle;
    const rec = recommendedSpreads();
    const list = Object.values(T.SPREADS).filter((s) => s.kind === selectedSpreadKind);
    if (!list.some((s) => s.id === selectedSpread)) {
      selectedSpread = list.find((s) => rec.includes(s.id))?.id || list[0].id;
    }
    $("#tarot-spread-list").innerHTML = list
      .map((s) => {
        const isRec = rec.includes(s.id);
        return `
        <button type="button" class="method-item ${s.id === selectedSpread ? "selected" : ""} ${isRec ? "recommended" : ""}" data-id="${s.id}">
          <span class="method-radio"></span>
          <span class="method-body">
            <strong>${s.name}${isRec ? '<span class="tag">宜此阵</span>' : ""}</strong>
            <span>${s.desc}</span>
          </span>
        </button>`;
      })
      .join("");
    $("#tarot-choice-fields").classList.toggle("hidden", selectedSpread !== "choice");
  }

  function renderTarotCard(drawn, delay) {
    const c = drawn.card;
    const cls = ["tarot-card", c.arcana === "major" ? "major" : "minor", drawn.reversed ? "reversed" : ""];
    return `
      <article class="${cls.join(" ")}" style="animation-delay:${delay}s">
        <div class="tarot-card-inner">
          <div class="tarot-glyph">${c.glyph || ""}</div>
          <div class="tarot-name">${c.name}</div>
          <div class="tarot-en">${c.en || ""}</div>
          ${c.suit ? `<div class="tarot-suit">${c.suit.name} · ${c.suit.elem}</div>` : `<div class="tarot-suit">大阿尔克那</div>`}
          <div class="tarot-orient">${drawn.reversed ? "逆位" : "正位"}</div>
        </div>
      </article>`;
  }

  function spreadClass(id) {
    if (id === "celtic") return "tarot-spread spread-celtic";
    return "tarot-spread";
  }

  function renderTarotResult(payload, mount) {
    const { reading, summary, question, eventId, yiCompare, askLabel } = payload;
    const ev = Yi.EVENT_TYPES[eventId] || Yi.EVENT_TYPES.decision;
    const cardsHtml = reading.cards
      .map(
        (d, i) => `
        <div class="tarot-pos">
          <div class="tarot-pos-name">${d.pos.name}</div>
          ${renderTarotCard(d, i * 0.08)}
          <div class="tarot-pos-hint">${d.pos.hint}</div>
        </div>`
      )
      .join("");

    const detail = reading.cards
      .map(
        (d) => `
        <div class="text-block">
          <h4>${d.pos.name} · ${d.card.name}${d.reversed ? "（逆）" : "（正）"}</h4>
          <p>${d.text}</p>
          ${d.card.yi ? `<p class="verdict-sub">易象线索：${d.card.yi}</p>` : ""}
        </div>`
      )
      .join("");

    const yiHtml = yiCompare
      ? `<div class="result-card compare-block">
          <h3>中西对照</h3>
          ${yiCompare.map((l) => `<p class="tarot-reading">${l}</p>`).join("")}
        </div>`
      : "";

    mount.innerHTML = `
      <div class="result-card oracle-banner">
        <div>
          <p class="eyebrow">韦特塔罗 · ${reading.spread.name} · ${ev.name}${askLabel ? " · " + askLabel : ""}</p>
          <h2 class="verdict-title">${reading.spread.name}</h2>
          <p class="verdict-sub">所问：${question}</p>
          <div class="chips">
            <span class="chip">大牌 ${summary.majors}</span>
            <span class="chip">逆位 ${summary.revs}</span>
            ${summary.yiEcho && summary.yiEcho.length ? `<span class="chip">易象 ${summary.yiEcho.join("、")}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="result-card">
        <h3>牌阵</h3>
        <div class="${spreadClass(reading.spread.id)}">${cardsHtml}</div>
      </div>
      <div class="result-card">
        <h3>读牌</h3>
        ${summary.lines.map((l) => `<p class="tarot-reading">${l}</p>`).join("")}
        ${detail}
      </div>
      ${yiHtml}
      ${renderFollowUpCard(tarotSession)}
    `;

    const box = mount.querySelector(".followup-card");
    if (box) {
      const sealBtn = box.querySelector(".fu-seal");
      const goBtn = box.querySelector(".fu-go");
      if (sealBtn) {
        sealBtn.onclick = () => {
          window.YiSession.seal(tarotSession);
          renderTarotResult(lastTarot, mount);
        };
      }
      if (goBtn) {
        goBtn.onclick = () => {
          const q = (box.querySelector(".fu-q") || {}).value || "";
          const same = !!(box.querySelector(".fu-same") && box.querySelector(".fu-same").checked);
          runTarotDraw(q.trim(), { followUp: true, sameMatter: same });
        };
      }
    }
    setTarotStep(yiCompare ? 4 : 3);
    mount.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function runTarotDraw(questionOverride, opts) {
    const T = window.TarotOracle;
    const followUp = !!(opts && opts.followUp);
    if (!followUp && tarotSession.count > 0) {
      alert("此事已铺牌。请用结果下方追问，或重置后另立新问。");
      return;
    }
    if (!followUp && !$("#tarot-sincerity").checked) {
      alert("请先勾选静心确认（一事一铺）。");
      return;
    }
    const q = (questionOverride || $("#tarot-question").value || "").trim();
    if (!q) {
      alert("请写下所问之事。");
      return;
    }
    if (selectedSpread === "choice") {
      const a = $("#tarot-opt-a").value.trim();
      const b = $("#tarot-opt-b").value.trim();
      if (!a || !b) {
        alert("二选一须先写明方案甲、方案乙。");
        return;
      }
    }
    const gate = window.YiSession.ask(tarotSession, q, selectedTarotEvent, {
      sameMatterConfirmed: followUp ? !!(opts && opts.sameMatter) : true
    });
    if (!gate.ok) {
      alert(gate.message);
      return;
    }

    setTarotStep(2);
    Viz.playRitual(() => {
      const reading = T.draw(selectedSpread);
      if (selectedSpread === "choice") {
        const a = $("#tarot-opt-a").value.trim() || "甲";
        const b = $("#tarot-opt-b").value.trim() || "乙";
        reading.cards.forEach((c) => {
          if (c.pos.id.startsWith("a")) c.pos.name = c.pos.name.replace("A", a);
          if (c.pos.id.startsWith("b")) c.pos.name = c.pos.name.replace("B", b);
        });
      }
      const summary = T.summarize(reading, q, selectedTarotEvent);
      let yiCompare = null;
      if ($("#tarot-compare-yi").checked) {
        const now = new Date();
        const yi = Yi.divinate("meihua_time", selectedTarotEvent, {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate(),
          hour: now.getHours(),
          question: q,
          askIndex: gate.index
        });
        yiCompare = T.compareWithYi(reading, yi);
        lastYiResult = yi;
      } else if (lastYiResult && lastYiResult.context && lastYiResult.context.question === q) {
        yiCompare = T.compareWithYi(reading, lastYiResult);
      }
      lastTarot = {
        reading,
        summary,
        question: q,
        eventId: selectedTarotEvent,
        yiCompare,
        askLabel: gate.label
      };
      renderTarotResult(lastTarot, $("#tarot-result"));
    });
  }

  function resetTarot() {
    tarotSession = window.YiSession.create("tarot");
    lastTarot = null;
    selectedTarotEvent = "decision";
    selectedSpreadKind = "simple";
    selectedSpread = "three";
    $("#tarot-result").innerHTML = "";
    $("#tarot-sincerity").checked = false;
    $("#tarot-compare-yi").checked = false;
    $("#tarot-question").value = "";
    $("#tarot-opt-a").value = "";
    $("#tarot-opt-b").value = "";
    $$(".spread-kind .chip-btn").forEach((b) =>
      b.classList.toggle("selected", b.dataset.kind === "simple")
    );
    renderTarotEvents();
    renderTarotSpreads();
    setTarotStep(1);
  }

  function initTarot() {
    if (!window.TarotOracle || !$("#tarot-panel")) return;
    renderTarotEvents();
    renderTarotSpreads();
    setTarotStep(1);

    $("#tarot-event-grid").addEventListener("click", (e) => {
      const card = e.target.closest(".event-card");
      if (!card) return;
      selectedTarotEvent = card.dataset.id;
      $$("#tarot-event-grid .event-card").forEach((c) => c.classList.toggle("selected", c === card));
      renderTarotSpreads();
      setTarotStep(1);
    });

    $$(".spread-kind .chip-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedSpreadKind = btn.dataset.kind;
        $$(".spread-kind .chip-btn").forEach((b) => b.classList.toggle("selected", b === btn));
        renderTarotSpreads();
        setTarotStep(2);
      });
    });

    $("#tarot-spread-list").addEventListener("click", (e) => {
      const item = e.target.closest(".method-item");
      if (!item) return;
      selectedSpread = item.dataset.id;
      renderTarotSpreads();
      setTarotStep(2);
    });

    $("#btn-tarot-draw").addEventListener("click", () => runTarotDraw());
    $("#btn-tarot-reset").addEventListener("click", resetTarot);
    $("#tarot-question").addEventListener("input", () => setTarotStep(1));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAtmosphere();
    initTabs();
    fillNow("ctx");
    initEvents();
    renderMethods();
    initClassic();
    initComplex();
    initTarot();
    setRitualStep(1);

    $("#btn-fill-now").addEventListener("click", () => fillNow("ctx"));
    $("#ctx-hour").addEventListener("input", updateShichenHint);
    $("#btn-cast").addEventListener("click", runCast);
    $("#btn-reset-cast").addEventListener("click", resetCast);

    ["#ctx-year", "#ctx-month", "#ctx-day", "#ctx-place", "#ctx-direction", "#ctx-person"].forEach(
      (sel) => {
        const el = $(sel);
        if (el) el.addEventListener("change", () => setRitualStep(2));
      }
    );
    $("#ctx-question").addEventListener("input", () => setRitualStep(1));
  });
})();
