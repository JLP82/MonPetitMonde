/* lighthouse.js — Uncharted Coast › The Lighthouse of Possibilities.
   The interior stays still; the exterior and a few lights breathe gently (see .fx layers in css/scenes.css).
   The meditation lives in js/meditation.js. */
(function () {
  var v = MPM.scene.vars;
  var ART = "assets/scenes/lighthouse.webp";

  /* ---- editable copy ---- */
  var COPY = {
    title: ["The Lighthouse of", "Possibilities"],
    subtitle: "A place to dream about what lies ahead, while remembering to appreciate where you are today.",
    paras: [
      { icon: "trees", text: "I hope to use my creativity and passion for design to create meaningful spaces, particularly public buildings that bring people together, strengthen communities, and give people a place to belong." },
      { icon: "people", text: "I believe good design has the power to make a difference, and that strong communities are built when we create spaces for people to connect, support one another, and grow." },
      { icon: "waves", text: "But not every moment needs to be about what comes next. Sometimes, it’s important to sit back, watch the boats drift by, take a deep breath, and simply enjoy where the tide has brought you." }
    ],
    closing: "So take a moment, settle in, and let the world slow down.",
    moment: {
      title: "Take a Moment",
      phrase: "Breathe in. Breathe out. Be here.",
      text: "A gentle guided meditation to help you slow down and enjoy the present.",
      button: "Begin Meditation"
    }
  };

  /* Small ink-style icons (inline SVG so they take the page's colours and need no files). */
  var ICON = {
    trees: '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M12 36V26M6 26l6-12 6 12zM8 20l4-9 4 9M32 36V24M24 24l8-16 8 16zM27 17l5-9 5 9M4 36h40" /></svg>',
    people: '<svg viewBox="0 0 48 40" aria-hidden="true"><circle cx="24" cy="12" r="5"/><circle cx="10" cy="17" r="4"/><circle cx="38" cy="17" r="4"/><path d="M14 36c0-8 4-13 10-13s10 5 10 13zM2 34c0-6 3-10 8-10M46 34c0-6-3-10-8-10"/></svg>',
    waves: '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M3 16c4-6 8-6 12 0s8 6 12 0 8-6 12 0 4 3 6 2M3 26c4-6 8-6 12 0s8 6 12 0 8-6 12 0 4 3 6 2M3 36c4-6 8-6 12 0s8 6 12 0 8-6 12 0 4 3 6 2"/></svg>'
  };
  var LIGHTHOUSE = '<svg viewBox="0 0 64 80" aria-hidden="true"><path d="M26 70l3-38h6l3 38M24 32h16l-2-8H26zM28 24v-8h8v8M32 8v8M29 16l3-8 3 8M16 78l6-8h20l6 8z"/><path d="M10 14l12 6M54 14L42 20M8 24l14 2M56 24L42 26" class="rays"/></svg>';
  var COMPASS = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22"/><path d="M32 6l5 21 21 5-21 5-5 21-5-21-21-5 21-5z"/><text x="32" y="5" text-anchor="middle">N</text></svg>';

  MPM.registerExperience("lighthouse", function (root) {
    var paras = COPY.paras.map(function (p) {
      return '<div class="lh-row"><span class="lh-ico">' + ICON[p.icon] + '</span><p>' + p.text + '</p></div>';
    }).join("");

    var wrap = document.createElement("section");
    wrap.className = "scene lh";
    wrap.innerHTML =
      '<div class="stage" style="background-image:url(' + ART + ')">' + MPM.scene.back() +
        '<div class="mhero" role="img" aria-label="Sunset over a harbour seen through the curved windows of a lighthouse, with a plaid blanket and a glowing lantern in the foreground." style="' + MPM.scene.crop([0, 0, 600, 733.33], ART) + '"></div>' +
        /* animated exterior + lights — each its own layer so more can be added later */
        '<div class="fx lh-sky" style="' + v([20, 40, 600, 290]) + '" aria-hidden="true"><i class="bird b1"></i><i class="bird b2"></i><i class="bird b3"></i></div>' +
        '<div class="fx lh-sun" style="' + v([217, 205, 437, 425]) + '" aria-hidden="true"></div>' +
        '<div class="fx lh-water" style="' + v([140, 352, 520, 490]) + '" aria-hidden="true"></div>' +
        '<div class="fx lh-lantern" style="' + v([495, 515, 645, 665]) + '" aria-hidden="true"></div>' +
        '<div class="fx lh-steam" style="' + v([140, 325, 195, 448]) + '" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="abs lh-panelwrap" style="' + v([586, 0, 1100, 733.33]) + '">' +
          '<article class="lh-panel" style="clip-path:' + MPM.scene.tornLeft(11, 2.2) + '">' +
            '<header class="lh-head"><span class="lh-lighthouse">' + LIGHTHOUSE + '</span>' +
              '<h1>' + COPY.title[0] + '<br><em>' + COPY.title[1] + '</em></h1><span class="lh-compass">' + COMPASS + '</span></header>' +
            '<p class="lh-sub">' + COPY.subtitle + '</p>' +
            '<div class="lh-body">' + paras + '<p class="lh-closing">' + COPY.closing + '</p></div>' +
            '<div class="lh-moment"><h2>' + COPY.moment.title + '</h2>' +
              '<p class="lh-phrase">' + COPY.moment.phrase + '</p><p class="lh-support">' + COPY.moment.text + '</p>' +
              '<button type="button" class="lh-begin" id="lh-begin"><span aria-hidden="true">&#9654;</span> ' + COPY.moment.button + '</button></div>' +
          '</article>' +
        '</div>' +
      '</div>';
    root.appendChild(wrap);

    var session = null;
    wrap.querySelector("#lh-begin").addEventListener("click", function () {
      if (session) return;
      session = MPM.Meditation.open({ background: ART, onClose: function () { session = null; } });
    });

    var navKey = function (e) { if (e.key === "Escape" && !session) MPM.router.go("#/atlas"); };
    document.addEventListener("keydown", navKey);
    return function () { document.removeEventListener("keydown", navKey); if (session) session.close(); };
  });
})();
