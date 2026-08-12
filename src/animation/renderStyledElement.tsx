import { createElement, type ReactNode, type Ref } from "react";
import { styleLayer } from "./styleLayer.js";
import { stylePrecedence } from "./stylePrecedence.js";

/** What {@link renderStyledElement} needs to build one element. */
interface StyledElement {
  /** The tag to render. A string, because `as` is still generic at the call site. */
  tag: string;
  /** The library class this element carries, which also names its stylesheet. */
  styleClass: string;
  /** The rules that class carries, all scoped to it. */
  styles: string;
  /** The consumer's own class, added to ours rather than replacing it. */
  className?: string;
  /** Everything else the consumer passed, which belongs to the element. */
  attributes: object;
  /** Whatever should receive the element. */
  ref?: Ref<HTMLElement>;
  /** Rendered inside the element, when the element is meant to hold anything. */
  children?: ReactNode;
}

/**
 * Renders one element carrying a library class, together with the stylesheet
 * that class names.
 *
 * The class and the `href` are one string, so React deduplicates the rules by
 * the same name the rules are scoped to: two components can only collide in the
 * document if they already collide in CSS, which is visible rather than silent.
 *
 * Built through `createElement` rather than as JSX, because JSX cannot take an
 * element type that is still generic: `<Tag />` where the tag comes from `as`
 * is `TS2604, no construct or call signatures`. Narrowing to one concrete tag
 * instead needs an assertion, which this does not.
 */
export function renderStyledElement({
  tag,
  styleClass,
  styles,
  className,
  attributes,
  ref,
  children,
}: StyledElement): ReactNode {
  return (
    <>
      {createElement(
        tag,
        {
          ...attributes,
          className: className ? `${styleClass} ${className}` : styleClass,
          ref,
        },
        children,
      )}
      {/*
       * After the element, not before it, and this decides which rules win.
       * Every sheet here shares one precedence, so React inserts them in the
       * order it meets them, and two rules at zero specificity are settled by
       * whichever comes last. An element's own rules therefore have to be met
       * after those of anything it contains, which is what rendering the tag
       * below the children achieves. The shared layer changes none of this:
       * every sheet sits in the same layer, so order still decides within it.
       */}
      <style href={styleClass} precedence={stylePrecedence}>
        {`@layer ${styleLayer}{${styles}}`}
      </style>
    </>
  );
}
