import type {
  AnimationEventName,
  AnimationItem,
  LottiePlayer,
} from "lottie-web";
import {
  type RefCallback,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createLogger } from "../utils/createLogger.js";
import { SubscriptionManager } from "../utils/SubscriptionManager.js";
import { useStableValue } from "../utils/useStableValue.js";
import { collectMarkerCrossings } from "./collectMarkerCrossings.js";
import { hasExpressions } from "./hasExpressions.js";
import {
  type LottieInstanceBox,
  LottieRegistryContext,
} from "./LottieRegistryContext.js";
import { normalizeAnimationSource } from "./normalizeAnimationSource.js";
import {
  type LottieMarker,
  readMarkers,
  resolveSeekTarget,
  resolveSegments,
} from "./resolveSeekTarget.js";
import {
  LottieDirection,
  type LottieInstance,
  LottieRenderer,
  type LottieSeekTarget,
  LottieState,
  LottieSubscription,
  type LottieSubscriptions,
  type RendererRows,
} from "./types.js";

/** The options both public hooks take. */
export interface UseLottieOptions<
  Renderer extends LottieRenderer = typeof LottieRenderer.svg,
> {
  /**
   * Where the animation comes from: a path or URL to fetch, or the parsed
   * animation itself.
   *
   * Changing it loads a new animation, which is compared by content, so an
   * object written inline at the call site is safe.
   */
  src: string | object;
  /** Which renderer draws it. Load-time; changing it reloads. */
  renderer?: Renderer;
  /** Settings for the chosen renderer. Load-time; changing it reloads. */
  rendererSettings?: RendererRows[Renderer]["settings"];
  /**
   * `false` for none, `true` for forever, or a number of repeats. Reactive,
   * and a change counts from itself: a new number means that many repeats
   * from now.
   */
  loop?: boolean | number;
  /** Playback rate, where `1` is the animation's own speed. Reactive. */
  speed?: number;
  /** Which way it plays. Reactive. */
  direction?: LottieDirection;
  /** Whether it starts on its own. Load-time. */
  autoplay?: boolean;
  /** The frame range to play, as `[first, last]`. Load-time. */
  segment?: readonly [number, number];
  /** Where the animation's images live, if they are not beside it. Load-time. */
  assetsPath?: string;
  /** Traces the load lifecycle to the console. Off by default. */
  debug?: boolean;
  /** Handlers called as the animation reports things. */
  subscriptions?: Partial<LottieSubscriptions>;
}

/**
 * Which of the two channels drove a reactive value.
 *
 * A union rather than an `as const` map on purpose: it is read only inside the
 * development-only warning, and a map is a runtime object, which would ship to
 * every production bundle in order to serve code that is not in one.
 */
type Driver = "prop" | "setter" | "both";

/** The values a prop and a setter can both reach. Development-only, as above. */
type ReactiveField = "speed" | "direction" | "loop";

/** Nothing guarantees a thrown value is an `Error`, and a reason has to be one. */
function toError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}

/**
 * Everything the animation does, with no opinion about how it is rendered.
 *
 * It takes the engine as an argument so the same logic serves every build.
 * Reach it through `useLottie`, `useLottieSvg` or `useLottieLight` rather than
 * directly.
 */
export function useLottieAnimation<
  Renderer extends LottieRenderer = typeof LottieRenderer.svg,
>(lottie: LottiePlayer, options: UseLottieOptions<Renderer>): LottieInstance {
  const {
    src,
    renderer,
    rendererSettings,
    loop,
    speed,
    direction,
    autoplay = false,
    segment,
    assetsPath,
    debug = false,
    subscriptions,
  } = options;

  // Created once and kept for the lifetime of the hook.
  const [manager] = useState(
    () => new SubscriptionManager<LottieSubscriptions>(),
  );

  /*
   * The element the animation is drawn inside, held as state rather than in a
   * ref so that attaching it is what starts the load.
   */
  const [display, setDisplay] = useState<HTMLElement | null>(null);
  const setDisplayRef = useCallback<RefCallback<HTMLElement>>((node) => {
    setDisplay(node);
  }, []);

  /*
   * The element fullscreen is asked of, and the one a key press has to have
   * happened inside to be ours. State rather than a ref because the controls
   * decide what to render from it, and a ref would leave them a render behind.
   */
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const setRootRef = useCallback<RefCallback<HTMLElement>>((node) => {
    setRoot(node);
  }, []);

  // What the animation reports about itself.
  const [animationItem, setAnimationItem] = useState<AnimationItem | null>(
    null,
  );
  const [state, setState] = useState<LottieState>(LottieState.loading);
  const [error, setError] = useState<Error | null>(null);

  /*
   * A counter rather than a flag, because what makes the load effect run again
   * for a source it has already seen is the value being different rather than
   * being anything in particular. It counts loads rather than reloads, and
   * starts at the first one, so the number reads the way a person counts both
   * here and in the debug log, where one climbing on its own is how a reload
   * loop would show itself.
   */
  const [loadAttempt, setLoadAttempt] = useState(1);
  const reload = useCallback(() => {
    setLoadAttempt((previous) => previous + 1);
  }, []);
  const [playableFrames, setPlayableFrames] = useState(0);
  const [playableDuration, setPlayableDuration] = useState(0);

  /*
   * The three values a prop and a setter can both reach, which is why they are
   * state seeded from a prop rather than the prop itself: `setLoop(3)` has to
   * change what the instance reports, and only state can do that. The load-time
   * options below take the opposite treatment, because only the caller can ever
   * change one of those, so there is nothing of ours to keep.
   */
  const [speedValue, setSpeedValue] = useState(speed ?? 1);
  const [directionValue, setDirectionValue] = useState(
    direction ?? LottieDirection.forward,
  );
  const [loopValue, setLoopValue] = useState<boolean | number>(loop ?? false);

  // What a reload depends on, stable until one of them really changes.
  const source = useStableValue(src);
  const loadConfig = useStableValue({
    renderer,
    rendererSettings,
    autoplay,
    segment,
    assetsPath,
  });

  /*
   * Read by effects and commands that must not restart, or be rebuilt, when
   * these change. `useRef` only ever uses its argument on the first render, so
   * the assignment beneath each one is what keeps it current.
   */
  const itemRef = useRef<AnimationItem | null>(null);
  const valuesRef = useRef({
    speed: speedValue,
    direction: directionValue,
    loop: loopValue,
  });
  valuesRef.current.speed = speedValue;
  valuesRef.current.direction = directionValue;
  valuesRef.current.loop = loopValue;

  const stateRef = useRef(state);
  stateRef.current = state;

  const debugRef = useRef(debug);
  debugRef.current = debug;

  const subscriptionsRef = useRef(subscriptions);
  subscriptionsRef.current = subscriptions;

  const driversRef = useRef<Partial<Record<ReactiveField, Driver>>>({});

  /*
   * What playback was doing when the current drag began, and `null` when no
   * drag is in progress. `scrubEnd` is the only thing that empties it, so a
   * drag that ends somewhere unexpected leaves a call missing rather than a
   * remembered state that silently changes what a later seek does.
   */
  const scrubbedFrom = useRef<LottieState | null>(null);

  /*
   * The frame the marker announcements measure from, and `null` whenever the
   * next frame must announce nothing: after a load, a jump, or a segment
   * change, the playhead has a new position without having travelled there, and
   * a marker is announced for being passed, not for being jumped across.
   */
  const markerMemory = useRef<number | null>(null);

  /**
   * Warns once per field when a value is driven from a prop and from a setter.
   *
   * Both keep working, per field and last writer wins, but they will disagree
   * the next time the prop changes, and that is worth saying out loud while
   * someone is building rather than leaving them to find it.
   */
  const noteDriver = useCallback((field: ReactiveField, driver: Driver) => {
    /*
     * Everything inside this branch is deleted from a consumer's production
     * build, because their bundler replaces `process.env.NODE_ENV` with
     * `"production"` and then drops the branch that can no longer be reached.
     *
     * Two things about the shape are load-bearing. The comparison has to be
     * written **here** rather than hoisted into a shared constant: hoisted, it
     * reads `typeof process !== "undefined" && false` after substitution, which
     * no bundler folds, so every message would ship. And the `typeof` guard has
     * to stay: without it this throws `ReferenceError` in a browser reached
     * through an import map rather than a bundler, which is a real and reported
     * failure for ESM libraries. Both forms strip to identical output, so the
     * guard is free.
     *
     * The message is built in here rather than passed in from the callers for
     * the same reason: an argument built at a call site survives as a discarded
     * expression even once the function body has been emptied.
     */
    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      const previous = driversRef.current[field];
      if (previous === undefined) {
        driversRef.current[field] = driver;
      } else if (previous !== driver && previous !== "both") {
        driversRef.current[field] = "both";
        console.warn(
          `[lottie-react] "${field}" is driven from both the ${field} prop and a setter. ` +
            "Both keep working and the last one to write wins, but they will disagree " +
            "the next time the prop changes. Drive it from one place.",
        );
      }
    }
  }, []);

  const applySpeed = useCallback(
    (next: number, driver: Driver) => {
      noteDriver("speed", driver);
      setSpeedValue(next);
      itemRef.current?.setSpeed(next);
    },
    [noteDriver],
  );

  const applyDirection = useCallback(
    (next: LottieDirection, driver: Driver) => {
      noteDriver("direction", driver);
      setDirectionValue(next);
      itemRef.current?.setDirection(next === LottieDirection.forward ? 1 : -1);
    },
    [noteDriver],
  );

  const applyLoop = useCallback(
    (next: boolean | number, driver: Driver) => {
      noteDriver("loop", driver);
      setLoopValue(next);
      const item = itemRef.current;
      if (item) {
        /*
         * The engine's pass counter survives everything except stop and a
         * segment change, counts up to `loop` going forward and down to zero
         * in reverse, and completion compares exactly. Assigned over an
         * accumulated count, a number would mean "whatever happens to
         * remain", or never complete once the count has passed it. Resetting
         * to the direction's fresh budget makes a change mean this many
         * repeats from now.
         */
        item.playCount =
          item.playDirection < 0 && typeof next === "number" ? next : 0;
        item.loop = next;
      }
    },
    [noteDriver],
  );

  const setSpeed = useCallback<LottieInstance["setSpeed"]>(
    (next) => {
      applySpeed(
        typeof next === "function" ? next(valuesRef.current.speed) : next,
        "setter",
      );
    },
    [applySpeed],
  );

  const setDirection = useCallback<LottieInstance["setDirection"]>(
    (next) => {
      applyDirection(
        typeof next === "function" ? next(valuesRef.current.direction) : next,
        "setter",
      );
    },
    [applyDirection],
  );

  const setLoop = useCallback<LottieInstance["setLoop"]>(
    (next) => {
      applyLoop(
        typeof next === "function" ? next(valuesRef.current.loop) : next,
        "setter",
      );
    },
    [applyLoop],
  );

  /**
   * Plays from wherever the animation is, or from the beginning if it is
   * sitting at the end it plays towards.
   *
   * The restart is not a convenience. Playing forwards from the final frame
   * does nothing, and playing in reverse from frame 0 does nothing either: the
   * engine decides it has already finished, pauses, and reports completion
   * without advancing. Both are the same fault seen from either end.
   */
  const play = useCallback(() => {
    const item = itemRef.current;
    if (item === null) {
      return;
    }

    /*
     * The direction comes off the engine, not the mirrored value: a direction
     * applied in the same React commit reaches the engine at once but the
     * mirror only on the next render, and a torn read here picks the wrong
     * end, playing reverse from frame 0 into an instant completion.
     */
    const reverse = item.playDirection < 0;
    const finished = reverse
      ? item.currentFrame <= 0
      : item.currentFrame >= item.totalFrames - 1;

    /*
     * A restart grants a fresh loop budget; a resume keeps its count. The
     * engine's pass counter survives every seek, counts up to `loop` going
     * forward and down to zero in reverse, so a fresh budget is zero one way
     * and the full count the other, and a replayed finite loop would
     * otherwise complete after a single pass. A restart is leaving from the
     * end the animation plays toward, or playing with the budget already
     * spent after being seeked elsewhere.
     */
    const numericLoop = typeof item.loop === "number" ? item.loop : null;
    const exhausted =
      numericLoop !== null &&
      (reverse ? item.playCount < 0 : item.playCount >= numericLoop);
    if (finished || exhausted) {
      item.playCount = reverse && numericLoop !== null ? numericLoop : 0;
    }

    if (finished) {
      markerMemory.current = null;
      item.goToAndPlay(reverse ? item.totalFrames : 0, true);
    } else {
      item.play();
    }

    setState(LottieState.playing);
  }, []);

  const pause = useCallback(() => {
    const item = itemRef.current;
    if (item === null) {
      return;
    }
    item.pause();
    setState(LottieState.paused);
  }, []);

  const stop = useCallback(() => {
    const item = itemRef.current;
    if (item === null) {
      return;
    }
    markerMemory.current = null;
    /*
     * The engine's own stop resets its pass counter; a rewind through
     * goToAndStop must not keep the spent loop budget.
     */
    item.playCount = 0;
    item.goToAndStop(0, true);
    setState(LottieState.stopped);
  }, []);

  /**
   * Reads the playable range, and how it is being played, back off the engine.
   *
   * A segment rewrites `firstFrame` and `totalFrames`, so the two values we
   * report about length have to follow it or a progress bar keeps measuring
   * whatever was playable before. It settles direction and speed as well: a
   * range whose end precedes its start plays backwards, a forward range played
   * while reversed turns the animation around, and a forward range at a
   * negative speed flips the speed instead. Reporting what was asked for rather
   * than what happened would make each of those a quiet lie.
   */
  const refreshRange = useCallback((item: AnimationItem) => {
    setPlayableFrames(item.totalFrames);
    setPlayableDuration(item.getDuration(false));
    setDirectionValue(
      item.playDirection < 0
        ? LottieDirection.reverse
        : LottieDirection.forward,
    );
    setSpeedValue(item.playSpeed);
  }, []);

  /**
   * Resolves a seek target, and says so in development when it cannot.
   *
   * Shared by `seek` and `scrubTo` so both report the same way. The message is
   * built inside the guard rather than passed in, because an argument built at
   * a call site survives as a discarded expression even once the branch that
   * used it has gone.
   */
  const resolveOrWarn = useCallback(
    (item: AnimationItem, target: LottieSeekTarget): number | null => {
      const resolved = resolveSeekTarget(item, target);

      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        if (resolved === null) {
          console.warn(
            `[lottie-react] the seek target ${JSON.stringify(target)} could not be resolved, so nothing moved. ` +
              "A marker name has to match one the animation carries, and every other unit has to be a finite number.",
          );
        } else if (
          resolved.frame !== resolved.requested &&
          typeof target === "object" &&
          target.marker !== undefined
        ) {
          console.warn(
            `[lottie-react] the marker "${target.marker}" lies outside the playable range, so the seek was held ` +
              `at frame ${resolved.frame}. Markers are placed against the whole animation, while seeking is ` +
              "relative to whatever a segment has left playable.",
          );
        }
      }

      return resolved === null ? null : resolved.frame;
    },
    [],
  );

  const seek = useCallback<LottieInstance["seek"]>(
    (target) => {
      const item = itemRef.current;
      if (item === null) {
        return;
      }
      const frame = resolveOrWarn(item, target);
      if (frame === null) {
        return;
      }
      markerMemory.current = null;
      /*
       * Seeking moves the playhead and settles nothing else, so a playing
       * animation has to be sent through the other door to carry on playing:
       * the engine's own jump pauses whatever it lands on.
       */
      if (item.isPaused) {
        item.goToAndStop(frame, true);
      } else {
        item.goToAndPlay(frame, true);
      }
    },
    [resolveOrWarn],
  );

  const scrubStart = useCallback(() => {
    const item = itemRef.current;
    if (item === null) {
      return;
    }
    // Overwritten rather than kept, so each drag restores what was true when
    // that drag began rather than what an earlier unfinished one saw.
    scrubbedFrom.current = stateRef.current;
    item.pause();
    setState(LottieState.paused);
  }, []);

  const scrubTo = useCallback<LottieInstance["scrubTo"]>(
    (frame) => {
      const item = itemRef.current;
      if (item === null) {
        return;
      }
      const resolved = resolveOrWarn(item, frame);
      if (resolved === null) {
        return;
      }
      markerMemory.current = null;
      item.goToAndStop(resolved, true);
      setState(LottieState.paused);
    },
    [resolveOrWarn],
  );

  const scrubEnd = useCallback(() => {
    const item = itemRef.current;
    if (item === null) {
      return;
    }
    const before = scrubbedFrom.current;
    scrubbedFrom.current = null;
    if (before === LottieState.playing) {
      play();
    }
  }, [play]);

  const playSegments = useCallback<LottieInstance["playSegments"]>(
    (segments, options) => {
      const item = itemRef.current;
      if (item === null) {
        return;
      }

      const ranges = resolveSegments(item, segments);
      if (ranges === null) {
        if (
          typeof process !== "undefined" &&
          process.env.NODE_ENV !== "production"
        ) {
          console.warn(
            `[lottie-react] playSegments could not use ${JSON.stringify(segments)}, so nothing changed. ` +
              "A range is two different finite frame numbers, and a marker has to carry a duration. A marker " +
              "without one labels a position rather than a span: seek to it and play instead.",
          );
        }
        return;
      }

      /*
       * Queueing means waiting for what is playing to finish. With nothing
       * playing there is nothing to wait for, and the engine answers that by
       * playing the whole current range first, which is the behaviour people
       * report as a bug. Applying it at once is what that case means.
       */
      item.playSegments(ranges, options?.queue !== true || item.isPaused);
      setState(LottieState.playing);
    },
    [],
  );

  const resetSegments = useCallback(() => {
    const item = itemRef.current;
    if (item === null) {
      return;
    }
    const wasPlaying = !item.isPaused;
    const { segment } = loadConfig;

    /*
     * Both routes empty the engine's queue and both go through the same
     * internal adjustment, so `segmentStart` fires either way and the reported
     * range follows. The engine's own reset always returns to the whole file,
     * which would forget a segment the animation was loaded with.
     */
    if (segment === undefined) {
      item.resetSegments(true);
    } else {
      item.playSegments([[segment[0], segment[1]]], true);
    }

    if (!wasPlaying) {
      item.pause();
    }
  }, [loadConfig]);

  /*
   * Consumer handlers are forwarded through one permanent registration each,
   * reading the latest handler from a ref. Written out per event rather than
   * looped, because a loop cannot give a handler its event's payload type
   * without a cast, and the nine lines are the price of not having one.
   */
  useEffect(() => {
    const unsubscribers = [
      manager.subscribe(LottieSubscription.ready, () =>
        subscriptionsRef.current?.ready?.(),
      ),
      manager.subscribe(LottieSubscription.play, () =>
        subscriptionsRef.current?.play?.(),
      ),
      manager.subscribe(LottieSubscription.pause, () =>
        subscriptionsRef.current?.pause?.(),
      ),
      manager.subscribe(LottieSubscription.stop, () =>
        subscriptionsRef.current?.stop?.(),
      ),
      manager.subscribe(LottieSubscription.complete, () =>
        subscriptionsRef.current?.complete?.(),
      ),
      manager.subscribe(LottieSubscription.loopCompleted, () =>
        subscriptionsRef.current?.loopCompleted?.(),
      ),
      manager.subscribe(LottieSubscription.frame, (event) =>
        subscriptionsRef.current?.frame?.(event),
      ),
      manager.subscribe(LottieSubscription.marker, (event) =>
        subscriptionsRef.current?.marker?.(event),
      ),
      manager.subscribe(LottieSubscription.newState, (event) =>
        subscriptionsRef.current?.newState?.(event),
      ),
      manager.subscribe(LottieSubscription.error, (event) =>
        subscriptionsRef.current?.error?.(event),
      ),
    ];

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, [manager]);

  /*
   * One place decides that playback changed, so `newState` and the three
   * playback events can never disagree. Notifying from the commands instead is
   * what made autoplay, completion and every segment end invisible.
   */
  const notifiedState = useRef(state);
  useEffect(() => {
    const previous = notifiedState.current;
    if (previous === state) {
      return;
    }
    notifiedState.current = state;

    manager.notify(LottieSubscription.newState, { state });

    if (state === LottieState.playing) {
      manager.notify(LottieSubscription.play);
    } else if (state === LottieState.paused) {
      manager.notify(LottieSubscription.pause);
    } else if (
      state === LottieState.stopped &&
      previous !== LottieState.loading
    ) {
      /*
       * Finishing a load is not stopping. An animation that arrives without
       * autoplay never started, so saying it stopped would be a lie a consumer
       * would have to filter out; `newState` above already reported the load.
       * An animation that arrives playing does genuinely start, which is why
       * `play` above is not guarded the same way.
       */
      manager.notify(LottieSubscription.stop);
    }
  }, [state, manager]);

  useEffect(() => {
    if (display === null) {
      return;
    }

    const logger = createLogger(debugRef.current);
    setState(LottieState.loading);
    setError(null);
    markerMemory.current = null;

    /*
     * The reason is both announced and kept. The announcement is what a
     * subscriber wants; the value is what anything rendering later needs, since
     * an event that fired before it mounted is an event it never sees.
     */
    const fail = (cause: Error) => {
      manager.notify(LottieSubscription.error, { error: cause });
      setError(cause);
      setState(LottieState.error);
    };

    const normalized = normalizeAnimationSource(source);
    if (normalized === null) {
      fail(
        new Error(
          "lottie-react: `src` must be a non-empty path or a parsed animation object.",
        ),
      );
      return;
    }

    const chosenRenderer = loadConfig.renderer ?? LottieRenderer.svg;

    /*
     * A device asking for reduced motion does not get an animation that starts
     * by itself. Deferred rather than blocked: the animation still loads,
     * `play()` still works, and a control can offer it. The preference is read
     * per load rather than watched, so a mid-session change never stops a
     * playing animation out from under its page.
     */
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const autoplayed = loadConfig.autoplay && !reducedMotion;
    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      if (loadConfig.autoplay && reducedMotion) {
        console.warn(
          "[lottie-react] autoplay was not started because this device asks for reduced motion. " +
            "The animation is loaded and play() works; offer a control rather than starting it for them.",
        );
      }
    }

    logger.log("loading the animation", {
      loadAttempt,
      renderer: chosenRenderer,
      autoplay: autoplayed,
      loop: valuesRef.current.loop,
      segment: loadConfig.segment,
    });

    let item: AnimationItem;
    try {
      item = lottie.loadAnimation({
        ...normalized,
        /* `container` is lottie-web's name for the element we call the display. */
        container: display,
        renderer: chosenRenderer,
        rendererSettings: loadConfig.rendererSettings,
        loop: valuesRef.current.loop,
        autoplay: autoplayed,
        initialSegment:
          loadConfig.segment === undefined
            ? undefined
            : [loadConfig.segment[0], loadConfig.segment[1]],
        assetsPath: loadConfig.assetsPath,
      });
    } catch (cause) {
      fail(toError(cause));
      return;
    }

    itemRef.current = item;
    setAnimationItem(item);
    item.setSpeed(valuesRef.current.speed);
    item.setDirection(
      valuesRef.current.direction === LottieDirection.forward ? 1 : -1,
    );

    /*
     * Sorted once, because the per-frame scan below stops at the first marker
     * past the movement, which only means something on an ordered list. Read at
     * load completion, which is the first moment the parsed data is there on
     * both the object path and the fetched one.
     */
    let sortedMarkers: readonly LottieMarker[] = [];

    const onDomLoaded = () => {
      sortedMarkers = readMarkers(item).sort((a, b) => a.time - b.time);
      setPlayableFrames(item.totalFrames);
      setPlayableDuration(item.getDuration(false));

      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        if (autoplayed) {
          const repeats = valuesRef.current.loop;
          const playsFor =
            repeats === true
              ? Number.POSITIVE_INFINITY
              : item.getDuration(false) *
                (typeof repeats === "number" ? repeats + 1 : 1);
          if (playsFor > 5) {
            console.warn(
              "[lottie-react] this animation starts by itself and moves for more than five seconds, " +
                "which needs a way to pause it whenever anything else shares the page (WCAG 2.2.2, level A). " +
                "<LottieControls> is one; any pause affordance satisfies it.",
            );
          }
        }
        /*
         * `expressionsPlugin` is what tells the light engine apart from the
         * others at runtime, and `null` there means every expression in the
         * file is skipped. Read here rather than before the load because this
         * is the first point where the parsed data exists for a path as well as
         * for an object. Neither field is in the engine's declarations, and
         * the `in` checks narrow them without a cast.
         */
        if (
          "expressionsPlugin" in item &&
          item.expressionsPlugin === null &&
          "animationData" in item &&
          hasExpressions(item.animationData)
        ) {
          console.warn(
            "[lottie-react] this animation uses expressions, which the light engine does not evaluate, so it renders without them. " +
              "LottieSvg and useLottieSvg run them and still draw svg only; Lottie and useLottie run them with every renderer.",
          );
        }
      }
      /*
       * The engine has already started by now if it was going to. Reading it is
       * the only way to catch autoplay, which it announces synchronously inside
       * `loadAnimation`, before anything could have been listening.
       */
      setState(item.isPaused ? LottieState.stopped : LottieState.playing);
      /*
       * `ready` is announced here rather than from the engine's own
       * `data_ready`, which fires synchronously inside `loadAnimation` whenever
       * the animation is passed as data. Nothing could have subscribed by then,
       * so it would only ever be seen by a caller who used a path.
       */
      manager.notify(LottieSubscription.ready);
    };

    const onDataFailed = () => {
      fail(
        new Error(
          "lottie-react: the animation could not be loaded. The engine reported no reason; check that the `src` path resolves and returns animation JSON.",
        ),
      );
    };

    const onComplete = () => {
      /*
       * The engine leaves the animation on its last frame, which is where it
       * belongs. Rewinding here would mean the final frame is never seen.
       */
      setState(LottieState.stopped);
      manager.notify(LottieSubscription.complete);
    };

    const onLoopComplete = () => {
      manager.notify(LottieSubscription.loopCompleted);
    };

    const onEnterFrame = () => {
      const current = item.currentFrame;
      manager.notify(LottieSubscription.frame, { currentFrame: current });

      const previous = markerMemory.current;
      markerMemory.current = current;
      if (previous === null || sortedMarkers.length === 0) {
        return;
      }

      const announce = (from: number, to: number) => {
        const crossed = collectMarkerCrossings(
          sortedMarkers,
          item.firstFrame,
          from,
          to,
        );
        if (crossed !== null) {
          for (const name of crossed) {
            manager.notify(LottieSubscription.marker, { marker: name });
          }
        }
      };

      /*
       * A frame that moved against the direction of play is a loop wrapping
       * around, which is really two straight runs: the rest of the range, then
       * its other end up to where the playhead landed. `-1` and `totalFrames`
       * bound those runs from outside the range, where no marker can sit.
       */
      const forward = item.playDirection >= 0;
      const wrapped = forward ? current < previous : current > previous;
      if (!wrapped) {
        announce(previous, current);
      } else if (forward) {
        announce(previous, item.totalFrames);
        announce(-1, current);
      } else {
        announce(previous, -1);
        announce(item.totalFrames, current);
      }
    };

    /*
     * One list, walked twice. `removeEventListener` called with a name and no
     * callback empties the whole list for that event, and lottie-web's own
     * manager keeps handlers there to drive its render loop, so every removal
     * has to name its exact callback. Pairing them here is what makes the two
     * walks impossible to disagree.
     */
    /*
     * `segmentStart` is the engine's own announcement that the playable range
     * changed, and it fires for a range applied immediately and for one that
     * waited its turn alike. It does not fire at load, even for an animation
     * loaded with a segment, so it says exactly what it means.
     */
    const onSegmentStart = () => {
      /* The range moved, so remembered positions are in dead coordinates. */
      markerMemory.current = null;
      refreshRange(item);
    };

    const listeners: [AnimationEventName, () => void][] = [
      ["DOMLoaded", onDomLoaded],
      ["data_failed", onDataFailed],
      ["complete", onComplete],
      ["loopComplete", onLoopComplete],
      ["enterFrame", onEnterFrame],
      ["segmentStart", onSegmentStart],
    ];

    for (const [name, handler] of listeners) {
      item.addEventListener(name, handler);
    }

    return () => {
      for (const [name, handler] of listeners) {
        item.removeEventListener(name, handler);
      }
      item.destroy();
      itemRef.current = null;
      setAnimationItem(null);
      logger.log("the animation was destroyed");
    };
  }, [display, source, loadConfig, lottie, manager, refreshRange, loadAttempt]);

  // One effect per reactive value, so a change to one never disturbs another.
  useEffect(() => {
    if (speed !== undefined) {
      applySpeed(speed, "prop");
    }
  }, [speed, applySpeed]);

  useEffect(() => {
    if (direction !== undefined) {
      applyDirection(direction, "prop");
    }
  }, [direction, applyDirection]);

  useEffect(() => {
    if (loop !== undefined) {
      applyLoop(loop, "prop");
    }
  }, [loop, applyLoop]);

  const instance: LottieInstance = {
    state,
    error,
    reload,
    speed: speedValue,
    direction: directionValue,
    loop: loopValue,
    playableFrames,
    playableDuration,
    play,
    pause,
    stop,
    seek,
    scrubStart,
    scrubTo,
    scrubEnd,
    playSegments,
    resetSegments,
    setSpeed,
    setDirection,
    setLoop,
    subscribe: manager.subscribe,
    setDisplayRef,
    setRootRef,
    root,
    animationItem,
  };

  /*
   * Hands the animation up to whatever wrapper surrounds it. The box is
   * registered once and read at use, because the object above is rebuilt every
   * render and anything holding it directly would hold the past; the bump on
   * every render is what tells a reader that it moved. With no wrapper around,
   * all three lines are no-ops.
   */
  const registry = useContext(LottieRegistryContext);
  const box = useRef<LottieInstanceBox>({ current: instance }).current;
  box.current = instance;
  useEffect(() => registry?.register(box), [registry, box]);
  useEffect(() => {
    registry?.bump();
  });

  return instance;
}
