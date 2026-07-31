// Renders the Projects page from the static JSON files the CMS maintains.
// Paths are relative to /projects/ (this page), hence the "../" prefixes.

const VISIBLE = 5; // thumbnails shown per carousel view

Promise.all([
  fetch("../data/projects.json").then((r) => r.json()),
  fetch("../data/profiles.json").then((r) => r.json()).catch(() => ({ profiles: [] })),
]).then(([{ projects }, { profiles }]) => {
  for (const cat of ["startup", "research", "oss"]) {
    const items = projects
      .filter((p) => p.category === cat)
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    renderCarousel(document.getElementById("car-" + cat), items);
  }
  renderProfiles(profiles);
  renderPublications(
    projects
      .filter((p) => p.category === "publication")
      .sort((a, b) => (b.publication.year + b.addedAt).localeCompare(a.publication.year + a.addedAt))
  );
});

/* ---------------- carousels ---------------- */

function renderCarousel(container, items) {
  if (!items.length) {
    container.innerHTML = '<p class="empty-note">Nothing here yet.</p>';
    return;
  }

  const viewport = document.createElement("div");
  viewport.className = "car-viewport";
  const track = document.createElement("div");
  track.className = "car-track";
  viewport.appendChild(track);

  for (const p of items) {
    const card = document.createElement("a");
    card.className = "proj-card";
    if (p.hasPage) card.href = p.slug + "/";
    const img = document.createElement("img");
    img.src = "../" + p.thumbnail;
    img.alt = p.miniTitle;
    img.loading = "lazy";
    const overlay = document.createElement("span");
    overlay.className = "proj-overlay";
    overlay.textContent = p.miniTitle;
    card.append(img, overlay);
    track.appendChild(card);
  }

  container.appendChild(viewport);

  // Arrows only when there are older entries beyond the first five.
  if (items.length > VISIBLE) {
    const prev = arrow("‹", "Previous projects");
    const next = arrow("›", "Older projects");
    container.prepend(prev);
    container.append(next);

    let offset = 0; // index of first visible card
    const maxOffset = items.length - VISIBLE;
    const update = () => {
      const card = track.firstElementChild;
      const step = card.offsetWidth + parseFloat(getComputedStyle(track).gap);
      track.style.transform = `translateX(${-offset * step}px)`;
      prev.disabled = offset === 0;
      next.disabled = offset >= maxOffset;
    };
    prev.addEventListener("click", () => { offset = Math.max(0, offset - VISIBLE); update(); });
    next.addEventListener("click", () => { offset = Math.min(maxOffset, offset + VISIBLE); update(); });
    update();
  }
}

function arrow(glyph, label) {
  const b = document.createElement("button");
  b.className = "car-arrow";
  b.type = "button";
  b.textContent = glyph;
  b.setAttribute("aria-label", label);
  return b;
}

/* ---------------- publications ---------------- */

const STATUS_LABELS = {
  published: "Published",
  accepted: "Accepted",
  preprint: "Preprint",
  "under-review": "Under Review",
  "in-preparation": "In Preparation",
};

const LINK_BUTTONS = [
  ["pdf", "PDF"],
  ["arxiv", "arXiv"],
  ["poster", "Poster"],
  ["code", "Code"],
  ["doi", "DOI"],
];

function renderProfiles(profiles) {
  const box = document.getElementById("profile-buttons");
  for (const p of profiles.filter((p) => p.url)) {
    const a = document.createElement("a");
    a.className = "profile-btn";
    a.href = p.url;
    a.textContent = p.label;
    box.appendChild(a);
  }
}

function renderPublications(pubs) {
  const list = document.getElementById("pub-list");
  document.getElementById("pub-empty").hidden = pubs.length > 0;

  for (const p of pubs) {
    const m = p.publication;
    const block = document.createElement("article");
    block.className = "pub-block";
    block.id = "pub-" + p.slug;

    const thumbWrap = document.createElement(p.hasPage ? "a" : "span");
    thumbWrap.className = "pub-thumb";
    if (p.hasPage) thumbWrap.href = p.slug + "/";
    const img = document.createElement("img");
    img.src = "../" + p.thumbnail;
    img.alt = m.title;
    img.loading = "lazy";
    thumbWrap.appendChild(img);

    const body = document.createElement("div");
    body.className = "pub-body";

    const title = document.createElement("h3");
    title.className = "pub-title";
    if (p.hasPage) {
      const a = document.createElement("a");
      a.href = p.slug + "/";
      a.textContent = m.title;
      title.appendChild(a);
    } else {
      title.textContent = m.title;
    }

    const authors = document.createElement("p");
    authors.className = "pub-authors";
    authors.textContent = m.authors;

    const meta = document.createElement("p");
    meta.className = "pub-meta";
    meta.innerHTML =
      (m.venue ? `<em></em> &middot; ` : "") +
      `<span class="pub-year"></span> ` +
      `<span class="pub-status s-${m.status}">${STATUS_LABELS[m.status] ?? m.status}</span>`;
    if (m.venue) meta.querySelector("em").textContent = m.venue;
    meta.querySelector(".pub-year").textContent = m.year;

    const buttons = document.createElement("div");
    buttons.className = "pub-buttons";
    for (const [key, label] of LINK_BUTTONS) {
      if (!m.links[key]) continue;
      const a = document.createElement("a");
      a.className = "pub-btn";
      a.href = m.links[key];
      a.textContent = label;
      buttons.appendChild(a);
    }
    if (m.bibtex) {
      const btn = document.createElement("button");
      btn.className = "pub-btn";
      btn.type = "button";
      btn.textContent = "BibTeX";
      const pre = document.createElement("pre");
      pre.className = "pub-bibtex";
      pre.hidden = true;
      pre.textContent = m.bibtex;
      btn.addEventListener("click", () => { pre.hidden = !pre.hidden; });
      buttons.appendChild(btn);
      body.append(title, authors, meta, buttons, pre);
    } else {
      body.append(title, authors, meta, buttons);
    }

    block.append(thumbWrap, body);
    list.appendChild(block);
  }
}
