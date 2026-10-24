/*
 * hide-netlify-badge.js
 * Hides the "Powered by Netlify" badge and its "Build your own site" card.
 * Add it to your page:  <script src="hide-netlify-badge.js"></script>
 * (in <head> is best, so the badge is hidden before it can flash on screen)
 */
(function () {
  "use strict";

  var HIDE = "display:none!important;visibility:hidden!important;pointer-events:none!important;";

  // 1. CSS rules, in case the badge is inline or is added before any script can react.
  var css = document.createElement("style");
  css.textContent =
    '#nl-badge,#nl-card,.nl-wrap,' +
    'iframe[id*="nl-" i],iframe[name*="nl-" i],iframe[title*="netlify" i],' +
    'iframe[src*="netlify" i][src*="badge" i]{' + HIDE + "}";
  (document.head || document.documentElement).appendChild(css);

  function hide(el) {
    if (el && el.style) el.style.cssText += ";" + HIDE;
  }

  // 2. Find the badge if it was injected as an iframe (the markup you pasted is
  //    the inside of an iframe that talks to its parent with "nlHud" messages).
  function looksLikeBadge(frame) {
    var text = [frame.id, frame.name, frame.title, frame.getAttribute("src"), frame.getAttribute("srcdoc")].join(" ");
    return /netlify|nl-badge|nl-card|nlHud/i.test(text);
  }

  function sweep() {
    var found = document.querySelectorAll("iframe,#nl-badge,#nl-card,.nl-wrap");
    for (var i = 0; i < found.length; i++) {
      var n = found[i];
      if (n.tagName !== "IFRAME" || looksLikeBadge(n)) hide(n);
    }
  }

  // 3. The badge frame announces itself with {nlHud: ...} messages. Whichever
  //    iframe sends one is the badge, so hide that exact frame.
  window.addEventListener(
    "message",
    function (e) {
      if (!e.data || !e.data.nlHud) return;
      var frames = document.querySelectorAll("iframe");
      for (var i = 0; i < frames.length; i++) {
        if (frames[i].contentWindow === e.source) hide(frames[i]);
      }
    },
    true
  );

  // 4. Netlify adds the badge after the page loads, so watch for new elements.
  var queued = false;
  new MutationObserver(function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      sweep();
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  sweep();
  document.addEventListener("DOMContentLoaded", sweep);
  window.addEventListener("load", sweep);
})();
