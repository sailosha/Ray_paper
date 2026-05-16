const instruments = {
  hutouluo: {
    name: '虎音锣 Hǔyīnluó',
    subtitle: 'tiger-voice gong',
    harmonics: [
      { f: 193.83, db: 36.83 },
      { f: 380.48, db: 29.31 },
      { f: 581.49, db: 40.52 },
      { f: 760.96, db: 38.04 }
    ]
  },
  bianzhong: {
    name: '编钟 Biānzhōng',
    subtitle: 'ritual bronze bell',
    harmonics: [
      { f: 321.07, db: 27.90 },
      { f: 661.72, db: 15.46 },
      { f: 1135.49, db: -9.55 },
      { f: 1425.23, db: -5.09 },
      { f: 1636.67, db: -7.70 },
      { f: 1765.88, db: 6.42 }
    ]
  },
  daba: {
    name: '大钹 Dàbá',
    subtitle: 'large cymbal',
    harmonics: [
      { f: 193.83, db: 36.83 },
      { f: 380.48, db: 29.31 },
      { f: 581.49, db: 40.52 },
      { f: 760.96, db: 38.04 }
    ]
  }
};

const PANEL_W = 380;
const PANEL_H = 380;
const GAP = 24;
const TITLE_PAD = 56;
const FOOTER_PAD = 36;
const LEGEND_H = 110;
const CANVAS_W = PANEL_W * 3 + GAP * 2;
const CANVAS_H = TITLE_PAD + PANEL_H + FOOTER_PAD + LEGEND_H;

const F_MIN = 150;
const F_MAX = 2000;
const LOG_F_MIN = Math.log(F_MIN);
const LOG_F_MAX = Math.log(F_MAX);

function freqToT(f) {
  return Math.max(0, Math.min(1, (Math.log(f) - LOG_F_MIN) / (LOG_F_MAX - LOG_F_MIN)));
}

function freqToAngle(f) {
  return -Math.PI / 2 + 2 * Math.PI * freqToT(f);
}

function freqToRGB(f) {
  const t = freqToT(f);
  const hue = 280 * t;
  return hslToRgb(hue, 1.0, 0.55);
}

function hslToRgb(h, s, l) {
  h = h / 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const pp = 2 * l - q;
    r = hue2rgb(pp, q, h + 1 / 3);
    g = hue2rgb(pp, q, h);
    b = hue2rgb(pp, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

const sketch = (p) => {
  p.setup = () => {
    const c = p.createCanvas(CANVAS_W, CANVAS_H);
    c.parent('sketch-container');
    p.noLoop();
    p.textFont('Georgia');
  };

  p.draw = () => {
    p.background(6, 4, 12);

    const keys = ['hutouluo', 'bianzhong', 'daba'];
    keys.forEach((key, i) => {
      const x = i * (PANEL_W + GAP);
      const y = TITLE_PAD;
      renderPanel(x, y, instruments[key]);
    });

    renderLegend(0, TITLE_PAD + PANEL_H + FOOTER_PAD, CANVAS_W, LEGEND_H);
  };

  function renderPanel(x0, y0, inst) {
    p.noStroke();
    p.fill(232, 217, 184);
    p.textSize(19);
    p.textAlign(p.CENTER);
    p.text(inst.name, x0 + PANEL_W / 2, y0 - 28);
    p.fill(160, 145, 110);
    p.textSize(11);
    p.text(inst.subtitle, x0 + PANEL_W / 2, y0 - 12);
    p.textAlign(p.LEFT);

    const buf = new Float32Array(PANEL_W * PANEL_H * 3);
    const cx = PANEL_W / 2;
    const cy = PANEL_H / 2;
    const R = PANEL_W * 0.30;

    const localAmps = inst.harmonics.map(h => Math.pow(10, h.db / 20));
    const localMax = Math.max.apply(null, localAmps);
    const minF = Math.min.apply(null, inst.harmonics.map(h => h.f));
    const maxF = Math.max.apply(null, inst.harmonics.map(h => h.f));

    const sources = inst.harmonics.map((harm, i) => {
      const ampNorm = localAmps[i] / localMax;
      const angle = freqToAngle(harm.f);
      const hx = cx + R * Math.cos(angle);
      const hy = cy + R * Math.sin(angle);
      const sigma = 18 + ampNorm * 56;
      const rgb = freqToRGB(harm.f);
      return { harm, ampNorm, hx, hy, sigma, rgb, angle };
    });

    sources.forEach(src => {
      const sigma2 = src.sigma * src.sigma;
      const peakIntensity = 0.35 + src.ampNorm * 2.0;
      const radius = src.sigma * 3.2;
      const minX = Math.max(0, Math.floor(src.hx - radius));
      const maxX = Math.min(PANEL_W - 1, Math.ceil(src.hx + radius));
      const minY = Math.max(0, Math.floor(src.hy - radius));
      const maxY = Math.min(PANEL_H - 1, Math.ceil(src.hy + radius));
      const rN = src.rgb[0] / 255;
      const gN = src.rgb[1] / 255;
      const bN = src.rgb[2] / 255;

      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          const dx = px - src.hx;
          const dy = py - src.hy;
          const d2 = dx * dx + dy * dy;
          const halo = Math.exp(-d2 / (2 * sigma2));
          const core = Math.exp(-d2 / (2 * sigma2 * 0.12));
          const v = peakIntensity * halo;
          const bi = (py * PANEL_W + px) * 3;
          buf[bi]     += v * rN + core * 0.9;
          buf[bi + 1] += v * gN + core * 0.9;
          buf[bi + 2] += v * bN + core * 0.9;
        }
      }
    });

    const img = p.createImage(PANEL_W, PANEL_H);
    img.loadPixels();
    for (let i = 0; i < PANEL_W * PANEL_H; i++) {
      const bi = i * 3;
      const pi = i * 4;
      const grain = (Math.random() - 0.5) * 0.012;
      const r = Math.min(1, Math.max(0, buf[bi] + grain));
      const g = Math.min(1, Math.max(0, buf[bi + 1] + grain));
      const b = Math.min(1, Math.max(0, buf[bi + 2] + grain));
      img.pixels[pi]     = Math.pow(r, 0.7) * 255;
      img.pixels[pi + 1] = Math.pow(g, 0.7) * 255;
      img.pixels[pi + 2] = Math.pow(b, 0.7) * 255;
      img.pixels[pi + 3] = 255;
    }
    img.updatePixels();
    p.image(img, x0, y0);

    p.noFill();
    p.stroke(60, 50, 40);
    p.strokeWeight(1);
    p.rect(x0, y0, PANEL_W, PANEL_H);

    p.stroke(80, 70, 50, 90);
    p.strokeWeight(0.5);
    p.noFill();
    [0.15, 0.30, 0.45].forEach(rf => {
      p.ellipse(x0 + cx, y0 + cy, PANEL_W * rf * 2, PANEL_W * rf * 2);
    });

    p.stroke(70, 60, 45, 100);
    p.line(x0 + cx - 8, y0 + cy, x0 + cx + 8, y0 + cy);
    p.line(x0 + cx, y0 + cy - 8, x0 + cx, y0 + cy + 8);

    sources.forEach(src => {
      const labelDist = src.sigma + 22;
      const lx = x0 + src.hx + labelDist * Math.cos(src.angle);
      const ly = y0 + src.hy + labelDist * Math.sin(src.angle);
      p.noStroke();
      p.fill(220, 210, 180, 230);
      p.textSize(10);
      const dx = Math.cos(src.angle);
      if (dx > 0.3) p.textAlign(p.LEFT);
      else if (dx < -0.3) p.textAlign(p.RIGHT);
      else p.textAlign(p.CENTER);
      p.text(src.harm.f.toFixed(0) + ' Hz', lx, ly - 2);
      p.fill(170, 155, 115, 210);
      p.textSize(9);
      p.text(src.harm.db.toFixed(1) + ' dB', lx, ly + 10);
    });

    p.textAlign(p.CENTER);
    p.noStroke();
    p.fill(180, 160, 120);
    p.textSize(11);
    p.text(
      inst.harmonics.length + ' harmonics  ·  ' +
        Math.round(minF) + '–' + Math.round(maxF) + ' Hz  ·  peak ' +
        Math.max.apply(null, inst.harmonics.map(h => h.db)).toFixed(1) + ' dB',
      x0 + PANEL_W / 2,
      y0 + PANEL_H + 22
    );
    p.textAlign(p.LEFT);
  }

  function renderLegend(x0, y0, w, h) {
    const padX = 60;
    const barX = x0 + padX;
    const barW = w - padX * 2;
    const barH = 22;
    const barY = y0 + 36;

    p.noStroke();
    p.fill(232, 217, 184);
    p.textSize(14);
    p.textAlign(p.LEFT);
    p.text('Frequency → color', barX, y0 + 20);
    p.textAlign(p.RIGHT);
    p.fill(160, 145, 110);
    p.textSize(11);
    p.text('amplitude → glow size & brightness  ·  position on ring → frequency (log scale)',
      x0 + w - padX, y0 + 20);

    for (let i = 0; i < barW; i++) {
      const t = i / (barW - 1);
      const f = Math.exp(LOG_F_MIN + t * (LOG_F_MAX - LOG_F_MIN));
      const rgb = freqToRGB(f);
      p.stroke(rgb[0], rgb[1], rgb[2]);
      p.line(barX + i, barY, barX + i, barY + barH);
    }

    p.noStroke();
    p.fill(180, 160, 120);
    p.textSize(10);
    p.textAlign(p.CENTER);
    [150, 300, 500, 800, 1200, 1800].forEach(f => {
      if (f < F_MIN || f > F_MAX) return;
      const t = freqToT(f);
      const x = barX + t * barW;
      p.stroke(80, 70, 50);
      p.line(x, barY + barH, x, barY + barH + 4);
      p.noStroke();
      p.fill(180, 160, 120);
      p.text(f + ' Hz', x, barY + barH + 18);
    });
    p.textAlign(p.LEFT);
  }
};

new p5(sketch);
