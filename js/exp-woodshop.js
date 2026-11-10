/* exp-woodshop.js — The Woodworker's Workshop (Makers Range).
   #/place/woodworkers-workshop       → the entrance card ("Start Game" / close)
   #/place/woodworkers-workshop/play  → Wood Tetris, driven by js/tetris-engine.js
   The painted entrance is kept exactly as approved; invisible, keyboard-focusable hotspots sit on its buttons.
   In the game, the painted board, score numbers and "Next" pieces are replaced by live ones; the frame, signs and tools are the painting. */
(function () {
  var ENTRANCE = "assets/wood/entrance.webp", GAME = "assets/wood/game.webp";
  var HERE = "#/place/woodworkers-workshop";
  function P(r, W, H) { return "left:" + (r[0] / W * 100).toFixed(3) + "%;top:" + (r[1] / H * 100).toFixed(3) + "%;width:" + ((r[2] - r[0]) / W * 100).toFixed(3) + "%;height:" + ((r[3] - r[1]) / H * 100).toFixed(3) + "%"; }

  MPM.registerExperience("woodworkers-workshop", function (root, place, sub) {
    return sub === "play" ? game(root) : entrance(root);
  });

  /* ------------------------------ entrance ------------------------------ */
  function entrance(root) {
    var W = 1672, H = 941;
    var wrap = document.createElement("section");
    wrap.className = "scene ws";
    wrap.innerHTML =
      MPM.scene.back() +
      '<div class="ws-view"><div class="ws-inner" style="background-image:url(' + ENTRANCE + ')" role="group" aria-label="Welcome to the Woodshop">' +
        '<p class="sr-only">Welcome to the Woodshop! Here you can build your foundation in Tetris! Don’t forget to learn your types of woods along the way!</p>' +
        '<a class="hs hs-start" href="' + HERE + '/play" style="' + P([598, 664, 1064, 766], W, H) + '" aria-label="Start Game"><span></span></a>' +
        '<a class="hs hs-close" href="#/atlas" style="' + P([1244, 70, 1360, 186], W, H) + '" aria-label="Close and return to the Atlas"><span></span></a>' +
      '</div></div>';
    root.appendChild(wrap);
    var start = wrap.querySelector(".hs-start");
    setTimeout(function () { try { start.focus({ preventScroll: true }); } catch (e) {} }, 60);
    function key(e) { if (e.key === "Escape") MPM.router.go("#/atlas"); }
    document.addEventListener("keydown", key);
    return function () { document.removeEventListener("keydown", key); };
  }

  /* -------------------------------- game -------------------------------- */
  function game(root) {
    var W = 1536, H = 1024, T = MPM.TETRIS, COLS = T.COLS, ROWS = T.ROWS;
    var WOOD = {}; T.WOODS.forEach(function (w) { WOOD[w.id] = w; });
    var BEST_KEY = "mpm.woodtetris.best";
    function getBest() { try { return +localStorage.getItem(BEST_KEY) || 0; } catch (e) { return 0; } }
    function setBest(n) { try { localStorage.setItem(BEST_KEY, String(n)); } catch (e) {} }
    var fmt = function (n) { return Number(n).toLocaleString("en-CA"); };

    var wrap = document.createElement("section");
    wrap.className = "scene wg";
    wrap.innerHTML =
      '<div class="wgstage" style="background-image:url(' + GAME + ')">' + MPM.scene.back(HERE, "Back to the Woodshop entrance") +
        '<div class="hud">' +
          '<div class="plate" style="' + P([250, 382, 447, 462], W, H) + '"><span class="lbl">Score</span><span class="n" id="w-score" aria-live="off">0</span></div>' +
          '<div class="plate" style="' + P([250, 487, 447, 570], W, H) + '"><span class="lbl">Lines</span><span class="n" id="w-lines">0</span></div>' +
          '<div class="plate" style="' + P([250, 593, 447, 680], W, H) + '"><span class="lbl">Level</span><span class="n" id="w-level">1</span></div>' +
        '</div>' +
        '<div class="board" style="' + P([548, 116, 1005, 820], W, H) + '"><canvas id="w-board" aria-label="Wood Tetris playfield" role="img"></canvas>' +
          '<div class="ovl" id="w-ovl"></div></div>' +
        '<div class="nextbox" style="' + P([1118, 262, 1300, 588], W, H) + '"><span class="nlbl">Next</span><canvas id="w-next" aria-label="Next pieces" role="img"></canvas></div>' +
        '<aside class="wnote" style="' + P([1102, 614, 1318, 762], W, H) + '" aria-live="polite"><h2>Wood Notes</h2><p id="w-note"></p></aside>' +
        '<div class="wctl" style="' + P([548, 832, 1005, 894], W, H) + '">' +
          '<button type="button" class="wbtn" id="w-pause">Pause</button><button type="button" class="wbtn" id="w-restart">Restart</button><button type="button" class="wbtn" id="w-exit">Exit</button></div>' +
        '<p class="whint" style="' + P([430, 898, 1125, 944], W, H) + '"><b>&larr; &rarr;</b> move &nbsp; <b>&uarr;</b> rotate &nbsp; <b>&darr;</b> soft drop &nbsp; <b>Space</b> drop &nbsp; <b>P</b> pause</p>' +
        '<div class="pad" aria-label="Touch controls">' +
          '<button type="button" data-k="left" aria-label="Move left">&#9664;</button><button type="button" data-k="rot" aria-label="Rotate">&#10227;</button>' +
          '<button type="button" data-k="down" aria-label="Soft drop">&#9660;</button><button type="button" data-k="drop" aria-label="Drop">&#10515;</button><button type="button" data-k="right" aria-label="Move right">&#9654;</button></div>' +
      '</div>';
    root.appendChild(wrap);

    var $ = function (s) { return wrap.querySelector(s); };
    var cvB = $("#w-board"), cvN = $("#w-next"), ovl = $("#w-ovl"), noteEl = $("#w-note");
    var elScore = $("#w-score"), elLines = $("#w-lines"), elLevel = $("#w-level"), btnPause = $("#w-pause");
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    var flash = null, lastType = "", acc = 0, last = 0, raf = 0, mode = "ready"; // ready | running | paused | over
    var g = new MPM.Tetris({
      onClear: function (rows) { flash = { rows: rows, t: performance.now() }; },
      onGameOver: function (gm) { finish(gm); }
    });

    /* ----- drawing ----- */
    function fit(cv) {
      var r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      var w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      return d;
    }
    function block(ctx, x, y, s, w, seed) {
      var pad = Math.max(1, s * .04), r = s * .09, q = s - pad * 2, b = Math.max(2, s * .08);
      ctx.fillStyle = w.face; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x + pad, y + pad, q, q, r); else ctx.rect(x + pad, y + pad, q, q);
      ctx.fill();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = w.grain; ctx.globalAlpha = .3; ctx.lineWidth = Math.max(1, s * .03);
      for (var i = 0; i < 3; i++) {
        var yy = y + s * (.24 + .26 * i) + ((seed + i * 3) % 5 - 2) * s * .02;
        ctx.beginPath(); ctx.moveTo(x, yy); ctx.bezierCurveTo(x + s * .3, yy - s * .06, x + s * .65, yy + s * .06, x + s, yy - s * .02); ctx.stroke();
      }
      ctx.globalAlpha = .75; ctx.fillStyle = w.light; ctx.fillRect(x + pad, y + pad, q, b); ctx.fillRect(x + pad, y + pad, b, q);
      ctx.fillStyle = w.dark; ctx.fillRect(x + pad, y + s - pad - b, q, b); ctx.fillRect(x + s - pad - b, y + pad, b, q);
      ctx.restore(); ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(30,14,4,.55)"; ctx.lineWidth = Math.max(1, s * .025); ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x + pad, y + pad, q, q, r); else ctx.rect(x + pad, y + pad, q, q);
      ctx.stroke();
    }
    function drawBoard() {
      var d = fit(cvB), ctx = cvB.getContext("2d"), cw = cvB.width, ch = cvB.height, s = cw / COLS;
      ctx.clearRect(0, 0, cw, ch);
      var bg = ctx.createLinearGradient(0, 0, 0, ch); bg.addColorStop(0, "#3d2111"); bg.addColorStop(1, "#2f180c");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = "rgba(255,200,140,.07)"; ctx.lineWidth = Math.max(1, d * .8); ctx.beginPath();
      for (var c = 1; c < COLS; c++) { ctx.moveTo(c * s, 0); ctx.lineTo(c * s, ch); }
      for (var r = 1; r < ROWS; r++) { ctx.moveTo(0, r * (ch / ROWS)); ctx.lineTo(cw, r * (ch / ROWS)); }
      ctx.stroke();
      var sy = ch / ROWS;
      function cell(cx, cy, type) { block(ctx, cx * s, cy * sy, Math.min(s, sy), WOOD[type], cx * 7 + cy * 13); }
      for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) if (g.board[y][x]) cell(x, y, g.board[y][x]);
      if (!g.over && mode !== "ready") {
        var gy = g.ghostY(), dy = gy - g.piece.y;
        if (dy > 0) {
          ctx.save(); ctx.setLineDash([s * .14, s * .1]); ctx.strokeStyle = "rgba(255,240,205,.6)"; ctx.lineWidth = Math.max(1.5, d * 1.4);
          g.cells(g.piece, 0, dy, 0).forEach(function (p) { if (p[1] >= 0) ctx.strokeRect(p[0] * s + s * .08, p[1] * sy + sy * .08, s * .84, sy * .84); });
          ctx.restore();
        }
        g.cells(g.piece, 0, 0, 0).forEach(function (p) { if (p[1] >= 0) cell(p[0], p[1], g.piece.type); });
      }
      if (flash && !reduced) {
        var a = 1 - (performance.now() - flash.t) / 220;
        if (a > 0) { ctx.fillStyle = "rgba(255,235,170," + (a * .55).toFixed(2) + ")"; flash.rows.forEach(function (rw) { ctx.fillRect(0, rw * sy, cw, sy); }); } else flash = null;
      }
    }
    function drawNext() {
      fit(cvN); var ctx = cvN.getContext("2d"), cw = cvN.width, ch = cvN.height;
      ctx.clearRect(0, 0, cw, ch);
      var slots = 3, sh = ch / slots, s = Math.min(cw / 4.6, sh / 3.4);
      for (var i = 0; i < slots; i++) {
        var type = g.queue[i], cells = T.cellsFor(type, 0), minx = 9, maxx = 0, miny = 9, maxy = 0;
        cells.forEach(function (c) { minx = Math.min(minx, c[0]); maxx = Math.max(maxx, c[0]); miny = Math.min(miny, c[1]); maxy = Math.max(maxy, c[1]); });
        var ox = (cw - (maxx - minx + 1) * s) / 2 - minx * s, oy = i * sh + (sh - (maxy - miny + 1) * s) / 2 - miny * s;
        cells.forEach(function (c) { block(ctx, ox + c[0] * s, oy + c[1] * s, s, WOOD[type], c[0] * 5 + c[1] * 11); });
      }
    }
    function hud() {
      elScore.textContent = fmt(g.score); elLines.textContent = fmt(g.lines); elLevel.textContent = g.level;
      if (g.piece && g.piece.type !== lastType) {
        lastType = g.piece.type; var w = WOOD[lastType];
        noteEl.innerHTML = '<b>' + w.name + '</b> <i>' + w.kind + '</i><br>' + w.fact;
      }
    }

    /* ----- overlays ----- */
    function showOverlay(kind) {
      var html = "";
      if (kind === "ready") html = '<h2>Wood Tetris</h2><p>Stack the woods and clear the lines. Each piece is a different wood, so watch the notes as you play.</p><button type="button" class="wbtn big" data-a="start">Start</button>';
      else if (kind === "paused") html = '<h2>Paused</h2><button type="button" class="wbtn big" data-a="resume">Resume</button><button type="button" class="wbtn" data-a="restart">Restart</button>';
      else html = '<h2>Game over</h2><p>Score <b>' + fmt(g.score) + '</b> &middot; Lines <b>' + g.lines + '</b> &middot; Level <b>' + g.level + '</b></p><p class="best">Best: ' + fmt(getBest()) + '</p><button type="button" class="wbtn big" data-a="restart">Play again</button>';
      ovl.innerHTML = '<div class="ovl-card">' + html + '</div>'; ovl.classList.add("on");
      var b = ovl.querySelector("button"); if (b) b.focus({ preventScroll: true });
    }
    function hideOverlay() { ovl.classList.remove("on"); ovl.innerHTML = ""; }
    ovl.addEventListener("click", function (e) {
      var a = e.target.getAttribute && e.target.getAttribute("data-a"); if (!a) return;
      if (a === "start" || a === "resume") run(); else if (a === "restart") restart();
    });

    /* ----- flow ----- */
    function run() { mode = "running"; last = performance.now(); acc = 0; hideOverlay(); btnPause.textContent = "Pause"; }
    function pause() { if (mode !== "running") return; mode = "paused"; btnPause.textContent = "Resume"; showOverlay("paused"); }
    function togglePause() { if (mode === "running") pause(); else if (mode === "paused") run(); else if (mode === "ready") run(); }
    function restart() { g.reset(); lastType = ""; flash = null; hud(); run(); }
    function finish(gm) {
      mode = "over"; if (gm.score > getBest()) setBest(gm.score);
      btnPause.textContent = "Pause"; showOverlay("over");
    }

    function tick(now) {
      if (mode === "running") {
        acc += Math.min(250, now - last); last = now;
        var iv = g.dropInterval();
        while (acc >= iv && mode === "running") { acc -= iv; g.step(false); }
        hud();
      }
      drawBoard(); drawNext(); raf = requestAnimationFrame(tick);
    }

    /* ----- input ----- */
    function act(k) {
      if (mode === "ready") { if (k === "drop" || k === "rot") run(); return; }
      if (mode !== "running") return;
      if (k === "left") g.move(-1); else if (k === "right") g.move(1);
      else if (k === "rot") g.rotate(1); else if (k === "rotccw") g.rotate(-1);
      else if (k === "down") { g.step(true); acc = 0; } else if (k === "drop") { g.hardDrop(); acc = 0; }
      hud();
    }
    var KEYS = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "rot", ArrowDown: "down", " ": "drop", x: "rot", X: "rot", z: "rotccw", Z: "rotccw", a: "left", d: "right", s: "down", w: "rot" };
    function onKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var tag = (e.target.tagName || "").toLowerCase();
      if (e.key === "Escape") { e.preventDefault(); MPM.router.go(HERE); return; }
      if (e.key === "p" || e.key === "P") { e.preventDefault(); togglePause(); return; }
      var k = KEYS[e.key]; if (!k) return;
      if (e.key === " " && tag === "button" && mode !== "running") return; // let overlay/buttons use Space normally
      e.preventDefault(); act(k);
    }
    document.addEventListener("keydown", onKey);
    var onVis = function () { if (document.hidden) pause(); }; document.addEventListener("visibilitychange", onVis);

    btnPause.addEventListener("click", togglePause);
    $("#w-restart").addEventListener("click", restart);
    $("#w-exit").addEventListener("click", function () { MPM.router.go(HERE); });

    /* touch pad: hold left / right / down to repeat */
    var rep = 0;
    function stopRep() { clearInterval(rep); rep = 0; }
    $(".pad").addEventListener("pointerdown", function (e) {
      var b = e.target.closest("button"); if (!b) return; e.preventDefault();
      var k = b.getAttribute("data-k"); act(k);
      if (k === "left" || k === "right" || k === "down") { stopRep(); rep = setInterval(function () { act(k); }, 120); }
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) { $(".pad").addEventListener(t, stopRep); });

    hud(); showOverlay("ready"); raf = requestAnimationFrame(tick);
    return function () { cancelAnimationFrame(raf); stopRep(); document.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onVis); };
  }
})();
