/* exp-keep.js — Cartographer's Keep: a merge-and-collect game.
   #/place/cartographers-keep
   The painted room is the stage. The board is a live canvas (own physics: js/keep-engine.js); the score signs,
   the progression guide and the buttons are live HTML sitting on the painting. Sprites are cut from the concept art
   (assets/keep/*.webp). Drop tokens; two touching tokens of the same kind merge into the next one up. */
(function () {
  var G = 1100 / 1536;
  function V(r) { return MPM.scene.vars(r.map(function (n) { return n * G; })); }

  /* ---------------- editable content ---------------- */
  var ITEMS = [   /* the 12-step progression — order here IS the merge order */
    { id: "acorn", name: "Acorn", r: 25 },
    { id: "pinecone", name: "Pinecone", r: 34 },
    { id: "leaf", name: "Autumn Leaf", r: 43 },
    { id: "drafting", name: "Drafting Compass", r: 53 },
    { id: "puzzle", name: "Puzzle Piece", r: 64 },
    { id: "tree", name: "Tree", r: 75 },
    { id: "wood", name: "Tree-Ring Wood Slice", r: 87 },
    { id: "navcompass", name: "Navigation Compass", r: 99 },
    { id: "scroll", name: "Rolled Map Scroll", r: 112 },
    { id: "books", name: "Stack of Books", r: 125 },
    { id: "globe", name: "Globe", r: 139 },
    { id: "cabin", name: "Explorer’s Cabin", r: 153 }
  ];
  var TEXT = { over: "Your collection has reached its limit!", next: "Next to drop" };
  /* drop pool: weights for levels 0..4, easing toward bigger pieces as the score climbs */
  var POOLS = [[45, 30, 18, 7, 0], [36, 28, 22, 11, 3], [28, 25, 24, 16, 7], [22, 22, 24, 19, 13]];
  var CABIN_BONUS = 1000;
  var KEY = "mpm.keep.v1";

  /* board geometry, in board pixels (canvas = 733 x 893; the playfield sits inside it) */
  var CW = 733, CH = 893, IN = { l: 13, r: 723, t: 148, b: 881 }, HOLD_Y = 74, LINE_Y = 172;
  var BOARD = [385, 12, 1118, 905];

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  function baseScore(level) { return 10 * level * (level + 1) / 2; }

  MPM.registerExperience("cartographers-keep", function (root) {
    var st = load(), best = +st.best || 0, reached = Math.min(+st.reached || 0, ITEMS.length - 1), soundOn = !!st.sound;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var radii = ITEMS.map(function (i) { return i.r; });
    var world = new MPM.KeepEngine.World({ l: IN.l, r: IN.r, b: IN.b, radii: radii });

    var guide = ITEMS.map(function (it, i) {
      return '<li data-l="' + i + '" title="' + it.name + '"><img src="assets/keep/' + it.id + '.webp" alt="" draggable="false"><span class="nm">' + it.name + '</span></li>';
    }).join("");

    var wrap = document.createElement("section");
    wrap.className = "scene kp";
    wrap.innerHTML =
      '<div class="stage" style="background-image:url(assets/keep/keep-bg.webp)">' + MPM.scene.back() +
        '<h1 class="kp-title">The Cartographer’s Keep</h1>' +
        '<div class="abs kp-score" style="' + V([188, 222, 314, 276]) + '"><span class="lbl">Score</span><b data-score>0</b></div>' +
        '<div class="abs kp-best" style="' + V([192, 360, 310, 412]) + '"><span class="lbl">Best</span><b data-best>' + fmt(best) + '</b></div>' +
        '<div class="abs kp-btns" style="' + V([190, 752, 326, 856]) + '">' +
          '<button type="button" class="kp-btn" data-act="restart">↻ Restart</button>' +
          '<button type="button" class="kp-btn" data-act="sound" aria-pressed="false">♪ Sound off</button></div>' +
        '<div class="abs kp-board" tabindex="0" role="application" aria-label="Merge board. Move the pointer or use the left and right arrow keys to aim, then click, tap or press space to drop." style="' + V(BOARD) + '">' +
          '<div class="kp-frame" aria-hidden="true"></div><canvas data-cv width="' + CW + '" height="' + CH + '"></canvas>' +
          '<span class="kp-cap">' + TEXT.next + '</span>' +
          '<div class="kp-over" hidden role="alertdialog" aria-labelledby="kpOverT"><div class="kp-card">' +
            '<h2 id="kpOverT">' + TEXT.over + '</h2>' +
            '<p class="kp-fs">Final score <b data-fs>0</b></p><p class="kp-bs">Best score <b data-bs>0</b></p><p class="kp-nb" hidden>✦ A new best! ✦</p>' +
            '<button type="button" class="kp-try">Try Again</button></div></div>' +
        '</div>' +
        '<aside class="abs kp-guide" style="' + V([1158, 40, 1338, 915]) + '" aria-label="Merge guide: the twelve objects in order, from acorn to explorer’s cabin"><ol>' + guide + '</ol></aside>' +
      '</div>';
    root.appendChild(wrap);

    var $ = function (s) { return wrap.querySelector(s); };
    var cv = $("[data-cv]"), ctx = cv.getContext("2d"), board = $(".kp-board");
    var elScore = $("[data-score]"), elBest = $("[data-best]"), over = $(".kp-over");
    var lis = [].slice.call(wrap.querySelectorAll(".kp-guide li"));

    /* sprites */
    var img = {}, loaded = 0;
    ITEMS.forEach(function (it) { var im = new Image(); im.onload = function () { loaded++; }; im.src = "assets/keep/" + it.id + ".webp"; img[it.id] = im; });

    /* ---------------- state ---------------- */
    var score = 0, isOver = false, cur = null, cooldown = 0, aimX = (IN.l + IN.r) / 2, overTimer = 0, danger = 0;
    var comboN = 0, comboT = -9, fx = [], texts = [], clock = 0, newBest = false;

    function pickLevel() {
      var tier = Math.min(POOLS.length - 1, Math.floor(score / 1800)), w = POOLS[tier], sum = 0, i;
      for (i = 0; i < w.length; i++) sum += w[i];
      var r = Math.random() * sum;
      for (i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return i; }
      return 0;
    }
    function spawn() { cur = { level: pickLevel(), born: clock }; markSeen(cur.level); }
    function markSeen(l) {
      if (l > reached) { reached = l; save({ best: best, reached: reached, sound: soundOn }); }
      paintGuide();
    }
    function paintGuide() {
      lis.forEach(function (li, i) {
        li.classList.toggle("seen", i <= reached);
        li.classList.toggle("next", i === reached + 1);
        li.classList.toggle("last", i === ITEMS.length - 1);
      });
    }

    function setScore(v) { score = v; elScore.textContent = fmt(score); if (score > best) { best = score; newBest = true; elBest.textContent = fmt(best); save({ best: best, reached: reached, sound: soundOn }); } }

    /* ---------------- sound (opt-in) ---------------- */
    var ac = null;
    function tone(f, d, type, vol, slide) {
      if (!soundOn) return;
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
        o.type = type || "sine"; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
        g.gain.setValueAtTime(vol || 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.02);
      } catch (e) {}
    }
    function paintSound() { var b = $('[data-act="sound"]'); b.textContent = "♪ Sound " + (soundOn ? "on" : "off"); b.setAttribute("aria-pressed", soundOn ? "true" : "false"); }

    /* ---------------- actions ---------------- */
    function drop() {
      if (isOver || !cur || cooldown > 0) return;
      var b = world.add(cur.level, aimX, HOLD_Y, 0, 60);
      b.pop = -9; cur = null; cooldown = 0.55;
      tone(260, 0.12, "triangle", 0.07, 180);
    }
    function restart() {
      world.clear(); fx.length = 0; texts.length = 0; comboN = 0; isOver = false; overTimer = 0; danger = 0; newBest = false;
      score = 0; elScore.textContent = "0"; over.hidden = true; board.classList.remove("is-over"); cooldown = 0; spawn();
    }
    function gameOver() {
      isOver = true; cur = null; tone(160, 0.6, "sawtooth", 0.07, 70);
      $("[data-fs]").textContent = fmt(score); $("[data-bs]").textContent = fmt(best);
      $(".kp-nb").hidden = !(newBest && score > 0);
      board.classList.add("is-over");
      setTimeout(function () { if (isOver) { over.hidden = false; var b = $(".kp-try"); if (b) b.focus({ preventScroll: true }); } }, reduce ? 0 : 650);
    }

    /* ---------------- effects ---------------- */
    function burst(x, y, r, level) {
      texts.push({ x: x, y: y - r * 0.4, t: 0, life: 1, s: "" });
      fx.push({ k: "ring", x: x, y: y, r0: r * 0.9, r1: r * 1.7, t: 0, life: 0.45 });
      if (reduce) return;
      for (var i = 0; i < 8 + level; i++) {
        var a = Math.random() * 6.283, sp = 90 + Math.random() * 190;
        fx.push({ k: "sp", x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, t: 0, life: 0.5 + Math.random() * 0.4, s: 2 + Math.random() * 3.2 });
      }
    }
    function floatText(x, y, s, big) { texts.push({ x: x, y: y, t: 0, life: 1.1, s: s, big: big }); }

    function handleEvents() {
      var ev = world.events;
      for (var i = 0; i < ev.length; i++) {
        var e = ev[i];
        if (e.type === "merge") {
          if (clock - comboT < 0.9) comboN++; else comboN = 1;
          comboT = clock;
          var mult = Math.min(1 + 0.5 * (comboN - 1), 4), pts = Math.round(baseScore(e.level) * mult);
          setScore(score + pts); e.body.pop = clock; markSeen(e.level);
          burst(e.x, e.y, e.body.r, e.level);
          floatText(e.x, e.y - e.body.r * 0.5, "+" + fmt(pts), e.level > 6);
          if (comboN >= 2) floatText(e.x, e.y - e.body.r * 0.5 - 28, "Combo ×" + comboN, false);
          tone(300 + e.level * 55, 0.22, "sine", 0.09, 420 + e.level * 70);
        } else if (e.type === "vanish") {
          setScore(score + CABIN_BONUS); burst(e.x, e.y, 120, 11);
          floatText(e.x, e.y, "+" + fmt(CABIN_BONUS) + " ✦ Two cabins!", true);
          tone(520, 0.5, "triangle", 0.1, 900);
        }
      }
    }

    /* ---------------- update / render ---------------- */
    function update(dt) {
      clock += dt;
      if (cooldown > 0) { cooldown -= dt; if (cooldown <= 0 && !isOver && !cur) spawn(); }
      world.step(dt);
      if (world.events.length) handleEvents();
      var i, minTop = 1e9, stuck = false;
      for (i = 0; i < world.bodies.length; i++) {
        var b = world.bodies[i], top = b.y - b.r;
        if (b.age > 1.2) { if (top < minTop) minTop = top; if (top < LINE_Y && Math.abs(b.vx) + Math.abs(b.vy) < 45) stuck = true; }
      }
      var target = minTop < 1e8 ? Math.max(0, Math.min(1, (IN.t + 190 - minTop) / 120)) : 0;
      danger += (target - danger) * Math.min(1, dt * 4);
      if (!isOver) { overTimer = stuck ? overTimer + dt : Math.max(0, overTimer - dt * 2); if (overTimer > 1.7) gameOver(); }
      for (i = fx.length - 1; i >= 0; i--) { var f = fx[i]; f.t += dt; if (f.k === "sp") { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 420 * dt; } if (f.t >= f.life) fx.splice(i, 1); }
      for (i = texts.length - 1; i >= 0; i--) { texts[i].t += dt; if (texts[i].t >= texts[i].life) texts.splice(i, 1); }
    }

    var sc = 1;
    function sprite(level, x, y, r, a, scale) {
      var im = img[ITEMS[level].id]; if (!im.complete || !im.naturalWidth) { ctx.fillStyle = "#c98a45"; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill(); return; }
      var d = r * 2.06 * (scale || 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a || 0); ctx.drawImage(im, -d / 2, -d / 2, d, d); ctx.restore();
    }

    function render() {
      ctx.setTransform(sc, 0, 0, sc, 0, 0);
      ctx.clearRect(0, 0, CW, CH);
      /* playfield */
      var gr = ctx.createLinearGradient(0, IN.t, 0, IN.b);
      gr.addColorStop(0, "#3c2117"); gr.addColorStop(1, "#2b150a");
      ctx.fillStyle = gr; ctx.fillRect(IN.l, IN.t, IN.r - IN.l, IN.b - IN.t);
      var vg = ctx.createRadialGradient((IN.l + IN.r) / 2, (IN.t + IN.b) / 2, 120, (IN.l + IN.r) / 2, (IN.t + IN.b) / 2, 520);
      vg.addColorStop(0, "rgba(255,170,90,.06)"); vg.addColorStop(1, "rgba(0,0,0,.28)");
      ctx.fillStyle = vg; ctx.fillRect(IN.l, IN.t, IN.r - IN.l, IN.b - IN.t);
      /* limit line */
      ctx.save(); ctx.setLineDash([10, 9]); ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,120,80," + (0.22 + 0.6 * danger * (0.6 + 0.4 * Math.sin(clock * 7))).toFixed(3) + ")";
      ctx.beginPath(); ctx.moveTo(IN.l + 6, LINE_Y); ctx.lineTo(IN.r - 6, LINE_Y); ctx.stroke(); ctx.restore();

      /* tokens (shadow first, then art) */
      var B = world.bodies, i, b;
      for (i = 0; i < B.length; i++) { b = B[i]; ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.arc(b.x + 3, b.y + 5, b.r * 0.99, 0, 6.2832); ctx.fill(); }
      for (i = 0; i < B.length; i++) {
        b = B[i]; var pt = clock - (b.pop || -9), s = 1;
        if (pt >= 0 && pt < 0.34) s = 1 + 0.22 * Math.sin(Math.PI * pt / 0.34) * (1 - pt / 0.34 * 0.4);
        sprite(b.level, b.x, b.y, b.r, b.a, s);
      }

      /* held token, glow, drop guide */
      if (cur && !isOver) {
        var it = ITEMS[cur.level], r = it.r, hx = Math.max(IN.l + r, Math.min(IN.r - r, aimX)), age = clock - cur.born;
        var yy = HOLD_Y, hit = IN.b;
        for (i = 0; i < B.length; i++) { b = B[i]; var dx = Math.abs(b.x - hx), R = b.r + r; if (dx < R) { var yh = b.y - Math.sqrt(R * R - dx * dx); if (yh < hit) hit = yh; } }
        hit = Math.min(hit, IN.b - r);
        ctx.save(); ctx.setLineDash([9, 9]); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,236,200,.55)";
        ctx.beginPath(); ctx.moveTo(hx, yy + r + 4); ctx.lineTo(hx, hit - r); ctx.stroke(); ctx.restore();
        if (hit - r > yy + r + 20) { ctx.save(); ctx.globalAlpha = 0.28; sprite(cur.level, hx, hit, r, 0, 1); ctx.restore(); }
        var gl = 0.5 + 0.5 * Math.sin(clock * 3.2), pop = age < 0.25 ? age / 0.25 : 1;
        var rg = ctx.createRadialGradient(hx, yy, r * 0.8, hx, yy, r * (1.9 + 0.25 * gl));
        rg.addColorStop(0, "rgba(255,206,120," + (0.55 + 0.25 * gl).toFixed(2) + ")"); rg.addColorStop(1, "rgba(255,170,70,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(hx, yy, r * 2.2, 0, 6.2832); ctx.fill();
        sprite(cur.level, hx, yy, r, 0, 0.55 + 0.45 * pop);
      }

      /* effects */
      for (i = 0; i < fx.length; i++) {
        var f = fx[i], p = f.t / f.life;
        if (f.k === "ring") { ctx.strokeStyle = "rgba(255,226,160," + (0.8 * (1 - p)).toFixed(2) + ")"; ctx.lineWidth = 5 * (1 - p) + 1; ctx.beginPath(); ctx.arc(f.x, f.y, f.r0 + (f.r1 - f.r0) * p, 0, 6.2832); ctx.stroke(); }
        else { ctx.fillStyle = "rgba(255," + (200 + (i % 3) * 18) + "," + (130 + (i % 4) * 25) + "," + (1 - p).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(f.x, f.y, f.s * (1 - p * 0.5), 0, 6.2832); ctx.fill(); }
      }
      ctx.textAlign = "center"; ctx.lineJoin = "round";
      for (i = 0; i < texts.length; i++) {
        var T = texts[i]; if (!T.s) continue; var q = T.t / T.life;
        ctx.globalAlpha = q < 0.7 ? 1 : 1 - (q - 0.7) / 0.3;
        ctx.font = "700 " + (T.big ? 30 : 24) + "px Georgia, 'Palatino Linotype', serif";
        ctx.lineWidth = 5; ctx.strokeStyle = "rgba(40,18,6,.85)"; ctx.strokeText(T.s, T.x, T.y - 46 * q);
        ctx.fillStyle = "#ffe3a1"; ctx.fillText(T.s, T.x, T.y - 46 * q);
      }
      ctx.globalAlpha = 1;
    }

    /* ---------------- loop ---------------- */
    var raf = 0, last = 0, acc = 0, STEP = 1 / 60;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min(0.1, (now - (last || now)) / 1000); last = now; acc += dt;
      var n = 0; while (acc >= STEP && n < 5) { update(STEP); acc -= STEP; n++; }
      if (n === 5) acc = 0;
      render();
    }

    /* ---------------- sizing ---------------- */
    function resize() {
      var w = board.clientWidth || CW, dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      var px = Math.round(w * dpr); if (cv.width !== px) { cv.width = px; cv.height = Math.round(px * CH / CW); }
      sc = cv.width / CW;
    }
    var ro = window.ResizeObserver ? new ResizeObserver(resize) : null; if (ro) ro.observe(board); else window.addEventListener("resize", resize);
    resize();

    /* ---------------- input (mouse, touch, keyboard) ---------------- */
    function worldX(e) { var r = cv.getBoundingClientRect(); return (e.clientX - r.left) / r.width * CW; }
    function aim(e) { aimX = worldX(e); }
    cv.addEventListener("pointerdown", function (e) { aim(e); try { cv.setPointerCapture(e.pointerId); } catch (x) {} board.focus({ preventScroll: true }); e.preventDefault(); });
    cv.addEventListener("pointermove", aim);
    cv.addEventListener("pointerup", function (e) { aim(e); drop(); });
    cv.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    board.addEventListener("keydown", function (e) {
      var k = e.key, step = e.shiftKey ? 60 : 20;
      if (k === "ArrowLeft") { aimX -= step; e.preventDefault(); }
      else if (k === "ArrowRight") { aimX += step; e.preventDefault(); }
      else if (k === " " || k === "Enter") { if (e.target === board) { drop(); e.preventDefault(); } }
    });
    wrap.addEventListener("click", function (e) {
      var a = e.target.closest("[data-act]"), t = e.target.closest(".kp-try");
      if (t) { restart(); return; }
      if (!a) return;
      if (a.dataset.act === "restart") restart();
      else if (a.dataset.act === "sound") { soundOn = !soundOn; save({ best: best, reached: reached, sound: soundOn }); paintSound(); tone(440, 0.12, "sine", 0.08); }
    });
    function esc(e) { if (e.key === "Escape") MPM.router.go("#/atlas"); }
    document.addEventListener("keydown", esc);

    paintGuide(); paintSound(); spawn();
    raf = requestAnimationFrame(frame);

    /* test hook (harmless in production) */
    wrap._kp = { world: world, ITEMS: ITEMS, drop: drop, aim: function (x) { aimX = x; }, setCur: function (l) { cur = { level: l, born: clock - 1 }; cooldown = 0; },
      state: function () { return { score: score, best: best, over: isOver, reached: reached, cur: cur && cur.level, cooldown: cooldown }; }, update: update, render: render };

    return function () {
      cancelAnimationFrame(raf); if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
      document.removeEventListener("keydown", esc);
      try { if (ac) ac.close(); } catch (e) {}
    };
  });
})();
