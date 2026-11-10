/* keep-engine.js — a small 2D circle-physics world for the Cartographer's Keep merge game.
   No DOM in here (so it can be tested in Node). Circles fall under gravity, collide, roll and settle;
   two touching circles of the same level merge into the next level at the contact point.
   Units are "board pixels" (the board is ~710 wide); y grows downward.

   MPM.KeepEngine.World({ l, r, b, radii, gravity }) →
     .bodies               live circles {id, level, r, x, y, vx, vy, a, av, age}
     .add(level, x, y)     drop a new circle
     .step(dt)             advance by dt seconds (call with a fixed 1/60)
     .events               array filled during step(): {type:"merge", level, x, y, from} | {type:"vanish", x, y}
*/
(function (root) {
  var SUB = 3, ITER = 5;

  function World(o) {
    this.l = o.l; this.r = o.r; this.b = o.b;
    this.radii = o.radii; this.maxLevel = o.radii.length - 1;
    this.g = o.gravity || 1700;
    this.bodies = []; this.events = []; this.t = 0; this._id = 1;
    this.restitution = 0.14; this.mu = 0.38;
  }

  World.prototype.add = function (level, x, y, vx, vy) {
    var r = this.radii[level];
    x = Math.max(this.l + r, Math.min(this.r - r, x));
    var b = { id: this._id++, level: level, r: r, m: r * r, I: 0.5 * r * r * r * r, x: x, y: y, vx: vx || 0, vy: vy || 0, a: 0, av: 0, age: 0, merged: false };
    this.bodies.push(b);
    return b;
  };

  World.prototype.clear = function () { this.bodies.length = 0; this.events.length = 0; };

  /* velocity impulse at a wall contact: n is the wall normal pointing INTO the board */
  World.prototype._wall = function (b, nx, ny, rx, ry, h) {
    var vn = b.vx * nx + b.vy * ny;
    var jn = 0;
    if (vn < 0) {
      var e = -vn > 120 ? this.restitution : 0;
      jn = -(1 + e) * vn * b.m;
      b.vx += (jn / b.m) * nx; b.vy += (jn / b.m) * ny;
    }
    var tx = -ny, ty = nx;
    var vt = (b.vx - b.av * ry) * tx + (b.vy + b.av * rx) * ty;
    var cr = rx * ty - ry * tx, K = 1 / b.m + (cr * cr) / b.I;
    var lim = this.mu * (jn + b.m * this.g * h);
    var jt = Math.max(-lim, Math.min(lim, -vt / K));
    b.vx += (jt / b.m) * tx; b.vy += (jt / b.m) * ty; b.av += (cr * jt) / b.I;
  };

  World.prototype._pair = function (a, c, nx, ny, d, h) {
    var rs = a.r + c.r, over = rs - d;
    var ia = 1 / a.m, ic = 1 / c.m, s = ia + ic;
    var push = over * 0.55;                      // partial correction each iteration; several iterations converge
    a.x -= nx * push * ia / s; a.y -= ny * push * ia / s;
    c.x += nx * push * ic / s; c.y += ny * push * ic / s;
    var rvx = c.vx - a.vx, rvy = c.vy - a.vy, vn = rvx * nx + rvy * ny, jn = 0;
    if (vn < 0) {
      var e = -vn > 140 ? this.restitution : 0;
      jn = -(1 + e) * vn / s;
      a.vx -= jn * ia * nx; a.vy -= jn * ia * ny; c.vx += jn * ic * nx; c.vy += jn * ic * ny;
    }
    var tx = -ny, ty = nx;
    var vt = (c.vx - a.vx) * tx + (c.vy - a.vy) * ty - c.av * c.r - a.av * a.r;
    var K = s + (a.r * a.r) / a.I + (c.r * c.r) / c.I;
    var lim = this.mu * (jn + 0.4 * Math.max(a.m, c.m) * this.g * h * 0.2);
    var jt = Math.max(-lim, Math.min(lim, -vt / K));
    a.vx -= jt * ia * tx; a.vy -= jt * ia * ty; c.vx += jt * ic * tx; c.vy += jt * ic * ty;
    a.av -= (a.r * jt) / a.I; c.av -= (c.r * jt) / c.I;
  };

  World.prototype.step = function (dt) {
    var h = dt / SUB, B = this.bodies, i, j, k, n = B.length, b, a, c;
    this.events.length = 0;
    for (var s = 0; s < SUB; s++) {
      n = B.length;
      for (i = 0; i < n; i++) {
        b = B[i];
        b.vy += this.g * h; b.x += b.vx * h; b.y += b.vy * h; b.a += b.av * h;
        var sp = Math.abs(b.vx) + Math.abs(b.vy);
        b.vx *= 1 - 0.25 * h; b.av *= 1 - 1.2 * h;
        if (sp < 14) { b.vx *= 0.85; b.av *= 0.85; }          // settle: kill micro-jitter
        /* a slow, upright-seeking spring so settled tokens read the right way up like the painted ones */
        if (sp < 60) { var an = Math.atan2(Math.sin(b.a), Math.cos(b.a)); b.av -= an * 14 * h; b.av *= 1 - 3 * h; }
      }
      for (k = 0; k < ITER; k++) {
        for (i = 0; i < n; i++) {
          b = B[i];
          if (b.y + b.r > this.b) { b.y = this.b - b.r; this._wall(b, 0, -1, 0, b.r, h); }
          if (b.x - b.r < this.l) { b.x = this.l + b.r; this._wall(b, 1, 0, -b.r, 0, h); }
          if (b.x + b.r > this.r) { b.x = this.r - b.r; this._wall(b, -1, 0, b.r, 0, h); }
        }
        for (i = 0; i < n; i++) {
          a = B[i];
          for (j = i + 1; j < n; j++) {
            c = B[j];
            var dx = c.x - a.x; if (dx > a.r + c.r || dx < -(a.r + c.r)) continue;
            var dy = c.y - a.y; if (dy > a.r + c.r || dy < -(a.r + c.r)) continue;
            var d2 = dx * dx + dy * dy, rs = a.r + c.r;
            if (d2 >= rs * rs) continue;
            var d = Math.sqrt(d2) || 0.0001;
            this._pair(a, c, d2 ? dx / d : 0, d2 ? dy / d : -1, d, h);
          }
        }
      }
    }
    for (i = 0; i < B.length; i++) B[i].age += dt;
    this.t += dt;
    this._merge();
  };

  World.prototype._merge = function () {
    var B = this.bodies, add = [], i, j, a, c;
    for (i = 0; i < B.length; i++) {
      a = B[i]; if (a.merged) continue;
      for (j = i + 1; j < B.length; j++) {
        c = B[j]; if (c.merged || c.level !== a.level) continue;
        var dx = c.x - a.x, dy = c.y - a.y, rs = a.r + c.r + 0.8;
        if (dx * dx + dy * dy > rs * rs) continue;
        a.merged = c.merged = true;
        var w = a.m + c.m, mx = (a.x * a.m + c.x * c.m) / w, my = (a.y * a.m + c.y * c.m) / w;
        if (a.level >= this.maxLevel) { this.events.push({ type: "vanish", x: mx, y: my, level: a.level }); }
        else add.push({ level: a.level + 1, x: mx, y: my, vx: (a.vx + c.vx) * 0.25, vy: (a.vy + c.vy) * 0.25 });
        break;
      }
    }
    if (!this.events.length && !add.length) return;
    this.bodies = B.filter(function (b) { return !b.merged; });
    for (i = 0; i < add.length; i++) {
      var nb = this.add(add[i].level, add[i].x, add[i].y, add[i].vx, add[i].vy);
      this.events.push({ type: "merge", level: nb.level, x: nb.x, y: nb.y, body: nb });
    }
  };

  var API = { World: World };
  root.MPM = root.MPM || {};
  root.MPM.KeepEngine = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
