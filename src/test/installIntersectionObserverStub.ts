import { vi } from "vitest";

/*
 * happy-dom declares `IntersectionObserver` and implements none of it: its
 * `observe()` is an empty body, so the callback can never fire. Tests that
 * need visibility install this controllable stand-in and drive it by hand.
 * The real API's one relevant sharp edge is kept: `rootMargin` accepts only
 * px and % lengths, and anything else throws at construction.
 */

export class StubbedIntersectionObserver implements IntersectionObserver {
  readonly callback: IntersectionObserverCallback;
  readonly options: IntersectionObserverInit;
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly scrollMargin = "0px 0px 0px 0px";
  readonly thresholds: readonly number[];
  readonly observed = new Set<Element>();
  observeCalls = 0;
  disconnected = false;

  constructor(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
  ) {
    const margin = options.rootMargin;
    if (
      margin !== undefined &&
      !/^(-?\d+(\.\d+)?(px|%)\s*)+$/.test(margin.trim())
    ) {
      throw new SyntaxError(
        `rootMargin must be specified in pixels or percent: ${margin}`,
      );
    }
    this.callback = callback;
    this.options = options;
    this.root = options.root ?? null;
    this.rootMargin = margin ?? "0px 0px 0px 0px";
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0];
    installed?.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.add(target);
    this.observeCalls += 1;
  }

  unobserve(target: Element): void {
    this.observed.delete(target);
  }

  disconnect(): void {
    this.observed.clear();
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Delivers one entry for the target, the way a real observer would. */
  trigger(target: Element, isIntersecting: boolean, ratio?: number): void {
    if (this.disconnected || !this.observed.has(target)) {
      return;
    }
    const rect = target.getBoundingClientRect();
    const entry: IntersectionObserverEntry = {
      target,
      isIntersecting,
      intersectionRatio: ratio ?? (isIntersecting ? 1 : 0),
      boundingClientRect: rect,
      intersectionRect: rect,
      rootBounds: null,
      time: 0,
    };
    this.callback([entry], this);
  }
}

export interface IntersectionObserverStub {
  /** Every observer constructed while the stub was installed, oldest first. */
  instances: StubbedIntersectionObserver[];
  /** The most recent observer, which is almost always the one under test. */
  last(): StubbedIntersectionObserver;
  /** Puts the environment's own inert implementation back. */
  restore(): void;
}

let installed: IntersectionObserverStub | null = null;

export function installIntersectionObserverStub(): IntersectionObserverStub {
  const stub: IntersectionObserverStub = {
    instances: [],
    last() {
      const latest = this.instances.at(-1);
      if (latest === undefined) {
        throw new Error("no IntersectionObserver was constructed");
      }
      return latest;
    },
    restore() {
      installed = null;
      vi.unstubAllGlobals();
    },
  };
  installed = stub;
  vi.stubGlobal("IntersectionObserver", StubbedIntersectionObserver);
  return stub;
}
