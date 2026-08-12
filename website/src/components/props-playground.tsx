import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock.core";
import { Lottie, type LottieDirection, type LottieHandle } from "lottie-react";
import { useEffect, useId, useRef, useState } from "react";
import { codeThemes, getHighlighter } from "@/components/highlighter";

const loopChoices = {
  off: false,
  forever: true,
  "3 repeats": 3,
} as const;
type LoopChoice = keyof typeof loopChoices;

const speedChoices = [0.5, 1, 2, 4] as const;

/**
 * The three reactive props driving one real animation, with the code rewritten
 * beneath as they change, so what the controls do and what you would write are
 * the same thing. Props left at their defaults leave the code too.
 */
export function PropsPlayground() {
  const id = useId();
  const [loopChoice, setLoopChoice] = useState<LoopChoice>("forever");
  const [speed, setSpeed] = useState<number>(1);
  const [direction, setDirection] = useState<LottieDirection>("forward");
  const loop = loopChoices[loopChoice];
  const handle = useRef<LottieHandle>(null);
  const done = useRef(false);

  /*
   * A finished animation sits where its travel ended, and a prop declares
   * state rather than commanding playback, so once a finite loop completes
   * every later control change would look dead. A control change therefore
   * queues a restart that the effect below performs after React has applied
   * the new props to the engine: restarting inside the change handler races
   * the direction prop. The restart is stop then play: stop resets the
   * engine past its completion latch, and play's own finished-edge handling
   * starts reversed playback from the correct end.
   */
  const wantRevive = useRef(false);
  const queueRevive = () => {
    if (done.current) {
      wantRevive.current = true;
    }
  };
  useEffect(() => {
    if (wantRevive.current) {
      wantRevive.current = false;
      done.current = false;
      handle.current?.stop();
      handle.current?.play();
    }
  });

  const lines = ["<Lottie", '  src="/anim.json"', "  autoplay"];
  if (loop === true) lines.push("  loop");
  if (typeof loop === "number") lines.push(`  loop={${loop}}`);
  if (speed !== 1) lines.push(`  speed={${speed}}`);
  if (direction !== "forward") lines.push(`  direction="${direction}"`);
  lines.push("/>");

  return (
    <div className="not-prose rounded-lg border">
      <div className="flex flex-wrap items-center justify-center gap-6 p-6">
        <Lottie
          src="/anim.json"
          autoplay
          loop={loop}
          speed={speed}
          direction={direction}
          lottieRef={handle}
          subscriptions={{
            complete: () => {
              done.current = true;
            },
          }}
          className="size-32"
        />
        <div className="flex flex-col gap-2 text-sm">
          <label
            className="flex items-center justify-between gap-3"
            htmlFor={`${id}-loop`}
          >
            loop
            <select
              id={`${id}-loop`}
              className="rounded border px-2 py-1"
              value={loopChoice}
              onChange={(event) => {
                queueRevive();
                setLoopChoice(event.target.value as LoopChoice);
              }}
            >
              {Object.keys(loopChoices).map((choice) => (
                <option key={choice}>{choice}</option>
              ))}
            </select>
          </label>
          <label
            className="flex items-center justify-between gap-3"
            htmlFor={`${id}-speed`}
          >
            speed
            <select
              id={`${id}-speed`}
              className="rounded border px-2 py-1"
              value={speed}
              onChange={(event) => {
                queueRevive();
                setSpeed(Number(event.target.value));
              }}
            >
              {speedChoices.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}x
                </option>
              ))}
            </select>
          </label>
          <label
            className="flex items-center justify-between gap-3"
            htmlFor={`${id}-direction`}
          >
            direction
            <select
              id={`${id}-direction`}
              className="rounded border px-2 py-1"
              value={direction}
              onChange={(event) => {
                queueRevive();
                setDirection(event.target.value as LottieDirection);
              }}
            >
              <option>forward</option>
              <option>reverse</option>
            </select>
          </label>
        </div>
      </div>
      <DynamicCodeBlock
        lang="tsx"
        code={lines.join("\n")}
        highlighter={getHighlighter}
        options={codeThemes}
      />
    </div>
  );
}
