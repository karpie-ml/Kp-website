// External links open in a new tab; same-origin / relative / hash / mailto stay here.

function isExternalHref(href) {
  if (!href) return false;
  const h = href.trim();
  if (
    h.startsWith("#") ||
    h.startsWith("mailto:") ||
    h.startsWith("tel:") ||
    h.startsWith("javascript:")
  ) {
    return false;
  }
  // Protocol-relative or absolute http(s) → compare origins.
  if (/^https?:\/\//i.test(h) || h.startsWith("//")) {
    try {
      return new URL(h, location.href).origin !== location.origin;
    } catch {
      return true;
    }
  }
  // Other schemes (e.g. https already handled) — treat absolute with a scheme as external.
  if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return true;
  // Relative path → internal.
  return false;
}

function markExternalLinks(root = document) {
  root.querySelectorAll("a[href]").forEach((a) => {
    if (!isExternalHref(a.getAttribute("href"))) return;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
}

// Cover links already in the DOM and any added later by page scripts.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => markExternalLinks());
} else {
  markExternalLinks();
}

const mo = new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.matches?.("a[href]")) markExternalLinks(node.parentElement ?? document);
      else if (node.querySelectorAll) markExternalLinks(node);
    }
  }
});
mo.observe(document.documentElement, { childList: true, subtree: true });
