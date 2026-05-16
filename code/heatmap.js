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

let currentKey = 'hutouluo';

const HEATMAP_W = 800;
const HEATMAP_H = 640;
const SPECTRUM_H = 320;
const TOTAL_H = HEATMAP_H + SPECTRUM_H;

const N_SAMPLES = 800000;
const K = 0.015;

function heatColor(t) {
  t = Math.max(0, Math.min(1, t));
  const stops = [
    [0.00, [0, 0, 4]],
    [0.15, [22, 11, 57]],
    [0.30, [66, 10, 104]],
    [0.45, [120, 28, 109]],
    [0.60, [177, 50, 90]],
    [0.75, [221, 81, 58]],
    [0.88, [243, 154, 30]],
    [1.00, [252, 254, 164]]
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t <= stops[i + 1][0]) {
      const f = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
      return [
        stops[i][1][0] + (stops[i + 1][1][0] - stops[i][1][0]) * f,
        stops[i][1][1] + (stops[i + 1][1][1] - stops[i][1][1]) * f,
        stops[i][1][2] + (stops[i + 1][1][2] - stops[i][1][2]) * f
      ];
    }
  }
  return stops[stops.length - 1][1];
}

const sketch = (p) => {
  p.setup = () => {
    const c = p.createCanvas(HEATMAP_W, TOTAL_H);
    c.parent('sketch-container');
    p.noLoop();
    p.textFont('Georgia');
  };

  p.draw = () => {
    render();
  };

  function render() {
    p.background(10, 10, 12);

    const data = instruments[currentKey];
    const harmonics = data.harmonics;
    const amps = harmonics.map(h => Math.pow(10, h.db / 20));

    let xSum = 0, ySum = 0;
    amps.forEach((a, i) => {
      if (i % 2 === 0) xSum += a;
      else ySum += a;
    });
    const maxAmpSum = Math.max(xSum, ySum, 1e-6);
    const scale = (Math.min(HEATMAP_W, HEATMAP_H) * 0.42) / maxAmpSum;

    const cx = HEATMAP_W / 2;
    const cy = HEATMAP_H / 2;
    const grid = new Uint32Array(HEATMAP_W * HEATMAP_H);
    let maxCount = 0;

    const fk = harmonics.map(h => h.f * K);
    for (let i = 0; i < N_SAMPLES; i++) {
      const theta = (i / N_SAMPLES) * Math.PI * 2;
      let x = 0, y = 0;
      for (let j = 0; j < harmonics.length; j++) {
        const phase = fk[j] * theta;
        if (j % 2 === 0) x += amps[j] * Math.sin(phase);
        else y += amps[j] * Math.cos(phase);
      }
      const px = (x * scale + cx) | 0;
      const py = (y * scale + cy) | 0;
      if (px >= 0 && px < HEATMAP_W && py >= 0 && py < HEATMAP_H) {
        const idx = py * HEATMAP_W + px;
        grid[idx]++;
        if (grid[idx] > maxCount) maxCount = grid[idx];
      }
    }

    p.loadPixels();
    const logMax = Math.log(1 + maxCount);
    for (let py = 0; py < HEATMAP_H; py++) {
      for (let px = 0; px < HEATMAP_W; px++) {
        const count = grid[py * HEATMAP_W + px];
        const t = count > 0 ? Math.log(1 + count) / logMax : 0;
        const c = heatColor(t);
        const pi = (py * HEATMAP_W + px) * 4;
        p.pixels[pi]     = c[0];
        p.pixels[pi + 1] = c[1];
        p.pixels[pi + 2] = c[2];
        p.pixels[pi + 3] = 255;
      }
    }
    p.updatePixels();

    p.noStroke();
    p.fill(232, 217, 184);
    p.textSize(22);
    p.text(data.name, 24, 38);
    p.fill(180, 160, 120);
    p.textSize(13);
    p.text(data.subtitle, 24, 58);
    p.fill(138, 125, 99);
    p.textSize(11);
    p.text(harmonics.length + ' harmonics  ·  density (log scale)', 24, 78);

    drawColorbar(HEATMAP_W - 40, 40, 18, 180);

    drawSpectrum(0, HEATMAP_H, HEATMAP_W, SPECTRUM_H, harmonics, amps);
  }

  function drawColorbar(x, y, w, h) {
    for (let i = 0; i < h; i++) {
      const t = 1 - i / (h - 1);
      const c = heatColor(t);
      p.stroke(c[0], c[1], c[2]);
      p.line(x, y + i, x + w, y + i);
    }
    p.noStroke();
    p.fill(232, 217, 184);
    p.textSize(10);
    p.textAlign(p.RIGHT);
    p.text('high', x - 6, y + 10);
    p.text('low',  x - 6, y + h);
    p.textAlign(p.LEFT);
  }

  function drawSpectrum(x0, y0, w, h, harmonics, amps) {
    p.noStroke();
    p.fill(14, 14, 18);
    p.rect(x0, y0, w, h);

    p.fill(232, 217, 184);
    p.textSize(15);
    p.text('Harmonic spectrum  ·  amplitude (10^{dB/20})', x0 + 24, y0 + 28);
    p.fill(138, 125, 99);
    p.textSize(11);
    p.text('bar height shows acoustic impact — taller = more energy in that frequency', x0 + 24, y0 + 46);

    const padL = 70, padR = 40, padT = 70, padB = 60;
    const innerX = x0 + padL;
    const innerY = y0 + padT;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;

    const maxF = Math.max.apply(null, harmonics.map(h => h.f)) * 1.12;
    const maxAmp = Math.max.apply(null, amps);

    p.stroke(74, 64, 48);
    p.strokeWeight(1);
    p.line(innerX, innerY + innerH, innerX + innerW, innerY + innerH);
    p.line(innerX, innerY, innerX, innerY + innerH);

    p.noStroke();
    p.fill(138, 125, 99);
    p.textSize(10);
    p.textAlign(p.CENTER);
    const tickStep = maxF > 2000 ? 500 : 200;
    for (let f = 0; f <= maxF; f += tickStep) {
      const xPos = innerX + (f / maxF) * innerW;
      p.text(f + ' Hz', xPos, innerY + innerH + 16);
      p.stroke(48, 42, 32);
      p.line(xPos, innerY + innerH, xPos, innerY + innerH + 3);
      p.noStroke();
    }

    p.textAlign(p.RIGHT);
    p.fill(138, 125, 99);
    p.text('amp', innerX - 8, innerY + innerH + 4);
    p.text('0', innerX - 8, innerY + innerH);
    p.text(maxAmp.toFixed(1), innerX - 8, innerY + 8);

    p.textAlign(p.LEFT);
    p.fill(180, 160, 120);
    p.textSize(11);
    p.text('frequency →', innerX + innerW - 70, innerY + innerH + 34);

    harmonics.forEach((harm, i) => {
      const xPos = innerX + (harm.f / maxF) * innerW;
      const t = amps[i] / maxAmp;
      const barH = t * innerH;
      const c = heatColor(0.2 + t * 0.8);
      p.noStroke();
      p.fill(c[0], c[1], c[2], 235);
      const barW = 18;
      p.rect(xPos - barW / 2, innerY + innerH - barH, barW, barH);

      p.fill(232, 217, 184);
      p.textSize(10);
      p.textAlign(p.CENTER);
      p.text(harm.db.toFixed(1) + ' dB', xPos, innerY + innerH - barH - 6);
      p.textSize(9);
      p.fill(160, 145, 110);
      p.text(harm.f.toFixed(0) + ' Hz', xPos, innerY + innerH - barH - 18);
      p.textAlign(p.LEFT);
    });
  }

  window.selectInstrument = (key) => {
    if (!instruments[key]) return;
    currentKey = key;
    document.querySelectorAll('.instrument-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.instrument === key);
    });
    p.redraw();
  };
};

new p5(sketch);
