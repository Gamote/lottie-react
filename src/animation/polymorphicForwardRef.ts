import {
  forwardRef,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from "react";

/* TODO: delete this file once React 18 leaves the peer range. On React 19 a
    component receives `ref` as an ordinary prop, so a component that chooses
    its element can be written as a plain generic function with no assertion
    anywhere. */

/**
 * `forwardRef`, with the render function's own type parameters kept.
 *
 * A component that chooses its element through `as` is generic in that tag, and
 * React's `forwardRef` is not: its signature settles the props at one type, so
 * the tag is lost and `as="button" type="button"` stops typechecking while
 * invented props start passing. Handing the same runtime function a signature
 * that carries the parameters through is what restores per-element props.
 *
 * The assertion lives here, alone, so that there is one of it and so that what
 * removes it is written beside it. React 18 is the whole reason it exists,
 * because a function component receives a `ref` only through `forwardRef`
 * there.
 */
export const polymorphicForwardRef = forwardRef as <T, P>(
  render: (props: P, ref: Ref<T>) => ReactNode,
) => (props: P & RefAttributes<T>) => ReactNode;
