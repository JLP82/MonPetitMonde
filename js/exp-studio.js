/* exp-studio.js — The Design Studio (Maker's Range).
   A warm landing page whose one job is to send visitors to the interior design portfolio.
   Set MPM.PORTFOLIO_URL in js/data.js once the live portfolio exists. */
(function () {
  var TEXT = {
    title: "The Design Studio",
    subtitle: "Where ideas become spaces.",
    heading: "Welcome to the Design Studio",
    p1: "Every space begins with an idea. This is where creativity, research, and imagination come together to shape the environments around us.",
    p2: "Step inside and explore my interior design journey, selected projects, and the ideas behind my work.",
    button: "ENTER MY PORTFOLIO →",
    back: "← Return to the Makers Range",
    noUrl: "My portfolio link isn’t ready yet — but you’re welcome to browse the portfolio right here in the meantime."
  };

  MPM.registerExperience("design-studio", function (root) {
    var wrap = document.createElement("section");
    wrap.className = "studio";
    wrap.innerHTML =
      '<div class="studio-stage">' +
        '<img class="studio-art" src="assets/img/design-studio.webp" width="1536" height="1024" alt="" decoding="async">' +
        '<div class="studio-hero" aria-hidden="true"></div>' +
        '<header class="paper studio-sign">' +
          '<span class="studio-compass" aria-hidden="true">⌖</span>' +
          '<h1 class="studio-title">' + TEXT.title + '</h1>' +
          '<p class="studio-sub">' + TEXT.subtitle + '</p>' +
        '</header>' +
        '<section class="paper studio-welcome" aria-labelledby="studio-h">' +
          '<h2 id="studio-h">' + TEXT.heading + '</h2>' +
          '<p>' + TEXT.p1 + '</p>' +
          '<p class="studio-leaf" aria-hidden="true">❦</p>' +
          '<p>' + TEXT.p2 + '</p>' +
          '<button type="button" class="studio-cta">' + TEXT.button + '</button>' +
          '<p class="studio-note" role="status" hidden>' + TEXT.noUrl +
            ' <a href="#/portfolio">Open the portfolio</a></p>' +
        '</section>' +
        '<a class="paper studio-return" href="#/atlas">' + TEXT.back + '</a>' +
      '</div>';
    root.appendChild(wrap);

    var note = wrap.querySelector(".studio-note");
    wrap.querySelector(".studio-cta").addEventListener("click", function () {
      var url = (MPM.PORTFOLIO_URL || "").trim();
      if (url) {
        window.open(url, "_blank", "noopener"); // new tab so visitors can come back to the map
      } else {
        note.hidden = false;
        note.querySelector("a").focus();
      }
    });

    function onKey(e) { if (e.key === "Escape") MPM.router.go("#/atlas"); }
    document.addEventListener("keydown", onKey);
    return function () { document.removeEventListener("keydown", onKey); };
  });
})();
