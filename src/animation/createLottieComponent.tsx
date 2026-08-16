import {
  type ReactNode,
  type Ref,
  type RefCallback,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { mergeRefs } from "../utils/mergeRefs.js";
import type { LottieEngine } from "./configureLottie.js";
import { lottieDisplayClass, lottieDisplayStyles } from "./LottieDisplay.js";
import { LottieInstanceContext } from "./LottieInstanceContext.js";
import { polymorphicForwardRef } from "./polymorphicForwardRef.js";
import { renderStyledElement } from "./renderStyledElement.js";
import type {
  AnyTag,
  ElementProps,
  LottieHandle,
  LottieRenderer,
  MustBeNever,
} from "./types.js";
import {
  type UseLottieOptions,
  useLottieAnimation,
} from "./useLottieAnimation.js";

/**
 * The class the element around the animation carries when you place the
 * animation yourself, and the name React deduplicates its stylesheet by.
 */
const lottieRootClass = "lottie-root";

/**
 * The rules that element carries, at zero specificity and inside the library's
 * cascade layer, so any rule the consumer writes beats them per property.
 *
 * The column is what puts the controls below the animation, and `position` is
 * what the overlays anchor to. The second rule is what lets the animation take
 * the space the controls leave, since the display's own default height is a
 * full 100% that would otherwise push them out of the box.
 *
 * The descendant rule is written as two separate `:where()` selectors rather
 * than one wrapping the combinator. The two are identical CSS at identical zero
 * specificity, so the split form costs nothing and reads as two independent
 * claims about specificity.
 *
 * The third rule is what this element looks like once it fills the screen. A
 * browser paints a black backdrop behind whatever goes fullscreen and leaves
 * the element itself transparent, so without a surface of its own the animation
 * sits on black and the control bar, whose colours are all inherited, keeps the
 * page's dark text and becomes close to unreadable. Measured in Chromium
 * against the real bar. `Canvas` and `CanvasText` are the system page colours
 * and are taken as a pair, so the two can never contradict each other the way a
 * background without a matching foreground can; they follow the consumer's
 * declared colour scheme rather than a colour this library picked, and the rule
 * is zero-specificity like every other, so one line of their own CSS replaces
 * either. It cannot be verified here, since this environment has no Fullscreen
 * API at all.
 */
const lottieRootStyles = `:where(.${lottieRootClass}){position:relative;display:flex;flex-direction:column}:where(.${lottieRootClass}) > :where(.${lottieDisplayClass}){flex:1;height:auto}:where(.${lottieRootClass}:fullscreen){background:Canvas;color:CanvasText}`;

/**
 * What a Lottie component owns, on top of everything the animation takes.
 *
 * Every name here is checked against the attributes of the elements `as`
 * permits, so none of them can quietly take an attribute away from a consumer.
 */
export interface LottieOwnProps<
  Children extends ReactNode,
  Renderer extends LottieRenderer,
> extends UseLottieOptions<Renderer> {
  /** Which element to render. A `div` unless you say otherwise. */
  as?: unknown;
  /**
   * Anything at all. Passing children means you place the animation yourself
   * with `<LottieDisplay>`, and this component renders only the box around it.
   */
  children?: Children;
  /** Added to the library's class rather than replacing it. */
  className?: string;
  /**
   * Where to put the imperative handle: the commands, without the values.
   *
   * `ref` names the element, because this component accepts that element's
   * whole attribute set, so the handle needs somewhere of its own to go. Write
   * `useRef<LottieHandle>(null)`; no ref type is exported.
   */
  lottieRef?: Ref<LottieHandle>;
}

/** What a Lottie component accepts for a given element. */
export type LottieComponentProps<
  As extends AnyTag,
  Children extends ReactNode,
  Renderer extends LottieRenderer,
> = ElementProps<LottieOwnProps<Children, Renderer>, As, Children, Renderer>;

/**
 * A component that renders an animation, still generic in its element, its
 * children and its renderer once the engine has been chosen.
 *
 * Written out as a call signature rather than inferred, because a function that
 * returns a component would otherwise settle those parameters at the moment the
 * component is created and hand back something that is no longer polymorphic.
 */
export type LottieComponent<Renderers extends LottieRenderer> = <
  As extends AnyTag = "div",
  Children extends ReactNode = undefined,
  /*
   * `svg` is in every build, so it is always the default; naming it directly
   * is what a bare type parameter cannot do, because nothing tells the
   * compiler that this build has it.
   */
  Renderer extends Renderers = Extract<Renderers, typeof LottieRenderer.svg>,
>(
  props: LottieComponentProps<As, Children, Renderer> & {
    ref?: Ref<HTMLElement>;
  },
) => ReactNode;

/**
 * Builds the component all three public ones are: the full, svg and light
 * builds differ in the engine they load and in the renderers they admit, and in
 * nothing else.
 *
 * `Renderers` is what narrows a smaller build to the renderers it actually
 * contains, so asking it for one it does not have is a compile error rather
 * than a blank animation and a runtime throw.
 */
export function createLottieComponent<Renderers extends LottieRenderer>(
  engine: LottieEngine,
): LottieComponent<Renderers> {
  return polymorphicForwardRef(function Lottie<
    As extends AnyTag = "div",
    Children extends ReactNode = undefined,
    Renderer extends Renderers = Extract<Renderers, typeof LottieRenderer.svg>,
  >(
    {
      as,
      children,
      className,
      lottieRef,
      src,
      renderer,
      rendererSettings,
      loop,
      speed,
      direction,
      autoplay,
      segment,
      assetsPath,
      debug,
      subscriptions,
      ...rest
    }: LottieComponentProps<As, Children, Renderer>,
    ref: Ref<HTMLElement>,
  ) {
    const options = {
      src,
      renderer,
      rendererSettings,
      loop,
      speed,
      direction,
      autoplay,
      segment,
      assetsPath,
      debug,
      subscriptions,
    };

    /*
     * An option the animation gained but this component never picked out of its
     * props would stay in the spread and land on the element as an attribute
     * nobody recognises, working nowhere and warning at runtime rather than
     * here.
     */
    type _EveryOptionReachesTheAnimation = MustBeNever<
      Exclude<keyof UseLottieOptions<Renderer>, keyof typeof options>
    >;

    const instance = useLottieAnimation(engine, options);
    const { setDisplayRef, setRootRef } = instance;

    useImperativeHandle(lottieRef, () => ({
      reload: instance.reload,
      play: instance.play,
      pause: instance.pause,
      stop: instance.stop,
      seek: instance.seek,
      scrubStart: instance.scrubStart,
      scrubTo: instance.scrubTo,
      scrubEnd: instance.scrubEnd,
      playSegments: instance.playSegments,
      resetSegments: instance.resetSegments,
      setSpeed: instance.setSpeed,
      setDirection: instance.setDirection,
      setLoop: instance.setLoop,
      animationItem: instance.animationItem,
    }));

    /*
     * How many displays are attached to this animation. React attaches a
     * child's ref before it runs a parent's effect, so this is already accurate
     * by the time the check below reads it, and it survives a mount, unmount
     * and remount because a detached element takes its count back with it.
     */
    const attached = useRef(0);
    const countDisplay = useCallback<RefCallback<HTMLElement>>(
      (node) => {
        attached.current += node === null ? -1 : 1;
        setDisplayRef(node);
      },
      [setDisplayRef],
    );

    /*
     * Children reach the animation through the attach callback this counts,
     * rather than through a channel of their own. Nothing else can hand an
     * element to the animation, so nothing else has to be watched.
     */
    const published = useMemo(
      () => ({ ...instance, setDisplayRef: countDisplay }),
      [instance, countDisplay],
    );

    const hasChildren = children !== undefined;

    useEffect(() => {
      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV !== "production"
      ) {
        if (!hasChildren || attached.current === 1) {
          return;
        }
        if (attached.current === 0) {
          console.warn(
            "[lottie-react] <Lottie> was given children and none of them is a <LottieDisplay>, " +
              "so the animation has nowhere to be drawn. Add one where the animation should go. " +
              "A display rendered conditionally has not appeared yet on this pass, which is the " +
              "one case where this warning is expected.",
          );
        } else {
          console.warn(
            `[lottie-react] <Lottie> was given ${attached.current} <LottieDisplay> children and an ` +
              "animation can only be drawn in one of them, so the last to attach is the one that " +
              "gets it. Render one display per animation.",
          );
        }
      }
    }, [hasChildren]);

    /*
     * Rebuilding either of these every render would make React detach and
     * reattach the element, handing the animation its container again on every
     * unrelated render of the page around it.
     *
     * Whichever element this component renders is the root, because the root is
     * the outermost element it puts on the page and that is what fullscreen has
     * to be asked of. With no children that is the same element as the display,
     * so one callback carries both.
     */
    const attachDisplay = useMemo(
      () => mergeRefs(ref, countDisplay, setRootRef),
      [ref, countDisplay, setRootRef],
    );
    const attachWrapper = useMemo(
      () => mergeRefs(ref, setRootRef),
      [ref, setRootRef],
    );

    /*
     * `as` carries a rejection type rather than a tag when the tag is refused,
     * which is what puts a readable message on the prop at the call site. Asking
     * whether it is a string is what tells the two apart.
     */
    const tag = typeof as === "string" ? as : "div";

    /*
     * With no children this component is the display itself, so it renders the
     * display's element rather than the component: `as` is still a type
     * parameter here, and the display's own `as` is validated against a
     * different set of rejections, so handing one to the other cannot typecheck
     * without an assertion.
     */
    if (!hasChildren) {
      return renderStyledElement({
        tag,
        styleClass: lottieDisplayClass,
        styles: lottieDisplayStyles,
        className,
        attributes: rest,
        ref: attachDisplay,
      });
    }

    return (
      <LottieInstanceContext.Provider value={published}>
        {renderStyledElement({
          tag,
          styleClass: lottieRootClass,
          styles: lottieRootStyles,
          className,
          attributes: rest,
          ref: attachWrapper,
          children,
        })}
      </LottieInstanceContext.Provider>
    );
  });
}
