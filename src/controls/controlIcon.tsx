import type { ReactNode } from "react";

/**
 * One control's icon, drawn from a single path on a 24 unit grid.
 *
 * Every icon in the bar is one shape, filled in `currentColor` so it takes the
 * button's own colour, and hidden from assistive technology because the button
 * already carries a label. Sharing the wrapper rather than repeating it is worth
 * doing here: in the player this replaces, the identical `<svg>` opening tag was
 * about two thirds of every icon's source.
 *
 * A function rather than a component, because nothing needs it to be one: it has
 * no state, takes no children, and adding a component boundary would put a node
 * in the tree for React to reconcile on every render of the bar.
 */
export function controlIcon(path: string): ReactNode {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
