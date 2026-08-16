import { useEffect, useRef, useState } from "react";
import {
  createLottieRegistry,
  type LottieInstanceBox,
} from "../animation/LottieRegistryContext.js";
import type { LottieInstance } from "../animation/types.js";
import { isSameJson } from "../utils/isSameJson.js";
import { useStableValue } from "../utils/useStableValue.js";
import type { LottieInteraction, LottieInteractionContext } from "./types.js";

/** What the runner drives from: the readable half of a registry. */
export interface InteractionsSource {
  boxes: () => readonly LottieInstanceBox[];
  subscribe: (listener: () => void) => () => void;
}

/** One armed behaviour on one animation. */
interface Attachment {
  /** The projected slot this was armed with, for telling a real change apart. */
  key: unknown;
  attachIdentity: LottieInteraction["attach"];
  cleanup: (() => void) | undefined;
  listeners: Set<() => void>;
  memory: Record<string, unknown>;
}

/*
 * The animation object a hook returns is rebuilt on every render, so anything
 * that keeps one keeps the past. A factory naturally keeps what it is handed
 * (`const { lottie } = context`), so what it is handed is a view: one object
 * per animation whose members read the current instance on every access.
 * The members are the instance's own, read from it once, so the view is
 * complete by construction. Getters only: a member of the view is a reading,
 * not a place to write, and a value pulled out of it is a copy of that moment.
 */
function createLiveInstanceView(box: LottieInstanceBox): LottieInstance {
  const view = {} as LottieInstance;
  for (const key of Object.keys(box.current) as (keyof LottieInstance)[]) {
    Object.defineProperty(view, key, {
      enumerable: true,
      get: () => box.current[key],
    });
  }
  return view;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The options with every function replaced by a marker, so the whole slot can
 * be compared by content. A callback's identity changes on every render at an
 * inline call site, which must not read as a configuration change; a callback
 * appearing or disappearing must.
 */
function projectData(value: unknown): unknown {
  if (typeof value === "function") {
    return "[function]";
  }
  if (Array.isArray(value)) {
    return value.map(projectData);
  }
  if (isRecord(value)) {
    const projected: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      projected[key] = projectData(entry);
    }
    return projected;
  }
  return value;
}

/**
 * Arms every interaction on every animation a source holds, and keeps that
 * true as animations come and go, options change, and values move.
 *
 * The granularity is deliberate: an animation arriving arms only itself, a
 * changed option re-arms only its own slot on each animation, and a moved
 * value re-arms nothing and only signals `onChange`. A re-arm caused by an
 * option change hands the new attachment the old one's `memory` when the
 * implementation is the same one, which is what lets a once-latch survive
 * reconfiguration.
 */
export function useInteractionsRunner(
  source: InteractionsSource,
  interactions: readonly LottieInteraction[],
): void {
  const latest = useRef(interactions);
  latest.current = interactions;

  const projected = useStableValue(
    interactions.map((interaction) => ({
      attach: interaction.attach,
      options: projectData(interaction.options),
    })),
  );

  const runtime = useRef(new Map<LottieInstanceBox, Attachment[]>()).current;
  const views = useRef(
    new WeakMap<LottieInstanceBox, LottieInstance>(),
  ).current;

  /*
   * The attachments live in a ref rather than inside the effect, so a changed
   * option can re-arm one slot without tearing every other one down. The cost
   * is that the effects below must leave the map consistent between them, and
   * that only the unmount-only effect at the end really detaches.
   */
  const armSlot = (
    box: LottieInstanceBox,
    slot: number,
    memory?: Record<string, unknown>,
  ): Attachment => {
    const interaction = latest.current[slot];
    const key = projected[slot];
    const record: Attachment = {
      key,
      attachIdentity: interaction.attach,
      cleanup: undefined,
      listeners: new Set(),
      memory: memory ?? {},
    };
    let view = views.get(box);
    if (view === undefined) {
      view = createLiveInstanceView(box);
      views.set(box, view);
    }
    const context: LottieInteractionContext = {
      lottie: view,
      options: () => latest.current[slot]?.options,
      onChange: (listener) => {
        record.listeners.add(listener);
        return () => {
          record.listeners.delete(listener);
        };
      },
      memory: record.memory,
    };
    record.cleanup = interaction.attach(context, interaction.options);
    return record;
  };

  const armRef = useRef(armSlot);
  armRef.current = armSlot;

  useEffect(() => {
    const attachBox = (box: LottieInstanceBox) => {
      runtime.set(
        box,
        projected.map((_, slot) => armRef.current(box, slot)),
      );
    };

    /* A changed slot re-arms in place; an unchanged one is left alone. */
    const syncSlots = () => {
      for (const [box, attachments] of runtime) {
        for (let slot = 0; slot < projected.length; slot += 1) {
          const existing = attachments[slot];
          if (
            existing !== undefined &&
            isSameJson(existing.key, projected[slot])
          ) {
            continue;
          }
          /* Same behaviour, new options: its remembered state carries over,
             and it has to be there before the new attach runs, not after. */
          const inherited =
            existing !== undefined &&
            existing.attachIdentity === latest.current[slot]?.attach
              ? existing.memory
              : undefined;
          existing?.cleanup?.();
          attachments[slot] = armRef.current(box, slot, inherited);
        }
        for (const removed of attachments.splice(projected.length)) {
          removed.cleanup?.();
        }
      }
    };

    const syncBoxes = () => {
      const current = new Set(source.boxes());
      for (const box of current) {
        if (!runtime.has(box)) {
          attachBox(box);
        }
      }
      for (const [box, attachments] of [...runtime]) {
        if (!current.has(box)) {
          for (const attachment of attachments) {
            attachment.cleanup?.();
          }
          runtime.delete(box);
        }
      }
    };

    const notifyChange = () => {
      for (const attachments of runtime.values()) {
        for (const attachment of attachments) {
          for (const listener of [...attachment.listeners]) {
            listener();
          }
        }
      }
    };

    syncSlots();
    syncBoxes();
    return source.subscribe(() => {
      syncBoxes();
      notifyChange();
    });
  }, [source, projected, runtime]);

  useEffect(() => {
    return () => {
      for (const attachments of runtime.values()) {
        for (const attachment of attachments) {
          attachment.cleanup?.();
        }
      }
      runtime.clear();
    };
  }, [runtime]);
}

/**
 * A source holding exactly one animation, for the positions where the
 * component or the hook was handed an instance rather than wrapping a subtree.
 * Mirrors the registration the animation itself performs toward a surrounding
 * wrapper, so the runner cannot tell the two apart.
 */
export function useSingleInstanceSource(
  instance: LottieInstance | null,
): InteractionsSource {
  const [store] = useState(createLottieRegistry);
  const box = useRef<LottieInstanceBox | null>(null);
  if (instance !== null) {
    if (box.current === null) {
      box.current = { current: instance };
    } else {
      box.current.current = instance;
    }
  }
  const present = instance !== null;

  useEffect(() => {
    const current = box.current;
    if (!present || current === null) {
      return;
    }
    return store.register(current);
  }, [store, present]);

  useEffect(() => {
    if (present) {
      store.bump();
    }
  });

  return store;
}
