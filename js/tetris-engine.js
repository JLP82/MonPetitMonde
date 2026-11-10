/* tetris-engine.js — pure game rules, no DOM. The Woodshop UI (exp-woodshop.js) drives it.
   Playfield is 10 wide x 15 high so it fits the picture frame in the concept art. */
(function () {
  var COLS = 10, ROWS = 15;

  /* Each tetromino is mapped to a wood. Add or change woods here. */
  var WOODS = [
    { id: "I", name: "Pine",     kind: "Softwood", fact: "Light, soft and easy to work — a classic for framing, shelves and country furniture.",
      face: "#e2bb74", dark: "#b88a45", light: "#f3d9a0", grain: "#b98a47" },
    { id: "O", name: "Maple",    kind: "Hardwood", fact: "Pale and very hard, so it handles heavy wear — think floors and butcher blocks.",
      face: "#f0dcab", dark: "#c7ad76", light: "#fbf0cf", grain: "#cdb27b" },
    { id: "T", name: "Oak",      kind: "Hardwood", fact: "Strong with a pronounced open grain; red and white oak are furniture and flooring staples.",
      face: "#c58b4b", dark: "#8f5f2c", light: "#e1ab6c", grain: "#8a5726" },
    { id: "S", name: "Cherry",   kind: "Hardwood", fact: "Fine, even grain that deepens to a rich reddish-brown as it ages in the light.",
      face: "#b05a2e", dark: "#7a3a1b", light: "#cf7c4d", grain: "#7b3a19" },
    { id: "Z", name: "Walnut",   kind: "Hardwood", fact: "Deep chocolate-brown and prized for fine furniture and cabinetry.",
      face: "#5e3623", dark: "#3b200f", light: "#80533b", grain: "#33190c" },
    { id: "J", name: "Birch",    kind: "Hardwood", fact: "Pale with a fine, uniform grain; common in plywood, cabinets and bentwood furniture.",
      face: "#dcc496", dark: "#ae9565", light: "#efdcb4", grain: "#b79c69" },
    { id: "L", name: "Mahogany", kind: "Hardwood", fact: "Reddish-brown and dimensionally stable — a traditional choice for fine furniture.",
      face: "#8e3d26", dark: "#5f2615", light: "#b0583c", grain: "#5d2413" }
  ];

  /* Shapes as lists of [col,row] cells in a 4x4 box (rotation 0). */
  var SHAPES = {
    I: [[0,1],[1,1],[2,1],[3,1]],
    O: [[1,0],[2,0],[1,1],[2,1]],
    T: [[1,0],[0,1],[1,1],[2,1]],
    S: [[1,0],[2,0],[0,1],[1,1]],
    Z: [[0,0],[1,0],[1,1],[2,1]],
    J: [[0,0],[0,1],[1,1],[2,1]],
    L: [[2,0],[0,1],[1,1],[2,1]]
  };
  var ORDER = ["I","O","T","S","Z","J","L"];

  function rotateCells(cells, size) { // clockwise inside a size x size box
    return cells.map(function (c) { return [size - 1 - c[1], c[0]]; });
  }
  function cellsFor(type, rot) {
    var size = type === "I" ? 4 : (type === "O" ? 4 : 3);
    var cells = SHAPES[type];
    if (type !== "I" && type !== "O") cells = cells.map(function (c) { return [c[0], c[1]]; });
    if (type === "O") return cells;
    for (var i = 0; i < ((rot % 4) + 4) % 4; i++) cells = rotateCells(cells, size);
    return cells;
  }

  function Tetris(opts) {
    opts = opts || {};
    this.rng = opts.rng || Math.random;
    this.onLock = opts.onLock || function () {};
    this.onClear = opts.onClear || function () {};
    this.onGameOver = opts.onGameOver || function () {};
    this.reset();
  }

  Tetris.prototype.reset = function () {
    this.board = [];
    for (var r = 0; r < ROWS; r++) this.board.push(new Array(COLS).fill(null));
    this.score = 0; this.lines = 0; this.level = 1;
    this.over = false; this.bag = []; this.queue = [];
    while (this.queue.length < 4) this.queue.push(this._draw());
    this._spawn();
  };

  Tetris.prototype._draw = function () {
    if (!this.bag.length) {
      this.bag = ORDER.slice();
      for (var i = this.bag.length - 1; i > 0; i--) { // Fisher–Yates
        var j = Math.floor(this.rng() * (i + 1)); var t = this.bag[i]; this.bag[i] = this.bag[j]; this.bag[j] = t;
      }
    }
    return this.bag.pop();
  };

  Tetris.prototype._spawn = function () {
    var type = this.queue.shift(); this.queue.push(this._draw());
    this.piece = { type: type, rot: 0, x: 3, y: type === "I" ? -1 : 0 };
    if (this._collides(this.piece, 0, 0, 0)) { this.over = true; this.onGameOver(this); }
  };

  Tetris.prototype.cells = function (p, dx, dy, drot) {
    var cs = cellsFor(p.type, p.rot + (drot || 0)), out = [];
    for (var i = 0; i < cs.length; i++) out.push([p.x + cs[i][0] + (dx || 0), p.y + cs[i][1] + (dy || 0)]);
    return out;
  };

  Tetris.prototype._collides = function (p, dx, dy, drot) {
    var cs = this.cells(p, dx, dy, drot);
    for (var i = 0; i < cs.length; i++) {
      var x = cs[i][0], y = cs[i][1];
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && this.board[y][x] !== null) return true;
    }
    return false;
  };

  Tetris.prototype.move = function (dx) {
    if (this.over || this._collides(this.piece, dx, 0, 0)) return false;
    this.piece.x += dx; return true;
  };

  Tetris.prototype.rotate = function (dir) {
    if (this.over || this.piece.type === "O") return false;
    var kicks = [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1]];
    for (var i = 0; i < kicks.length; i++) {
      if (!this._collides(this.piece, kicks[i][0], kicks[i][1], dir)) {
        this.piece.x += kicks[i][0]; this.piece.y += kicks[i][1]; this.piece.rot += dir; return true;
      }
    }
    return false;
  };

  /* One step of gravity. Returns true if the piece locked. */
  Tetris.prototype.step = function (soft) {
    if (this.over) return false;
    if (!this._collides(this.piece, 0, 1, 0)) {
      this.piece.y += 1; if (soft) this.score += 1; return false;
    }
    this._lock(); return true;
  };

  Tetris.prototype.hardDrop = function () {
    if (this.over) return 0;
    var n = 0;
    while (!this._collides(this.piece, 0, 1, 0)) { this.piece.y += 1; n++; }
    this.score += n * 2;
    this._lock();
    return n;
  };

  Tetris.prototype.ghostY = function () {
    var y = 0;
    while (!this._collides(this.piece, 0, y + 1, 0)) y++;
    return this.piece.y + y;
  };

  Tetris.prototype._lock = function () {
    var cs = this.cells(this.piece, 0, 0, 0), toppedOut = false;
    for (var i = 0; i < cs.length; i++) {
      if (cs[i][1] < 0) toppedOut = true; else this.board[cs[i][1]][cs[i][0]] = this.piece.type;
    }
    var cleared = [];
    for (var r = 0; r < ROWS; r++) if (this.board[r].every(function (c) { return c !== null; })) cleared.push(r);
    if (cleared.length) {
      for (var k = 0; k < cleared.length; k++) { this.board.splice(cleared[k], 1); this.board.unshift(new Array(COLS).fill(null)); }
      var pts = [0, 100, 300, 500, 800][cleared.length] * this.level;
      this.score += pts; this.lines += cleared.length;
      this.level = Math.floor(this.lines / 10) + 1;
      this.onClear(cleared, pts, this);
    }
    this.onLock(this);
    if (toppedOut) { this.over = true; this.onGameOver(this); return; }
    this._spawn();
  };

  /* Milliseconds per gravity step — gets faster each level (the game fills up quicker). */
  Tetris.prototype.dropInterval = function () { return Math.max(110, Math.round(820 * Math.pow(0.85, this.level - 1))); };

  window.MPM = window.MPM || {};
  MPM.Tetris = Tetris;
  MPM.TETRIS = { COLS: COLS, ROWS: ROWS, WOODS: WOODS, ORDER: ORDER, cellsFor: cellsFor };
})();
