/* destinations.js — landing page for each landmark.
   Phase 3 replaces these placeholders one by one: register a real renderer with
   MPM.registerExperience("<place-id>", function (root, place) { ... }) and it is used instead. */
(function () {
  var experiences = {};
  MPM.registerExperience = function (id, fn) { experiences[id] = fn; };
  MPM.hasExperience = function (id) { return !!experiences[id]; };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* A crop of the real map around the landmark, used as the page's header picture. */
  function mapCrop(box) {
    var cx = (box[0] + box[2]) / 2 / MPM.ART.w * 100, cy = (box[1] + box[3]) / 2 / MPM.ART.h * 100;
    return "background-image:url(assets/map.webp);background-size:300% auto;background-position:" + cx + "% " + cy + "%";
  }

  MPM.renderPlace = function (root, params) {
    var id = decodeURIComponent(params[0] || "");
    var sub = params[1] ? decodeURIComponent(params[1]) : "";
    var place = MPM.placeById(id);
    if (!place) {
      root.innerHTML = '<section class="page"><div class="parchment"><h1>Lost in the woods</h1><p>That place isn\'t on the map.</p><p><a class="btn" href="#/atlas">Back to the Atlas</a></p></div></section>';
      return;
    }
    if (experiences[id]) return experiences[id](root, place, sub);

    var region = MPM.REGIONS[place.region];
    var box = place.box || [500, 650, 700, 850];
    var wrap = document.createElement("section");
    wrap.className = "page place-page";
    wrap.innerHTML =
      '<div class="place-hero" role="img" aria-label="A close-up of ' + esc(place.name) + ' on the map" style="' + mapCrop(box) + '"></div>' +
      '<article class="parchment">' +
        '<nav class="crumbs" aria-label="You are here"><a href="#/">Bookshelf</a><span aria-hidden="true">›</span><a href="#/atlas">Fantasy Atlas</a><span aria-hidden="true">›</span><span>' + esc(region.name) + '</span></nav>' +
        '<p class="eyebrow">' + esc(region.name) + '</p>' +
        '<h1>' + esc(place.name) + '</h1>' +
        '<p class="lede">' + esc(place.blurb) + '</p>' +
        '<p class="status"><span class="ribbon">Coming soon</span> This destination is being built next. Its illustrated experience will open right here.</p>' +
        '<div class="actions">' +
          '<a class="btn primary" href="#/atlas">&larr; Back to the Atlas</a>' +
          '<a class="btn" href="#/">Bookshelf</a>' +
          (place.extra ? '<a class="btn" href="' + esc(place.extra.to) + '">' + esc(place.extra.label) + '</a>' : '') +
        '</div>' +
      '</article>';
    root.appendChild(wrap);

    function onKey(e) { if (e.key === "Escape") MPM.router.go("#/atlas"); }
    document.addEventListener("keydown", onKey);
    return function () { document.removeEventListener("keydown", onKey); };
  };
})();
