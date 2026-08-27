/**
 * 玄学可视化：星空、八卦盘、铜钱动画、卦气仪表
 */
(function () {
  function createStars(container, count) {
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "star";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = Math.random() * 4 + "s";
      s.style.animationDuration = 2 + Math.random() * 3 + "s";
      s.style.width = s.style.height = 1 + Math.random() * 2 + "px";
      container.appendChild(s);
    }
  }

  function renderBaguaWheel(el) {
    if (!el) return;
    const names = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    el.innerHTML = `
      <div class="bagua-ring">
        <div class="bagua-core">☯</div>
        ${names
          .map(
            (n, i) =>
              `<span class="bagua-label" style="--a:${angles[i]}deg">${n}</span>`
          )
          .join("")}
      </div>
    `;
  }

  /** 铜钱翻转动画，resolve 为每次掷出的 line */
  function animateCoins(host, line, duration) {
    return new Promise((resolve) => {
      if (!host) {
        resolve(line);
        return;
      }
      host.innerHTML = "";
      host.classList.add("casting");
      const faces = line.coins.map((v) => (v === 2 ? "字" : "背"));
      faces.forEach((f, i) => {
        const coin = document.createElement("div");
        coin.className = "coin flip";
        coin.style.animationDelay = i * 0.12 + "s";
        coin.innerHTML = `
          <div class="coin-inner">
            <div class="coin-face front">銭</div>
            <div class="coin-face back">${f}</div>
          </div>`;
        host.appendChild(coin);
      });
      setTimeout(() => {
        host.classList.remove("casting");
        resolve(line);
      }, duration || 900);
    });
  }

  /** SVG 卦象动态绘制 */
  function renderHexagramSVG(container, lines, opts) {
    opts = opts || {};
    const w = opts.width || 160;
    const h = opts.height || 200;
    const movingSet = opts.movingSet || new Set();
    const pad = 20;
    const gap = (h - pad * 2) / 5;
    const lineW = w - pad * 2;
    const stroke = opts.color || "#e8e8e8";
    const moveColor = opts.moveColor || "#c4a0a0";

    // lines: index 0 = 初爻，绘制时从上到下是上爻→初爻
    const order = [5, 4, 3, 2, 1, 0];
    let paths = "";
    order.forEach((idx, row) => {
      const y = pad + row * gap;
      const l = lines[idx];
      const moving = movingSet.has(idx) || (l && l.moving);
      const col = moving ? moveColor : stroke;
      const yin = l ? l.yin : false;
      if (!yin) {
        paths += `<rect class="yao-bar ${moving ? "pulse" : ""}" x="${pad}" y="${y}" width="${lineW}" height="10" rx="3" fill="${col}"/>`;
      } else {
        const half = (lineW - 16) / 2;
        paths += `<rect class="yao-bar ${moving ? "pulse" : ""}" x="${pad}" y="${y}" width="${half}" height="10" rx="3" fill="${col}"/>`;
        paths += `<rect class="yao-bar ${moving ? "pulse" : ""}" x="${pad + half + 16}" y="${y}" width="${half}" height="10" rx="3" fill="${col}"/>`;
      }
      if (moving) {
        paths += `<text x="${w / 2}" y="${y + 9}" text-anchor="middle" fill="${moveColor}" font-size="11" font-family="serif">○</text>`;
      }
    });

    container.innerHTML = `
      <svg class="hex-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g filter="url(#glow)" class="hex-draw">${paths}</g>
      </svg>`;
  }

  /** 体用五行仪表 */
  function renderWuXingMeter(container, tiYong, score) {
    if (!container || !tiYong) return;
    const wx = ["木", "火", "土", "金", "水"];
    const angles = [270, 342, 54, 126, 198]; // 五角大致分布
    const tiIdx = wx.indexOf(tiYong.ti);
    const yongIdx = wx.indexOf(tiYong.yong);
    const r = 70;
    const cx = 90;
    const cy = 90;

    const points = wx
      .map((name, i) => {
        const a = ((angles[i] - 90) * Math.PI) / 180;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        const isTi = i === tiIdx;
        const isYong = i === yongIdx;
        return `<g>
          <circle cx="${x}" cy="${y}" r="${isTi || isYong ? 14 : 10}"
            fill="${isTi ? "#f0f0f0" : isYong ? "#8a8a8a" : "#2a2a2a"}"
            stroke="${isTi || isYong ? "#fff6" : "#444"}" stroke-width="1.5"/>
          <text x="${x}" y="${y + 4}" text-anchor="middle" fill="${isTi || isYong ? "#111" : "#aaa"}" font-size="11">${name}</text>
        </g>`;
      })
      .join("");

    let link = "";
    if (tiIdx >= 0 && yongIdx >= 0) {
      const a1 = ((angles[tiIdx] - 90) * Math.PI) / 180;
      const a2 = ((angles[yongIdx] - 90) * Math.PI) / 180;
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      link = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ddd" stroke-width="2" stroke-dasharray="4 3" opacity="0.8"/>`;
    }

    const levelColor =
      score >= 75 ? "#c8c8c8" : score >= 55 ? "#eeeeee" : score >= 40 ? "#aaa" : "#888";

    container.innerHTML = `
      <div class="meter-wrap">
        <svg viewBox="0 0 180 180" class="wuxing-svg">
          <circle cx="90" cy="90" r="78" fill="none" stroke="#ffffff12" stroke-width="1"/>
          ${link}
          ${points}
          <text x="90" y="86" text-anchor="middle" fill="#eee" font-size="13">${tiYong.relation}</text>
          <text x="90" y="104" text-anchor="middle" fill="#888" font-size="10">体→用</text>
        </svg>
        <div class="score-ring" style="--p:${score}; --c:${levelColor}">
          <span class="score-num">${score}</span>
          <span class="score-label">象数指数</span>
        </div>
      </div>`;
  }

  /** 起卦仪式遮罩 */
  function playRitual(onDone) {
    document.querySelectorAll(".ritual-overlay").forEach((el) => el.remove());
    const overlay = document.createElement("div");
    overlay.className = "ritual-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="ritual-inner">
        <div class="ritual-bagua">☯</div>
        <p class="ritual-text">寂然不动 · 感而遂通</p>
        <div class="ritual-bar"><i></i></div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("show"));
    const finish = () => {
      overlay.remove();
      try {
        const ret = onDone && onDone();
        if (ret && typeof ret.then === "function") {
          ret.catch((err) => {
            console.error(err);
            if (window.flashOracle) {
              window.flashOracle("未能成象：" + (err.message || String(err)), "warn");
            }
          });
        }
      } catch (err) {
        console.error(err);
        if (window.flashOracle) {
          window.flashOracle("未能成象：" + (err.message || String(err)), "warn");
        }
      }
    };
    setTimeout(() => {
      overlay.classList.remove("show");
      setTimeout(finish, 400);
    }, 1600);
  }

  window.YiViz = {
    createStars,
    renderBaguaWheel,
    animateCoins,
    renderHexagramSVG,
    renderWuXingMeter,
    playRitual
  };
})();
