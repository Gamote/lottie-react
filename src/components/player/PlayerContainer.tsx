import React, {
  DetailedHTMLProps,
  forwardRef,
  ForwardRefRenderFunction,
  HTMLAttributes,
} from "react";

export type PlayerContainerProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

/**
 * Container for displaying the animation
 *
 * TODO: implement loading and error state
 * @param props
 * @param ref
 * @constructor
 */
const PlayerContainer: ForwardRefRenderFunction<HTMLDivElement, PlayerContainerProps> = (
  props,
  ref,
) => {
  const { children, ...rest } = props;

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

export default forwardRef(PlayerContainer);
