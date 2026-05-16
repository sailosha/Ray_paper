# Music &amp; Math Simulations

Harmonograph visualizations of traditional Chinese percussion instruments, built with [p5.js](https://p5js.org/).

Each sketch takes the measured harmonic spectrum of a real instrument — frequencies (Hz) and intensities (dB) for its first overtones — and renders them as a four-axis Lissajous / harmonograph figure. The louder a harmonic, the more it shapes the figure; the higher its frequency, the denser its inner weave. Time evolves the phase, producing a slow drift.

## Live demo

GitHub Pages: **https://&lt;your-github-username&gt;.github.io/Ray_paper/**

(Replace `<your-github-username>` after the repo is published. See *Publishing* below.)

## Sketches

| File | Instrument | Notes |
| --- | --- | --- |
| `hutouluo.html` &rarr; `code/hutouluo.js` | 虎音锣 Hǔyīnluó (tiger-voice gong) | Warm brass, dominant 3rd harmonic, long metallic reverb |
| `bianzhong.html` &rarr; `code/bianzhong.js` | 编钟 Biānzhōng (ritual bronze bell) | Deep fundamental, fine high-frequency ripples |
| `daba.html` &rarr; `code/daba.js` | 大钹 Dàbá (large cymbal) | Currently identical to the gong sketch — placeholder for cymbal-specific data |

Press `S` on any sketch to save a PNG of the current frame.

## Running locally

The pages are static and load p5.js from a CDN. Any local web server will do:

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

Opening the `.html` files directly with `file://` also works in most browsers.

## Publishing on GitHub Pages

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, **Branch** to `main`, folder `/ (root)`, then **Save**.
4. Wait ~1 minute. The site appears at `https://<your-github-username>.github.io/Ray_paper/`.

## Structure

```
.
├── index.html          # landing page
├── hutouluo.html       # 虎音锣 page
├── bianzhong.html      # 编钟 page
├── daba.html           # 大钹 page
└── code/
    ├── hutouluo.js
    ├── bianzhong.js
    └── daba.js
```
