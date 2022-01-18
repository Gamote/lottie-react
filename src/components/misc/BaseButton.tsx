import React, { FC, useState } from "react";
import config from "../../config";

export type BaseButtonProps = {
  onClick?: () => void;
  DropdownContent?: (setShowDropdown: (state: boolean) => void) => JSX.Element;
};

export const BaseButton: FC<BaseButtonProps> = ({ children, onClick, DropdownContent }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        zIndex: 2,
      }}
    >
      {showDropdown && DropdownContent && (
        <div
          style={{
            display: "block",
            position: "absolute",
            backgroundColor: config.darkTransparentBackgroundColor,
            minWidth: 120,
            boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
            borderRadius: 3,
            right: 0,
            bottom: 0,
            marginBottom: 43,
          }}
        >
          {DropdownContent(setShowDropdown)}
        </div>
      )}

      <button
        style={{
          background: config.transparentColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 2,
          paddingRight: 2,
          width: 30,
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => {
          setShowDropdown(!showDropdown);
          onClick?.();
        }}
      >
        {children}
      </button>
    </div>
  );
};
