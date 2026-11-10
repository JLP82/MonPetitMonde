/* exp-poststop.js — The Post Stop (Contact).  #/place/post-stop   Reached from the candle on the bookshelf.
   The painting is the scene; the form is real, editable HTML laid over the painted fields. Delivery is configured in
   data.js (MPM.CONTACT: endpoint or email) — nothing is hardcoded here. */
(function () {
  var AW = 1606, AH = 979, ART = "assets/poststop/post.webp";
  var F = { name: [882, 387, 1358, 418], email: [882, 458, 1358, 489], subject: [882, 530, 1358, 562], message: [882, 606, 1358, 712], send: [992, 733, 1246, 797], head: [868, 205, 1336, 355], slot: [395, 515, 565, 548] };
  var COPY = { heading: "Leave a Letter", intro: "Have a question, want to get in touch, or simply have something to say? Leave me a little letter!" };
  function pos(r) { return "left:" + (r[0] / AW * 100).toFixed(3) + "%;top:" + (r[1] / AH * 100).toFixed(3) + "%;width:" + ((r[2] - r[0]) / AW * 100).toFixed(3) + "%;height:" + ((r[3] - r[1]) / AH * 100).toFixed(3) + "%"; }
  function patch(r) { var fw = (r[2] - r[0]) / AW, fh = (r[3] - r[1]) / AH;
    return "background-image:url(" + ART + ");background-size:" + (100 / fw).toFixed(3) + "% " + (100 / fh).toFixed(3) + "%;background-position:" + (r[0] / (AW - (r[2] - r[0])) * 100).toFixed(3) + "% " + (r[1] / (AH - (r[3] - r[1])) * 100).toFixed(3) + "%"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  MPM.registerExperience("post-stop", function (root) {
    var C = MPM.CONTACT || {}, busy = false;
    var opts = (C.subjects || []).map(function (s) { return "<option>" + esc(s) + "</option>"; }).join("");
    var wrap = document.createElement("section"); wrap.className = "scene ps";
    wrap.innerHTML =
      '<div class="stage ps-stage" style="background-image:url(' + ART + ')">' + MPM.scene.back("#/", "Back to the bookshelf") +
      '<div class="ps-hero" role="img" aria-label="The Post Stop: a stone post office with a burgundy letterbox, ivy, parcels and a glowing lantern." style="' + "background-image:url(" + ART + ")" + '"></div>' +
      '<div class="ps-lantern" aria-hidden="true"></div>' +
      '<form class="ps-form" novalidate autocomplete="on" aria-labelledby="ps-h">' +
        '<div class="ps-head" style="' + pos(F.head) + '"><h1 id="ps-h">' + COPY.heading + '</h1><p>' + COPY.intro + '</p></div>' +
        '<input class="ps-in" style="' + pos(F.name) + '" name="name" type="text" autocomplete="name" aria-label="Name" placeholder="Your name *" required>' +
        '<input class="ps-in" style="' + pos(F.email) + '" name="email" type="email" autocomplete="email" aria-label="Email address" placeholder="Your email *" required>' +
        '<select class="ps-in ps-sel" style="' + pos(F.subject) + '" name="subject" aria-label="Subject">' + opts + '</select>' +
        '<textarea class="ps-in ps-msg" style="' + pos(F.message) + '" name="message" aria-label="Message" placeholder="Write your letter here *" required></textarea>' +
        '<input class="ps-hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button type="submit" class="ps-send" style="' + pos(F.send) + ";" + patch(F.send) + '"><span class="sr">Send Letter</span></button>' +
        '<div class="ps-status" role="status" aria-live="polite" hidden></div>' +
      '</form>' +
      '<span class="ps-env" aria-hidden="true"><svg viewBox="0 0 24 16"><path d="M1 1h22v14H1z" fill="#f6e6bf" stroke="#7a2a22"/><path d="M1 1l11 8 11-8" fill="none" stroke="#7a2a22"/></svg></span>' +
      '</div>';
    root.appendChild(wrap);
    var $ = function (s) { return wrap.querySelector(s); };
    var form = $(".ps-form"), st = $(".ps-status"), env = $(".ps-env"), send = $(".ps-send");

    function say(msg, kind) { st.hidden = false; st.className = "ps-status " + kind; st.textContent = msg; }
    function validate() {
      var bad = [], v = function (n) { return form.elements[n].value.trim(); };
      [].forEach.call(form.querySelectorAll(".ps-in"), function (e) { e.removeAttribute("aria-invalid"); });
      if (!v("name")) bad.push(["name", "Please tell me your name."]);
      if (!v("email")) bad.push(["email", "Please add an email so I can reply."]);
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) bad.push(["email", "That email address doesn’t look quite right."]);
      if (!v("message")) bad.push(["message", "Your letter is empty — write a few words first."]);
      bad.forEach(function (b) { form.elements[b[0]].setAttribute("aria-invalid", "true"); });
      if (bad.length) { say(bad[0][1], "err"); form.elements[bad[0][0]].focus(); }
      return !bad.length;
    }
    function flyLetter() {
      if (!env.animate || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return Promise.resolve();
      var sr = stage().getBoundingClientRect(), b = send.getBoundingClientRect(), sx = b.left - sr.left + b.width / 2, sy = b.top - sr.top + b.height / 2;
      var tx = sr.width * (480 / AW), ty = sr.height * (530 / AH);
      env.style.cssText = "display:block;left:" + sx + "px;top:" + sy + "px";
      return env.animate([{ transform: "translate(-50%,-50%) scale(1) rotate(0)", opacity: 1 }, { transform: "translate(" + ((tx - sx) * .5 - 0) + "px," + ((ty - sy) * .5 - 90) + "px) scale(.9) rotate(-14deg)", opacity: 1, offset: .55 }, { transform: "translate(" + (tx - sx) + "px," + (ty - sy) + "px) scale(.4) rotate(-20deg)", opacity: 0 }], { duration: 900, easing: "ease-in-out" }).finished.then(function () { env.style.display = "none"; });
    }
    function stage() { return $(".ps-stage"); }
    function deliver(d) {
      if (C.endpoint) {
        return fetch(C.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) })
          .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return "sent"; });
      }
      if (C.email) { return Promise.resolve("choose"); }
      return Promise.reject(new Error("not-configured"));
    }
    /* No server: hand the finished letter to the visitor's own email, three ways. Nothing is lost if one doesn't suit. */
    function choose(d) {
      var to = C.email, sub = d.subject + " \u2014 from " + d.name, body = d.message + "\n\n\u2014 " + d.name + " (" + d.email + ")";
      var gmail = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(to) + "&su=" + encodeURIComponent(sub) + "&body=" + encodeURIComponent(body);
      var mail = "mailto:" + to + "?subject=" + encodeURIComponent(sub) + "&body=" + encodeURIComponent(body);
      st.hidden = false; st.className = "ps-status ok ps-choose";
      st.innerHTML = '<span>Your letter is sealed! Choose how to send it:</span><span class="ps-opts"><a class="ps-o" href="' + esc(gmail) + '" target="_blank" rel="noopener">Open in Gmail</a><a class="ps-o" href="' + esc(mail) + '">Open mail app</a><button type="button" class="ps-o ps-copy">Copy letter</button></span>';
      st.addEventListener("click", function h(e) {
        var t = e.target.closest(".ps-o"); if (!t) return;
        if (t.classList.contains("ps-copy")) {
          var txt = "To: " + to + "\nSubject: " + sub + "\n\n" + body, done = function () { t.textContent = "Copied \u2713"; };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { t.textContent = "Copy failed"; }); else t.textContent = "Copy failed";
        } else { setTimeout(function () { form.reset(); st.removeEventListener("click", h); say("Thank you! Your letter is ready to send from your email.", "ok"); }, 400); }
      });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault(); if (busy || form.elements.company.value) return;
      if (!validate()) return;
      var d = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), subject: form.elements.subject.value, message: form.elements.message.value.trim() };
      busy = true; send.disabled = true; say("Sealing your letter…", "info");
      deliver(d).then(function (how) {
        return flyLetter().then(function () {
          if (how !== "choose") { form.reset(); }
          if (how === "choose") choose(d); else say("Your letter is on its way. Thank you!", "ok");
        });
      }).catch(function (err) {
        say(err.message === "not-configured" ? "The letterbox isn’t connected to a delivery address yet, so this letter couldn’t be sent." : "Sorry — your letter couldn’t be delivered. Please try again in a moment.", "err");
      }).then(function () { busy = false; send.disabled = false; });
    });
    form.addEventListener("input", function (e) { if (e.target.getAttribute && e.target.getAttribute("aria-invalid")) e.target.removeAttribute("aria-invalid"); });
  });
})();
