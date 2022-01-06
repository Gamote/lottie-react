/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { FC } from "react";

import styles from "./BrowserWindow.module.css";

type BrowserWindowProps = {
  minBodyHeight?: number;
  maxBodyHeight?: number;
  bodyHeight?: number;
  url: string;
};

const BrowserWindow: FC<BrowserWindowProps> = ({
  children,
  minBodyHeight,
  maxBodyHeight,
  bodyHeight,
  url = "https://myapp.com",
}) => (
  <div className={styles.browserWindow}>
    <div className={styles.browserWindowHeader}>
      <div className={styles.buttons}>
        <span className={styles.dot} style={{ background: "#f25f58" }} />
        <span className={styles.dot} style={{ background: "#fbbe3c" }} />
        <span className={styles.dot} style={{ background: "#58cb42" }} />
      </div>
      <div className={styles.browserWindowAddressBar}>{url}</div>
      <div className={styles.browserWindowMenuIcon}>
        <div>
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </div>
      </div>
    </div>

    <div
      className={styles.browserWindowBody}
      style={{ minHeight: minBodyHeight, maxHeight: maxBodyHeight, height: bodyHeight }}
    >
      {children}
    </div>
  </div>
);

export default BrowserWindow;
