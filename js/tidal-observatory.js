/* tidal-observatory.js — Uncharted Coast › The Tidal Observatory: "A Little French Lesson".
   Pronunciation (speech synthesis, never autoplays), interactive conjugation and phrase breakdown.
   All copy lives in the DATA block so it can be edited without touching the logic. */
(function () {
  var v = MPM.scene.vars;
  var ART = "assets/scenes/tidal-observatory.webp";
  var esc = MPM.scene.esc;

  /* ---------------- DATA (editable) ---------------- */
  var DATA = {
    quoteLines: [
      { fr: "Je t’aimerai toujours,",   en: "I’ll love you forever,",    pron: "Zhuh tem-ray too-zhoor",    keys: ["je", "toujours"] },
      { fr: "la nuit comme le jour,",         en: "night and day,",                 pron: "Lah nwee kom luh zhoor",    keys: ["nuit"] },
      { fr: "et tant que je vivrai,",         en: "and as long as I live,",         pron: "Ay tahn kuh zhuh vee-vray", keys: ["tant"] },
      { fr: "tu seras mon bébé.",   en: "you’ll be my baby.",        pron: "Too suh-rah mohn bay-bay",  keys: ["seras", "bebe"] }
    ],
    english: "“I’ll love you forever, night and day, and as long as I live, you’ll be my baby.”",
    breakdown: [
      { k: "je",       fr: "Je t’aimerai",         en: "I will love you",       pron: "Zhuh tem-ray" },
      { k: "toujours", fr: "toujours",                  en: "Always / forever",      pron: "Too-zhoor" },
      { k: "nuit",     fr: "la nuit comme le jour",     en: "Night as well as day",  pron: "Lah nwee kom luh zhoor" },
      { k: "tant",     fr: "et tant que je vivrai",     en: "And as long as I live", pron: "Ay tahn kuh zhuh vee-vray" },
      { k: "seras",    fr: "tu seras",                  en: "You will be",           pron: "Too suh-rah" },
      { k: "bebe",     fr: "mon bébé",        en: "My baby",               pron: "Mohn bay-bay" }
    ],
    /* pron = simplified English-style guide, not formal phonetics. say = what the voice reads. */
    present: [
      { fr: "J’aime",           en: "I love",         pron: "zhem",                 say: "J’aime" },
      { fr: "Tu aimes",              en: "You love",       pron: "too em",               say: "Tu aimes" },
      { fr: "Il / Elle aime",        en: "He / She loves", pron: "eel / el em",          say: "Il aime" },
      { fr: "Nous aimons",           en: "We love",        pron: "noo-zeh-mohn",         say: "Nous aimons" },
      { fr: "Vous aimez",            en: "You love",       pron: "voo-zeh-may",          say: "Vous aimez" },
      { fr: "Ils / Elles aiment",    en: "They love",      pron: "eel / el-zem",         say: "Ils aiment" }
    ],
    future: [
      { fr: "J’aimerai",        en: "I will love",         pron: "zhem-ray",          say: "J’aimerai" },
      { fr: "Tu aimeras",            en: "You will love",       pron: "too em-rah",        say: "Tu aimeras" },
      { fr: "Il / Elle aimera",      en: "He / She will love",  pron: "eel / el em-rah",   say: "Il aimera" },
      { fr: "Nous aimerons",         en: "We will love",        pron: "noo-zem-rohn",      say: "Nous aimerons" },
      { fr: "Vous aimerez",          en: "You will love",       pron: "voo-zem-ray",       say: "Vous aimerez" },
      { fr: "Ils / Elles aimeront",  en: "They will love",      pron: "eel / el-zem-rohn", say: "Ils aimeront" }
    ],
    tenseNote: "In French, the future simple is used to describe something that will happen in the future. In this quote, it expresses a promise of lasting love.",
    why: "This quote has always held a special place in my heart. Growing up in a French-speaking home, stories, language, and family traditions have been a big part of my life. To me, it represents the kind of love that stays with us, the people who shape us, and the connections we carry throughout our lives."
  };

  /* ---------------- speech (French voice if the device has one; never autoplays) ---------------- */
  var Speech = (function () {
    var supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    var voice = null, token = 0;
    function pick() {
      if (!supported) return;
      var vs = window.speechSynthesis.getVoices() || [];
      voice = vs.filter(function (x) { return /^fr-CA/i.test(x.lang); })[0] ||
              vs.filter(function (x) { return /^fr/i.test(x.lang); })[0] || null;
    }
    if (supported) { pick(); window.speechSynthesis.addEventListener && window.speechSynthesis.addEventListener("voiceschanged", pick); }
    return {
      supported: supported,
      hasFrench: function () { pick(); return !!voice; },
      speak: function (text, cb) {
        if (!supported) return false;
        window.speechSynthesis.cancel();
        var my = ++token, u = new SpeechSynthesisUtterance(text);
        pick(); if (voice) u.voice = voice; u.lang = voice ? voice.lang : "fr-FR"; u.rate = 0.85;
        u.onstart = function () { if (cb && cb.start) cb.start(); };
        u.onend = u.onerror = function () { if (my === token && cb && cb.end) cb.end(); };
        window.speechSynthesis.speak(u);
        return true;
      },
      stop: function () { token++; if (supported) window.speechSynthesis.cancel(); }
    };
  })();

  var SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none"/></svg>';
  var WAVE_ORNAMENT = '<svg viewBox="0 0 120 22" aria-hidden="true"><path d="M2 12c8-10 14-10 22 0s14 10 22 0 14-10 22 0 14 10 22 0 14-10 22 0"/></svg>';

  function speakerBtn(label, attrs) {
    return '<button type="button" class="spk" aria-label="' + esc(label) + '" ' + (attrs || "") + '>' + SPEAKER + '</button>';
  }

  MPM.registerExperience("tidal-observatory", function (root) {
    var D = DATA;

    var quote = D.quoteLines.map(function (l) {
      var inner = l.fr;
      // wrap the expressions so they can be highlighted
      D.breakdown.forEach(function (b) {
        if (l.keys.indexOf(b.k) > -1) {
          var re = new RegExp("(^|\\b)(" + b.fr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "i");
          inner = inner.replace(re, function (m, a, t) { return a + '<span class="x" data-k="' + b.k + '">' + t + "</span>"; });
        }
      });
      return '<span class="ln">' + inner + "</span>";
    }).join("");

    var pronRows = D.quoteLines.map(function (l, i) {
      return '<li class="prow" data-line="' + i + '">' + speakerBtn("Play pronunciation: " + l.fr, 'data-line="' + i + '"') +
        '<div><button type="button" class="ptext" data-line="' + i + '" lang="fr">' + l.fr + '</button><span class="pguide">' + l.pron + '</span></div></li>';
    }).join("");

    var pills = D.breakdown.map(function (b) {
      return '<li><button type="button" class="pill" data-k="' + b.k + '" lang="fr">' + b.fr + '</button><span class="pdash" aria-hidden="true">&mdash;</span><span class="pmean">' + b.en + '</span></li>';
    }).join("");

    function table(kind, rows, head, sub, cls) {
      return '<table class="conj ' + cls + '"><caption><b>' + head + '</b><small>' + sub + '</small></caption>' +
        '<thead><tr><th scope="col">French</th><th scope="col">English</th></tr></thead><tbody>' +
        rows.map(function (r, i) {
          return '<tr><td><button type="button" class="cform" data-t="' + kind + '" data-i="' + i + '" lang="fr">' + r.fr + '</button></td><td>' + r.en + '</td></tr>';
        }).join("") + '</tbody></table>';
    }

    var wrap = document.createElement("section");
    wrap.className = "scene td";
    wrap.innerHTML =
      '<div class="stage" style="background-image:url(' + ART + ')">' + MPM.scene.back() +
        '<div class="mhero" role="img" aria-label="A brass telescope in a cozy observatory looking out over the sea at sunset, with a steaming mug and a glowing lantern." style="' + MPM.scene.crop([0, 185, 392, 660], ART) + '"></div>' +
        '<div class="fx td-lantern" style="' + v([8, 385, 92, 520]) + '" aria-hidden="true"></div>' +
        '<div class="fx td-lantern2" style="' + v([352, 235, 432, 335]) + '" aria-hidden="true"></div>' +
        '<div class="fx td-steam" style="' + v([312, 470, 366, 565]) + '" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="abs td-sign" style="' + v([112, 30, 372, 190]) + '">' +
          '<h1>The Tidal<br>Observatory</h1><span class="td-wave">' + WAVE_ORNAMENT + '</span>' +
          '<p>A quiet place to learn, explore, and see the world a little differently.</p></div>' +
        '<div class="abs td-panelwrap" style="' + v([376, 0, 1100, 733.33]) + '">' +
          '<article class="td-panel" id="td-panel" style="clip-path:' + MPM.scene.tornLeft(23, 1.8) + '">' +
            '<header class="td-top"><h2>A Little French Lesson</h2><p>A favourite quote from one of my favourite childhood books.</p></header>' +
            '<figure class="td-quote"><blockquote lang="fr"><span class="gm gl" aria-hidden="true">&laquo;</span>' +
              '<span class="sr-only">&laquo;&nbsp;</span>' + quote + '<span class="gm gr" aria-hidden="true">&raquo;</span><span class="sr-only">&nbsp;&raquo;</span></blockquote>' +
              '<p class="td-en">' + D.english + '</p>' +
              '<p class="td-src">Source: <em>Je t’aimerai toujours</em>, the French edition of <em>Love You Forever</em> by Robert Munsch.</p></figure>' +
            '<div class="td-meaning" id="td-meaning" aria-live="polite"><span class="hint">Select any phrase to see what it means.</span></div>' +
            '<div class="td-grid">' +
              '<section class="td-card" aria-labelledby="h-pron"><div class="td-cardhead"><h3 id="h-pron">Pronunciation</h3>' +
                '<button type="button" class="playall" id="td-playall" aria-label="Play the whole quote">' + SPEAKER + '<span>Play all</span></button></div>' +
                '<ul class="plist">' + pronRows + '</ul>' +
                '<p class="td-note">These are simplified English-style guides, not formal French phonetics.</p>' +
                '<p class="td-audio" id="td-audio" role="status" hidden></p></section>' +
              '<section class="td-card" aria-labelledby="h-break"><div class="td-cardhead"><h3 id="h-break">Breaking It Down</h3></div><ul class="blist">' + pills + '</ul></section>' +
            '</div>' +
            '<section class="td-card td-conj" aria-labelledby="h-conj"><div class="td-cardhead"><h3 id="h-conj">The Conjugation</h3></div>' +
              '<p class="td-verb"><b lang="fr">Aimer</b> &ndash; to love</p>' +
              '<p class="td-tense">This quote uses the French future simple tense (<i lang="fr">le futur simple</i>). The word <b lang="fr">aimerai</b> means &ldquo;I will love.&rdquo;</p>' +
              '<div class="tables">' + table("present", D.present, "Present Tense", "Présent", "pres") + table("future", D.future, "Future Tense", "Futur simple", "fut") + '</div>' +
              '<div class="conj-out" id="conj-out" aria-live="polite"><span class="hint">Select a form to see its meaning and how it sounds.</span></div>' +
              '<p class="td-tensenote">' + D.tenseNote + '</p></section>' +
            '<section class="td-why" aria-labelledby="h-why"><h3 id="h-why">Why It Matters to Me</h3><p>' + D.why + '</p>' +
              '<svg class="td-shore" viewBox="0 0 400 40" aria-hidden="true"><path d="M0 28c20-14 40-14 60 0s40 14 60 0 40-14 60 0 40 14 60 0 40-14 60 0 40 14 60 0"/><path d="M352 30v-16l4-4 4 4v16zM356 10V4" class="lhs"/></svg></section>' +
          '</article>' +
        '</div>' +
      '</div>';
    root.appendChild(wrap);

    /* ---------- behaviour ---------- */
    var panel = wrap.querySelector("#td-panel");
    var meaning = wrap.querySelector("#td-meaning"), conjOut = wrap.querySelector("#conj-out"), audioNote = wrap.querySelector("#td-audio");
    var playAll = wrap.querySelector("#td-playall");
    var playingBtns = [];

    function highlight(keys) {
      panel.querySelectorAll(".x, .pill").forEach(function (el) { el.classList.toggle("hl", keys.indexOf(el.getAttribute("data-k")) > -1); });
    }
    function showMeaning(fr, en, pron, keys, rowIdx) {
      meaning.innerHTML = '<span class="m-fr" lang="fr">' + fr + '</span><span class="m-arrow" aria-hidden="true">&rarr;</span><span class="m-en">' + en + '</span><span class="m-pron">(' + pron + ')</span>';
      highlight(keys || []);
      panel.querySelectorAll(".ptext").forEach(function (b) { b.classList.toggle("sel", String(rowIdx) === b.getAttribute("data-line")); });
    }
    function say(text, btn, onEnd) {
      if (!Speech.supported) { notify("Audio isn’t available in this browser. Use the pronunciation guides to sound it out."); return false; }
      if (!Speech.hasFrench()) notify("No French voice was found on this device, so it may sound English-accented. The pronunciation guides can help.");
      else audioNote.hidden = true;
      clearPlaying();
      return Speech.speak(text, {
        start: function () { if (btn) { btn.classList.add("playing"); playingBtns.push(btn); } },
        end: function () { clearPlaying(); if (onEnd) onEnd(); }
      });
    }
    function clearPlaying() { playingBtns.forEach(function (b) { b.classList.remove("playing"); }); playingBtns = []; panel.querySelectorAll(".prow.now").forEach(function (r) { r.classList.remove("now"); }); }
    function notify(msg) { audioNote.textContent = msg; audioNote.hidden = false; }

    function selectLine(i) { var l = D.quoteLines[i]; showMeaning(l.fr, l.en, l.pron, l.keys, i); }

    var allRunning = false;
    function stopAll() { allRunning = false; Speech.stop(); clearPlaying(); playAll.classList.remove("playing"); playAll.querySelector("span").textContent = "Play all"; }
    function runAll() {
      if (!Speech.supported) { notify("Audio isn’t available in this browser. Use the pronunciation guides to sound it out."); return; }
      if (allRunning) { stopAll(); return; }
      allRunning = true; playAll.classList.add("playing"); playAll.querySelector("span").textContent = "Stop";
      var i = 0;
      (function next() {
        if (!allRunning) return;
        if (i >= D.quoteLines.length) { stopAll(); return; }
        var row = panel.querySelector('.prow[data-line="' + i + '"]'); row.classList.add("now"); selectLine(i);
        var ok = Speech.speak(D.quoteLines[i].fr, { end: function () { row.classList.remove("now"); i++; next(); } });
        if (!ok) stopAll();
      })();
    }

    panel.addEventListener("click", function (e) {
      var t = e.target;
      var spk = t.closest(".spk"), pt = t.closest(".ptext"), pill = t.closest(".pill"), x = t.closest(".x"), cf = t.closest(".cform");
      if (t.closest("#td-playall")) { runAll(); return; }
      if (spk) { stopAll(); var i = +spk.getAttribute("data-line"); selectLine(i); say(D.quoteLines[i].fr, spk); }
      else if (pt) { stopAll(); selectLine(+pt.getAttribute("data-line")); }
      else if (pill || x) {
        stopAll();
        var k = (pill || x).getAttribute("data-k"), b = D.breakdown.filter(function (z) { return z.k === k; })[0];
        showMeaning(b.fr, b.en, b.pron, [k], -1);
        say(b.fr, null);
      }
      else if (cf) {
        stopAll();
        var set = cf.getAttribute("data-t") === "future" ? D.future : D.present, f = set[+cf.getAttribute("data-i")];
        panel.querySelectorAll(".cform").forEach(function (b) { b.classList.remove("sel"); b.closest("tr").classList.remove("sel"); });
        cf.classList.add("sel"); cf.closest("tr").classList.add("sel");
        panel.querySelectorAll(".conj tr").forEach(function () {});
        conjOut.innerHTML = '<span class="m-fr" lang="fr">' + f.fr + '</span><span class="m-arrow" aria-hidden="true">&rarr;</span><span class="m-en">' + f.en + '</span><span class="m-pron">(' + f.pron + ')</span>' +
          speakerBtn("Play " + f.fr, 'id="conj-spk"');
        var tr = cf.closest("tr"), idx = Array.prototype.indexOf.call(tr.parentNode.children, tr);
        panel.querySelectorAll(".conj").forEach(function (tb) { Array.prototype.forEach.call(tb.tBodies[0].rows, function (r, n) { r.classList.toggle("pair", n === idx && r !== tr); }); });
        conjOut.setAttribute("data-say", f.say);
      }
      var cs = t.closest("#conj-spk");
      if (cs) { stopAll(); say(conjOut.getAttribute("data-say"), cs); }
    });

    return function () { stopAll(); };
  });
})();
