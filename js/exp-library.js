/* exp-library.js — The Story Keepers' Library (Whispering Woods).  #/place/storykeepers-library
   A reading journal: 10 spreads (introduction + 9 books). Desktop shows the open journal with a two-page flip;
   phones show one page at a time with swipe. The page art is the supplied illustration for each spread; the contents list,
   buttons, dots and all text for phones / screen readers are live and come from BOOKS below, so books and wording are editable.
   Adding a book: add an entry to BOOKS and drop its spread art in assets/library/. */
(function () {
  var AW = 1670, AH = 941, SPINE = 830, LEFT = [220, 90, 830, 880], RIGHT = [830, 90, 1440, 880];
  var INTRO = {
    title: "The Story Keepers’ Library", subtitle: "Every story leaves a little something behind.",
    paras: [
      "Welcome to my little collection of stories. This is a place for the worlds I’ve explored, the characters I’ve met, and the adventures that have stayed with me long after turning the final page.",
      "From dystopian futures to magical kingdoms, these are some of the books that have shaped my imagination and inspired my love of storytelling.",
      "Every book has its own place on these shelves, and every rating is a little piece of my reading journey.",
      "So find a comfortable spot, turn a page, and discover a few of my favourite stories."],
    contents: "The Reading Collection"
  };
  /* art = spread illustration (assets/library/<art>.webp) */
  var BOOKS = [
    { title: "Red Rising Trilogy", sub: "The Red Rising Trilogy", author: "Pierce Brown", rating: 5, art: "s02",
      synopsis: "In a future society divided by colour-coded castes, Darrow belongs to the oppressed Reds, who believe they are sacrificing their lives to make Mars habitable. When he discovers the truth about their society, he becomes part of a dangerous rebellion determined to tear down the system from within." },
    { title: "The 5th Wave Trilogy", sub: "The 5th Wave Trilogy", author: "Rick Yancey", rating: 3.5, art: "s03",
      synopsis: "Following a series of devastating alien attacks, humanity is pushed to the brink of extinction. Cassie Sullivan struggles to survive in a world where trust has become dangerous and the next wave could change everything." },
    { title: "The Rule of Three", author: "Eric Walters", rating: 5, art: "s04",
      synopsis: "When a worldwide computer failure brings modern society to a standstill, teenager Adam Daley and his neighbours must figure out how to survive. As resources disappear and chaos spreads, the community discovers just how important cooperation and preparation can be.",
      note: { head: "Fun Fact", text: "This was the book that got me into reading!" } },
    { title: "The Last She", author: "H. J. Nelson", rating: 4, art: "s05",
      synopsis: "After a devastating virus wipes out nearly all women, Ara finds herself alone in a world she barely recognizes. When she encounters a group of survivors, she becomes determined to uncover the truth about the plague and find a way forward in a world that has changed forever." },
    { title: "Scythe", author: "Neal Shusterman", rating: 4, art: "s06",
      synopsis: "In a future where humanity has conquered death, the world is controlled by Scythes — trained individuals who maintain balance through the permanent elimination of life. Citra and Rowan are unexpectedly chosen as apprentices and must learn what it truly means to wield the power over life and death." },
    { title: "Fourth Wing", author: "Rebecca Yarros", rating: 4, art: "s07",
      synopsis: "Violet Sorrengail expected to live a quiet life among books, but instead she’s thrown into the brutal world of Basgiath War College, where survival depends on strength, strategy, and the bond with a dragon. As threats grow and loyalties are tested, Violet must discover just how far she’s willing to go to protect those she loves.",
      note: { head: "My Dragon", text: "I have my own dragon — Neisuith — a powerful and beautiful dragon inspired by the worlds and magic of Fourth Wing." } },
    { title: "Six of Crows", author: "Leigh Bardugo", rating: 3.5, art: "s08",
      synopsis: "A crew of six outcasts with dangerous skills are brought together for one impossible heist in the criminal underworld of Ketterdam. As the job spins out of control, they must rely on each other’s talents, secrets, and loyalties to survive.",
      list: { head: "The Crew", items: ["Kaz Brekker", "Inej Ghafa", "Jesper Fahey", "Wylan Van Eck", "Nina Zenik", "Matthias Helvar"] } },
    { title: "Cities of Smoke and Starlight", author: "Alli Earnest", rating: 4.5, art: "s09",
      synopsis: "Scholar Hallie Walker and daring pilot Kase Shackley are thrown together on a dangerous mission across a world of failing technology and ancient magic. With a ragtag crew, they must find a lost people and forge an alliance before war consumes their home." },
    { title: "The Knife of Never Letting Go", author: "Patrick Ness", rating: 4, art: "s10",
      synopsis: "Todd Hewitt lives in a town where everyone can hear each other’s thoughts — the Noise — and there are no secrets. When he and his dog, Manchee, are forced to flee, Todd discovers a dangerous truth about his world, and must learn to survive in a place that’s far more complex than he was ever told.",
      list: { head: "Themes", items: ["Identity", "Control", "Survival", "Growing up"] } }
  ];
  var SPREADS = [{ art: "s01", intro: true }].concat(BOOKS.map(function (b, i) { b.n = i + 1; return b; }));

  function ratingTxt(r) { return (r % 1 ? r.toFixed(1) : r) + "/5"; }
  function stars(r) { var h = ""; for (var i = 1; i <= 5; i++) h += '<i class="' + (r >= i ? "f" : r >= i - 0.5 ? "h" : "e") + '"></i>'; return '<span class="lb-stars" role="img" aria-label="' + ratingTxt(r) + ' stars">' + h + "</span>"; }
  function pc(r, a, b) { return (r / (a ? a : 1) * 100).toFixed(3) + "%"; }
  function pos(r) { return "left:" + (r[0] / AW * 100).toFixed(3) + "%;top:" + (r[1] / AH * 100).toFixed(3) + "%;width:" + ((r[2] - r[0]) / AW * 100).toFixed(3) + "%;height:" + ((r[3] - r[1]) / AH * 100).toFixed(3) + "%"; }
  function url(art) { return "assets/library/" + art + ".webp"; }
  /* background that shows exactly rect r of the artwork `art` */
  function patch(art, r) {
    var fw = (r[2] - r[0]) / AW, fh = (r[3] - r[1]) / AH;
    return "background-image:url(" + url(art) + ");background-size:" + (100 / fw).toFixed(3) + "% " + (100 / fh).toFixed(3) + "%;background-position:" + (r[0] / (AW - (r[2] - r[0])) * 100).toFixed(3) + "% " + (r[1] / (AH - (r[3] - r[1])) * 100).toFixed(3) + "%";
  }
  var TOC_Y0 = 298, TOC_DY = 38.5;      /* where the nine painted contents lines sit on the intro spread */

  MPM.registerExperience("storykeepers-library", function (root, place, sub) {
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var mq = window.matchMedia("(max-width: 860px)");
    var cur = Math.max(0, Math.min(SPREADS.length - 1, (parseInt(sub, 10) || 1) - 1)), side = 0, busy = false;
    SPREADS.forEach(function (s) { var im = new Image(); im.src = url(s.art); });

    var wrap = document.createElement("section");
    wrap.className = "scene lb";
    var dots = SPREADS.map(function (s, i) { return '<button type="button" class="lb-dot" data-go="' + i + '" aria-label="' + (i ? BOOKS[i - 1].title : "Introduction and contents") + '"></button>'; }).join("");
    var tocHot = BOOKS.map(function (b, i) {
      return '<button type="button" class="lb-hot" data-go="' + (i + 1) + '" style="top:' + ((TOC_Y0 + TOC_DY * i - 20) / AH * 100).toFixed(3) + '%" aria-label="' + (i + 1) + '. ' + b.title + ' — ' + ratingTxt(b.rating) + '"></button>';
    }).join("");
    wrap.innerHTML =
      '<div class="stage lb-stage" style="background-image:url(' + url(SPREADS[cur].art) + ')">' + MPM.scene.back("#/atlas", "Back to the Whispering Woods map") +
        '<h1 class="lb-h1">' + INTRO.title + '</h1>' +
        '<div class="lb-fx" aria-hidden="true"></div>' +
        '<div class="lb-hots" hidden>' + tocHot + '</div>' +
        '<div class="lb-sr" aria-live="polite"></div>' +
        '<nav class="lb-bar" aria-label="Journal navigation">' +
          '<button type="button" class="lb-btn lb-prev" data-act="prev" style="' + pos([280, 866, 462, 918]) + '"><span aria-hidden="true">←</span> Previous</button>' +
          '<button type="button" class="lb-btn lb-toc" data-act="toc" style="' + pos([492, 868, 676, 916]) + '">Contents</button>' +
          '<div class="lb-dots" style="' + pos([690, 862, 990, 920]) + '" role="group" aria-label="Pages">' + dots + '</div>' +
          '<button type="button" class="lb-btn lb-next" data-act="next" style="' + pos([1215, 866, 1392, 918]) + '">Next <span aria-hidden="true">→</span></button>' +
        '</nav>' +
        '<div class="lb-m" hidden><div class="lb-mpage"></div>' +
          '<div class="lb-mbar"><button type="button" class="lb-btn" data-act="prev"><span aria-hidden="true">←</span> Previous</button><button type="button" class="lb-btn" data-act="toc">Contents</button><button type="button" class="lb-btn" data-act="next">Next <span aria-hidden="true">→</span></button></div>' +
          '<p class="lb-mcount" aria-live="polite"></p></div>' +
      '</div>';
    root.appendChild(wrap);
    var $ = function (s) { return wrap.querySelector(s); }, $$ = function (s) { return [].slice.call(wrap.querySelectorAll(s)); };
    var stage = $(".lb-stage"), fx = $(".lb-fx"), hots = $(".lb-hots"), sr = $(".lb-sr"), mpage = $(".lb-mpage");

    /* ---------- text for screen readers + phones ---------- */
    function noteHTML(b) {
      if (b.note) return '<div class="lb-note"><b>' + b.note.head + '</b><p>' + b.note.text + '</p></div>';
      if (b.list) return '<div class="lb-note"><b>' + b.list.head + '</b><ul>' + b.list.items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul></div>';
      return "";
    }
    function bookHTML(b) {
      return '<h2>' + b.title + '</h2>' + (b.sub ? '<p class="lb-sub">' + b.sub + '</p>' : '') + '<p class="lb-by">by ' + b.author + '</p>' +
        '<p class="lb-rate"><span>My Rating:</span> ' + stars(b.rating) + ' <b>' + ratingTxt(b.rating) + '</b></p><h3>Synopsis</h3><p class="lb-syn">' + b.synopsis + '</p>' + noteHTML(b);
    }
    function introHTML() { return '<h2>' + INTRO.title + '</h2><p class="lb-sub">' + INTRO.subtitle + '</p>' + INTRO.paras.map(function (p) { return "<p>" + p + "</p>"; }).join(""); }
    function tocHTML() { return '<h2>' + INTRO.contents + '</h2><ol class="lb-list">' + BOOKS.map(function (b, i) { return '<li><button type="button" data-go="' + (i + 1) + '"><span class="t">' + b.title + '</span>' + stars(b.rating) + '<b>' + ratingTxt(b.rating) + '</b></button></li>'; }).join("") + '</ol>'; }

    function updateUI() {
      var last = SPREADS.length - 1, mob = mq.matches;
      var atStart = mob ? (cur === 0 && side === 0) : cur === 0, atEnd = mob ? (cur === last && side === 1) : cur === last;
      $$('[data-act=prev]').forEach(function (b) { b.disabled = atStart; });
      $$('[data-act=next]').forEach(function (b) { b.disabled = atEnd; });
      $$(".lb-dot").forEach(function (d, i) { d.classList.toggle("on", i === cur); d.setAttribute("aria-current", i === cur ? "page" : "false"); });
      hots.hidden = !(cur === 0 && !mob); $(".lb-toc").classList.toggle("here", cur === 0);
      var s = SPREADS[cur];
      sr.innerHTML = s.intro ? introHTML() + '<h2>' + INTRO.contents + '</h2><ol>' + BOOKS.map(function (b) { return '<li>' + b.title + ', ' + ratingTxt(b.rating) + '</li>'; }).join('') + '</ol>' : bookHTML(s);
      stage.style.backgroundImage = "url(" + url(s.art) + ")";
      $(".lb-mcount").textContent = mob ? "Page " + (cur * 2 + side + 1) + " of " + SPREADS.length * 2 : "";
      if (mob) paintMobile();
    }
    function paintMobile() {
      var s = SPREADS[cur], h;
      if (s.intro) h = side === 0 ? '<article class="lb-card">' + introHTML() + '</article>' : '<article class="lb-card">' + tocHTML() + '</article>';
      else h = side === 0 ? '<div class="lb-art" role="img" aria-label="Scrapbook page of illustrations for ' + s.title + '" style="' + patch(s.art, LEFT) + '"></div>' : '<article class="lb-card lb-book">' + bookHTML(s) + '</article>';
      mpage.innerHTML = h;
    }

    /* ---------- page turning ---------- */
    function turn(to) {
      if (busy || to === cur || to < 0 || to >= SPREADS.length) return;
      var from = cur, fwd = to > from;
      if (mq.matches || reduce) { cur = to; side = fwd ? 0 : (mq.matches ? 1 : 0); updateUI(); return; }
      busy = true; hots.hidden = true;
      var A = SPREADS[from].art, B = SPREADS[to].art, cover, leaf, dur = 780;
      /* base (the stage) switches to the new spread; the old half stays on top until the leaf has swung over it */
      stage.style.backgroundImage = "url(" + url(B) + ")";
      var keepRect = fwd ? LEFT : RIGHT, leafRect = fwd ? RIGHT : LEFT;
      fx.innerHTML = '<div class="lb-keep" style="' + pos(keepRect) + ";" + patch(A, keepRect) + '"></div>' +
        '<div class="lb-leaf ' + (fwd ? "fwd" : "back") + '" style="' + pos(leafRect) + '"><div class="face front" style="' + patch(A, leafRect) + '"></div><div class="face back" style="' + patch(B, fwd ? LEFT : RIGHT) + '"></div><div class="shade"></div></div>';
      leaf = fx.querySelector(".lb-leaf");
      var anim = leaf.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(" + (fwd ? -180 : 180) + "deg)" }], { duration: dur, easing: "cubic-bezier(.45,.05,.3,1)", fill: "forwards" });
      leaf.querySelector(".shade").animate([{ opacity: 0 }, { opacity: 1, offset: .5 }, { opacity: 0 }], { duration: dur, easing: "linear" });
      anim.onfinish = function () { fx.innerHTML = ""; cur = to; side = 0; busy = false; updateUI(); };
    }
    function next() {
      if (mq.matches) { if (side === 0) { side = 1; updateUI(); } else if (cur < SPREADS.length - 1) { cur++; side = 0; updateUI(); } }
      else turn(cur + 1);
    }
    function prev() {
      if (mq.matches) { if (side === 1) { side = 0; updateUI(); } else if (cur > 0) { cur--; side = 1; updateUI(); } }
      else turn(cur - 1);
    }
    function go(i) { if (mq.matches) { cur = i; side = 0; updateUI(); window.scrollTo(0, 0); } else turn(i); }
    function toc() { if (mq.matches) { cur = 0; side = 1; updateUI(); } else turn(0); }

    wrap.addEventListener("click", function (e) {
      var g = e.target.closest("[data-go]"), a = e.target.closest("[data-act]");
      if (g) { go(+g.dataset.go); return; }
      if (a && !a.disabled) { var k = a.dataset.act; if (k === "next") next(); else if (k === "prev") prev(); else if (k === "toc") toc(); }
    });
    function key(e) {
      if (e.key === "Escape") MPM.router.go("#/atlas");
      else if (e.key === "ArrowRight") next(); else if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", key);
    /* swipe on phones */
    var sx = null;
    mpage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    mpage.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); } });
    function mode() { $(".lb-m").hidden = !mq.matches; updateUI(); }
    if (mq.addEventListener) mq.addEventListener("change", mode); else mq.addListener(mode);
    mode();
    wrap._lb = { go: go, next: next, prev: prev, state: function () { return { cur: cur, side: side, busy: busy }; }, SPREADS: SPREADS };
    return function () { document.removeEventListener("keydown", key); };
  });
})();
