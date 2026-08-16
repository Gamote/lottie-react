import { vi } from "vitest";

/*
 * happy-dom has no `ViewTimeline` at all, so the platform path of anything
 * scroll-linked is unreachable under test without this stand-in. It holds a
 * percentage a test sets by hand and answers `currentTime` the way the real
 * interface does: an object carrying `value`, or `null` while inactive.
 */

export class StubbedViewTimeline {
  readonly subject: Element;
  readonly axis: string;
  /**
   * The scroller the timeline reports as driving it. A real one derives it
   * from the subject's ancestors; the stub answers the document's own scroller
   * unless a test says otherwise, which is what a plain page produces.
   */
  source: Element | null;
  private percent: number | null = null;

  constructor(options?: ViewTimelineOptions) {
    const subject = options?.subject;
    if (subject === undefined) {
      throw new Error("the stub needs a subject, like the real one");
    }
    this.subject = subject;
    this.axis = options?.axis ?? "block";
    this.source = document.scrollingElement;
    installed?.instances.push(this);
  }

  private numeric = false;

  get currentTime(): number | { value: number } | null {
    if (this.percent === null) {
      return null;
    }
    return this.numeric ? this.percent : { value: this.percent };
  }

  /** Puts the timeline at a percentage of its range, or `null` for inactive. */
  set(percent: number | null): void {
    this.percent = percent;
    this.numeric = false;
  }

  /** The same position answered as a bare number, which the type also allows. */
  setNumeric(percent: number): void {
    this.percent = percent;
    this.numeric = true;
  }

  /** Makes the timeline report another element, or none, as its scroller. */
  setSource(element: Element | null): void {
    this.source = element;
  }
}

export interface ViewTimelineStub {
  /** Every timeline constructed while installed, oldest first. */
  instances: StubbedViewTimeline[];
  /** The most recent timeline, which is almost always the one under test. */
  last(): StubbedViewTimeline;
  /** Removes the global again, as if the browser never had it. */
  restore(): void;
}

let installed: ViewTimelineStub | null = null;

export function installViewTimelineStub(): ViewTimelineStub {
  const stub: ViewTimelineStub = {
    instances: [],
    last() {
      const latest = this.instances.at(-1);
      if (latest === undefined) {
        throw new Error("no ViewTimeline was constructed");
      }
      return latest;
    },
    restore() {
      installed = null;
      vi.unstubAllGlobals();
    },
  };
  installed = stub;
  vi.stubGlobal("ViewTimeline", StubbedViewTimeline);
  return stub;
}
