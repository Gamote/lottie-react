import React, { FC, useEffect, useRef, useState } from "react";
import config from "../../config";

export type BaseButtonProps = {
  children: JSX.Element;
  onClick?: () => void;
  DropdownContent?: (setIsMenuOpen: (state: boolean) => void) => JSX.Element;
};

/**
 * Component that wraps a button and provides a menu
 * TODO: add tooltips
 */
export const BaseButton: FC<BaseButtonProps> = ({ children, onClick, DropdownContent }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Do nothing, the menu will never open
    if (!DropdownContent) {
      return;
    }

    const checkIfClickedOutside = (event: MouseEvent) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (
        isMenuOpen &&
        ref.current &&
        event.target &&
        !ref.current.contains(event.target as HTMLDivElement)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [DropdownContent, isMenuOpen]);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        display: "inline-block",
        zIndex: 2,
      }}
    >
      {isMenuOpen && DropdownContent && (
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
          {DropdownContent(setIsMenuOpen)}
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
          setIsMenuOpen(!isMenuOpen);
          onClick?.();
        }}
      >
        {children}
      </button>
    </div>
  );
};
