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

  document.addEventListener("DOMContentLoaded", () => {
    initAtmosphere();
    initTabs();
    fillNow("ctx");
    initEvents();
    renderMethods();
    initClassic();
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
