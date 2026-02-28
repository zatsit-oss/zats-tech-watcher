/** Query selector shorthand */
export function qs<T extends HTMLElement>(
  selector: string,
  parent: ParentNode = document
): T | null {
  return parent.querySelector<T>(selector);
}

/** Query selector all shorthand */
export function qsa<T extends HTMLElement>(
  selector: string,
  parent: ParentNode = document
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

/** Mount component HTML into container */
export function mount(container: HTMLElement, html: string): void {
  container.innerHTML = html;
  container.classList.add("page-enter");
}

/** Clear container */
export function unmount(container: HTMLElement): void {
  container.classList.remove("page-enter");
  container.innerHTML = "";
}

/** Create element with attributes */
export function el(
  tag: string,
  attrs?: Record<string, string>,
  children?: string
): HTMLElement {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      element.setAttribute(k, v);
    }
  }
  if (children) element.innerHTML = children;
  return element;
}
