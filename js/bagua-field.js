/**
 * 黑白动态：太极 · 先天八卦 · 六十四卦阵
 * Canvas 全屏背景，顺逆相旋，象法天地
 */
(function () {
  const TRIGRAMS = [
    { name: "乾", bin: "111", angle: -90 },
    { name: "兑", bin: "110", angle: -45 },
    { name: "离", bin: "101", angle: 0 },
    { name: "震", bin: "100", angle: 45 },
    { name: "巽", bin: "011", angle: 90 },
    { name: "坎", bin: "010", angle: 135 },
    { name: "艮", bin: "001", angle: 180 },
    { name: "坤", bin: "000", angle: 225 }
  ];

  /** 文王六十四卦圆图近似：按二进制 0–63 排布 */
  function allHexBinaries() {
    const list = [];
    for (let i = 0; i < 64; i++) {
      list.push(i.toString(2).padStart(6, "0"));
    }
    return list;
  }

  function createBaguaField(host) {
    if (!host) return { destroy() {} };

    const canvas = document.createElement("canvas");
    canvas.className = "bagua-field-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const hexes = allHexBinaries();
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let t0 = performance.now();
    let running = true;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawTaiji(cx, cy, r, rot) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      // 外圆
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      // 右半黑
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();

      // 上白下黑小圆（阴阳鱼）
      ctx.beginPath();
      ctx.arc(0, -r / 2, r / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, r / 2, r / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();

      // 鱼眼
      ctx.beginPath();
      ctx.arc(0, -r / 2, r / 8.5, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, r / 2, r / 8.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      // 外环线
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
    }

    function drawTrigram(cx, cy, size, bin, label, alpha) {
      const gap = size * 0.22;
      const thick = size * 0.12;
      const width = size;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalAlpha = alpha;
      // bin 自下而上：初爻在下
      for (let i = 0; i < 3; i++) {
        const y = size / 2 - i * (thick + gap) - thick;
        const yang = bin[i] === "1";
        ctx.fillStyle = "#e8d5a3";
        if (yang) {
          ctx.fillRect(-width / 2, y, width, thick);
        } else {
          const half = (width - size * 0.18) / 2;
          ctx.fillRect(-width / 2, y, half, thick);
          ctx.fillRect(width / 2 - half, y, half, thick);
        }
      }
      if (label) {
        ctx.fillStyle = "rgba(220,220,220,0.85)";
        ctx.font = `${Math.max(10, size * 0.42)}px "Noto Serif SC", serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(label, 0, size / 2 + 4);
      }
      ctx.restore();
    }

    function drawHexMini(cx, cy, size, bin, alpha) {
      const thick = size * 0.1;
      const gap = size * 0.08;
      const width = size * 0.9;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 6; i++) {
        const y = size / 2 - i * (thick + gap) - thick;
        const yang = bin[i] === "1";
        ctx.fillStyle = "#d4c4a0";
        if (yang) {
          ctx.fillRect(-width / 2, y, width, thick);
        } else {
          const half = (width - size * 0.14) / 2;
          ctx.fillRect(-width / 2, y, half, thick);
          ctx.fillRect(width / 2 - half, y, half, thick);
        }
      }
      ctx.restore();
    }

    function frame(now) {
      if (!running) return;
      const t = (now - t0) / 1000;
      const cx = w / 2;
      const cy = h / 2;
      const minSide = Math.min(w, h);
      const taijiR = minSide * 0.09;
      const baguaR = minSide * 0.2;
      const hexR = minSide * 0.38;
      const hexR2 = minSide * 0.48;

      ctx.clearRect(0, 0, w, h);

      // 深黑底 + 微弱径向
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, minSide * 0.7);
      g.addColorStop(0, "#141418");
      g.addColorStop(0.55, "#0a0a0c");
      g.addColorStop(1, "#050506");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // 细网格气场
      ctx.strokeStyle = "rgba(201,168,108,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, baguaR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, hexR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, hexR2, 0, Math.PI * 2);
      ctx.stroke();

      // 外层六十四卦（逆旋）
      const rotHex = -t * 0.04;
      hexes.forEach((bin, i) => {
        const a = rotHex + (i / 64) * Math.PI * 2;
        const ring = i % 2 === 0 ? hexR : hexR2;
        const x = cx + Math.cos(a) * ring;
        const y = cy + Math.sin(a) * ring;
        const pulse = 0.25 + 0.2 * Math.sin(t * 1.2 + i * 0.4);
        drawHexMini(x, y, minSide * 0.028, bin, pulse);
      });

      // 先天八卦环（顺旋）
      const rotBa = t * 0.08;
      TRIGRAMS.forEach((tr, i) => {
        const a = rotBa + (i / 8) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * baguaR;
        const y = cy + Math.sin(a) * baguaR;
        drawTrigram(x, y, minSide * 0.045, tr.bin, tr.name, 0.75);
      });

      // 中心太极（顺旋稍快）
      drawTaiji(cx, cy, taijiR, t * 0.15);

      // 四正微光
      ctx.fillStyle = "rgba(201,168,108,0.12)";
      ctx.font = `${Math.max(11, minSide * 0.018)}px "Noto Serif SC", serif`;
      ctx.textAlign = "center";
      [
        [cx, cy - minSide * 0.28, "天"],
        [cx, cy + minSide * 0.28, "地"],
        [cx - minSide * 0.28, cy, "阴"],
        [cx + minSide * 0.28, cy, "阳"]
      ].forEach(([x, y, s]) => {
        ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t + s.length);
        ctx.fillText(s, x, y);
      });
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    }

    function onVis() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        t0 = performance.now() - (performance.now() - t0);
        raf = requestAnimationFrame(frame);
      }
    }

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);

    return {
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVis);
        canvas.remove();
      }
    };
  }

  window.BaguaField = { createBaguaField };
})();
