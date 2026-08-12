import { expect, it, vi } from "vitest";
import { SubscriptionManager } from "./SubscriptionManager.js";

type Events = {
  ready: () => void;
  frame: (event: { currentFrame: number }) => void;
};

it("calls the handler registered for an event, with its payload", () => {
  const manager = new SubscriptionManager<Events>();
  const onFrame = vi.fn();

  manager.subscribe("frame", onFrame);
  manager.notify("frame", { currentFrame: 3 });

  expect(onFrame).toHaveBeenCalledExactlyOnceWith({ currentFrame: 3 });
});

it("calls every handler registered for the same event", () => {
  const manager = new SubscriptionManager<Events>();
  const first = vi.fn();
  const second = vi.fn();

  manager.subscribe("ready", first);
  manager.subscribe("ready", second);
  manager.notify("ready");

  expect(first).toHaveBeenCalledOnce();
  expect(second).toHaveBeenCalledOnce();
});

it("does not call a handler registered for a different event", () => {
  const manager = new SubscriptionManager<Events>();
  const onReady = vi.fn();

  manager.subscribe("ready", onReady);
  manager.notify("frame", { currentFrame: 1 });

  expect(onReady).not.toHaveBeenCalled();
});

it("notifying an event nobody subscribed to does nothing", () => {
  const manager = new SubscriptionManager<Events>();

  expect(() => {
    manager.notify("ready");
  }).not.toThrow();
});

it("the returned function removes that handler and leaves the others", () => {
  const manager = new SubscriptionManager<Events>();
  const removed = vi.fn();
  const kept = vi.fn();

  const unsubscribe = manager.subscribe("ready", removed);
  manager.subscribe("ready", kept);
  unsubscribe();
  manager.notify("ready");

  expect(removed).not.toHaveBeenCalled();
  expect(kept).toHaveBeenCalledOnce();
});

it("unsubscribing twice is harmless", () => {
  const manager = new SubscriptionManager<Events>();
  const unsubscribe = manager.subscribe("ready", vi.fn());

  unsubscribe();

  expect(() => {
    unsubscribe();
  }).not.toThrow();
});

it("a handler that removes itself while being called is not called again", () => {
  const manager = new SubscriptionManager<Events>();
  const calls: number[] = [];

  const unsubscribe = manager.subscribe("frame", ({ currentFrame }) => {
    calls.push(currentFrame);
    unsubscribe();
  });

  manager.notify("frame", { currentFrame: 1 });
  manager.notify("frame", { currentFrame: 2 });

  expect(calls).toEqual([1]);
});

it("survives being handed the same handler twice", () => {
  const manager = new SubscriptionManager<Events>();
  const handler = vi.fn();

  manager.subscribe("ready", handler);
  manager.subscribe("ready", handler);
  manager.notify("ready");

  // A set, so the second registration is the same entry as the first.
  expect(handler).toHaveBeenCalledOnce();
});
