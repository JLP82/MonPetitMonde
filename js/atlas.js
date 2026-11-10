/* atlas.js — the Fantasy Atlas: zoomable, pannable map with clickable landmarks.
   View state (centre + zoom) is stored in sessionStorage so returning from a
   destination puts the visitor exactly where they were. */
(function () {
  var KEY = "mpm.atlas.view";
  var W = MPM.ART.w, H = MPM.ART.h;

  function loadView() {
    try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function saveView(v) {
    try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }

  MPM.renderAtlas = function (root) {
    var screen = document.createElement("div");
    screen.className = "atlas-screen";
    screen.innerHTML =
      '<header class="atlas-bar">' +
        '<a class="chip" href="#/">&larr; Bookshelf</a>' +
        '<nav class="crumbs" aria-label="You are here"><a href="#/">Bookshelf</a><span aria-hidden="true">›</span><span aria-current="page">Fantasy Atlas</span></nav>' +
      '</header>' +
      '<div class="atlas-viewport" tabindex="0" aria-label="Fantasy map. Drag to pan, scroll or pinch to zoom, use arrow keys to move and plus or minus to zoom.">' +
        '<div class="atlas-world"></div>' +
      '</div>' +
      '<div class="atlas-controls" role="group" aria-label="Map zoom">' +
        '<button type="button" data-z="in" aria-label="Zoom in">+</button>' +
        '<button type="button" data-z="out" aria-label="Zoom out">−</button>' +
        '<button type="button" data-z="fit" aria-label="Show whole map">⌂</button>' +
      '</div>';
    root.appendChild(screen);

    var viewport = screen.querySelector(".atlas-viewport");
    var world = screen.querySelector(".atlas-world");
    world.style.width = W + "px"; world.style.height = H + "px";

    var img = new Image();
    img.src = "assets/map.webp"; img.width = W; img.height = H; img.draggable = false;
    img.alt = "Illustrated fantasy map with five regions: Whispering Woods, Maker's Range, The Hearthlands, Cartographer's Keep and Uncharted Coast.";
    world.appendChild(img);

    /* ---- landmark hotspots ---- */
    MPM.PLACES.forEach(function (p) {
      var a = document.createElement("a");
      a.className = "hotspot map-hotspot";
      a.href = p.to || ("#/place/" + p.id);
      var region = MPM.REGIONS[p.region].name;
      a.setAttribute("aria-label", p.name + ", " + region);
      a.style.left = p.box[0] + "px"; a.style.top = p.box[1] + "px";
      a.style.width = (p.box[2] - p.box[0]) + "px"; a.style.height = (p.box[3] - p.box[1]) + "px";
      var tip = document.createElement("span");
      tip.className = "hs-label"; tip.setAttribute("aria-hidden", "true");
      tip.innerHTML = p.name + (p.name === region ? "" : "<small>" + region + "</small>");
      a.appendChild(tip);
      if (p.special === "library") {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          MPM.router.goWith(MPM.transition.bookClose, "#/");
        });
      }
      world.appendChild(a);
    });

    /* ---- pan / zoom ---- */
    var vw = 0, vh = 0, fit = 1, s = 1, x = 0, y = 0;
    var MAXK = 5;
    var raf = 0;

    function measure() {
      vw = viewport.clientWidth; vh = viewport.clientHeight;
      fit = Math.min(vw / W, vh / H);
    }
    function clamp() {
      var w = W * s, h = H * s;
      x = w <= vw ? (vw - w) / 2 : Math.min(0, Math.max(vw - w, x));
      y = h <= vh ? (vh - h) / 2 : Math.min(0, Math.max(vh - h, y));
    }
    function apply() {
      clamp();
      world.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")";
      world.style.setProperty("--inv", String(1 / s));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        saveView({ k: s / fit, cx: (vw / 2 - x) / s, cy: (vh / 2 - y) / s });
      });
    }
    function zoomAt(newS, px, py) {
      newS = Math.min(fit * MAXK, Math.max(fit, newS));
      var wx = (px - x) / s, wy = (py - y) / s;
      s = newS; x = px - wx * s; y = py - wy * s;
      apply();
    }
    function setView(k, cx, cy) {
      s = Math.min(fit * MAXK, Math.max(fit, fit * k));
      x = vw / 2 - cx * s; y = vh / 2 - cy * s;
      apply();
    }
    function initialView() {
      var saved = loadView();
      if (saved && isFinite(saved.k)) return setView(saved.k, saved.cx, saved.cy);
      setView(vw < 700 ? 1.8 : 1, W / 2, H / 2);
    }

    measure(); initialView();

    var ro = new ResizeObserver(function () {
      var cx = (vw / 2 - x) / s, cy = (vh / 2 - y) / s, k = s / fit;
      measure(); setView(k, cx, cy);
    });
    ro.observe(viewport);

    var pointers = new Map(), dragged = false, startX = 0, startY = 0, pinch0 = 0, pinchS0 = 1;

    viewport.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button > 0) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) { dragged = false; startX = e.clientX; startY = e.clientY; }
      if (pointers.size === 2) {
        var pts = Array.from(pointers.values());
        pinch0 = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y); pinchS0 = s; dragged = true;
      }
    });
    viewport.addEventListener("pointermove", function (e) {
      var prev = pointers.get(e.pointerId);
      if (!prev) return;
      var cur = { x: e.clientX, y: e.clientY };
      if (pointers.size === 1) {
        if (!dragged && Math.hypot(cur.x - startX, cur.y - startY) > 6) {
          dragged = true; try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
          viewport.classList.add("grabbing");
        }
        if (dragged) { x += cur.x - prev.x; y += cur.y - prev.y; apply(); }
      } else if (pointers.size === 2) {
        pointers.set(e.pointerId, cur);
        var pts = Array.from(pointers.values());
        var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        var r = viewport.getBoundingClientRect();
        zoomAt(pinchS0 * d / (pinch0 || 1), (pts[0].x + pts[1].x) / 2 - r.left, (pts[0].y + pts[1].y) / 2 - r.top);
      }
      pointers.set(e.pointerId, cur);
    });
    function up(e) {
      pointers.delete(e.pointerId);
      viewport.classList.remove("grabbing");
      if (pointers.size === 0) setTimeout(function () { dragged = false; }, 0);
    }
    viewport.addEventListener("pointerup", up);
    viewport.addEventListener("pointercancel", up);
    /* A drag must never be mistaken for a click on a landmark. */
    viewport.addEventListener("click", function (e) { if (dragged) { e.preventDefault(); e.stopPropagation(); } }, true);

    viewport.addEventListener("wheel", function (e) {
      e.preventDefault();
      var r = viewport.getBoundingClientRect();
      zoomAt(s * Math.exp(-e.deltaY * 0.0016), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    screen.querySelector(".atlas-controls").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var z = b.getAttribute("data-z");
      if (z === "in") zoomAt(s * 1.4, vw / 2, vh / 2);
      else if (z === "out") zoomAt(s / 1.4, vw / 2, vh / 2);
      else setView(1, W / 2, H / 2);
    });

    viewport.addEventListener("keydown", function (e) {
      var step = 60;
      if (e.target !== viewport) return;
      if (e.key === "ArrowLeft") x += step;
      else if (e.key === "ArrowRight") x -= step;
      else if (e.key === "ArrowUp") y += step;
      else if (e.key === "ArrowDown") y -= step;
      else if (e.key === "+" || e.key === "=") { zoomAt(s * 1.25, vw / 2, vh / 2); e.preventDefault(); return; }
      else if (e.key === "-" || e.key === "_") { zoomAt(s / 1.25, vw / 2, vh / 2); e.preventDefault(); return; }
      else return;
      e.preventDefault(); apply();
    });

    return function () { ro.disconnect(); cancelAnimationFrame(raf); };
  };
})();
