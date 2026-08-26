(function () {
  const Yi = window.YiDivination;
  const Viz = window.YiViz;
  const LINE_NAMES = window.LINE_NAMES;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  let selectedEvent = "decision";
  let selectedMethod = null;

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
          <p class="eyebrow">${result.methodMeta.name} · ${rd.event.name}</p>
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

    setRitualStep(4);
    mount.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validateForMethod(method, ctx) {
    if (!$("#sincerity-check").checked) {
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

  async function runCast() {
    const ctx = readContext();
    const err = validateForMethod(selectedMethod, ctx);
    if (err) {
      alert(err);
      return;
    }

    setRitualStep(3);
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
      renderFullResult(result, mount);
    });
  }

  function resetCast() {
    selectedEvent = "decision";
    selectedMethod = null;
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

  document.addEventListener("DOMContentLoaded", () => {
    initAtmosphere();
    initTabs();
    fillNow("ctx");
    initEvents();
    renderMethods();
    initClassic();
    initComplex();
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
