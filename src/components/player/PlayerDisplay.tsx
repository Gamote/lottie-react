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
 * @param props
 * @param ref
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
        "😬 Seems like you forgot to pass the `ref` property to the `PlayerDisplay` component.",
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
