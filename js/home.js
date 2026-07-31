// Hydrates the Home page from the static JSON files the CMS maintains.
// Everything here runs against files in the deployed tree — no backend.

// Name animation: "Karthik Prabhu" folds into "KP" shortly after load.
setTimeout(() => {
  document.getElementById("hero-name").classList.add("collapsed");
}, 1600);

// Inline icons for the socials row (stroke follows currentColor).
const SOCIAL_ICONS = {
  twitter:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125M7.119 20.452H3.554V9h3.565zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
};
const SOCIAL_LABELS = { twitter: "Twitter / X", linkedin: "LinkedIn", instagram: "Instagram" };

// About + socials + education + contact (data/home.json is written and
// sanitized by the CMS).
fetch("data/home.json")
  .then((r) => r.json())
  .then(({ avatar, aboutHtml, socials, education, contact }) => {
    const avatarEl = document.getElementById("avatar");
    if (avatar) {
      // Cache-bust so a newly uploaded photo shows after CMS save without a hard refresh.
      avatarEl.src = avatar + (avatar.endsWith(".svg") ? "" : "?v=" + Date.now());
    }

    document.getElementById("about").innerHTML = aboutHtml;

    const socialsBox = document.getElementById("socials");
    for (const key of ["twitter", "linkedin", "instagram"]) {
      if (!socials?.[key]) continue;
      const a = document.createElement("a");
      a.className = "social-btn";
      a.href = socials[key];
      a.setAttribute("aria-label", SOCIAL_LABELS[key]);
      a.title = SOCIAL_LABELS[key];
      a.innerHTML = SOCIAL_ICONS[key];
      socialsBox.appendChild(a);
    }

    const eduList = document.getElementById("education");
    const entries = education ?? [];
    document.getElementById("education-empty").hidden = entries.length > 0;
    for (const e of entries) {
      const li = document.createElement("li");
      li.className = "edu-item";

      const status = e.status === "ongoing" || String(e.completed ?? "").toLowerCase() === "ongoing"
        ? "ongoing"
        : "completed";

      const head = document.createElement("div");
      head.className = "edu-head";
      head.innerHTML = `
        <span class="edu-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
        </span>
        <span class="edu-body">
          <span class="edu-program-line">
            <span class="edu-program"></span>
            <span class="edu-cgpa" hidden></span>
          </span>
          <span class="edu-institute"></span>
        </span>
        <span class="edu-meta"></span>`;
      head.querySelector(".edu-program").textContent = e.program;
      head.querySelector(".edu-institute").textContent = e.institute;
      if (e.cgpa) {
        const cgpaEl = head.querySelector(".edu-cgpa");
        cgpaEl.hidden = false;
        cgpaEl.textContent = "CGPA " + e.cgpa;
      }

      const metaEl = head.querySelector(".edu-meta");
      if (e.completed && String(e.completed).toLowerCase() !== "ongoing") {
        const date = document.createElement("span");
        date.className = "edu-date";
        date.textContent = e.completed;
        metaEl.appendChild(date);
      }
      if (status === "ongoing") {
        const badge = document.createElement("span");
        badge.className = "edu-badge ongoing";
        badge.textContent = "Ongoing";
        metaEl.appendChild(badge);
      }

      li.appendChild(head);

      const semesters = e.semesters ?? [];
      if (semesters.length) {
        const wrap = document.createElement("div");
        wrap.className = "edu-semesters";
        for (const s of semesters) {
          const sec = document.createElement("section");
          sec.className = "edu-semester";
          const h = document.createElement("h3");
          h.className = "edu-semester-label";
          const title = document.createElement("span");
          title.textContent = s.label;
          h.appendChild(title);
          if (s.status === "completed") {
            const tag = document.createElement("span");
            tag.className = "edu-sem-tag";
            tag.textContent = "Completed";
            h.appendChild(tag);
          } else if (s.status === "in-progress") {
            const tag = document.createElement("span");
            tag.className = "edu-sem-tag in-progress";
            tag.textContent = "In progress";
            h.appendChild(tag);
          }
          const ul = document.createElement("ul");
          ul.className = "edu-courses";
          for (const c of s.courses ?? []) {
            const ci = document.createElement("li");
            ci.className = "edu-course";
            const code = document.createElement("span");
            code.className = "edu-course-code";
            code.textContent = c.code;
            const name = document.createElement("span");
            name.className = "edu-course-name";
            name.textContent = c.name;
            ci.append(code, name);
            if (s.status === "completed" && c.grade) {
              const grade = document.createElement("span");
              grade.className = "edu-course-grade";
              grade.textContent = c.grade;
              ci.appendChild(grade);
            }
            ul.appendChild(ci);
          }
          sec.append(h, ul);
          wrap.appendChild(sec);
        }
        li.appendChild(wrap);
      }

      eduList.appendChild(li);
    }

    const email = document.getElementById("contact-email");
    email.textContent = contact.email || "—";
    if (contact.email) email.href = "mailto:" + contact.email;
    document.getElementById("contact-phone").textContent = contact.phone || "—";
    document.getElementById("contact-address").textContent = contact.address || "—";
  })
  .catch(() => {});

// Highlights: latest 5 additions from the unified content index.
const TAGS = {
  startup: "Startup",
  research: "Research",
  oss: "OSS",
  publication: "Publication",
  blog: "Blog",
};

fetch("data/content-index.json")
  .then((r) => r.json())
  .then(({ entries }) => {
    const list = document.getElementById("highlights");
    const latest = entries.slice(0, 5);
    document.getElementById("highlights-empty").hidden = latest.length > 0;
    for (const e of latest) {
      const a = document.createElement("a");
      a.className = "highlight-card";
      a.href = e.path;
      const date = new Date(e.addedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      a.innerHTML =
        `<span class="tag">New &middot; ${TAGS[e.type] ?? e.type}</span>` +
        `<span class="title"></span><span class="date">${date}</span>`;
      a.querySelector(".title").textContent = e.title;
      const li = document.createElement("li");
      li.appendChild(a);
      list.appendChild(li);
    }
  })
  .catch(() => {
    document.getElementById("highlights-empty").hidden = false;
  });
