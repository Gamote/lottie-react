import React, {
  DetailedHTMLProps,
  forwardRef,
  ForwardRefRenderFunction,
  HTMLAttributes,
  useEffect,
} from "react";
import logger from "../../utils/logger";

export type PlayerDisplayProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Container for displaying the animation
 *
 * TODO: implement loading and error state
 * @param props
 * @param ref
 * @constructor
 */
const _PlayerDisplay: ForwardRefRenderFunction<HTMLDivElement, PlayerDisplayProps> = (
  props,
  ref,
) => {
  const { children, ...rest } = props;

  // Warn about missing `ref` property
  useEffect(() => {
    if (!ref) {
      logger.warn(
        "😬 Seems like you forgot to pass the `ref` property to the `PlayerContainer` component.",
      );
    }
  }, [ref]);

  return (
    <div
      {...rest}
      style={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        justifyContent: "center",
        ...rest.style,
      }}
      ref={ref}
    >
      {children}
    </div>
  );
};

export const PlayerDisplay = forwardRef(_PlayerDisplay);
