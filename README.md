# Karthik Prabhu — personal site

Static personal academic website (Home, CV, Projects, Blog). Deploy this folder as-is to Vercel (or any static host).

## How the site works

Everything here is plain HTML, CSS, JS, JSON, and media. There is no server runtime in production.

| Path | Role |
|---|---|
| `index.html` | Home — hero, about, education, socials, highlights, contact |
| `cv/` | CV page (compiled document or embedded PDF) |
| `projects/` | Projects listing + per-project pages under `projects/<slug>/` |
| `blog/` | Blog placeholder (Medium integration later) |
| `data/` | Content the CMS writes: `home.json`, `projects.json`, `content-index.json` (highlights), `profiles.json` |
| `js/` | Client scripts that hydrate pages from those JSON files |
| `styles/` | Site chrome + compiled-document typography (light/dark theme) |
| `media/` | Avatar, project thumbnails |

**Content flow:** a local CMS (outside this folder) edits the JSON files and compiles uploaded `.md` / `.tex` / `.docx` / `.pdf` bundles into pages under `cv/` and `projects/`. You commit the resulting static files here and push; Vercel serves them.

**Highlights:** `data/content-index.json` lists recent additions (newest first). The home page shows the latest five.

**Theme:** light/dark toggle persists in `localStorage` (`kp-theme`).

## Deploy (Vercel)

1. Create a GitHub repo from **this folder only** (not the parent workspace with the CMS).
2. Import the repo in Vercel.
3. Framework preset: **Other**. Root directory: `.` (repo root). No build command needed.
4. Deploy. Updates = edit via CMS locally → commit `frontend/` → push.

## Local preview

Any static server works, for example:

```bash
npx serve .
```

Or use the CMS preview at `http://localhost:4400/preview/` when the local CMS is running.
