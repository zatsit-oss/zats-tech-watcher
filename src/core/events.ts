type Handler = (...args: unknown[]) => void;

const bus = new Map<string, Set<Handler>>();

export function on(event: string, handler: Handler): () => void {
  if (!bus.has(event)) bus.set(event, new Set());
  bus.get(event)!.add(handler);
  return () => bus.get(event)?.delete(handler);
}

export function emit(event: string, ...args: unknown[]): void {
  bus.get(event)?.forEach((fn) => fn(...args));
}
