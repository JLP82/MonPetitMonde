/* transitions.js — fades between screens and the book-closing transition. */
(function () {
  var overlay = document.getElementById("transition");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function fade(run, ms) {
    ms = reduced.matches ? 120 : (ms || 260);
    overlay.className = "fade";
    overlay.style.setProperty("--t", ms + "ms");
    overlay.getBoundingClientRect(); // flush
    overlay.classList.add("on");
    return new Promise(function (res) {
      setTimeout(function () {
        run();
        requestAnimationFrame(function () {
          overlay.classList.remove("on");
          setTimeout(function () { overlay.className = ""; res(); }, ms);
        });
      }, ms);
    });
  }

  /* A leather book gently closes, a few pages turn, then we land on the bookshelf (~1.6s). */
  function bookClose(run) {
    if (reduced.matches) return fade(run, 220);
    overlay.className = "book";
    overlay.innerHTML =
      '<div class="bk"><div class="bk-page p1"></div><div class="bk-page p2"></div><div class="bk-page p3"></div>' +
      '<div class="bk-cover left"></div><div class="bk-cover right"></div><div class="bk-spine"></div></div>';
    overlay.getBoundingClientRect();
    overlay.classList.add("on");
    return new Promise(function (res) {
      setTimeout(function () {
        run();
        overlay.classList.add("out");
        setTimeout(function () { overlay.className = ""; overlay.innerHTML = ""; res(); }, 450);
      }, 1150);
    });
  }

  MPM.transition = { fade: fade, bookClose: bookClose };
})();
