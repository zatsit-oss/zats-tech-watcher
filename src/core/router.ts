export interface Route {
  path: string;
  handler: (params: Record<string, string>) => void;
}

const routes: Route[] = [];
let currentCleanup: (() => void) | null = null;

export function registerRoute(
  path: string,
  handler: (params: Record<string, string>) => void
): void {
  routes.push({ path, handler });
}

export function navigate(hash: string): void {
  window.location.hash = hash;
}

export function getCurrentHash(): string {
  return window.location.hash.slice(1) || "/";
}

export function startRouter(): void {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}

function handleRoute(): void {
  const hash = getCurrentHash();

  for (const route of routes) {
    const params = matchRoute(route.path, hash);
    if (params !== null) {
      if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
      }
      route.handler(params);
      return;
    }
  }

  // Fallback to home
  if (hash !== "/") {
    navigate("/");
  }
}

function matchRoute(
  pattern: string,
  hash: string
): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const hashParts = hash.split("/").filter(Boolean);

  if (patternParts.length !== hashParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(hashParts[i]);
    } else if (patternParts[i] !== hashParts[i]) {
      return null;
    }
  }
  return params;
}

export function setCleanup(fn: () => void): void {
  currentCleanup = fn;
}
