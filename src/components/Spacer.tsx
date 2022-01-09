import React, { FC } from "react";

type SpaceBetweenProps = {
  size: number;
};

/**
 * Add space
 */
const Spacer: FC<SpaceBetweenProps> = ({ size }) => (
  <div style={{ paddingLeft: size / 2, paddingRight: size / 2 }} />
);

export default Spacer;
