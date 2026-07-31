// Shared Medium RSS helpers (rss2json → JSON items).

export async function loadBlogConfig() {
  const res = await fetch(new URL("../data/blog.json", import.meta.url));
  if (!res.ok) throw new Error("Could not load blog config.");
  return res.json();
}

export async function fetchMediumPosts(username) {
  const handle = String(username || "").replace(/^@/, "").trim();
  if (!handle) throw new Error("Set your Medium username in the CMS Settings.");

  const rssUrl = `https://medium.com/feed/@${encodeURIComponent(handle)}`;
  const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
  const res = await fetch(api);
  if (!res.ok) throw new Error("Failed to reach Medium feed.");
  const data = await res.json();
  if (data.status !== "ok" || !Array.isArray(data.items)) {
    throw new Error(data.message || "Medium feed returned no posts.");
  }
  return {
    feed: data.feed,
    items: data.items.map(normalizeItem),
  };
}

function normalizeItem(item) {
  const id = articleIdFrom(item);
  const cover =
    item.thumbnail ||
    firstImgSrc(item.description || item.content || "") ||
    "";
  return {
    id,
    title: item.title || "Untitled",
    author: item.author || "",
    pubDate: item.pubDate || "",
    link: item.link || "",
    cover,
    // Full HTML body from Medium — rendered via innerHTML on the article page.
    description: item.content || item.description || "",
    categories: item.categories || [],
  };
}

export function articleIdFrom(item) {
  const raw = item.guid || item.link || item.title || "";
  try {
    const u = new URL(raw);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || encodeURIComponent(raw);
  } catch {
    return encodeURIComponent(String(raw));
  }
}

function firstImgSrc(html) {
  const m = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : "";
}

export function formatPubDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Strip executable bits before injecting Medium HTML into the page. */
export function sanitizeArticleHtml(html, { coverUrl = "" } = {}) {
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content
    .querySelectorAll("script, iframe, object, embed, form, link[rel=import]")
    .forEach((el) => el.remove());
  template.content.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (/^on/i.test(attr.name) || attr.value.trim().toLowerCase().startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    });
  });
  // Medium RSS repeats the hero as both thumbnail and first <img> in the body.
  if (coverUrl) stripLeadingCoverImage(template.content, coverUrl);
  return template.innerHTML;
}

function imageKey(url) {
  try {
    const path = new URL(url, location.href).pathname;
    const file = path.split("/").filter(Boolean).pop() || path;
    // Medium CDN: …/max/1400/1*hash.jpeg → compare on the asset id, ignore size.
    return decodeURIComponent(file).toLowerCase();
  } catch {
    return String(url || "").toLowerCase();
  }
}

function stripLeadingCoverImage(root, coverUrl) {
  const coverKey = imageKey(coverUrl);
  if (!coverKey) return;
  const firstImg = root.querySelector("img");
  if (!firstImg) return;
  if (imageKey(firstImg.getAttribute("src") || "") !== coverKey) return;

  let node = firstImg;
  const figure = firstImg.closest("figure");
  if (figure && figure.querySelectorAll("img").length === 1) node = figure;
  // Drop empty wrappers Medium often puts around the hero.
  while (
    node.parentElement &&
    node.parentElement !== root &&
    node.parentElement.children.length === 1 &&
    !(node.parentElement.textContent || "").trim()
  ) {
    node = node.parentElement;
  }
  node.remove();
}
