(() => {
  'use strict';
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- ASCII field: raw traffic on the left settles into resolved order on the right ---- */
  const canvas = document.getElementById('field');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const CW = +css('--cell-w').replace('px', '') || 8;
    const CH = +css('--cell-h').replace('px', '') || 16;
    const tints = ['--color-glyph-1', '--color-glyph-2', '--color-glyph-3', '--color-glyph-4'].map(css);
    const deep = css('--color-accent-deep');
    const ramp = ' .:-=+*#%@';
    const noisy = '01{}<>/\\|;:#$%&*';
    let cols = 0, rows = 0, dpr = 1, nodes = [], visible = true, raf = 0, last = 0;
    const mouse = { x: -999, y: -999 };

    const hash = (x, y, t) => { const s = Math.sin(x * 127.1 + y * 311.7 + t * 74.7) * 43758.5453; return s - Math.floor(s); };
    const smooth = (x, y, t) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = hash(xi, yi, t), b = hash(xi + 1, yi, t), c = hash(xi, yi + 1, t), d = hash(xi + 1, yi + 1, t);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(r.width / CW); rows = Math.ceil(r.height / CH);
      const n = cols < 70 ? 4 : 7;
      nodes = Array.from({ length: n }, (_, i) => ({
        x: cols * (0.52 + 0.42 * ((i * 0.618) % 1)),
        y: rows * (0.15 + 0.7 * ((i * 0.381 + 0.2) % 1)),
      }));
    };

    const draw = (t) => {
      const r = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      ctx.font = `${CH - 3}px ${css('--font-outlier')}`;
      ctx.textBaseline = 'top';
      const mx = mouse.x / CW, my = mouse.y / CH;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const fx = x / cols;
          const order = Math.min(1, Math.max(0, (fx - 0.35) / 0.5));       // 0 raw, 1 resolved
          let n = smooth(x * 0.09, y * 0.16, 0) * 0.7 + smooth(x * 0.3 + t * 0.4, y * 0.5, 1) * 0.3;
          // nodes light the field around them
          let node = 0;
          for (const p of nodes) { const d = Math.hypot((x - p.x) / 2, y - p.y); node = Math.max(node, Math.max(0, 1 - d / 6)); }
          const lens = Math.max(0, 1 - Math.hypot((x - mx) / 2, y - my) / 7);
          // keep text column quiet: fade the left side's density
          const quiet = 0.25 + 0.75 * Math.min(1, fx * 1.6);
          const v = Math.min(1, (n * (1 - order * 0.55) * quiet) + node * 0.9 + lens * 0.5);
          if (v < 0.28) continue;
          const idx = Math.min(tints.length - 1, Math.floor(v * tints.length));
          let ch;
          if (order < 0.5 && hash(x, y, Math.floor(t * 3)) > 0.55) ch = noisy[Math.floor(hash(y, x, Math.floor(t * 3)) * noisy.length)];
          else ch = ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))];
          ctx.fillStyle = node > 0.5 ? deep : tints[idx];
          ctx.fillText(ch, x * CW, y * CH);
        }
      }
    };

    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      if (!visible || ts - last < 33) return;          // 30 fps
      last = ts; draw(ts / 1000);
    };

    resize();
    draw(2);                                            // composed still, also the reduced-motion state
    new ResizeObserver(() => { resize(); draw(2); }).observe(canvas);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
    canvas.parentElement.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    const start = () => { cancelAnimationFrame(raf); if (!reduce.matches) raf = requestAnimationFrame(loop); else draw(2); };
    reduce.addEventListener('change', start); start();
  }

  /* ---- GSAP: entrances; content is visible by default and animated only when motion is allowed ---- */
  if (!window.gsap) return;
  gsap.registerPlugin(window.ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.7 });

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // hero headline: word by word
    const h = document.querySelector('[data-split]');
    if (h) {
      const words = h.textContent.trim().split(/\s+/);
      h.setAttribute('aria-label', h.textContent.trim());
      h.innerHTML = words.map((w) => `<span aria-hidden="true" style="display:inline-block;overflow:clip;vertical-align:top;padding-bottom:.08em"><span class="w" style="display:inline-block">${w}</span></span>`).join(' ');
      gsap.from('.w', { yPercent: 110, stagger: 0.07, duration: 0.9, delay: 0.1 });
    }
    gsap.from('.hero [data-rise]', { y: 16, opacity: 0, delay: 0.5 });

    // sections and rows rise as they enter
    gsap.utils.toArray('[data-rise]:not(.hero [data-rise])').forEach((el) =>
      gsap.from(el, { y: 24, opacity: 0, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
    ScrollTrigger.batch('[data-row]', {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.from(els, { y: 20, opacity: 0, stagger: 0.08, overwrite: true }),
    });
    gsap.from('[data-stage]', { x: 24, opacity: 0, stagger: 0.14, scrollTrigger: { trigger: '.pipeline', start: 'top 80%', once: true } });

    // the figure counts up to the paper's number
    const f = document.querySelector('[data-count]');
    if (f) {
      const end = parseFloat(f.dataset.count), o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: f, start: 'top 85%', once: true },
        onUpdate: () => { f.textContent = o.v.toFixed(2) + '%'; } });
    }
  });
})();
