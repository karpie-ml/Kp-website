// Light/dark toggle. The initial theme is applied by an inline script in
// <head> (before paint); this file only wires up the toggle button.
document.getElementById("theme-toggle").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("kp-theme", next);
});
