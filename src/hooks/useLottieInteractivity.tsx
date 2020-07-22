import { AnimationSegment } from "lottie-web";
import React, { useEffect, useState, ReactElement, useRef } from "react";
import { InteractivityProps } from "../types";

// helpers
function getContainerVisibility(container: Element): number {
  const { top, height } = container.getBoundingClientRect();

  const current = window.innerHeight - top;
  const max = window.innerHeight + height;
  return current / max;
}

function getContainerCursorPosition(
  container: Element,
  cursorX: number,
  cursorY: number,
): { x: number; y: number } {
  const { top, left, width, height } = container.getBoundingClientRect();

  const x = (cursorX - left) / width;
  const y = (cursorY - top) / height;

  return { x, y };
}

const useLottieInteractivity = ({
  actions,
  mode,
  lottieObj,
}: InteractivityProps): ReactElement => {
  const {
    goToAndStop,
    getDuration,
    playSegments,
    animationItem,
    play,
    stop,
    View,
  } = lottieObj;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [assignedSegment, setAssignedSegment] = useState<number[]>();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    const totalFrames = getDuration(true) as number;
    stop();

    if (mode === "scroll") {
      const scrollHandler = () => {
        const currentPercent = getContainerVisibility(wrapper);

        // Find the first action that satisfies the current position conditions
        const action = actions.find(
          ({ visibility }) =>
            visibility &&
            currentPercent >= visibility[0] &&
            currentPercent <= visibility[1],
        );

        // Skip if no matching action was found!
        if (!action) {
          return;
        }

        switch (action.type) {
          // Seek: Go to a frame based on player scroll position action
          case "seek": {
            if (action.visibility) {
              goToAndStop(
                Math.ceil(
                  ((currentPercent - action.visibility[0]) /
                    (action.visibility[1] - action.visibility[0])) *
                    totalFrames,
                ),
                true,
              );
            }

            break;
          }

          case "loop": {
            // Loop: Loop a given frames
            if (assignedSegment === null) {
              playSegments(action.frames as AnimationSegment, true);
              setAssignedSegment(action.frames);
            }
            // if playing any segments currently
            // check if segments in state are equal to the frames selected by action
            if (assignedSegment !== action.frames) {
              // if they are not equal. new segments are to be loaded
              playSegments(action.frames as AnimationSegment, true);
              setAssignedSegment(action.frames);
            }

            if (
              assignedSegment === action.frames &&
              animationItem?.isPaused === true
            ) {
              playSegments(action.frames as AnimationSegment, true);
              setAssignedSegment(action.frames);
            }

            break;
          }

          case "play": {
            // Play: Reset segments and continue playing full animation from current position
            if (animationItem?.isPaused === true) {
              animationItem.resetSegments(false);
              play();
            }

            break;
          }

          case "stop": {
            // Stop: Stop playback
            goToAndStop(action.frames[0], true);

            break;
          }

          default:
        }
      };

      document.addEventListener("scroll", scrollHandler);

      // eslint-disable-next-line consistent-return
      return () => {
        document.removeEventListener("scroll", scrollHandler);
      };
    }

    if (mode === "cursor") {
      const handleCursor = (_x: number, _y: number) => {
        let x = _x;
        let y = _y;

        // Resolve cursor position if cursor is inside container
        if (x !== -1 && y !== -1) {
          // Get container cursor position
          const pos = getContainerCursorPosition(wrapper, x, y);

          // Use the resolved position
          x = pos.x;
          y = pos.y;
        }

        // Find the first action that satisfies the current position conditions
        const action = actions.find(({ position }) => {
          if (
            position &&
            Array.isArray(position.x) &&
            Array.isArray(position.y)
          ) {
            return (
              x >= position.x[0] &&
              x <= position.x[1] &&
              y >= position.y[0] &&
              y <= position.y[1]
            );
          }

          if (
            position &&
            !Number.isNaN(position.x) &&
            !Number.isNaN(position.y)
          ) {
            return x === position.x && y === position.y;
          }

          return false;
        });

        // Skip if no matching action was found!
        if (!action) {
          return;
        }

        // Process action types:
        if (action.type === "seek") {
          // Seek: Go to a frame based on player scroll position action
          if (
            action.position &&
            Array.isArray(action.position.x) &&
            Array.isArray(action.position.y)
          ) {
            const xPercent =
              (x - action.position.x[0]) /
              (action.position.x[1] - action.position.x[0]);
            const yPercent =
              (y - action.position.y[0]) /
              (action.position.y[1] - action.position.y[0]);

            playSegments(action.frames as AnimationSegment, true);
            goToAndStop(
              Math.ceil(((xPercent + yPercent) / 2) * totalFrames),
              true,
            );
          }
        } else if (action.type === "loop") {
          playSegments(action.frames as AnimationSegment, true);
        } else if (action.type === "play") {
          // Play: Reset segments and continue playing full animation from current position
          if (animationItem?.isPaused === true) {
            animationItem.resetSegments(false);
          }
          playSegments(action.frames as AnimationSegment);
        } else if (action.type === "stop") {
          goToAndStop(action.frames[0], true);
        }
      };

      const mouseMoveHandler = (ev: MouseEvent) => {
        handleCursor(ev.clientX, ev.clientY);
      };

      const mouseOutHandler = () => {
        handleCursor(-1, -1);
      };

      wrapper.addEventListener("mousemove", mouseMoveHandler);
      wrapper.addEventListener("mouseout", mouseOutHandler);

      // eslint-disable-next-line consistent-return
      return () => {
        wrapper.removeEventListener("mousemove", mouseMoveHandler);
        wrapper.removeEventListener("mouseout", mouseOutHandler);
      };
    }
  }, [mode]);

  return <div ref={wrapperRef}>{View}</div>;
};

export default useLottieInteractivity;
