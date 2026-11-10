/* meditation.js — "Take a Moment": a self-contained, 2-minute guided breathing session.
   MPM.Meditation.open({ background, onClose }) → returns { close() }.
   Silent by default. Optional ambient waves only start when the visitor switches sound on. */
(function () {
  var CYCLE = { inhale: 4000, hold: 2000, exhale: 6000 };           // 12 s per breath
  var CYCLE_MS = CYCLE.inhale + CYCLE.hold + CYCLE.exhale;
  var TOTAL_MS = CYCLE_MS * 10;                                      // 10 breaths = 2 minutes
  var DONE_MSG = "Take this feeling of calm with you. There’s no rush to get where you’re going.";

  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function fmt(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }

  /* ---- optional ambient waves (Web Audio, generated — no file needed) ---- */
  function Waves() {
    var ctx = null, gain = null, src = null, lfo = null;
    return {
      start: function () {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        if (!ctx) {
          ctx = new AC();
          var len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0), last = 0;
          for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
          src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
          var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 650;
          gain = ctx.createGain(); gain.gain.value = 0;
          lfo = ctx.createOscillator(); lfo.frequency.value = 0.09;
          var lg = ctx.createGain(); lg.gain.value = 0.05;
          lfo.connect(lg); lg.connect(gain.gain);
          src.connect(lp); lp.connect(gain); gain.connect(ctx.destination);
          src.start(); lfo.start();
        }
        if (ctx.state === "suspended") ctx.resume();
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 1.5);
        return true;
      },
      stop: function () { if (ctx && gain) { gain.gain.cancelScheduledValues(ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6); } },
      destroy: function () { try { if (ctx) ctx.close(); } catch (e) {} ctx = null; }
    };
  }

  MPM.Meditation = {
    open: function (opts) {
      opts = opts || {};
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var previouslyFocused = document.activeElement;
      var waves = Waves();
      var state = "intro", elapsed = 0, last = 0, raf = 0, lastPhase = "";

      var ov = document.createElement("div");
      ov.className = "med";
      ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "med-title");
      if (opts.background) ov.style.backgroundImage = "linear-gradient(rgba(40,16,50,.62), rgba(30,12,30,.75)), url(" + opts.background + ")";
      ov.innerHTML =
        '<div class="med-card">' +
          '<h2 id="med-title" class="med-title">Take a Moment</h2>' +
          '<div class="med-stage" aria-hidden="true"><div class="med-ring"></div><div class="med-circle"></div></div>' +
          '<p class="med-phase" aria-live="polite">Find a comfortable position.</p>' +
          '<p class="med-sub">A gentle 2-minute breathing session. You can pause or end it at any time.</p>' +
          '<div class="med-meter" hidden><div class="med-bar" role="progressbar" aria-label="Session progress" aria-valuemin="0" aria-valuemax="120" aria-valuenow="0"><i></i></div><span class="med-time">2:00</span></div>' +
          '<div class="med-actions">' +
            '<button type="button" class="med-btn primary" data-act="start">Start</button>' +
            '<button type="button" class="med-btn" data-act="pause" hidden>Pause</button>' +
            '<button type="button" class="med-btn" data-act="again" hidden>Breathe again</button>' +
            '<button type="button" class="med-btn" data-act="end">End session</button>' +
          '</div>' +
          '<button type="button" class="med-sound" data-act="sound" aria-pressed="false">Ambient waves: off</button>' +
          '<p class="med-note" role="status"></p>' +
        '</div>';
      document.body.appendChild(ov);
      requestAnimationFrame(function () { ov.classList.add("open"); });

      var $ = function (s) { return ov.querySelector(s); };
      var phaseEl = $(".med-phase"), subEl = $(".med-sub"), circle = $(".med-circle"), ring = $(".med-ring");
      var meter = $(".med-meter"), bar = $(".med-bar"), barI = $(".med-bar i"), timeEl = $(".med-time");
      var bStart = $('[data-act="start"]'), bPause = $('[data-act="pause"]'), bAgain = $('[data-act="again"]'), bEnd = $('[data-act="end"]');
      var bSound = $('[data-act="sound"]'), note = $(".med-note");

      function setPhase(text) { if (text !== lastPhase) { lastPhase = text; phaseEl.textContent = text; phaseEl.classList.remove("swap"); void phaseEl.offsetWidth; phaseEl.classList.add("swap"); } }
      function draw(scale) {
        if (reduced) { circle.style.transform = "scale(.8)"; circle.style.opacity = String(0.45 + 0.55 * scale); }
        else { circle.style.transform = "scale(" + (0.5 + 0.5 * scale) + ")"; circle.style.opacity = ""; }
      }
      function frame(now) {
        if (state !== "running") return;
        elapsed += now - last; last = now;
        if (elapsed >= TOTAL_MS) return finish();
        var t = elapsed % CYCLE_MS, scale;
        if (t < CYCLE.inhale) { setPhase("Breathe in."); scale = ease(t / CYCLE.inhale); }
        else if (t < CYCLE.inhale + CYCLE.hold) { setPhase("Hold gently."); scale = 1; }
        else { setPhase("Breathe out."); scale = 1 - ease((t - CYCLE.inhale - CYCLE.hold) / CYCLE.exhale); }
        draw(scale);
        var left = TOTAL_MS - elapsed;
        timeEl.textContent = fmt(left);
        barI.style.width = (elapsed / TOTAL_MS * 100).toFixed(2) + "%";
        bar.setAttribute("aria-valuenow", String(Math.round(elapsed / 1000)));
        raf = requestAnimationFrame(frame);
      }
      function begin() {
        state = "running"; elapsed = 0; last = performance.now(); lastPhase = "";
        subEl.hidden = true; meter.hidden = false; bStart.hidden = true; bAgain.hidden = true; bPause.hidden = false; bPause.textContent = "Pause";
        bEnd.textContent = "End session"; ov.classList.remove("done"); ov.classList.add("running");
        bPause.focus();
        raf = requestAnimationFrame(frame);
      }
      function pause() {
        if (state === "running") { state = "paused"; cancelAnimationFrame(raf); bPause.textContent = "Resume"; setPhase("Paused. Whenever you’re ready."); ov.classList.add("paused"); }
        else if (state === "paused") { state = "running"; last = performance.now(); lastPhase = ""; bPause.textContent = "Pause"; ov.classList.remove("paused"); raf = requestAnimationFrame(frame); }
      }
      function finish() {
        state = "done"; cancelAnimationFrame(raf); waves.stop();
        ov.classList.remove("running", "paused"); ov.classList.add("done");
        draw(0.6); setPhase(DONE_MSG);
        timeEl.textContent = "0:00"; barI.style.width = "100%"; bar.setAttribute("aria-valuenow", "120");
        bPause.hidden = true; bAgain.hidden = false; bEnd.textContent = "Return to the lighthouse"; bAgain.focus();
      }
      function close() {
        cancelAnimationFrame(raf); waves.stop();
        ov.classList.remove("open");
        setTimeout(function () { waves.destroy(); if (ov.parentNode) ov.parentNode.removeChild(ov); }, reduced ? 0 : 400);
        document.removeEventListener("keydown", onKey, true);
        if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
        if (opts.onClose) opts.onClose();
      }
      function toggleSound() {
        var on = bSound.getAttribute("aria-pressed") === "true";
        if (on) { waves.stop(); bSound.setAttribute("aria-pressed", "false"); bSound.textContent = "Ambient waves: off"; note.textContent = ""; }
        else if (waves.start()) { bSound.setAttribute("aria-pressed", "true"); bSound.textContent = "Ambient waves: on"; note.textContent = ""; }
        else { note.textContent = "Sound isn’t available in this browser. The session works just as well in silence."; }
      }

      ov.addEventListener("click", function (e) {
        var b = e.target.closest("[data-act]"); if (!b) return;
        var a = b.getAttribute("data-act");
        if (a === "start" || a === "again") begin();
        else if (a === "pause") pause();
        else if (a === "end") close();
        else if (a === "sound") toggleSound();
      });

      function onKey(e) {
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; }
        if (e.key !== "Tab") return;
        var f = Array.prototype.filter.call(ov.querySelectorAll("button"), function (b) { return !b.hidden; });
        if (!f.length) return;
        var first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
      document.addEventListener("keydown", onKey, true);

      draw(0); bStart.focus();
      return { close: close };
    }
  };
})();
