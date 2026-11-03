(() => {
  'use strict';
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- dot field: a static grid, precomputed once. Dots thin out and bend away from the text;
         the pointer pushes and lights nearby dots. Redraws only while the pointer is moving. ---- */
  const canvas = document.getElementById('field');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const GAP = 22, TEXT_PAD = 14, TEXT_FADE = 80, PUSH = 16, MR = 120;
    let base = css('--color-glyph-2'), hot = css('--color-accent-2');
    let streak = document.documentElement.dataset.mode === 'off';
    const host = canvas.parentElement;
    let n = 0, ox, oy, sc, W = 0, H = 0, raf = 0;
    const m = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const textRects = (box) => {
      const out = [];
      host.querySelectorAll('h1, .eyebrow, .lead, .actions, .facts').forEach((el) => {
        let r;
        if (el.matches('h1, .eyebrow, .lead')) { const g = document.createRange(); g.selectNodeContents(el); r = g.getBoundingClientRect(); }
        else r = el.getBoundingClientRect();
        if (r.width) out.push({ l: r.left - box.left - TEXT_PAD, r: r.right - box.left + TEXT_PAD, t: r.top - box.top - TEXT_PAD, b: r.bottom - box.top + TEXT_PAD });
      });
      return out;
    };

    const layout = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = box.width; H = box.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(W / GAP) + 1, rows = Math.ceil(H / GAP) + 1;
      n = cols * rows; ox = new Float32Array(n); oy = new Float32Array(n); sc = new Float32Array(n);
      const rects = textRects(box);
      let k = 0;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++, k++) {
        let x = i * GAP, y = j * GAP, s = 1;
        for (const q of rects) {
          const dx = Math.max(q.l - x, 0, x - q.r), dy = Math.max(q.t - y, 0, y - q.b);
          const d = Math.hypot(dx, dy);
          if (d >= TEXT_FADE) continue;
          const f = d / TEXT_FADE, push = (1 - f) * (1 - f) * 20;
          let nx = dx ? Math.sign(x - (x < q.l ? q.l : q.r)) : 0, ny = dy ? Math.sign(y - (y < q.t ? q.t : q.b)) : 0;
          if (!nx && !ny) { nx = x < (q.l + q.r) / 2 ? -1 : 1; ny = 0; }
          const len = Math.hypot(nx * Math.max(dx, 1), ny * Math.max(dy, 1)) || 1;
          x += (nx * Math.max(dx, 1) / len) * push; y += (ny * Math.max(dy, 1) / len) * push;
          s = Math.min(s, f * f);
        }
        ox[k] = x; oy[k] = y; sc[k] = s;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const lit = [];
      ctx.fillStyle = base; ctx.globalAlpha = 0.55; ctx.beginPath();
      for (let k = 0; k < n; k++) {
        const s = sc[k]; if (s < 0.12) continue;
        let x = ox[k], y = oy[k], r = 1.5 * s;
        const dx = x - m.x, dy = y - m.y, d2 = dx * dx + dy * dy;
        if (d2 < MR * MR) {
          const d = Math.sqrt(d2), f = 1 - d / MR, p = f * f * PUSH;
          x += (dx / (d || 1)) * p; y += (dy / (d || 1)) * p;
          lit.push(x, y, (1.5 + f * 2.2) * Math.max(s, 0.4)); continue;
        }
        if (streak) { const hl = (3 + 10 * (x / W)) * s; ctx.rect(x - hl, y - 1, hl * 2, 2); } else { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832); }
      }
      ctx.fill();
      if (lit.length) {
        ctx.fillStyle = hot; ctx.globalAlpha = 0.95; ctx.beginPath();
        for (let i = 0; i < lit.length; i += 3) { if (streak) { const hl = lit[i + 2] * 3.2; ctx.rect(lit[i] - hl, lit[i + 1] - 1.25, hl * 2, 2.5); } else { ctx.moveTo(lit[i] + lit[i + 2], lit[i + 1]); ctx.arc(lit[i], lit[i + 1], lit[i + 2], 0, 6.2832); } }
        ctx.fill();
      }
    };

    const tick = () => {
      m.x += (m.tx - m.x) * 0.22; m.y += (m.ty - m.y) * 0.22;
      draw();
      raf = (Math.abs(m.tx - m.x) > 0.4 || Math.abs(m.ty - m.y) > 0.4) ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

    let to = 0;
    const relayout = () => { clearTimeout(to); to = setTimeout(() => { layout(); draw(); }, 80); };
    layout(); draw();
    new ResizeObserver(relayout).observe(host);
    if (document.fonts) document.fonts.ready.then(() => { layout(); draw(); });
    addEventListener('field:relayout', () => requestAnimationFrame(() => { base = css('--color-glyph-2'); hot = css('--color-accent-2'); streak = document.documentElement.dataset.mode === 'off'; layout(); draw(); }));

    if (!reduce.matches) {
      host.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        if (m.tx < -999) { m.x = e.clientX - r.left; m.y = e.clientY - r.top; }
        m.tx = e.clientX - r.left; m.ty = e.clientY - r.top; kick();
      }, { passive: true });
      host.addEventListener('pointerleave', () => { m.tx = m.ty = -9999; m.x = m.y = -9999; draw(); });
    }
  }

  if (!window.gsap) return;
  gsap.registerPlugin(window.ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.6 });
  // content is visible by default; entrances run only when motion is allowed
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray('[data-rise]').forEach((el) => {
      const top = el.getBoundingClientRect().top < window.innerHeight;
      gsap.from(el, { y: 16, opacity: 0, delay: top ? 0.05 : 0, scrollTrigger: top ? null : { trigger: el, start: 'top 90%', once: true } });
    });
  });
})();

/* ---- enhancements: all content is already in the HTML; these only add interaction ---- */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // scroll progress
  const bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true'); document.body.prepend(bar);
  let tick = 0;
  const prog = () => { tick = 0; const h = document.documentElement; const max = h.scrollHeight - h.clientHeight; bar.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`; };
  addEventListener('scroll', () => { if (!tick) tick = requestAnimationFrame(prog); }, { passive: true }); prog();

  // card spotlight
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.card'); if (!c) return;
    const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // project filters
  const projects = $$('.project[data-cat]');
  if (projects.length) {
    const labels = { ai: 'AI tooling', security: 'Security', systems: 'Systems and IoT', research: 'Research', academic: 'Academic' };
    const used = Object.keys(labels).filter((k) => projects.some((p) => p.dataset.cat.split(' ').includes(k)));
    const wrap = document.createElement('div'); wrap.className = 'chips'; wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-label', 'Filter projects');
    const count = document.createElement('span'); count.className = 'chips__n'; count.setAttribute('aria-live', 'polite');
    const mk = (k, t) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = t; b.dataset.k = k; b.setAttribute('aria-pressed', k === 'all'); return b; };
    wrap.append(mk('all', 'All'), ...used.map((k) => mk(k, labels[k])), count);
    projects[0].parentElement.insertBefore(wrap, projects[0]);
    const apply = (k) => {
      let n = 0;
      projects.forEach((p) => { const on = k === 'all' || p.dataset.cat.split(' ').includes(k); p.hidden = !on; if (on) n++; });
      $$('.chip', wrap).forEach((b) => b.setAttribute('aria-pressed', b.dataset.k === k));
      count.textContent = `${n} of ${projects.length} shown`;
    };
    wrap.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) apply(b.dataset.k); });
    const reveal = () => { const t = location.hash && document.getElementById(location.hash.slice(1)); if (t && t.hidden) { apply('all'); t.scrollIntoView(); } };
    addEventListener('hashchange', reveal); apply('all'); reveal();
  }

  // count-up stats
  const parse = (s) => { const t = s.match(/^(\d+):(\d+):(\d+)$/); if (t) return { v: +t[1] * 3600 + +t[2] * 60 + +t[3], f: (v) => { v = Math.round(v); return `${Math.floor(v / 3600)}:${String(Math.floor(v % 3600 / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`; } };
    const m = s.match(/^(\d+) min$/); return m ? { v: +m[1], f: (v) => `${Math.round(v)} min` } : null; };
  if (!reduce && 'IntersectionObserver' in window) {
    $$('.stats dd').forEach((el) => {
      const p = parse(el.textContent.trim()); if (!p) return; const end = el.textContent;
      new IntersectionObserver(([en], io) => { if (!en.isIntersecting) return; io.disconnect(); const t0 = performance.now();
        const step = (t) => { const k = Math.min(1, (t - t0) / 1200), e = 1 - Math.pow(1 - k, 3); el.textContent = k < 1 ? p.f(p.v * e) : end; if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step); }, { threshold: 0.6 }).observe(el);
    });
  }

  // terminal facts type in
  if (window.gsap && !reduce) gsap.from('.term .facts > div', { opacity: 0, x: -10, stagger: 0.18, delay: 0.7, duration: 0.5, ease: 'power2.out' });

  // command palette (Ctrl/Cmd+K or /)
  const mac = /Mac|iPhone|iPad/.test(navigator.platform);
  const pg = (t, h) => ({ t, h, g: 'page' }), pr = (t, id) => ({ t, h: `projects.html#${id}`, g: 'project' }), ex = (t, h, g = 'link') => ({ t, h, g, x: true });
  const items = [pg('Home', 'index.html'), pg('Projects', 'projects.html'), pg('Research', 'research.html'), pg('Writing', 'writing.html'),
    pr('universalMods', 'universalmods'), pr('GenieTest', 'genietest'), pr('GOSniff', 'gosniff'), pr('Early Speed Breaker Detection', 'speedbreaker'), pr('Pay via Fingerprint', 'finpay'), pr('Mock Stock Trading', 'stocks'), pr('Multi-agent RAG vulnerability repair', 'vuln-repair'),
    { t: 'Off the clock mode (toggle)', g: 'mode', m: true }, { t: 'About me', h: 'index.html#about', g: 'home' }, { t: 'Skills and technologies', h: 'index.html#skills', g: 'home' }, { t: 'Certifications', h: 'index.html#certifications', g: 'home' },
    ex('Email', 'mailto:samridhanand.2003@gmail.com', 'contact'), ex('GitHub', 'https://github.com/samridh3215'), ex('LinkedIn', 'https://www.linkedin.com/in/samridh-anand-985415241/'), ex('Strava', 'https://www.strava.com/athletes/23573279'), ex('Blog on Hashnode', 'https://samridh3215.hashnode.dev'), ex('Read the paper on Springer', 'https://link.springer.com/chapter/10.1007/978-981-95-3489-0_36', 'paper')];
  const dlg = document.createElement('dialog'); dlg.className = 'pal'; dlg.setAttribute('aria-label', 'Jump to');
  dlg.innerHTML = '<input class="pal__in" type="text" placeholder="Jump to a page, project or link" aria-label="Jump to" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="pal-list"><ul class="pal__list" id="pal-list" role="listbox"></ul><div class="pal__hint">↑↓ to move, Enter to open, Esc to close</div>';
  document.body.append(dlg);
  const input = $('input', dlg), list = $('ul', dlg); let shown = [], sel = 0;
  const render = () => {
    const q = input.value.trim().toLowerCase();
    shown = items.filter((i) => !q || (i.t + ' ' + i.g).toLowerCase().includes(q)); sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown.map((i, n) => `<li class="pal__item" role="option" id="pal-${n}" data-n="${n}" aria-selected="${n === sel}"><span>${i.t}</span><span class="pal__g">${i.g}</span></li>`).join('') || '<li class="pal__item"><span>No matches</span></li>';
    input.setAttribute('aria-activedescendant', shown.length ? `pal-${sel}` : '');
  };
  const go = (i) => { if (!i) return; dlg.close(); if (i.m) { if (document.documentElement.dataset.mode) dispatchEvent(new Event('mode:toggle')); else location.href = 'index.html?mode=off'; return; } if (i.x && !i.h.startsWith('mailto:')) open(i.h, '_blank', 'noopener'); else location.href = i.h; };
  const openPal = () => { input.value = ''; sel = 0; render(); dlg.showModal(); input.focus(); };
  input.addEventListener('input', () => { sel = 0; render(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % (shown.length || 1); render(); $('[aria-selected="true"]', list)?.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter') { e.preventDefault(); go(shown[sel]); }
  });
  list.addEventListener('click', (e) => { const li = e.target.closest('[data-n]'); if (li) go(shown[+li.dataset.n]); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) { e.preventDefault(); dlg.open ? dlg.close() : openPal(); }
  });
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'nav__k'; btn.setAttribute('aria-label', 'Open quick jump menu');
  btn.innerHTML = `<span>Jump to</span><kbd>${mac ? '⌘' : 'Ctrl'} K</kbd>`; btn.addEventListener('click', openPal);
  const nav = $('.nav__inner nav'); if (nav) nav.append(btn);
})();

/* ---- work / off the clock: a laptop closes, the page switches to everything outside work ---- */
(() => {
  'use strict';
  const html = document.documentElement, sw = document.querySelector('.mode');
  if (!sw || !html.dataset.mode) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const say = document.createElement('p'); say.className = 'visually-hidden'; say.setAttribute('role', 'status'); document.body.append(say);

  const setMode = (m) => {
    html.dataset.mode = m; sw.setAttribute('aria-checked', String(m === 'off'));
    say.textContent = m === 'off' ? 'Showing life outside work' : 'Showing work';
    window.scrollTo(0, 0); dispatchEvent(new Event('field:relayout')); if (window.ScrollTrigger) ScrollTrigger.refresh();
    if (window.gsap && !reduce) requestAnimationFrame(() => gsap.from($$('.term .facts > div').filter((e) => e.offsetParent), { opacity: 0, x: -10, stagger: 0.15, delay: 0.5, duration: 0.5 }));
  };
  sw.setAttribute('aria-checked', String(html.dataset.mode === 'off'));

  let scene, tl, busy = false;
  const build = () => {
    scene = document.createElement('div'); scene.className = 'lights'; scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML = '<div class="lap"><span class="lap__glow"></span><div class="lap__lid"><div class="lap__screen">' + '<i></i>'.repeat(7) + '</div></div><div class="lap__base"></div></div><p class="lights__cap"></p>';
    document.body.append(scene); scene.addEventListener('click', () => tl && tl.timeScale(4));
  };

  const toggle = () => {
    if (busy) return; const toOff = html.dataset.mode !== 'off';
    if (reduce || !window.gsap) { setMode(toOff ? 'off' : 'work'); return; }
    busy = true; if (!scene) build();
    const lid = $('.lap__lid', scene), glow = $('.lap__glow', scene), lines = $$('.lap__screen i', scene), cap = $('.lights__cap', scene), lap = $('.lap', scene);
    cap.textContent = ''; gsap.set(cap, { opacity: 0, y: 8 });
    gsap.set(lid, { rotateX: toOff ? 0 : -88 }); gsap.set(glow, { opacity: toOff ? 1 : 0 }); gsap.set(lines, { scaleX: toOff ? 0 : 1, opacity: toOff ? 1 : 0 }); gsap.set(lap, { y: 24, scale: 0.94, opacity: 0 });
    tl = gsap.timeline({ onComplete: () => { gsap.set(scene, { autoAlpha: 0 }); busy = false; tl = null; } });
    tl.to(scene, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
      .to(lap, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }, '<0.1');
    if (toOff) {
      tl.to(lines, { scaleX: 1, stagger: 0.07, duration: 0.3, ease: 'power2.out' }, '-=0.1')
        .to({}, { duration: 0.4 })
        .to(lines, { opacity: 0, duration: 0.25 })
        .to(glow, { opacity: 0, duration: 0.6, ease: 'power1.in' }, '<')
        .to(lid, { rotateX: -88, duration: 0.7, ease: 'power3.in' }, '<')
        .add(() => { cap.textContent = 'Off the clock'; setMode('off'); })
        .to(cap, { opacity: 1, y: 0, duration: 0.4 })
        .to({}, { duration: 0.45 });
    } else {
      tl.add(() => { cap.textContent = 'Back to work'; })
        .to(cap, { opacity: 1, y: 0, duration: 0.35 })
        .to(lid, { rotateX: 0, duration: 0.8, ease: 'power3.out' })
        .to(glow, { opacity: 1, duration: 0.6 }, '<0.3')
        .to(lines, { opacity: 1, scaleX: 1, stagger: 0.06, duration: 0.25 }, '<0.2')
        .add(() => setMode('work'))
        .to({}, { duration: 0.45 });
    }
    tl.to(lap, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.in' }).to(cap, { opacity: 0, duration: 0.3 }, '<').to(scene, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' });
  };

  sw.addEventListener('click', toggle);
  $$('[data-mode-toggle]').forEach((b) => b.addEventListener('click', toggle));
  addEventListener('mode:toggle', toggle);
})();

(() => {
  const p = document.querySelector('.pace');
  if (!p || !('IntersectionObserver' in window)) { p && p.classList.add('in'); return; }
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { p.classList.add('in'); io.disconnect(); } }, { threshold: 0.4 }).observe(p);
})();

/* ---- mobile menu ---- */
(() => {
  const nav = document.querySelector('.nav'), burger = nav && nav.querySelector('.burger'), menu = document.getElementById('menu');
  if (!burger || !menu) return;
  const scrim = document.createElement('div'); scrim.className = 'nav__scrim'; scrim.setAttribute('aria-hidden', 'true'); document.body.append(scrim);
  const set = (o) => { nav.classList.toggle('is-open', o); burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); document.documentElement.classList.toggle('menu-open', o); };
  burger.addEventListener('click', () => set(!nav.classList.contains('is-open')));
  scrim.addEventListener('click', () => set(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  matchMedia('(min-width: 56.01rem)').addEventListener('change', (e) => { if (e.matches) set(false); });
  const li = document.createElement('li'); li.className = 'menu__jump'; li.innerHTML = '<button type="button">Jump to...</button>'; menu.append(li);
  li.firstChild.addEventListener('click', () => { set(false); const k = document.querySelector('.nav__k'); if (k) k.click(); });
})();
