/* portfolio.js — the interior design portfolio, opened directly from the Design Manuals.
   The pages are rendered from the supplied PDF (assets/portfolio/p-01.jpg …). */
(function () {
  function pad(n) { return n < 10 ? "0" + n : String(n); }

  MPM.renderPortfolio = function (root) {
    var P = MPM.PORTFOLIO;
    var wrap = document.createElement("section");
    wrap.className = "portfolio-screen";

    var chips = P.sections.map(function (s) {
      return '<button type="button" class="pf-chip" data-target="pf-' + s.id + '">' + s.title + '</button>';
    }).join("");

    var body = P.sections.map(function (s) {
      var imgs = "";
      for (var n = s.from; n <= s.to; n++) {
        imgs += '<img class="pf-page" loading="lazy" decoding="async" width="720" height="720" ' +
                'src="assets/portfolio/p-' + pad(n) + '.jpg" alt="' + s.title + ', page ' + n + ' of ' + P.pageCount + '">';
      }
      return '<div class="pf-section" id="pf-' + s.id + '" data-id="pf-' + s.id + '"><h2 class="sr-only">' + s.title + '</h2>' + imgs + '</div>';
    }).join("");

    wrap.innerHTML =
      '<header class="pf-bar">' +
        '<a class="chip" href="#/">&larr; Bookshelf</a>' +
        '<nav class="crumbs" aria-label="You are here"><a href="#/">Bookshelf</a><span aria-hidden="true">›</span><span aria-current="page">Interior Design Portfolio</span></nav>' +
        '<a class="chip" href="' + P.pdf + '" target="_blank" rel="noopener" download>Download PDF</a>' +
      '</header>' +
      '<nav class="pf-nav" aria-label="Portfolio sections">' + chips + '</nav>' +
      '<div class="pf-pages">' + body + '</div>' +
      '<footer class="pf-foot"><a class="btn primary" href="#/">Back to the bookshelf</a></footer>';
    root.appendChild(wrap);

    var chipEls = Array.from(wrap.querySelectorAll(".pf-chip"));
    wrap.querySelector(".pf-nav").addEventListener("click", function (e) {
      var b = e.target.closest(".pf-chip"); if (!b) return;
      var t = document.getElementById(b.getAttribute("data-target"));
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (t) t.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });

    var io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.getAttribute("data-id");
          chipEls.forEach(function (c) {
            var on = c.getAttribute("data-target") === id;
            c.classList.toggle("active", on);
            if (on) c.setAttribute("aria-current", "true"); else c.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      wrap.querySelectorAll(".pf-section").forEach(function (s) { io.observe(s); });
    }
    return function () { if (io) io.disconnect(); };
  };
})();
