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

export const _PlayerContainer: ForwardRefRenderFunction<HTMLDivElement, PlayerContainerProps> = (
  props,
  ref,
) => {
  const { children, ...rest } = props;

  return (
    <div
      {...rest}
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        ...rest.style,
      }}
    >
      {children}
    </div>
  );
};

export const PlayerContainer = forwardRef(_PlayerContainer);
