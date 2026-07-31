import {
  loadBlogConfig,
  fetchMediumPosts,
  formatPubDate,
  sanitizeArticleHtml,
} from "./medium.js";

const statusEl = document.getElementById("article-status");
const articleEl = document.getElementById("article");

function showStatus(msg, isError = false) {
  statusEl.hidden = !msg;
  statusEl.textContent = msg;
  statusEl.classList.toggle("error", isError);
  articleEl.hidden = Boolean(msg);
}

async function main() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    showStatus("Missing article id. Open a post from the Blog page.", true);
    return;
  }

  showStatus("Loading article…");
  try {
    const { mediumUsername } = await loadBlogConfig();
    const { items } = await fetchMediumPosts(mediumUsername);
    const post = items.find((p) => p.id === id || decodeURIComponent(p.id) === id);
    if (!post) {
      showStatus("Article not found in the latest Medium feed (Medium only exposes recent posts).", true);
      return;
    }

    document.title = `${post.title} — Blog`;
    document.getElementById("article-title").textContent = post.title;
    document.getElementById("article-author").textContent = post.author || "—";
    document.getElementById("article-date").textContent = formatPubDate(post.pubDate);

    const cover = document.getElementById("article-cover");
    if (post.cover) {
      cover.hidden = false;
      cover.src = post.cover;
      cover.alt = post.title;
    } else {
      cover.hidden = true;
    }

    // Equivalent of React's dangerouslySetInnerHTML — Medium sends HTML in the feed.
    document.getElementById("article-body").innerHTML = sanitizeArticleHtml(post.description, {
      coverUrl: post.cover,
    });

    const mediumLink = document.getElementById("article-medium-link");
    mediumLink.href = post.link;
    mediumLink.hidden = !post.link;

    showStatus("");
  } catch (err) {
    showStatus(String(err.message || err), true);
  }
}

main();
