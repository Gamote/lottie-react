import React, { FC } from "react";

type SpaceBetweenProps = {
  size: number;
};

/**
 * Add a div with padding to the left and right of `size` / 2
 */
const Spacer: FC<SpaceBetweenProps> = ({ size }) => (
  <div style={{ paddingLeft: size / 2, paddingRight: size / 2 }} />
);

export default Spacer;
