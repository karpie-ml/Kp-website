import {
  loadBlogConfig,
  fetchMediumPosts,
  formatPubDate,
} from "./medium.js";

const listEl = document.getElementById("blog-list");
const statusEl = document.getElementById("blog-status");
const emptyEl = document.getElementById("blog-empty");

function showStatus(msg, isError = false) {
  statusEl.hidden = !msg;
  statusEl.textContent = msg;
  statusEl.classList.toggle("error", isError);
}

function cardHtml(post) {
  const a = document.createElement("a");
  a.className = "blog-card";
  a.href = `article/?id=${encodeURIComponent(post.id)}`;

  if (post.cover) {
    const img = document.createElement("img");
    img.className = "blog-card-cover";
    img.src = post.cover;
    img.alt = "";
    img.loading = "lazy";
    a.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "blog-card-body";

  const title = document.createElement("h2");
  title.className = "blog-card-title";
  title.textContent = post.title;

  const meta = document.createElement("p");
  meta.className = "blog-card-meta";
  meta.textContent = [post.author, formatPubDate(post.pubDate)].filter(Boolean).join(" · ");

  const excerpt = document.createElement("p");
  excerpt.className = "blog-card-excerpt";
  // Plain-text teaser from the HTML description.
  const tmp = document.createElement("div");
  tmp.innerHTML = post.description;
  excerpt.textContent = (tmp.textContent || "").replace(/\s+/g, " ").trim().slice(0, 180) +
    ((tmp.textContent || "").trim().length > 180 ? "…" : "");

  body.append(title, meta, excerpt);
  a.appendChild(body);
  return a;
}

async function main() {
  showStatus("Loading posts from Medium…");
  try {
    const { mediumUsername } = await loadBlogConfig();
    if (!mediumUsername) {
      showStatus("");
      emptyEl.hidden = false;
      emptyEl.textContent =
        "No Medium username configured. Set it under CMS → Settings → Medium username.";
      return;
    }
    const { items } = await fetchMediumPosts(mediumUsername);
    showStatus("");
    if (!items.length) {
      emptyEl.hidden = false;
      emptyEl.textContent = "No posts found on this Medium profile yet.";
      return;
    }
    emptyEl.hidden = true;
    for (const post of items) listEl.appendChild(cardHtml(post));
  } catch (err) {
    showStatus(String(err.message || err), true);
  }
}

main();
