import { getCurrentHash } from "../core/router.ts";

const NAV_ITEMS = [
  { label: "Accueil", hash: "/" },
  { label: "Contributeurs", hash: "/contributors" },
  { label: "Timeline", hash: "/timeline" },
  { label: "Stats", hash: "/stats" },
  { label: "Tags", hash: "/tags" },
  { label: "Activité", hash: "/activity" },
];

export function renderHeader(): string {
  return `
    <header class="glass sticky top-0 z-40 border-b border-edge">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a href="#/" class="flex items-center gap-2 no-underline">
            <span class="text-xl font-bold gradient-text">Zatsit Tech Watch</span>
          </a>
          <nav id="main-nav" class="hidden md:flex items-center gap-6">
            ${NAV_ITEMS.map(
              (item) => `<a href="#${item.hash}" class="nav-link text-sm">${item.label}</a>`
            ).join("")}
          </nav>
          <div class="flex items-center gap-3">
            <button id="theme-toggle" class="p-2 rounded-lg hover:bg-bg-alt transition-colors" aria-label="Toggle theme">
              <svg id="icon-sun" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <svg id="icon-moon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            </button>
            <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg hover:bg-bg-alt transition-colors" aria-label="Menu">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
        <nav id="mobile-nav" class="md:hidden hidden pb-4 flex-col gap-2">
          ${NAV_ITEMS.map(
            (item) => `<a href="#${item.hash}" class="nav-link text-sm block py-2">${item.label}</a>`
          ).join("")}
        </nav>
      </div>
    </header>
  `;
}

export function initHeader(): void {
  initThemeToggle();
  initMobileMenu();
  updateActiveNav();
  window.addEventListener("hashchange", updateActiveNav);
}

function initThemeToggle(): void {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved ?? (prefersDark ? "dark" : "light");
  applyTheme(theme);

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });
}

function applyTheme(theme: string): void {
  document.documentElement.setAttribute("data-theme", theme);
  const sun = document.getElementById("icon-sun");
  const moon = document.getElementById("icon-moon");
  if (sun && moon) {
    sun.classList.toggle("hidden", theme === "light");
    moon.classList.toggle("hidden", theme === "dark");
  }
}

function initMobileMenu(): void {
  const btn = document.getElementById("mobile-menu-btn");
  const nav = document.getElementById("mobile-nav");
  btn?.addEventListener("click", () => {
    nav?.classList.toggle("hidden");
    nav?.classList.toggle("flex");
  });
  // Close on nav click
  nav?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).tagName === "A") {
      nav.classList.add("hidden");
      nav.classList.remove("flex");
    }
  });
}

function updateActiveNav(): void {
  const hash = getCurrentHash();
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => {
      const href = link.getAttribute("href")?.slice(1) ?? "";
      const isActive =
        href === hash || (href === "/" && hash === "/");
      link.classList.toggle("active", isActive);
    });
}
