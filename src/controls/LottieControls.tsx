import { forwardRef, useCallback, useRef } from "react";
import { renderStyledElement } from "../animation/renderStyledElement.js";
import {
  type FixedElementProps,
  type LottieInstance,
  LottieState,
} from "../animation/types.js";
import { useLottieInstance } from "../animation/useLottieInstance.js";
import {
  LottieDirectionButton,
  lottieDirectionClass,
} from "./LottieDirectionButton.js";
import { LottieFullscreenButton } from "./LottieFullscreenButton.js";
import { LottieLoopButton } from "./LottieLoopButton.js";
import { LottiePlayButton } from "./LottiePlayButton.js";
import {
  LottieReadout,
  type LottieReadoutUnit,
  lottieReadoutClass,
} from "./LottieReadout.js";
import { LottieSeekBar, lottieSeekClass } from "./LottieSeekBar.js";
import { LottieSpeedSelect, lottieSpeedClass } from "./LottieSpeedSelect.js";
import { LottieStopButton, lottieStopClass } from "./LottieStopButton.js";
import { useFullscreen } from "./useFullscreen.js";
import { useShortcuts } from "./useShortcuts.js";

/**
 * The class the bar carries, and the name React deduplicates its stylesheet by.
 * One string does both, so two components can only collide in the document if
 * they already collide in CSS.
 */
export const lottieControlsClass = "lottie-controls";

/**
 * The content-box width below which the bar drops to its short form, in
 * pixels. A container query measures the content box, so with the bar's
 * 0.35em padding each side the threshold a reader sees is the border-box
 * crossing about 411px.
 *
 * Measured on the bar rather than the window, so a small animation on a wide
 * page counts as narrow. The number is what the full set needs before the seek
 * bar stops being wide enough to aim at: four buttons at 1.5em, the rate picker,
 * the readout, the gaps and the padding come to roughly 280px on their own, and
 * a seek bar worth dragging wants around 120 more.
 *
 * It is deliberately not the 480 the player this replaces used. That was a
 * viewport breakpoint borrowed from phone widths, and as a measurement of the
 * bar it hides four controls on any animation narrower than half a laptop.
 */
const narrowWidth = 400;

/**
 * Everything the bar and its controls look like, at zero specificity and inside
 * the library's cascade layer, so that any rule the consumer writes beats them
 * per property.
 *
 * The whole set lives here rather than one sheet per control, because the class
 * and the `href` are one string and eight stylesheets would mean eight names to
 * keep from colliding instead of one. Every rule below is scoped under the bar's
 * own class, so the controls' classes need no such guarantee.
 *
 * Every control carries a faint fill before it is touched, a stronger one under
 * the pointer and stronger again when it is a toggle that is on, so the three
 * states can never read as each other and the bar is legible at rest rather
 * than only under a cursor. The readout is the one thing with no fill, because
 * it is the one thing that is not a control.
 *
 * Five of these are load-bearing rather than taste.
 *
 * `container-type` is what lets the narrow-width rule measure the bar instead of
 * the window, so a small animation on a wide page counts as narrow. It has a
 * consequence worth knowing: the bar's own width can no longer be worked out
 * from its contents, so it has to be stretched by whatever holds it. Inside the
 * element `<Lottie>` renders that is automatic, and in a row that sizes to its
 * contents the bar would have no width at all.
 *
 * `accent-color` colours the seek bar's track and thumb with one property. The
 * player this replaces reached for `::-webkit-slider-thumb` and its Firefox
 * counterpart instead, unscoped, and so restyled every range input on the page.
 *
 * `field-sizing` on the rate picker makes it as wide as the value showing
 * rather than as wide as its widest option. Measured in Chromium against the
 * real component, that is 35.2px rather than 61.0px, so without it two fifths
 * of the control is space held for `0.25x` while `1x` is displayed, which reads
 * as a gap between the value and its chevron. It is newly enough available that
 * a browser without it simply keeps the wider box, which is a roomy control
 * rather than a broken one.
 *
 * The focus ring is written inside `:where()` along with everything else, so a
 * consumer can still replace it, and it is `:focus-visible` so it appears for
 * the keyboard rather than for every click.
 *
 * Sizes are in `em` and colours are `currentColor` throughout, so the bar takes
 * the surrounding text's size and colour rather than any this library picked.
 * `1.5em` is the smallest target WCAG accepts at a 16px root.
 */
export const lottieControlsStyles = `:where(.${lottieControlsClass}){container-type:inline-size;display:flex;align-items:center;gap:0.3em;padding:0.35em;border-radius:0.6em;background:color-mix(in srgb,currentColor 7%,transparent);color:currentColor}:where(.${lottieControlsClass}) :where(button,select,input){min-width:1.5em;min-height:1.5em;padding:0;border:0;border-radius:0.25em;background:transparent;color:inherit;font:inherit}:where(.${lottieControlsClass}) :where(button,select){background:color-mix(in srgb,currentColor 10%,transparent)}:where(.${lottieControlsClass}) :where(button){display:inline-flex;align-items:center;justify-content:center;cursor:pointer}:where(.${lottieControlsClass}) :where(button)>:where(svg){width:1em;height:1em}:where(.${lottieControlsClass}) :where(button:hover,select:hover){background:color-mix(in srgb,currentColor 22%,transparent)}:where(.${lottieControlsClass}) :where(button[aria-pressed="true"]){background:color-mix(in srgb,currentColor 38%,transparent)}:where(.${lottieControlsClass}) :where(button:disabled,select:disabled,input:disabled){opacity:0.5;cursor:default}:where(.${lottieControlsClass}) :where(button:focus-visible,select:focus-visible,input:focus-visible){outline:2px solid currentColor;outline-offset:1px}:where(.${lottieControlsClass}) :where(.${lottieSeekClass}){flex:1;min-width:6em;accent-color:currentColor;cursor:pointer}:where(.${lottieControlsClass}) :where(.${lottieSpeedClass}){field-sizing:content;padding:0 0.35em}:where(.${lottieControlsClass}) :where(.${lottieReadoutClass}){padding:0 0.4em;font-variant-numeric:tabular-nums;white-space:nowrap;opacity:0.8}:where(.${lottieControlsClass}) :where(.${lottieReadoutClass})>:where(span){display:inline-block;text-align:right}@container (max-width:${narrowWidth}px){:where(.${lottieControlsClass}) :where(.${lottieStopClass},.${lottieReadoutClass},.${lottieDirectionClass},.${lottieSpeedClass}){display:none}}`;

/** What this component owns. Every other prop belongs to the element. */
interface LottieControlsOwnProps {
  /** The animation to drive. Omit it inside a component that publishes one. */
  lottie?: LottieInstance;
  /** What the position is counted in. Frames unless you say otherwise. */
  unit?: LottieReadoutUnit;
  /** Added to the library's class rather than replacing it. */
  className?: string;
}

/** What {@link LottieControls} accepts. */
export type LottieControlsProps = FixedElementProps<
  LottieControlsOwnProps,
  "div"
>;

/**
 * A bar of controls for driving an animation.
 *
 * Render it among the children of a component that publishes an animation, or
 * anywhere at all with the result of `useLottie`. It sits below the animation
 * rather than over it, because this control set is for inspecting a file and
 * covering the thing being inspected defeats it.
 *
 * ```jsx
 * <Lottie src="/hero.json">
 *   <LottieDisplay />
 *   <LottieControls />
 * </Lottie>
 * ```
 *
 * Left to right: play and stop, the seek bar, the position, looping and
 * direction, then the playback rate and fullscreen. That order follows what
 * every Lottie player that publishes one does, and it is why the rate sits away
 * from the transport controls rather than beside them.
 *
 * Three keys work while the animation holds focus, or while it is the thing
 * filling the screen: `k` plays and pauses, `l` loops, `f` fills the screen.
 * They belong to this bar, so a page that renders no controls has no key
 * listener either.
 *
 * Fullscreen takes this bar with the animation, since both sit inside the
 * element `<Lottie>` renders. On the hook path that element is yours, so the
 * button appears once something carries `setRootRef` and not before.
 *
 * While the animation is loading, and after a load has failed, every control is
 * disabled and so are the keys. Both are states in which an overlay covers this
 * bar, so leaving them usable would mean a keyboard could reach controls
 * nothing can see.
 *
 * It takes every attribute of the `div` it renders, and `ref` names that same
 * element. Its own rules are all zero-specificity, so any of them can be
 * replaced one property at a time from your own stylesheet, which is why there
 * is no theme prop. If your CSS lives in cascade layers, declare
 * `@layer lottie-react;` before your own styles so the library's layer ranks
 * below them.
 */
export const LottieControls = forwardRef<HTMLDivElement, LottieControlsProps>(
  function LottieControls({ lottie, unit, className, ...rest }, ref) {
    const instance = useLottieInstance(lottie);
    const { loop, setLoop } = instance;
    const disabled =
      instance.state === LottieState.loading ||
      instance.state === LottieState.error;

    /*
     * Held here rather than in the loop button, because the `l` shortcut is the
     * same operation and a count remembered in two places is a count lost the
     * moment someone uses both.
     */
    const remembered = useRef<boolean | number>(true);
    const toggleLoop = useCallback(() => {
      if (loop === false) {
        setLoop(remembered.current);
      } else {
        remembered.current = loop;
        setLoop(false);
      }
    }, [loop, setLoop]);

    const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(
      instance.root,
    );
    useShortcuts(instance, { disabled, toggleLoop, toggleFullscreen });

    return renderStyledElement({
      tag: "div",
      styleClass: lottieControlsClass,
      styles: lottieControlsStyles,
      className,
      /* Both are placed before the spread, so a consumer's own replace them. */
      attributes: {
        role: "group",
        "aria-label": "Animation controls",
        ...rest,
      },
      ref,
      children: (
        <>
          {/* The animation is handed down rather than left to each control to
              find, so the bar reads the context once instead of seven times. */}
          <LottiePlayButton lottie={instance} disabled={disabled} />
          <LottieStopButton lottie={instance} disabled={disabled} />
          <LottieSeekBar lottie={instance} disabled={disabled} />
          <LottieReadout lottie={instance} unit={unit} />
          <LottieLoopButton
            lottie={instance}
            toggle={toggleLoop}
            disabled={disabled}
          />
          <LottieDirectionButton lottie={instance} disabled={disabled} />
          <LottieSpeedSelect lottie={instance} disabled={disabled} />
          {/* Absent rather than disabled where it cannot work, which is a
              browser without the API, a page not allowed to use it, and the
              hook path when nothing carries `setRootRef`. */}
          {toggleFullscreen !== null && (
            <LottieFullscreenButton
              isFullscreen={isFullscreen}
              toggle={toggleFullscreen}
              disabled={disabled}
            />
          )}
        </>
      ),
    });
  },
);
