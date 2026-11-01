// Trendusty Orbit & Retrosmart Custom Cursors - Content Script
(function() {
  function applyCursor(cursorKey) {
    let el = document.getElementById("trendusty-orbit-custom-cursor-style");
    if (!cursorKey || cursorKey === "default") {
      if (el) el.remove();
      return;
    }
    const arrowUrl = chrome.runtime.getURL(`cursors/${cursorKey}_arrow.png`);
    const pointerUrl = chrome.runtime.getURL(`cursors/${cursorKey}_pointer.png`);

    if (!el) {
      el = document.createElement("style");
      el.id = "trendusty-orbit-custom-cursor-style";
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = `
      html, body, div, p, span, h1, h2, h3, h4, h5, h6, table, tr, td, th, section, article, nav, header, footer {
        cursor: url("${arrowUrl}") 0 0, default !important;
      }
      a, button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"], select, label, .clickable, svg, img {
        cursor: url("${pointerUrl}") 2 2, pointer !important;
      }
      input[type="text"], input[type="search"], input[type="password"], textarea {
        cursor: text !important;
      }
    `;
  }

  // Load active cursor from local extension storage
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["activeCursor"], function(res) {
      if (res && res.activeCursor) {
        applyCursor(res.activeCursor);
      }
    });

    chrome.storage.onChanged.addListener(function(changes, area) {
      if (area === "local" && changes.activeCursor) {
        applyCursor(changes.activeCursor.newValue);
      }
    });
  }
})();
