/* main.js — wire the routes and start. */
(function () {
  MPM.router.add(/^#\/?$/, function (root) { MPM.renderBookshelf(root); });
  MPM.router.add(/^#\/atlas$/, function (root) { return MPM.renderAtlas(root); });
  MPM.router.add(/^#\/place\/([^/]+)(?:\/([^/]+))?$/, function (root, p) { return MPM.renderPlace(root, p); });
  MPM.router.add(/^#\/portfolio$/, function (root) { return MPM.renderPortfolio(root); });
  MPM.router.start();
})();
