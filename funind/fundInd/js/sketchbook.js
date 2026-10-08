/**
 * Exact ThreeUI MengToSketchbookLandingPage Integration Engine
 * Authored structure, 18-strip 3D page curl, cosine shaders, pointer tilt,
 * spring loop, loupe magnifier, zoom controls, and typography.
 */

(function () {
  const DIR = 'sketchbook/';
  const PAGES = [
    { file: 'marina-bay-sands.png', title: 'Marina Bay Sands', place: 'Bayfront · FinTech & AI Hub' },
    { file: 'gardens-by-the-bay.png', title: 'Gardens by the Bay', place: 'Supertree Grove · ClimateTech' },
    { file: 'merlion.png', title: 'The Merlion', place: 'Merlion Park · Capital Gateway' },
    { file: 'buddha-tooth.png', title: 'Buddha Tooth Relic Temple', place: 'Chinatown · Heritage & Trade' },
    { file: 'joo-chiat.png', title: 'Joo Chiat Shophouses', place: 'Katong · Founder Ecosystem' },
    { file: 'lau-pa-sat.png', title: 'Lau Pa Sat', place: 'Raffles Quay · Financial District' },
    { file: 'marina-bay-skyline.png', title: 'Marina Bay Skyline', place: 'The Bay · Global VC Capital' },
    { file: 'singapore-river.png', title: 'Singapore River', place: 'Boat Quay · Angel Syndicate' },
    { file: 'botanic-gardens.png', title: 'Botanic Gardens', place: 'Tanglin · BioTech & Health' }
  ];

  PAGES.forEach(p => p.url = DIR + p.file);
  const M = PAGES.length, LAND = 6;

  let wrap, stage, sb3d, book, capBox, hint;
  let REDUCED = false;

  const N = 18;            /* 18 nested strips for smooth curved page turn */
  const SPAN = 0.449;      /* gutter -> outer page edge fraction */
  const BETA = 0.60;       /* peak curl of arc radians */
  let idx = 0, turn = null;
  let strips = [];

  function el(t, c) {
    const e = document.createElement(t);
    if (c) e.className = c;
    return e;
  }

  function imgEl(i, side) {
    const im = new Image();
    im.className = 'sb-half-img ' + side;
    im.draggable = false;
    im.alt = '';
    im.src = PAGES[i].url;
    return im;
  }

  function halfEl(pos, i) {
    const d = el('div', 'sb-half ' + pos);
    d.appendChild(imgEl(i, pos));
    d.appendChild(el('div', 'gutter-shade ' + pos));
    return d;
  }

  function buildCurl(dir, from, to) {
    strips = [];
    const c = el('div', 'curl ' + dir);
    c.style.setProperty('--n', N);
    c.style.setProperty('--span', SPAN);
    let host = c;
    for (let i = 0; i < N; i++) {
      const s = el('div', 'strip');
      s.style.setProperty('--i', i);
      const gut = 'calc(var(--bw) * 0.5)';
      const sw = 'calc(var(--bw) * ' + SPAN + ' / ' + N + ')';
      const A = 'calc(-1 * (' + gut + ' + ' + i + ' * ' + sw + '))';
      const B = 'calc(' + (i + 1) + ' * ' + sw + ' - ' + gut + ')';
      const f = el('div', 'face front'), b = el('div', 'face back');
      const dress = (e, url, px) => {
        e.style.backgroundImage = 'url(' + url + ')';
        e.style.backgroundPositionX = px;
      };
      dress(f, PAGES[from].url, dir === 'next' ? A : B);
      dress(b, PAGES[to].url, dir === 'next' ? B : A);
      f.appendChild(el('div', 'sh'));
      f.appendChild(el('div', 'gl'));
      b.appendChild(el('div', 'sh'));
      b.appendChild(el('div', 'gl'));
      s.appendChild(f);
      s.appendChild(b);
      if (i === N - 1) s.classList.add('edge');
      host.appendChild(s);
      host = s;
      strips.push(s);
    }
    return c;
  }

  function applyTurn(t) {
    const th = Math.PI * t;
    const beta = BETA * Math.sin(Math.PI * t);
    const D = 180 / Math.PI;
    const tt = th + beta, td = 2 * beta / N;
    if (!sb3d) return;
    sb3d.style.setProperty('--tt', (tt * D).toFixed(2) + 'deg');
    sb3d.style.setProperty('--td', (td * D).toFixed(3) + 'deg');
    sb3d.style.setProperty('--shade', Math.sin(Math.PI * t).toFixed(3));
    fadeCaption(t);
    for (let i = 0; i < strips.length; i++) {
      const l1 = Math.abs(Math.cos(tt - i * td));
      const l2 = Math.abs(Math.cos(tt - (i + 1) * td));
      const st = strips[i].style;
      st.setProperty('--lit', l1.toFixed(3));
      st.setProperty('--a1', ((1 - l1) * 0.62).toFixed(3));
      st.setProperty('--a2', ((1 - l2) * 0.62).toFixed(3));
    }
  }

  function paint() {
    if (!book) return;
    book.textContent = '';
    if (!turn) {
      const f = el('div', 'sb-full');
      const im = new Image();
      im.src = PAGES[idx].url;
      im.alt = PAGES[idx].title;
      im.draggable = false;
      f.appendChild(im);
      book.appendChild(f);
      if (sb3d) sb3d.style.setProperty('--shade', '0');
    } else {
      const next = turn.dir === 'next';
      book.appendChild(halfEl('left', next ? turn.from : turn.to));
      book.appendChild(halfEl('right', next ? turn.to : turn.from));
      book.appendChild(buildCurl(turn.dir, turn.from, turn.to));
      applyTurn(turn.t);
    }
    const a = el('button', 'sb-zone sb-prev'), b = el('button', 'sb-zone sb-next');
    a.setAttribute('aria-label', 'previous page');
    b.setAttribute('aria-label', 'next page');
    book.appendChild(a);
    book.appendChild(b);
    layout();
    caption();
    marks();
    syncZoomLayer();
    placeLoupe();
  }

  let capOut = null, capIn = null;
  function caption() {
    if (!capBox) return;
    capBox.textContent = '';
    capOut = capIn = null;
    if (turn) {
      capOut = el('p', 'sb-caption live');
      capOut.textContent = PAGES[turn.from].title;
      capBox.appendChild(capOut);
      capIn = el('p', 'sb-caption live');
      capIn.textContent = PAGES[turn.to].title;
      capBox.appendChild(capIn);
      fadeCaption(turn.t);
    } else {
      const p = el('p', 'sb-caption');
      p.textContent = PAGES[idx].title;
      capBox.appendChild(p);
    }
  }

  function fadeCaption(t) {
    if (!capOut || !capIn) return;
    const out = 1 - Math.max(0, Math.min(1, (t - 0.10) / 0.28));
    const inn = Math.max(0, Math.min(1, (t - 0.56) / 0.30));
    capOut.style.opacity = out.toFixed(3);
    capIn.style.opacity = inn.toFixed(3);
  }

  function layout() {
    if (sb3d && book) {
      sb3d.style.setProperty('--bw', book.clientWidth + 'px');
    }
  }

  window.addEventListener('resize', layout);

  /* Spring loop */
  let spring = null;
  function animateTo(target, onDone, stiff, damp) {
    spring = { kind: 'spring', v: 0, target: target, done: onDone, k: stiff || 150, c: damp || 22 };
    kick();
  }

  function tweenTo(target, dur, onDone) {
    spring = { kind: 'tween', from: turn ? turn.t : 0, target: target, dur: dur, e: 0, done: onDone };
    kick();
  }

  let raf = null, last = 0;
  function tick(now) {
    raf = null;
    const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
    last = now;
    if (spring && turn) {
      const s = spring;
      if (s.kind === 'tween') {
        s.e += dt;
        const k = Math.min(1, s.e / s.dur);
        turn.t = s.from + (s.target - s.from) * k;
        applyTurn(turn.t);
        if (k >= 1) {
          spring = null;
          const d = s.done;
          d && d();
        }
      } else {
        const x = turn.t - s.target;
        s.v += (-s.k * x - s.c * s.v) * dt;
        turn.t += s.v * dt;
        if (Math.abs(turn.t - s.target) < 0.002 && Math.abs(s.v) < 0.02) {
          turn.t = s.target;
          spring = null;
          applyTurn(turn.t);
          const d = s.done;
          d && d();
        } else {
          applyTurn(turn.t);
        }
      }
    }
    viewSpring();
    const lmoved = loupeEase();
    if ((spring || viewActive || lmoved) && raf === null) {
      raf = requestAnimationFrame(tick);
    }
  }

  function kick() {
    if (raf === null) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  /* Tilt & Zoom */
  const TILT_X = 4.5, TILT_Y = 7;
  const ZOOM_MIN = 0.9, ZOOM_MAX = 1.5;
  const view = { rx: 0, ry: 0, z: 1, trx: 0, try_: 0, tz: 1 };
  let viewActive = false;
  let lastZ = 1;

  function applyView() {
    if (!sb3d) return;
    sb3d.style.setProperty('--rx', view.rx.toFixed(2) + 'deg');
    sb3d.style.setProperty('--ry', view.ry.toFixed(2) + 'deg');
    sb3d.style.setProperty('--zoom', view.z.toFixed(3));
    if (view.z !== lastZ) {
      lastZ = view.z;
      placeLoupe();
    }
  }

  function viewSpring() {
    const e = 0.14;
    let moved = false;
    for (const [k, t] of [['rx', 'trx'], ['ry', 'try_'], ['z', 'tz']]) {
      const d = view[t] - view[k];
      if (Math.abs(d) > 0.0006) {
        view[k] += d * e;
        moved = true;
      } else {
        view[k] = view[t];
      }
    }
    if (moved) applyView();
    viewActive = moved;
    return moved;
  }

  function setView(rx, ry, z) {
    view.trx = Math.max(-TILT_X, Math.min(TILT_X, rx));
    view.try_ = Math.max(-TILT_Y, Math.min(TILT_Y, ry));
    view.tz = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    viewActive = true;
    kick();
    syncZoom();
  }

  function tiltTo(cx, cy) {
    if (drag || !book) return;
    const r = book.getBoundingClientRect();
    if (!r.width) return;
    const nx = Math.max(-1, Math.min(1, (cx - (r.left + r.width / 2)) / (r.width * 0.62)));
    const ny = Math.max(-1, Math.min(1, (cy - (r.top + r.height / 2)) / (r.height * 0.9)));
    setView(-ny * TILT_X, nx * TILT_Y, view.tz);
  }

  /* Pointer Drag Mechanics */
  let drag = null;
  function bookRect() { return book ? book.getBoundingClientRect() : { width: 0, left: 0 }; }
  function hideHint() { if (hint) hint.classList.add('gone'); }

  function startTurn(dir, t) {
    spring = null;
    if (turn) { idx = turn.to; turn = null; }
    shoveLoupe(dir);
    const from = idx;
    turn = { dir: dir, from: from, to: dir === 'next' ? (from + 1) % M : (from - 1 + M) % M, t: t || 0 };
    paint();
  }

  function commit() {
    if (!turn) return;
    if (REDUCED) { idx = turn.to; turn = null; paint(); return; }
    animateTo(1, () => { idx = turn.to; turn = null; paint(); }, 170, 26);
    kick();
  }

  function cancel() {
    if (!turn) return;
    animateTo(0, () => { turn = null; paint(); }, 150, 24);
    kick();
  }

  function step(dir) {
    if (introOn) endIntro();
    if (turn) { idx = turn.to; turn = null; }
    startTurn(dir, 0);
    commit();
  }

  function goTo(i) {
    if (introOn) endIntro();
    if (i === idx) return;
    if (turn) { idx = turn.to; turn = null; }
    const fwd = (i - idx + M) % M, back = (idx - i + M) % M;
    if (Math.min(fwd, back) === 1) {
      step(fwd === 1 ? 'next' : 'prev');
      return;
    }
    idx = i;
    paint();
  }

  /* Loupe Magnifier */
  let loupe, lens, mag, zRead, loupeBtn, zInBtn, zOutBtn;
  let zoomWrap, zoomInner, plateList;
  const MAG = 2.3;
  let loupeOn = true, lx = null, ly = null, lgrab = null, lTarget = null;

  function loupeSize() {
    return Math.round(Math.max(165, Math.min(262, (book ? book.clientWidth : 800) * 0.235)));
  }

  function bookBox() {
    return { x: 0, y: 0, w: book ? book.clientWidth : 800, h: book ? book.clientHeight : 600 };
  }

  function restLoupe() {
    const b = bookBox();
    lx = b.x + b.w * 0.88;
    ly = b.y + b.h * 0.855;
    placeLoupe();
  }

  function syncZoomLayer() {
    if (!zoomInner || !book) return;
    zoomInner.textContent = '';
    for (const c of book.children) {
      if (c.classList.contains('sb-zone')) continue;
      zoomInner.appendChild(c.cloneNode(true));
    }
  }

  function placeLoupe() {
    if (lx === null || !loupe) return;
    const B = bookBox(), bw = B.w, bh = B.h;
    if (!bw) return;
    const R = loupeSize() / 2, bez = R * 2 * 0.058;
    loupe.style.setProperty('--lr', R * 2 + 'px');
    loupe.style.transform = 'translate3d(' + (lx - R).toFixed(1) + 'px,' + (ly - R).toFixed(1) + 'px,0)';
    if (loupeOn) loupe.classList.add('on');

    const z = view.z, cx = bw / 2, cy = bh / 2;
    const x0 = cx + (bw * 0.051 - cx) * z, x1 = cx + (bw * 0.949 - cx) * z;
    const y0 = cy + (bh * 0.218 - cy) * z, y1 = cy + (bh * 0.782 - cy) * z;

    const nx = Math.max(x0, Math.min(lx, x1));
    const ny = Math.max(y0, Math.min(ly, y1));
    const inside = (lx > x0 && lx < x1 && ly > y0 && ly < y1)
      ? Math.min(lx - x0, x1 - lx, ly - y0, y1 - ly)
      : -Math.hypot(lx - nx, ly - ny);
    const k = Math.max(0, Math.min(1, (inside + R * 0.30) / (R * 0.55)));

    if (zoomWrap) {
      zoomWrap.style.opacity = (loupeOn ? k : 0).toFixed(3);
      if (k > 0.002) {
        const r = (R - bez).toFixed(1);
        const mask = 'radial-gradient(circle ' + r + 'px at ' + lx.toFixed(1) + 'px ' + ly.toFixed(1) + 'px,#000 calc(100% - 1px),transparent 100%)';
        zoomWrap.style.webkitMaskImage = mask;
        zoomWrap.style.maskImage = mask;
        const px = cx + (lx - cx) / z, py = cy + (ly - cy) / z, s = MAG * z;
        if (zoomInner) {
          zoomInner.style.transform = 'translate(' + (lx - px * s).toFixed(1) + 'px,' + (ly - py * s).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
        }
      }
    }
  }

  function shoveLoupe(dir) {
    if (!loupeOn || lx === null || lgrab) return;
    const b = bookBox();
    const nx = (b.w / 2 + (lx - b.x - b.w / 2) / view.z) / b.w, ny = (b.h / 2 + (ly - b.y - b.h / 2) / view.z) / b.h;
    if (nx < 0.02 || nx > 0.98 || ny < 0.17 || ny > 0.83) return;
    lTarget = { x: b.x + b.w * (dir === 'next' ? 0.12 : 0.88), y: b.y + b.h * 0.855 };
    kick();
  }

  function loupeEase() {
    if (!lTarget) return false;
    if (lgrab) { lTarget = null; return false; }
    const dx = lTarget.x - lx, dy = lTarget.y - ly;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      lx = lTarget.x;
      ly = lTarget.y;
      lTarget = null;
      placeLoupe();
      return false;
    }
    lx += dx * 0.17;
    ly += dy * 0.17;
    placeLoupe();
    return true;
  }

  function syncZoom() {
    if (!zRead) return;
    zRead.textContent = Math.round(view.tz * 100) + '%';
    if (zOutBtn) zOutBtn.disabled = view.tz <= ZOOM_MIN + 0.001;
    if (zInBtn) zInBtn.disabled = view.tz >= ZOOM_MAX - 0.001;
  }

  function marks() {
    if (!plateList) return;
    const cur = turn ? turn.to : idx;
    plateList.querySelectorAll('.plate').forEach((b, i) => b.setAttribute('aria-current', i === cur ? 'true' : 'false'));
  }

  let riffle = null, riffleAt = 0, introOn = false;
  function endIntro() {
    introOn = false;
    if (wrap) wrap.classList.remove('intro', 'b2');
  }

  function riffleStep() {
    if (!riffle || riffleAt >= riffle.length) {
      endIntro();
      paint();
      return;
    }
    const s = riffle[riffleAt];
    if (wrap) wrap.classList.toggle('b2', s.bell > 0.55);
    startTurn('next', 0);
    tweenTo(1, s.dur, () => {
      idx = turn.to;
      turn = null;
      riffleAt++;
      if (introOn && riffleAt < riffle.length) {
        paint();
        riffleStep();
      } else {
        endIntro();
        paint();
      }
    });
  }

  function startIntro() {
    const coarse = matchMedia('(max-width: 640px), (pointer: coarse)').matches;
    if (coarse || REDUCED) {
      idx = LAND;
      paint();
      return;
    }
    const steps = M + LAND;
    riffle = [];
    for (let r = 0; r < steps; r++) {
      const bell = Math.sin(Math.PI * (r / (steps - 1)));
      riffle.push({ bell: bell, dur: 0.26 - 0.19 * bell });
    }
    riffleAt = 0;
    introOn = true;
    if (wrap) wrap.classList.add('intro');
    riffleStep();
  }

  function initSketchbook() {
    wrap = document.getElementById('sbWrap');
    stage = document.getElementById('sbStage');
    sb3d = document.getElementById('sb3d');
    book = document.getElementById('sbBook');
    capBox = document.getElementById('sbCaptions');
    hint = document.getElementById('sbHint');
    loupe = document.getElementById('loupe');
    lens = document.getElementById('loupeLens');
    mag = document.getElementById('loupeMag');
    zRead = document.getElementById('zRead');
    loupeBtn = document.getElementById('loupeBtn');
    zInBtn = document.getElementById('zIn');
    zOutBtn = document.getElementById('zOut');
    zoomWrap = document.getElementById('zoomWrap');
    zoomInner = document.getElementById('zoomInner');
    plateList = document.getElementById('plateList');

    REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!stage || !book) return;

    // Stage pointer events
    stage.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      const onBook = e.target.closest('.sb-zone');
      stage.setPointerCapture(e.pointerId);
      hideHint();
      if (!onBook || introOn) return;
      const r = bookRect();
      const dir = (e.clientX - r.left) / r.width > 0.5 ? 'next' : 'prev';
      startTurn(dir, 0);
      drag = { dir: dir, x0: e.clientX, w: r.width, moved: 0, vel: 0, tPrev: performance.now() };
    });

    stage.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x0;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      const raw = (drag.dir === 'next' ? -dx : dx) / (drag.w * 0.62);
      const t = Math.max(0, Math.min(1, raw));
      const now = performance.now();
      drag.vel = (t - (turn ? turn.t : 0)) / Math.max(0.001, (now - drag.tPrev) / 1000);
      drag.tPrev = now;
      if (turn) { turn.t = t; applyTurn(t); }
    });

    function endDrag(e) {
      if (!drag) return;
      const d = drag;
      drag = null;
      if (!turn) return;
      if (d.moved < 6) {
        commit();
        return;
      }
      const go = turn.t > 0.42 || d.vel > 1.1;
      if (go) commit(); else cancel();
    }

    stage.addEventListener('dragstart', e => e.preventDefault());
    stage.addEventListener('selectstart', e => e.preventDefault());
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    // Global pointermove for 3D tilt
    window.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      tiltTo(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('pointerout', e => { if (!e.relatedTarget) setView(0, 0, view.tz); });
    window.addEventListener('blur', () => setView(0, 0, view.tz));
    stage.addEventListener('dblclick', () => setView(view.trx, view.try_, 1));

    // Arrow navigation buttons
    const leftBtn = document.getElementById('sbLeft');
    const rightBtn = document.getElementById('sbRight');
    if (leftBtn) leftBtn.onclick = () => step('prev');
    if (rightBtn) rightBtn.onclick = () => step('next');

    window.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      hideHint();
      step(e.key === 'ArrowRight' ? 'next' : 'prev');
    });

    // Loupe interaction
    if (loupe) {
      loupe.addEventListener('pointerdown', e => {
        if (!loupeOn || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        lTarget = null;
        lgrab = { cx: e.clientX, cy: e.clientY, lx0: lx, ly0: ly };
        loupe.classList.add('held');
        loupe.setPointerCapture(e.pointerId);
        hideHint();
      });

      loupe.addEventListener('pointermove', e => {
        if (!lgrab) return;
        const b = bookBox(), R = loupeSize() / 2;
        lx = Math.max(b.x - R * 0.7, Math.min(b.x + b.w + R * 0.7, lgrab.lx0 + (e.clientX - lgrab.cx)));
        ly = Math.max(b.y - R * 0.7, Math.min(b.y + b.h + R * 1.0, lgrab.ly0 + (e.clientY - lgrab.cy)));
        placeLoupe();
      });

      function dropLoupe() {
        lgrab = null;
        loupe.classList.remove('held');
      }
      loupe.addEventListener('pointerup', dropLoupe);
      loupe.addEventListener('pointercancel', dropLoupe);
    }

    if (loupeBtn) {
      loupeBtn.onclick = () => {
        loupeOn = !loupeOn;
        loupeBtn.setAttribute('aria-pressed', String(loupeOn));
        if (loupe) loupe.classList.toggle('on', loupeOn);
        if (loupeOn && lx === null) restLoupe();
      };
    }

    if (zInBtn) zInBtn.onclick = () => { setView(view.trx, view.try_, view.tz * 1.16); hideHint(); };
    if (zOutBtn) zOutBtn.onclick = () => { setView(view.trx, view.try_, view.tz / 1.16); hideHint(); };

    // Build editorial plates index
    if (plateList) {
      plateList.textContent = '';
      PAGES.forEach((p, i) => {
        const li = el('li');
        const b = el('button', 'plate');
        b.innerHTML = '<span class="n">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="t"></span><span class="p"></span>';
        b.querySelector('.t').textContent = p.title;
        b.querySelector('.p').textContent = p.place;
        b.onclick = () => {
          goTo(i);
          const sbElem = document.getElementById('sketchbook');
          if (sbElem) sbElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        li.appendChild(b);
        plateList.appendChild(li);
      });
    }

    // Initialize display
    paint();
    applyView();
    syncZoom();
    restLoupe();

    // Preload images
    Promise.all(PAGES.map(p => {
      const im = new Image();
      im.src = p.url;
      return im.decode ? im.decode().catch(() => {}) : new Promise(r => { im.onload = im.onerror = r; });
    })).then(() => {
      setTimeout(startIntro, 300);
    });
  }

  // Expose initializer
  window.initSketchbookExperience = initSketchbook;
})();
