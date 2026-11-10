/* exp-clearing.js — The Hidden Clearing (Whispering Woods).  #/place/hidden-clearing
   The supplied illustration is the stage. Each painted parchment card is a real button; clicking one opens a parchment panel
   with its illustration and description. Edit TALENTS below to change any title or text. */
(function () {
  var ART = "assets/clearing/clearing.webp", AW = 1672, AH = 941;
  var INTRO = { title: "The Hidden Clearing", line: "A quiet little place for the talents that don’t always make it onto a résumé." };
  /* box = the painted card on the 1672 x 941 artwork */
  var TALENTS = [
    { id: "singing", title: "Singing", box: [135, 128, 525, 342], img: "i-singing",
      text: "Music has always been one of my favourite ways to express myself. Whether I’m singing along to a favourite song or simply enjoying a melody, it’s one of those little things that makes me happy." },
    { id: "laugh", title: "Making People Laugh", box: [1168, 128, 1560, 340], img: "i-laugh",
      text: "I love finding humour in everyday situations. Whether it’s a silly joke, an unexpected comment or simply making someone smile, bringing a little laughter into someone’s day is something I genuinely enjoy." },
    { id: "photography", title: "Amateur Photography", box: [1172, 368, 1610, 588], img: "i-photography",
      text: "I enjoy capturing little moments, beautiful places and the small details that might otherwise go unnoticed. I love having the opportunity to preserve memories and see the world through a different perspective." },
    { id: "baking", title: "Baking", box: [72, 368, 482, 585], img: "i-baking",
      text: "There’s something comforting about creating something delicious from scratch. I enjoy experimenting in the kitchen, baking for others and sharing something I’ve made with the people I care about." },
    { id: "fixing", title: "Fixing & Making Things", box: [86, 592, 552, 845], img: "i-fixing",
      text: "I love figuring out how things work, whether it’s repairing something, building something new or finding a creative solution to a problem. I enjoy working with my hands and discovering what I can create." },
    { id: "advice", title: "Great Advice Giver", box: [1112, 604, 1590, 835], img: "i-advice",
      text: "I enjoy being someone people can turn to when they need a listening ear, a fresh perspective or a little guidance. I genuinely care about the people around me and want them to feel supported and understood." }
  ];

  function pos(b) { return "left:" + (b[0] / AW * 100).toFixed(3) + "%;top:" + (b[1] / AH * 100).toFixed(3) + "%;width:" + ((b[2] - b[0]) / AW * 100).toFixed(3) + "%;height:" + ((b[3] - b[1]) / AH * 100).toFixed(3) + "%"; }
  /* the same patch of artwork as a background, so the card can lift on hover and still match the painting */
  function patch(b) {
    var fw = (b[2] - b[0]) / AW, fh = (b[3] - b[1]) / AH;
    return "background-image:url(" + ART + ");background-size:" + (100 / fw).toFixed(3) + "% " + (100 / fh).toFixed(3) + "%;background-position:" + (b[0] / (AW - (b[2] - b[0])) * 100).toFixed(3) + "% " + (b[1] / (AH - (b[3] - b[1])) * 100).toFixed(3) + "%;aspect-ratio:" + ((b[2] - b[0]) / (b[3] - b[1])).toFixed(4);
  }

  MPM.registerExperience("hidden-clearing", function (root) {
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var wrap = document.createElement("section");
    wrap.className = "scene hc";
    var flies = "";
    for (var i = 0; i < 16; i++) flies += '<i style="left:' + (Math.random() * 96 + 2).toFixed(1) + '%;top:' + (Math.random() * 90 + 4).toFixed(1) + '%;--d:' + (Math.random() * 6).toFixed(1) + 's;--t:' + (5 + Math.random() * 5).toFixed(1) + 's"></i>';
    wrap.innerHTML =
      '<div class="stage hc-stage" style="background-image:url(' + ART + ')">' + MPM.scene.back("#/atlas", "Back to the Whispering Woods map") +
        '<h1 class="hc-h1">' + INTRO.title + '</h1><p class="hc-intro">' + INTRO.line + '</p>' +
        '<div class="hc-mhero" role="img" aria-label="A carved wooden sign reading The Hidden Clearing, hanging in an enchanted woodland clearing." style="' + patch([520, 0, 1150, 335]) + '"></div>' +
        '<div class="hc-flies" aria-hidden="true">' + flies + '</div>' +
        '<div class="hc-cards">' + TALENTS.map(function (t) {
          return '<button type="button" class="hc-card" data-id="' + t.id + '" style="' + pos(t.box) + '" aria-haspopup="dialog" aria-label="' + t.title + ' — open"><span class="art" style="' + patch(t.box) + '"></span></button>';
        }).join("") + '</div>' +
        '<p class="hc-hint">Tap a card to read more.</p>' +
      '</div>';
    root.appendChild(wrap);

    var pop = null, lastBtn = null;
    function close() {
      if (!pop) return;
      var p = pop; pop = null; p.classList.add("out");
      setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, reduce ? 0 : 180);
      if (lastBtn) { try { lastBtn.focus({ preventScroll: true }); } catch (e) {} }
    }
    function open(id, btn) {
      var t = TALENTS.filter(function (x) { return x.id === id; })[0]; if (!t) return;
      if (pop) { pop.parentNode && pop.parentNode.removeChild(pop); pop = null; }   /* only one panel at a time */
      lastBtn = btn;
      var el = document.createElement("div");
      el.className = "hc-pop";
      el.innerHTML = '<div class="hc-panel" role="dialog" aria-modal="true" aria-labelledby="hcT">' +
        '<button type="button" class="hc-x" aria-label="Close">×</button>' +
        '<img class="hc-ill" src="assets/clearing/' + t.img + '.webp" alt="" draggable="false">' +
        '<div class="hc-txt"><h2 id="hcT">' + t.title + '</h2><div class="hc-rule" aria-hidden="true"><i></i>❦<i></i></div><p>' + t.text + '</p></div></div>';
      document.body.appendChild(el); pop = el;
      el.addEventListener("click", function (e) { if (e.target === el || e.target.closest(".hc-x")) close(); });
      el.querySelector(".hc-x").focus({ preventScroll: true });
    }
    wrap.addEventListener("click", function (e) { var b = e.target.closest(".hc-card"); if (b) open(b.dataset.id, b); });
    function key(e) {
      if (e.key === "Escape") { if (pop) close(); else MPM.router.go("#/atlas"); }
      else if (e.key === "Tab" && pop) {   /* keep focus inside the open panel */
        var f = pop.querySelector(".hc-x"); e.preventDefault(); f.focus();
      }
    }
    document.addEventListener("keydown", key);
    return function () { document.removeEventListener("keydown", key); if (pop && pop.parentNode) pop.parentNode.removeChild(pop); };
  });
})();
