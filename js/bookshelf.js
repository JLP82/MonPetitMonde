/* bookshelf.js — the home screen. The artwork is the approved unlabelled bookshelf;
   interactive objects are transparent links laid over it. Labels only appear on hover/focus. */
(function () {
  function pct(box) {
    var A = MPM.ART;
    return {
      left: (box[0] / A.w * 100) + "%",
      top: (box[1] / A.h * 100) + "%",
      width: ((box[2] - box[0]) / A.w * 100) + "%",
      height: ((box[3] - box[1]) / A.h * 100) + "%"
    };
  }

  MPM.renderBookshelf = function (root) {
    var wrap = document.createElement("div");
    wrap.className = "shelf-screen";

    var stage = document.createElement("div");
    stage.className = "shelf-stage";

    var img = new Image();
    img.src = "assets/bookshelf.webp";
    img.alt = "A cozy wooden bookshelf with an atlas, books, a puzzle box, a globe, candles and ivy.";
    img.className = "shelf-art";
    img.width = MPM.ART.w; img.height = MPM.ART.h;
    img.decoding = "async";
    stage.appendChild(img);

    MPM.BOOKSHELF.forEach(function (item) {
      if (item.kind !== "route") return; // decorative objects (mismatched books) stay inert
      var a = document.createElement("a");
      a.className = "hotspot shelf-hotspot";
      a.href = item.to;
      a.setAttribute("aria-label", item.label);
      var p = pct(item.box);
      a.style.left = p.left; a.style.top = p.top; a.style.width = p.width; a.style.height = p.height;
      var tip = document.createElement("span");
      tip.className = "hs-label"; tip.textContent = item.label; tip.setAttribute("aria-hidden", "true");
      a.appendChild(tip);
      stage.appendChild(a);
    });

    wrap.appendChild(stage);
    root.appendChild(wrap);
  };
})();
