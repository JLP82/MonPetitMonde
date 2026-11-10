/* exp-puzzle.js — The Puzzle Chamber: "The Animal Parade".
   #/place/puzzle-chamber
   Eight jigsaw puzzles (one per animal). Finish one to meet that animal. Everything animal-specific lives in ANIMALS below,
   so a painting, a title, the traits or the blurb can each be swapped without touching the game code.
   The painted chamber is the stage; the puzzle table, panels, dots and collection strip are live on top of it. */
(function () {
  var G = 1100 / 1536;
  function V(r) { return MPM.scene.vars(r.map(function (n) { return n * G; })); }
  var ART = "assets/puzzle/chamber-bg.webp", KEY = "mpm.puzzle.v1", IMG = "assets/puzzle/";

  /* ------------------------- editable copy ------------------------- */
  var COPY = {
    title: "The Puzzle Chamber", sub: "Puzzle Tables",
    storyHead: "Puzzles",
    story: "Puzzles have always been a part of my life. My grandfather and grandmother always had either cards going or they were doing a puzzle. It’s a simple thing, but it created so many good memories and taught me the value of patience, focus and enjoying the little moments.",
    paradeHead: "The Animal Parade",
    intro: "Complete the puzzles to discover your animal companions! Each animal represents a different part of your personality, values, and the way you move through the world.",
    how: ["Pick a difficulty, then press Start Puzzle.", "Drag pieces onto the board \u2014 they snap in when they fit.", "Hint peeks at the picture; the corner button opens a big table."],
    waiting: "Your next animal companion is waiting to be discovered!", waitingSub: "Finish the puzzle to meet them.",
    meet: "Meet Your Animal Companion!", again: "Your animal companion", cont: "Continue Exploring",
    allDone: "You’ve met the whole parade!"
  };
  /* blurb: the line under the traits. NOTE: Elephant's is from the concept art; Fox's is from the brief; the other six are
     placeholder drafts — replace them with your own words. */
  var ANIMALS = [
    { id: "elephant", name: "The Elephant", title: "The Heart", traits: ["Dependable", "Caring", "Considerate"], blurb: "A gentle soul with a big heart, always there for the ones they love.", alt: "An elephant walking through wildflowers beside a lake at sunset." },
    { id: "octopus", name: "The Octopus", title: "The Problem Solver", traits: ["Capable", "Adaptable", "Independent"], blurb: "Clever and flexible, there’s rarely a problem it can’t find a way around.", alt: "An orange octopus on a coral reef in beams of sunlight." },
    { id: "fox", name: "The Fox", title: "The Individualist", traits: ["Authentic", "Self-aware", "Independent"], blurb: "Authentic, self-aware, and independent.", alt: "A red fox sitting on a rock beneath autumn maples, face lifted to the sunset." },
    { id: "bee", name: "The Bee", title: "The Builder", traits: ["Hardworking", "Determined", "Ambitious"], blurb: "Always building something good, one steady, determined step at a time.", alt: "A bumblebee on a pink coneflower in a sunlit meadow." },
    { id: "otter", name: "The Otter", title: "The Spark", traits: ["Curious", "Funny", "Warm"], blurb: "Playful and warm — the spark that makes ordinary moments a little more fun.", alt: "An otter floating on its back in a pond, holding a shell." },
    { id: "turtle", name: "The Turtle", title: "The Steady One", traits: ["Resilient", "Grounded", "Persistent"], blurb: "Slow, steady and unshakeable — it gets there by never losing its footing.", alt: "A turtle basking on a mossy log in a pond ringed with ferns." },
    { id: "owl", name: "The Owl", title: "The Observer", traits: ["Thoughtful", "Observant", "A good listener"], blurb: "Quietly watching and listening, and noticing what everyone else misses.", alt: "A barn owl perched on a branch among autumn leaves." },
    { id: "butterfly", name: "The Butterfly", title: "The Dreamer", traits: ["Imaginative", "Creative", "Growth-oriented"], blurb: "Always imagining, always growing, always becoming something new.", alt: "A monarch butterfly resting on lilac blossoms." }
  ];
  /* cols x rows: Easy 12, Medium 24, Hard 48 pieces */
  var LEVELS = { easy: { label: "Easy", cols: 3, rows: 4 }, medium: { label: "Medium", cols: 4, rows: 6 }, hard: { label: "Hard", cols: 6, rows: 8 } };
  var LEVEL_ORDER = ["easy", "medium", "hard"];

  /* ------------------------- helpers ------------------------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  var uid = 0;

  /* One jigsaw edge from (x0,y0) to (x1,y1): three cubic Béziers with a tab (sign +1) or blank (-1). Returns 3 segments of 3 points. */
  function edge(x0, y0, x1, y1, sign, p) {
    var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L * sign, ny = dx / L * sign, t = p.t;
    function P(l, w) { return [x0 + dx * l + nx * L * w, y0 + dy * l + ny * L * w]; }
    return [[P(0.2, p.a), P(0.5 + p.b + p.d, -t + p.c), P(0.5 - t + p.b, t + p.c)],
            [P(0.5 - 2 * t + p.b - p.d, 3 * t + p.c), P(0.5 + 2 * t + p.b - p.d, 3 * t + p.c), P(0.5 + t + p.b, t + p.c)],
            [P(0.5 + p.b + p.d, -t + p.c), P(0.8, p.e), [x1, y1]]];
  }
  function fwd(s) { return s.map(function (g) { return "C" + g.map(function (q) { return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" "); }).join(""); }
  /* same edge walked backwards: reverse each curve (controls swap) and the segment order */
  function rev(s, x0, y0) {
    var starts = [[x0, y0], s[0][2], s[1][2]], out = "";
    for (var i = 2; i >= 0; i--) out += "C" + [s[i][1], s[i][0], starts[i]].map(function (q) { return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" ");
    return out;
  }

  /* Build the geometry for a cols x rows jigsaw on a 1000 x 1000 picture. Neighbouring pieces share each edge, so they always fit. */
  function buildPuzzle(animalId, levelKey) {
    var L = LEVELS[levelKey], cols = L.cols, rows = L.rows, rnd = mulberry(hash(animalId + ":" + levelKey));
    var cw = 1000 / cols, ch = 1000 / rows, m = 0.42 * Math.max(cw, ch);
    function params() { return { t: 0.105 + rnd() * 0.025, a: (rnd() - 0.5) * 0.08, b: (rnd() - 0.5) * 0.08, c: (rnd() - 0.5) * 0.06, d: (rnd() - 0.5) * 0.08, e: (rnd() - 0.5) * 0.08, s: rnd() < 0.5 ? 1 : -1 }; }
    var H = [], Vv = [], r, c;
    for (r = 0; r <= rows; r++) { H[r] = []; for (c = 0; c < cols; c++) H[r][c] = (r === 0 || r === rows) ? null : params(); }
    for (r = 0; r < rows; r++) { Vv[r] = []; for (c = 0; c <= cols; c++) Vv[r][c] = (c === 0 || c === cols) ? null : params(); }
    var pieces = [];
    for (r = 0; r < rows; r++) for (c = 0; c < cols; c++) {
      var x0 = c * cw, y0 = r * ch, x1 = x0 + cw, y1 = y0 + ch, d = "M" + x0.toFixed(1) + " " + y0.toFixed(1), e;
      e = H[r][c]; d += e ? fwd(edge(x0, y0, x1, y0, e.s, e)) : "L" + x1.toFixed(1) + " " + y0.toFixed(1);
      e = Vv[r][c + 1]; d += e ? fwd(edge(x1, y0, x1, y1, e.s, e)) : "L" + x1.toFixed(1) + " " + y1.toFixed(1);
      e = H[r + 1][c]; d += e ? rev(edge(x0, y1, x1, y1, e.s, e), x0, y1) : "L" + x0.toFixed(1) + " " + y1.toFixed(1);
      e = Vv[r][c]; d += e ? rev(edge(x0, y0, x0, y1, e.s, e), x0, y0) : "L" + x0.toFixed(1) + " " + y0.toFixed(1);
      pieces.push({ r: r, c: c, d: d + "Z", x0: x0, y0: y0, cw: cw, ch: ch, m: m, cu: c / cols, cv: r / rows });
    }
    return { cols: cols, rows: rows, cw: cw, ch: ch, m: m, pieces: pieces };
  }

  /* ------------------------- the experience ------------------------- */
  MPM.registerExperience("puzzle-chamber", function (root) {
    var st = load(), done = st.done || {}, level = LEVELS[st.level] ? st.level : "easy", idx = Math.max(0, Math.min(ANIMALS.length - 1, +st.idx || 0));
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    function persist() { save({ done: done, level: level, idx: idx }); }
    function count() { return ANIMALS.filter(function (a) { return done[a.id]; }).length; }

    var BAR = 44, chipsEl = null;                    /* height of the chip bar along the top of the table */
    var wrap = document.createElement("section");
    wrap.className = "scene pz";
    wrap.innerHTML =
      '<div class="stage" style="background-image:url(' + ART + ')">' + MPM.scene.back() +
        '<header class="pz-head"><h1>' + COPY.title + '</h1><p>' + COPY.sub + '</p></header>' +
        '<section class="abs pz-left" style="' + V([96, 205, 360, 646]) + '" data-mode="story"></section>' +
        '<div class="abs pz-table" style="' + V([462, 181, 1071, 691]) + '">' +
          '<div class="pz-chips">' +
            '<div class="pz-lv" role="group" aria-label="Difficulty">' + LEVEL_ORDER.map(function (k) { return '<button type="button" data-lv="' + k + '" aria-pressed="false">' + LEVELS[k].label + ' <small>' + LEVELS[k].cols * LEVELS[k].rows + '</small></button>'; }).join("") + '</div>' +
            '<span class="pz-prog" aria-live="polite"></span>' +
            '<button type="button" class="pz-hint" aria-pressed="false" title="Peek at the picture">Hint</button>' +
            '<button type="button" class="pz-big" aria-label="Open the big table" title="Big table"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>' +
          '</div>' +
          '<div class="pz-board"><img class="pz-ghost" alt="" draggable="false"></div>' +
          '<div class="pz-pieces"></div><div class="pz-fx" aria-hidden="true"></div>' +
        '</div>' +
        '<button type="button" class="abs pz-arrow pz-prev" style="' + V([528, 701, 596, 769]) + '" aria-label="Previous animal"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
        '<button type="button" class="abs pz-start" style="' + V([622, 699, 915, 755]) + '"><span></span></button>' +
        '<button type="button" class="abs pz-arrow pz-next" style="' + V([938, 701, 1006, 769]) + '" aria-label="Next animal"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>' +
        '<div class="abs pz-dots" style="' + V([640, 760, 896, 796]) + '" role="tablist" aria-label="Animals">' + ANIMALS.map(function (a, i) { return '<button type="button" role="tab" data-i="' + i + '" aria-label="' + a.name.replace("The ", "") + '"></button>'; }).join("") + '</div>' +
        '<aside class="abs pz-right" style="' + V([1160, 182, 1462, 636]) + '" aria-live="polite"></aside>' +
        '<nav class="abs pz-strip" style="' + V([236, 826, 1318, 968]) + '" aria-label="Animal collection">' +
          '<div class="pz-meds">' + ANIMALS.map(function (a, i) { return '<button type="button" class="pz-med" data-i="' + i + '"><img src="' + IMG + a.id + '-i.webp" alt="" draggable="false"><span class="q" aria-hidden="true">?</span></button>'; }).join("") + '</div>' +
          '<p class="pz-count"><b></b> <span>Discovered</span></p>' +
        '</nav>' +
      '</div>';
    root.appendChild(wrap);

    var $ = function (s) { return wrap.querySelector(s); }, $$ = function (s) { return [].slice.call(wrap.querySelectorAll(s)); };
    var table = $(".pz-table"), board = $(".pz-board"), ghost = $(".pz-ghost"), layer = $(".pz-pieces"), fxl = $(".pz-fx"), prog = $(".pz-prog");
    var tableHome = table.parentNode, tableNext = table.nextSibling;
    var puz = null, items = [], placed = 0, playing = false, finished = false, fresh = false, topZ = 3, lay = { S: 300, bx: 0, by: 0, tw: 0, th: 0 }, hint = false;

    /* ---------- panels ---------- */
    function paintLeft() {
      var mode = playing || finished ? "parade" : "story", el = $(".pz-left");
      el.dataset.mode = mode;
      el.innerHTML = mode === "story"
        ? '<h2>' + COPY.storyHead + '</h2><div class="pz-orn" aria-hidden="true"><i></i><svg viewBox="0 0 24 24"><path d="M9 3h6v4a2.2 2.2 0 1 0 0 4.4V15h-4a2.2 2.2 0 1 1-4.4 0H3V9h4a2.2 2.2 0 1 0 0-4.4V3z" transform="translate(2 2) scale(.82)"/></svg><i></i></div><p>' + COPY.story + '</p>'
        : '<h2>' + COPY.paradeHead + '</h2><div class="pz-orn" aria-hidden="true"><i></i><svg viewBox="0 0 24 24"><path d="M12 3l2.2 6.2L21 10l-5 4.2L17.5 21 12 17.4 6.5 21 8 14.2 3 10l6.8-.8z" transform="translate(1 .5) scale(.92)"/></svg><i></i></div><p>' + COPY.intro + '</p><ul>' + COPY.how.map(function (h) { return "<li>" + h + "</li>"; }).join("") + '</ul>';
    }
    var LEAF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4C9 4 4 10 4 17c0 1.2.2 2.2.6 3C6 14 10 10.500 14 9c-3.500 2.500-6 6-6.700 11.500C16 20 20 13 20 4z"/></svg>';
    function paintRight() {
      var a = ANIMALS[idx], el = $(".pz-right"), got = !!done[a.id], reveal = got && !playing;
      el.classList.toggle("revealed", reveal && fresh);
      if (!reveal) {
        el.innerHTML = '<div class="rp wait"><div class="orb"><img src="' + IMG + a.id + '-i.webp" alt="" draggable="false"><b>?</b></div><p class="w">' + COPY.waiting + '</p><p class="s">' + (playing ? "Keep going — you’re " + Math.round(placed / items.length * 100) + "% there." : COPY.waitingSub) + '</p></div>';
        return;
      }
      var all = count() === ANIMALS.length;
      el.innerHTML = '<div class="rp got"><p class="kick">' + (fresh ? COPY.meet : COPY.again) + '</p>' +
        '<img class="pic" src="' + IMG + a.id + '-t.webp" alt="' + a.alt + '" draggable="false">' +
        '<h3>' + a.name + '</h3><p class="ttl">' + a.title + '</p>' +
        '<ul class="tr">' + a.traits.map(function (t) { return "<li>" + LEAF + "<span>" + t + "</span></li>"; }).join("") + '</ul>' +
        '<p class="bl">' + a.blurb + '</p>' +
        (all && fresh ? '<p class="all">' + COPY.allDone + '</p>' : '') +
        '<div class="rb"><button type="button" class="pz-go" data-act="next">' + COPY.cont + '</button><button type="button" class="pz-alt" data-act="replay" title="Replay this puzzle">\u21bb Replay</button></div></div>';
    }
    function paintNav() {
      var n = count();
      $$(".pz-med").forEach(function (b, i) {
        var a = ANIMALS[i], got = !!done[a.id];
        b.classList.toggle("got", got); b.classList.toggle("cur", i === idx); b.setAttribute("aria-current", i === idx ? "true" : "false");
        b.setAttribute("aria-label", a.name + (got ? " — discovered" : " — not discovered yet"));
      });
      $$(".pz-dots button").forEach(function (b, i) { b.classList.toggle("on", !!done[ANIMALS[i].id]); b.classList.toggle("cur", i === idx); b.setAttribute("aria-selected", i === idx ? "true" : "false"); });
      $(".pz-count b").textContent = n + " of " + ANIMALS.length;
      $(".pz-start span").textContent = playing ? "Restart Puzzle" : done[ANIMALS[idx].id] ? "Replay Puzzle" : "Start Puzzle";
      $$(".pz-lv button").forEach(function (b) { var on = b.dataset.lv === level; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
      var a = ANIMALS[idx];
      table.classList.toggle("is-playing", playing); table.classList.toggle("is-done", finished); table.classList.toggle("is-found", !!done[a.id]);
      prog.textContent = playing || finished ? placed + " / " + items.length + " pieces" : (done[a.id] ? "✓ Discovered" : LEVELS[level].cols * LEVELS[level].rows + " pieces");
      prog.style.setProperty("--p", items.length ? placed / items.length : 0);
      ghost.alt = a.alt;
    }
    function paintAll() { paintLeft(); paintRight(); paintNav(); }

    /* ---------- layout: where the board sits on the table ---------- */
    function layout() {
      var tw = table.clientWidth, th = table.clientHeight; if (!tw || !th) return;
      chipsEl = chipsEl || table.querySelector('.pz-chips'); BAR = Math.max(44, chipsEl.offsetHeight + 8);
      var ah = th - BAR, S, by;
      if (tw / ah > 1.15) { S = Math.min(ah * 0.78, tw * 0.62); by = BAR + (ah - S) / 2; } else { S = Math.min(tw * 0.94, ah * 0.62); by = BAR + 6; }
      lay = { S: S, bx: (tw - S) / 2, by: by, tw: tw, th: th };
      board.style.cssText = "left:" + lay.bx + "px;top:" + lay.by + "px;width:" + S + "px;height:" + S + "px";
      items.forEach(function (it) { place(it); });
    }
    function place(it) {
      var k = lay.S / 1000, p = it.p;
      if (!it.locked) {   /* keep loose pieces on the table after a resize */
        var cx = lay.bx + (it.u + p.cw / 2000) * lay.S, cy = lay.by + (it.v + p.ch / 2000) * lay.S;
        var nx = Math.max(10, Math.min(lay.tw - 10, cx)), ny = Math.max(BAR + 6, Math.min(lay.th - 10, cy));
        if (nx !== cx) it.u += (nx - cx) / lay.S; if (ny !== cy) it.v += (ny - cy) / lay.S;
      }
      var x = lay.bx + it.u * lay.S - p.m * k, y = lay.by + it.v * lay.S - p.m * k;
      it.el.style.width = (p.cw + 2 * p.m) * k + "px"; it.el.style.height = (p.ch + 2 * p.m) * k + "px";
      it.el.style.transform = "translate(" + x + "px," + y + "px)";
    }

    /* ---------- puzzle lifecycle ---------- */
    function showPreview() { ghost.src = IMG + ANIMALS[idx].id + ".webp"; board.classList.remove("ghosted"); board.classList.remove("hint"); }
    function clearPieces() { layer.innerHTML = ""; fxl.innerHTML = ""; items = []; placed = 0; }
    function idle() {
      playing = false; finished = false; fresh = false; hint = false; clearPieces(); showPreview(); paintAll(); layout();
    }
    function start() {
      var a = ANIMALS[idx]; clearPieces(); finished = false; fresh = false; playing = true; hint = false;
      puz = buildPuzzle(a.id, level);
      var src = IMG + a.id + ".webp", html = "";
      puz.pieces.forEach(function (p, n) {
        var k = "pzc" + (++uid), vb = (p.x0 - p.m).toFixed(1) + " " + (p.y0 - p.m).toFixed(1) + " " + (p.cw + 2 * p.m).toFixed(1) + " " + (p.ch + 2 * p.m).toFixed(1);
        html += '<div class="pc" data-n="' + n + '"><svg viewBox="' + vb + '" aria-hidden="true"><defs><clipPath id="' + k + '"><path d="' + p.d + '"/></clipPath></defs>' +
          '<g clip-path="url(#' + k + ')"><image href="' + src + '" x="0" y="0" width="1000" height="1000" preserveAspectRatio="none"/></g>' +
          '<path class="o1" d="' + p.d + '"/><path class="o2" d="' + p.d + '"/><path class="hit" d="' + p.d + '"/></svg></div>';
      });
      layer.innerHTML = html;
      items = [].slice.call(layer.children).map(function (el, n) { return { el: el, p: puz.pieces[n], u: 0, v: 0, locked: false, n: n }; });
      ghost.src = src; board.classList.add("ghosted"); board.classList.remove("hint");
      layout(); scatter(); items.forEach(place); paintAll();
    }
    function scatter() {
      var rnd = Math.random, k = lay.S / 1000;
      items.forEach(function (it) {
        var p = it.p, pw = p.cw * k, ph = p.ch * k, cx, cy, tries = 0, ok;
        do {
          cx = pw / 2 + 4 + rnd() * (lay.tw - pw - 8); cy = BAR + 4 + ph / 2 + rnd() * (lay.th - BAR - ph - 8);
          var inBoard = cx > lay.bx && cx < lay.bx + lay.S && cy > lay.by && cy < lay.by + lay.S;
          var home = Math.hypot(cx - (lay.bx + (p.cu * 1000 + p.cw / 2) * k), cy - (lay.by + (p.cv * 1000 + p.ch / 2) * k)) < Math.min(pw, ph) * 0.9;
          ok = !home && (!inBoard || tries > 24); tries++;
        } while (!ok && tries < 60);
        it.u = (cx - pw / 2 - lay.bx) / lay.S; it.v = (cy - ph / 2 - lay.by) / lay.S;
        it.el.style.zIndex = 3 + Math.floor(rnd() * 20);
      });
      topZ = 30;
    }
    function snapNow(it) {
      it.u = it.p.cu; it.v = it.p.cv; it.locked = true; it.el.classList.remove("drag"); it.el.classList.add("locked", "snap"); it.el.style.zIndex = 1;
      place(it); placed++;
      setTimeout(function () { it.el.classList.remove("snap"); }, 500);
      paintNav(); if (placed < items.length) paintRight();
      if (placed === items.length) complete();
    }
    function complete() {
      playing = false; finished = true; fresh = true;
      var a = ANIMALS[idx]; done[a.id] = { n: items.length, at: Date.now() }; persist();
      board.classList.remove("ghosted"); table.classList.add("is-done");
      setTimeout(function () { paintAll(); sparkle(); }, reduce ? 0 : 650);
      paintNav();
    }
    function sparkle() {
      if (reduce) return;
      var cols = ["#d9742a", "#c24a1f", "#e0a22e", "#8a9a3a", "#b5421f", "#f0c15a"], h = "";
      for (var i = 0; i < 34; i++) {
        h += '<i class="lf" style="left:' + (Math.random() * 100).toFixed(1) + '%;--d:' + (Math.random() * 1.6).toFixed(2) + 's;--t:' + (3.4 + Math.random() * 2.4).toFixed(2) + 's;--x:' + ((Math.random() - 0.5) * 160).toFixed(0) + 'px;--r:' + (180 + Math.random() * 540).toFixed(0) + 'deg;--s:' + (0.7 + Math.random() * 0.8).toFixed(2) + ';background:' + cols[i % cols.length] + '"></i>';
        if (i % 2) h += '<b class="sp" style="left:' + (8 + Math.random() * 84).toFixed(1) + '%;top:' + (10 + Math.random() * 78).toFixed(1) + '%;--d:' + (Math.random() * 1.4).toFixed(2) + 's"></b>';
      }
      fxl.innerHTML = h; setTimeout(function () { fxl.innerHTML = ""; }, 7200);
    }
    function select(i, startNow) {
      idx = (i + ANIMALS.length) % ANIMALS.length; persist(); idle(); if (startNow) start();
    }

    /* ---------- dragging (mouse + touch via pointer events) ---------- */
    var drag = null;
    table.addEventListener("pointerdown", function (e) {
      var el = e.target.closest && e.target.closest(".pc"); if (!el || !playing) return;
      var it = items[+el.dataset.n]; if (!it || it.locked) return;
      var r = table.getBoundingClientRect(), k = lay.S / 1000;
      drag = { it: it, rect: r, ox: e.clientX - r.left - (lay.bx + it.u * lay.S), oy: e.clientY - r.top - (lay.by + it.v * lay.S), id: e.pointerId };
      try { table.setPointerCapture(e.pointerId); } catch (x) {}
      it.el.classList.add("drag"); it.el.style.zIndex = ++topZ; e.preventDefault();
    });
    table.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var it = drag.it, px = e.clientX - drag.rect.left - drag.ox, py = e.clientY - drag.rect.top - drag.oy;
      var cw = it.p.cw / 1000 * lay.S, ch = it.p.ch / 1000 * lay.S;
      px = Math.max(-cw * 0.3, Math.min(lay.tw - cw * 0.7, px)); py = Math.max(BAR - ch * 0.2, Math.min(lay.th - ch * 0.7, py));
      it.u = (px - lay.bx) / lay.S; it.v = (py - lay.by) / lay.S; place(it);
    });
    function endDrag(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var it = drag.it; drag = null; it.el.classList.remove("drag");
      var d = Math.hypot((it.u - it.p.cu) * lay.S, (it.v - it.p.cv) * lay.S), thr = Math.max(14, 0.34 * Math.min(it.p.cw, it.p.ch) / 1000 * lay.S);
      if (d <= thr) snapNow(it);
    }
    table.addEventListener("pointerup", endDrag); table.addEventListener("pointercancel", endDrag);

    /* ---------- big table (re-parents the table to <body> so it can fill the screen) ---------- */
    var isBig = false, bigBtn = $(".pz-big");
    function setBig(on) {
      if (on === isBig) return; isBig = on;
      if (on) { document.body.appendChild(table); table.classList.add("big"); document.documentElement.style.overflow = "hidden"; }
      else { tableHome.insertBefore(table, tableNext); table.classList.remove("big"); document.documentElement.style.overflow = ""; }
      bigBtn.setAttribute("aria-label", on ? "Close the big table" : "Open the big table"); bigBtn.title = on ? "Close big table" : "Big table";
      bigBtn.classList.toggle("on", on); requestAnimationFrame(layout);
    }

    /* ---------- events ---------- */
    function onClick(e) {
      if (e._pz) return; e._pz = true;       /* the table can sit inside the stage or on <body>; handle each click once */
      var t = e.target, b;
      if ((b = t.closest(".pz-lv button"))) { level = b.dataset.lv; persist(); if (playing || finished) { start(); } else { idle(); } return; }
      if (t.closest(".pz-hint")) { hint = !hint; board.classList.toggle("hint", hint); t.closest(".pz-hint").setAttribute("aria-pressed", hint ? "true" : "false"); return; }
      if (t.closest(".pz-big")) { setBig(!isBig); return; }
      if (t.closest(".pz-start")) { start(); return; }
      if (t.closest(".pz-prev")) { select(idx - 1); return; }
      if (t.closest(".pz-next")) { select(idx + 1); return; }
      if ((b = t.closest(".pz-dots button, .pz-med"))) { select(+b.dataset.i); return; }
      if ((b = t.closest("[data-act]"))) {
        if (b.dataset.act === "next") {
          var nxt = idx + 1; for (var k = 0; k < ANIMALS.length; k++) { var j = (idx + 1 + k) % ANIMALS.length; if (!done[ANIMALS[j].id]) { nxt = j; break; } }
          select(nxt);
        } else if (b.dataset.act === "replay") start();
      }
    }
    wrap.addEventListener("click", onClick); table.addEventListener("click", onClick);
    function key(e) { if (e.key === "Escape") { if (isBig) setBig(false); else MPM.router.go("#/atlas"); } }
    document.addEventListener("keydown", key);
    var ro = window.ResizeObserver ? new ResizeObserver(function () { layout(); }) : null; if (ro) ro.observe(table); else window.addEventListener("resize", layout);

    idle();
    wrap._pz = { ANIMALS: ANIMALS, LEVELS: LEVELS, start: start, select: select, items: function () { return items; }, lay: function () { return lay; }, snap: function (n) { snapNow(items[n]); }, done: function () { return done; }, state: function () { return { idx: idx, level: level, playing: playing, finished: finished, placed: placed, total: items.length }; } };

    return function () {
      if (ro) ro.disconnect(); else window.removeEventListener("resize", layout);
      document.removeEventListener("keydown", key);
      if (isBig) { document.documentElement.style.overflow = ""; if (table.parentNode === document.body) document.body.removeChild(table); }
    };
  });
})();
