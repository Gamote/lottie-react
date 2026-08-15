import type {
  AnimationItem,
  CanvasRendererConfig,
  HTMLRendererConfig,
  RendererType,
  SVGRendererConfig,
} from "lottie-web";
import type { ComponentPropsWithoutRef, JSX, RefCallback } from "react";
import type { SubscriptionManager } from "../utils/SubscriptionManager.js";

/**
 * The renderers lottie-web can draw an animation with.
 *
 * `svg` is the default and the only one the smaller builds contain. `canvas`
 * draws to a bitmap, and `html` builds real DOM nodes, which is the only
 * renderer that puts block content inside the display.
 */
export const LottieRenderer = {
  svg: "svg",
  canvas: "canvas",
  html: "html",
} as const;
export type LottieRenderer =
  (typeof LottieRenderer)[keyof typeof LottieRenderer];

/**
 * Instantiable only with `never`, so every assertion written as
 * `MustBeNever<Exclude<...>>` fails with a diagnostic naming the members that
 * broke it. A guard that cannot name what went wrong is barely a guard.
 */
export type MustBeNever<T extends never> = T;

/**
 * What the animation is doing.
 *
 * `paused` means a person asked it to stop; `frozen` means the library stopped
 * it on the animation's behalf and will start it again. Nothing sets `frozen`
 * yet, and it is declared because adding a member to a union later breaks an
 * exhaustive `switch` in a consumer's code.
 */
export const LottieState = {
  loading: "loading",
  playing: "playing",
  paused: "paused",
  stopped: "stopped",
  frozen: "frozen",
  error: "error",
} as const;
export type LottieState = (typeof LottieState)[keyof typeof LottieState];

/**
 * Which way the animation plays.
 *
 * lottie-web works in `1` and `-1`, which say nothing to a reader; the
 * translation happens once, where the engine is called.
 */
export const LottieDirection = {
  forward: "forward",
  reverse: "reverse",
} as const;
export type LottieDirection =
  (typeof LottieDirection)[keyof typeof LottieDirection];

/**
 * Everything a consumer can subscribe to.
 *
 * `frame` is the only one that fires per frame, and it is deliberately the only
 * route to the current frame, because a value that changes sixty times a second
 * cannot be a value without re-rendering at that rate.
 *
 * `marker` announces the playhead passing a marker the animation's designer
 * placed, while it is travelling: a seek or a scrub puts the playhead somewhere
 * without passing anything, so it announces nothing.
 *
 * `ready` carries no payload. Everything that can subscribe already holds the
 * instance, either as the hook's return value or through `useLottieInstance`,
 * so the values it announces are read from there.
 */
export const LottieSubscription = {
  ready: "ready",
  play: "play",
  pause: "pause",
  stop: "stop",
  complete: "complete",
  loopCompleted: "loopCompleted",
  frame: "frame",
  marker: "marker",
  newState: "newState",
  error: "error",
} as const;
export type LottieSubscription =
  (typeof LottieSubscription)[keyof typeof LottieSubscription];

/**
 * The handler each subscription takes.
 *
 * Declared as a `type` rather than an `interface` on purpose: an interface has
 * no implicit index signature, so it cannot satisfy the constraint
 * `SubscriptionManager` puts on the map it is given.
 */
export type LottieSubscriptions = {
  [LottieSubscription.ready]: () => void;
  [LottieSubscription.play]: () => void;
  [LottieSubscription.pause]: () => void;
  [LottieSubscription.stop]: () => void;
  [LottieSubscription.complete]: () => void;
  [LottieSubscription.loopCompleted]: () => void;
  [LottieSubscription.frame]: (event: { currentFrame: number }) => void;
  [LottieSubscription.marker]: (event: { marker: string }) => void;
  [LottieSubscription.newState]: (event: { state: LottieState }) => void;
  [LottieSubscription.error]: (event: { error: Error }) => void;
};

/*
 * The keys above are the vocabulary itself rather than strings that match it,
 * so a renamed member takes its handler with it and a handler for an event that
 * does not exist cannot be written. What that cannot catch is a member added to
 * the vocabulary and forgotten here, which is what this guard is for. There is
 * no guard in the other direction, because there is no longer a way to fail it.
 */
type _EverySubscriptionHasAHandler = MustBeNever<
  Exclude<LottieSubscription, keyof LottieSubscriptions>
>;

/**
 * Every fact about a renderer, one row each: what it puts inside the display,
 * which settings bag it accepts, and which of the smaller builds contain it.
 *
 * This is the only place any of those facts is recorded. A second table would
 * be a second place for them to disagree, and the disagreement would be silent.
 *
 * `puts`, `inSvg` and `inLight` are claims about lottie-web's runtime that no
 * type can check, so `types.test.ts` checks them against the real engine.
 */
export interface RendererRows {
  svg: {
    puts: "inline";
    settings: SVGRendererConfig;
    inSvg: true;
    inLight: true;
  };
  canvas: {
    puts: "inline";
    settings: CanvasRendererConfig;
    inSvg: false;
    inLight: false;
  };
  html: {
    puts: "block";
    settings: HTMLRendererConfig;
    inSvg: false;
    inLight: false;
  };
}

/** The shape every row of the table has to have. */
interface RendererRow {
  puts: "inline" | "block";
  settings: object;
  inSvg: boolean;
  inLight: boolean;
}

/*
 * Guards on the table. The first pair fails when the table and the public
 * vocabulary drift apart, the second when lottie-web gains or loses a renderer,
 * and the third when a row stops carrying what a row has to carry.
 */
type _EveryRendererHasARow = MustBeNever<
  Exclude<LottieRenderer, keyof RendererRows>
>;
type _NoRowWithoutARenderer = MustBeNever<
  Exclude<keyof RendererRows, LottieRenderer>
>;
type _EveryRendererStillExists = MustBeNever<
  Exclude<LottieRenderer, RendererType>
>;
type _NoRendererWentUnnoticed = MustBeNever<
  Exclude<RendererType, LottieRenderer>
>;
type _EveryRowIsWellFormed = MustBeNever<
  {
    [K in keyof RendererRows]: RendererRows[K] extends RendererRow ? never : K;
  }[keyof RendererRows]
>;

/**
 * The renderers the svg build of the engine contains.
 *
 * Read off the table rather than written out, so the svg component's surface
 * and the claim `types.test.ts` checks against the real engine can never be two
 * different answers.
 */
export type RendererInSvg = {
  [K in LottieRenderer]: RendererRows[K]["inSvg"] extends true ? K : never;
}[LottieRenderer];

/**
 * The renderers the light build of the engine contains, read off the table for
 * the same reason {@link RendererInSvg} is.
 */
export type RendererInLight = {
  [K in LottieRenderer]: RendererRows[K]["inLight"] extends true ? K : never;
}[LottieRenderer];

/**
 * Every HTML tag React will accept as an intrinsic element.
 *
 * The intersection is what drops the SVG tags, which cannot host an animation:
 * canvas and html read `wrapper.offsetWidth` and every renderer tears down with
 * `wrapper.innerText`, and `SVGSVGElement` has neither.
 */
export type AnyTag = Extract<
  keyof JSX.IntrinsicElements,
  keyof HTMLElementTagNameMap
>;

/*
 * The three lists below say why a tag is excluded, and they are data rather
 * than logic. They cannot be derived: React types a void element exactly as it
 * types a container, because `children` comes from `DOMAttributes` and applies
 * to every tag, so there is nothing to compute from.
 *
 * The direction of a mistake is not symmetric. Too permissive lets invalid
 * markup through, which is the failure this design removes; too restrictive
 * blocks a legitimate tag, which is a bug report and a one-line fix. So the
 * first two lists are held strict and the third is held permissive.
 */

/** Void elements. They cannot contain anything, so the animation would never appear. */
type TagWithoutChildren =
  | "area"
  | "base"
  | "br"
  | "col"
  | "embed"
  | "hr"
  | "img"
  | "input"
  | "link"
  | "meta"
  | "source"
  | "track"
  | "wbr";

/**
 * Elements whose children already mean something to the parser or to the user
 * agent, so an injected animation is ignored, invalid, or never rendered.
 */
type TagWithReservedChildren =
  | "audio"
  | "body"
  | "canvas"
  | "colgroup"
  | "datalist"
  | "dl"
  | "head"
  | "hgroup"
  | "html"
  | "iframe"
  | "map"
  | "menu"
  | "noscript"
  | "object"
  | "ol"
  | "optgroup"
  | "option"
  | "picture"
  | "script"
  | "select"
  | "slot"
  | "style"
  | "table"
  | "tbody"
  | "template"
  | "textarea"
  | "tfoot"
  | "thead"
  | "title"
  | "tr"
  | "ul"
  | "video";

/**
 * Elements whose content model is phrasing content only. They can hold the
 * `<svg>` or `<canvas>` a renderer appends, because both are embedded content,
 * but they cannot legally hold a `<div>`.
 *
 * `a`, `del` and `ins` are deliberately absent: their content model is
 * transparent, so they may hold whatever their parent may hold, which makes
 * `<a href="..."><div/></a>` valid and is the ordinary card-link pattern.
 */
type TagWithoutBlockChildren =
  | "abbr"
  | "b"
  | "bdi"
  | "bdo"
  | "button"
  | "cite"
  | "code"
  | "data"
  | "dfn"
  | "em"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "i"
  | "kbd"
  | "label"
  | "legend"
  | "mark"
  | "meter"
  | "output"
  | "p"
  | "pre"
  | "progress"
  | "q"
  | "rp"
  | "rt"
  | "ruby"
  | "s"
  | "samp"
  | "small"
  | "span"
  | "strong"
  | "sub"
  | "summary"
  | "sup"
  | "time"
  | "u"
  | "var";

/*
 * The three lists have to stay disjoint. Listing a tag twice still produces the
 * right answer, so the mistake is invisible, and the next reader cannot tell
 * which list was meant to be authoritative.
 */
type _VoidTagsAreNotReserved = MustBeNever<
  Extract<TagWithoutChildren, TagWithReservedChildren>
>;
type _VoidTagsAreNotInline = MustBeNever<
  Extract<TagWithoutChildren, TagWithoutBlockChildren>
>;
type _ReservedTagsAreNotInline = MustBeNever<
  Extract<TagWithReservedChildren, TagWithoutBlockChildren>
>;

/** A tag that may hold the `<svg>` or `<canvas>` a renderer appends. */
export type ContainerTag = Exclude<
  AnyTag,
  TagWithoutChildren | TagWithReservedChildren
>;

/** A tag that may additionally hold a `<div>`, which is what `html` appends. */
export type BlockContainerTag = Exclude<ContainerTag, TagWithoutBlockChildren>;

/**
 * Carries the reason a tag was refused into the diagnostic, so the compiler
 * reports what to use instead rather than only that something failed.
 */
type Reject<Why extends string> = { readonly __lottie: Why };

/**
 * The one rule that decides `as`: block content is required when the renderer
 * is `html` or when children are present, and inline content is enough
 * otherwise.
 *
 * Written as a single type with the other two values captured as parameters,
 * rather than as a union of prop objects discriminated by them. A union reports
 * the first mismatch it finds, which blames `renderer` when the tag is what is
 * wrong; this shape lands every message on `as`.
 */
export type AllowedAs<As extends AnyTag, Children, R extends LottieRenderer> = [
  Children,
] extends [undefined]
  ? RendererRows[R]["puts"] extends "block"
    ? As extends BlockContainerTag
      ? As
      : Reject<"this renderer puts a <div> inside: use a block container such as div or section">
    : As extends ContainerTag
      ? As
      : Reject<"this tag cannot hold an animation">
  : As extends BlockContainerTag
    ? As
    : Reject<"with children this tag must hold a <div>: use a block container such as div or section">;

/** Every attribute name any tag `as` permits declares. */
type AllowedTagAttribute = {
  [T in ContainerTag]: keyof ComponentPropsWithoutRef<T>;
}[ContainerTag];

/**
 * The element's own names a component takes over deliberately, and hands back
 * itself: `children` is rendered, `className` is joined with ours. Every other
 * name a component claims stops reaching the element, which is what
 * {@link ElementProps} refuses.
 */
type DeliberatelyTaken = "children" | "className";

/** The attribute names a component would swallow without meaning to. */
type Swallowed<Own> = Exclude<
  Extract<keyof Own, AllowedTagAttribute>,
  DeliberatelyTaken
>;

/**
 * Refuses a set of own props that would silently swallow an attribute.
 *
 * Naming a prop after an attribute costs the consumer that attribute: it lands
 * on our prop, we take it out of the spread, and it never reaches the element.
 * Nothing about that is visible, which is why it is checked here rather than
 * left to the rule in the documentation.
 *
 * The constraint refers to its own parameter so that the diagnostic lands on
 * the props declaration, naming the offending prop, rather than on every call
 * site in a consumer's application.
 */
type MustNotSwallow<Own> = [Swallowed<Own>] extends [never]
  ? unknown
  : Reject<`rename this prop, an element already uses the name: ${Swallowed<Own> & string}`>;

/**
 * What a component accepts: its own props, plus every attribute of the element
 * `as` names, with `as` itself validated against the tag rules.
 *
 * The element's version of a name the component owns is removed rather than
 * merged with it. Merging is an intersection rather than a choice, so a `src`
 * that accepts an object would narrow to the element's `string` and stop
 * accepting one. That is the fault v2 shipped, and it is why the removal is
 * derived from the own props rather than listed.
 */
export type ElementProps<
  Own extends MustNotSwallow<Own>,
  As extends AnyTag,
  Children,
  Renderer extends LottieRenderer,
> = Omit<Own, "as"> & {
  as?: AllowedAs<As, Children, Renderer>;
} & Omit<ComponentPropsWithoutRef<As>, keyof Own>;

/**
 * What a component accepts when the element it renders is fixed: its own props,
 * plus every attribute of that element, with the same refusal of a name that
 * would swallow one.
 *
 * The counterpart to {@link ElementProps}, for a component that presents itself
 * as an element without offering a choice of which. It takes no `as`, so it
 * needs none of the tag validation, and the reasons a tag can be refused are
 * written for the animation rather than for anything else.
 */
export type FixedElementProps<
  Own extends MustNotSwallow<Own>,
  Tag extends AnyTag,
> = Own & Omit<ComponentPropsWithoutRef<Tag>, keyof Own>;

/**
 * Makes one member of a union exclusive, by declaring every key it does not
 * carry as optional-`never`.
 *
 * A plain union of single-key objects does **not** refuse a literal combining
 * two of them: TypeScript's excess-property check against a union admits a
 * property that appears in any member, so `{ marker: "a", seconds: 1 }` passes
 * while `{ nonsense: true }` is still refused. Naming the other keys is what
 * closes that.
 */
type Only<T, Keys extends PropertyKey> = T & {
  [K in Exclude<Keys, keyof T>]?: never;
};

/** The units a {@link LottieSeekTarget} can be written in. */
type Units = "frame" | "marker" | "percent" | "seconds";

/**
 * Where to move the playhead.
 *
 * A plain number is a frame, which is the common case; every other unit names
 * itself, so nothing collides and a typo is a compile error rather than a
 * runtime guess. Exactly one unit may be given.
 *
 * `percent` and `seconds` are scoped to the currently playable range, like
 * `playableFrames` and `playableDuration`, so a segment moves all three
 * together. A marker
 * resolves to the frame the designer placed it on, which is deliberately not
 * what the engine's own marker seeking does.
 */
export type LottieSeekTarget =
  | number
  | Only<{ frame: number }, Units>
  | Only<{ marker: string }, Units>
  | Only<{ percent: number }, Units>
  | Only<{ seconds: number }, Units>;

/**
 * What may be played as a range: one range, several played in order, or the
 * name of a marker that labels a span.
 *
 * Frames here are absolute positions in the animation, unlike
 * {@link LottieSeekTarget}, whose units are relative to whatever is playable at
 * the time. That difference is why a seek target is not accepted in their
 * place: the same descriptor would mean two different frames.
 *
 * Ranges are only read, never kept or changed, which is why `readonly` tuples
 * are accepted: the natural home for named ranges is an `as const` map.
 */
export type LottieSegments =
  | readonly [number, number]
  | readonly (readonly [number, number])[]
  | { marker: string };

/** A setter that takes either the next value or a function of the current one. */
type Setter<Value> = (next: Value | ((previous: Value) => Value)) => void;

/**
 * The animation: what it is doing, and how to drive it.
 *
 * This is what the hook returns, what the context carries, and what the child
 * components take. Reading a value from it re-renders when it changes, which is
 * what separates it from the narrower {@link LottieHandle}.
 */
export interface LottieInstance {
  /** What the animation is doing. */
  state: LottieState;
  /**
   * Why the last load failed, or `null` if it did not.
   *
   * Readable whenever you like, unlike the `error` subscription, which is
   * announced once and is therefore missed by anything that starts listening
   * afterwards. Cleared when a load begins.
   */
  error: Error | null;
  /** The current playback rate, where `1` is the animation's own speed. */
  speed: number;
  /** Which way it is playing. */
  direction: LottieDirection;
  /** `false` for none, `true` for forever, or a number of repeats. */
  loop: boolean | number;
  /**
   * How many frames are playable right now.
   *
   * Scoped to the current range rather than to the file, so a segment changes
   * it, which is what a progress bar wants.
   *
   * It is a count and not a frame number, so **the last frame is one less than
   * this**: an animation reporting 32 has frames 0 to 31, and nothing is ever
   * drawn at 32, which the Lottie format requires so that a loop does not show
   * one frame twice. A progress control measured against this rather than
   * against one less stops a frame short of its own end and stays there.
   */
  playableFrames: number;
  /**
   * How long the playable range lasts, in seconds. Scoped like
   * `playableFrames`.
   */
  playableDuration: number;
  /**
   * Throws the animation away and builds it again from the source.
   *
   * Playback starts from the beginning, while the speed, direction and loop in
   * force at the time are kept, and the state returns to `loading` as it does
   * for any other load.
   *
   * A source whose content has not changed is otherwise never fetched twice,
   * which makes this the only way back from a load that failed, and the way to
   * pick up a URL whose contents have been replaced since.
   */
  reload: () => void;
  /** Plays from wherever it is. */
  play: () => void;
  /** Stops where it is. */
  pause: () => void;
  /** Stops and returns to the first frame of the playable range. */
  stop: () => void;
  /**
   * Moves the playhead, without starting or stopping anything.
   *
   * Whatever was true about playback stays true: a playing animation plays on
   * from the new position, and a paused one waits there. A target that cannot
   * be resolved warns while you are developing and does nothing; a position
   * outside the playable range is clamped to its nearest end.
   */
  seek: (target: LottieSeekTarget) => void;
  /**
   * Begins a drag, remembering whether it was playing, and pauses.
   *
   * Calling it again without an end begins a new gesture, so each drag
   * restores what was true when that drag started.
   */
  scrubStart: () => void;
  /** Moves the playhead during a drag. Frames only, clamped to the range. */
  scrubTo: (frame: number) => void;
  /**
   * Ends a drag, resuming playback if it was playing when the drag began.
   *
   * **The only thing that clears the remembered playback state.** A drag that
   * ends somewhere unexpected therefore leaves a call missing, which is visible,
   * rather than a remembered state that quietly changes what a later seek does.
   */
  scrubEnd: () => void;
  /**
   * Plays part of the animation, which becomes what is playable.
   *
   * `playableFrames` and `playableDuration` follow it, so a progress bar
   * measures the range
   * rather than the file. Several ranges play in the order given, and the last
   * one is what a loop repeats. Direction and speed follow the engine, which
   * plays a range whose end is before its start backwards.
   *
   * Pass `{ queue: true }` to wait for whatever is playing to finish first. If
   * nothing is playing there is nothing to wait for, so it starts at once.
   */
  playSegments: (
    segments: LottieSegments,
    options?: { queue?: boolean },
  ) => void;
  /**
   * Makes the whole animation playable again, and forgets anything queued.
   *
   * Restores the `segment` the animation was loaded with, or the entire file if
   * it was loaded without one. Playback is left as it was.
   */
  resetSegments: () => void;
  /** Changes the playback rate, taking effect immediately. */
  setSpeed: Setter<number>;
  /** Changes the direction, taking effect immediately. */
  setDirection: Setter<LottieDirection>;
  /** Changes the loop behaviour, taking effect on the next loop boundary. */
  setLoop: Setter<boolean | number>;
  /** Listens for one event. Returns the function that stops listening. */
  subscribe: SubscriptionManager<LottieSubscriptions>["subscribe"];
  /**
   * Give this to the element the animation should be drawn inside, which this
   * library calls the display. Nothing loads until an element carries it.
   *
   * `<LottieDisplay>` attaches it for you. Attach it yourself only when you are
   * placing the element, which is what the hook is for.
   */
  setDisplayRef: RefCallback<HTMLElement>;
  /**
   * Give this to the element that should fill the screen when someone asks for
   * fullscreen, which this library calls the root.
   *
   * `<Lottie>` attaches it to the element it renders, so the animation and the
   * controls go together. Attach it yourself only when you are placing that
   * element, which is what the hook is for: without it there is no fullscreen
   * button and no keyboard shortcuts, because nothing says which part of the
   * page belongs to this animation.
   */
  setRootRef: RefCallback<HTMLElement>;
  /**
   * The element carrying {@link LottieInstance.setRootRef}, or `null` until one
   * does.
   *
   * A value as well as a callback, because the controls have to read the
   * element back: fullscreen is asked of it, and a key press is ours only if it
   * happened inside it.
   */
  root: HTMLElement | null;
  /**
   * lottie-web's own animation object, or `null` before it loads.
   *
   * The escape hatch, and **outside the semver promise**: it is the shape of a
   * dependency we do not control, its declarations are wrong in both
   * directions, and anything reached through it can change in a patch release.
   */
  animationItem: AnimationItem | null;
}

/**
 * What an imperative ref hands back: {@link LottieInstance} without the parts a
 * ref cannot serve.
 *
 * Derived rather than written out, so the two can never disagree about what
 * they share. The values come off because a ref does not re-render, which would
 * make every one of them silently stale. `subscribe` comes off because from a
 * ref you would have to wait for it to fill, subscribe inside an effect and
 * clean up yourself, all of which the `subscriptions` prop already does.
 * `setDisplayRef` comes off because moving the animation out of the element the
 * component just rendered is not something a caller should be able to do, and
 * `setRootRef` for the same reason. `root` comes off as a value.
 *
 * A consumer writes `useRef<LottieHandle>(null)`; no ref type is exported.
 */
export type LottieHandle = Omit<
  LottieInstance,
  | "state"
  | "error"
  | "speed"
  | "direction"
  | "loop"
  | "playableFrames"
  | "playableDuration"
  | "root"
  | "subscribe"
  | "setDisplayRef"
  | "setRootRef"
>;
