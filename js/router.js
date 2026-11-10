/* router.js — tiny hash router. Routes:
     #/                 bookshelf (home)
     #/atlas            fantasy atlas (map)
     #/place/<id>       a landmark's experience
     #/portfolio        interior design portfolio
   Each route is a function that renders into #app and may return a cleanup function. */
(function () {
  var app = document.getElementById("app");
  var routes = [];
  var cleanup = null;
  var first = true;

  function add(pattern, render) { routes.push({ re: pattern, render: render }); }

  function resolve() {
    var hash = location.hash || "#/";
    for (var i = 0; i < routes.length; i++) {
      var m = hash.match(routes[i].re);
      if (m) return { route: routes[i], params: m.slice(1) };
    }
    return { route: routes[0], params: [] };
  }

  function render() {
    var r = resolve();
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    app.innerHTML = "";
    window.scrollTo(0, 0);
    cleanup = r.route.render(app, r.params) || null;
    app.focus({ preventScroll: true });
  }

  function onChange() {
    if (first) { first = false; render(); return; }
    MPM.transition.fade(render);
  }

  /* go() lets components navigate with a custom transition (e.g. the Library book). */
  MPM.router = {
    add: add,
    start: function () { window.addEventListener("hashchange", onChange); first = false; render(); },
    go: function (hash) { if (location.hash === hash) return; location.hash = hash; },
    goWith: function (transition, hash) {
      /* Run a custom transition, swapping the hash silently under the overlay. */
      window.removeEventListener("hashchange", onChange);
      transition(function () { location.hash = hash; render(); }).then(function () {
        setTimeout(function () { window.addEventListener("hashchange", onChange); }, 0);
      });
    }
  };
})();
