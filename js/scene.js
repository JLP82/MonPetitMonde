/* scene.js — helpers shared by the illustrated "scene" pages (Design Studio, Lighthouse, Tidal Observatory…).
   Scenes are laid out on a 1100 x 733.33 grid (the 1536 x 1024 artwork scaled down), so every
   overlay is positioned in % of the artwork and stays glued to it at any size. */
(function () {
  var W = 1100, H = 733.3333;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* rect = [x0, y0, x1, y1] on the 1100-wide grid → CSS custom properties used by .abs */
  function vars(r) {
    return "--l:" + (r[0] / W * 100).toFixed(3) + "%;--t:" + (r[1] / H * 100).toFixed(3) + "%;--w:" +
           ((r[2] - r[0]) / W * 100).toFixed(3) + "%;--h:" + ((r[3] - r[1]) / H * 100).toFixed(3) + "%";
  }

  /* A cropped window onto the artwork, used as the hero image on phones and tablets. */
  function crop(r, url) {
    var fx0 = r[0] / W, fx1 = r[2] / W, fy0 = r[1] / H, fy1 = r[3] / H;
    var fw = fx1 - fx0, fh = fy1 - fy0;
    var aspect = (fw * 1536) / (fh * 1024);
    var px = fw >= 1 ? 0 : fx0 / (1 - fw) * 100, py = fh >= 1 ? 0 : fy0 / (1 - fh) * 100;
    return "aspect-ratio:" + aspect.toFixed(4) + ";background-image:url(" + url + ");background-size:" + (100 / fw).toFixed(2) +
           "% auto;background-position:" + px.toFixed(2) + "% " + py.toFixed(2) + "%";
  }

  /* Irregular "torn paper" edge for a panel hugging the right side of the stage. */
  function tornLeft(seed, amp) {
    var s = seed || 7, pts = ["0% 0%"];
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    var left = [];
    for (var y = 0; y <= 100; y += 3.5) left.push((rnd() * (amp || 1.6)).toFixed(2) + "% " + Math.min(y, 100) + "%");
    return "polygon(" + left.concat(["100% 100%", "100% 0%"]).join(",") + ")";
  }

  var toastEl = null, toastTimer = 0;
  function toast(html) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.innerHTML = html;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 9000);
  }
  function hideToast() { if (toastEl) toastEl.classList.remove("show"); }

  /* Round "back to the Atlas" button every scene page carries (Escape also works). */
  function back(href, label) { label = label || "Back to the Atlas"; return '<a class="scene-back" href="' + (href || "#/atlas") + '" aria-label="' + label + '" title="' + label + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></a>'; }

  MPM.scene = { back: back, W: W, H: H, esc: esc, vars: vars, crop: crop, tornLeft: tornLeft, toast: toast, hideToast: hideToast };
})();
