/** The shape a subscription map has to have: a handler per event name. */
type HandlerMap = Record<string, (...args: never[]) => void>;

/**
 * A typed event emitter, small enough to avoid a dependency and precise enough
 * that a wrong payload is a compile error rather than a runtime surprise.
 *
 * The map it is given must be declared as a `type` rather than an `interface`,
 * because an interface has no implicit index signature and cannot satisfy the
 * constraint above.
 *
 * Both methods are fields rather than prototype methods so they can be handed
 * out on their own, which is how `subscribe` reaches a consumer.
 */
export class SubscriptionManager<Subscriptions extends HandlerMap> {
  private readonly listeners: {
    [Type in keyof Subscriptions]?: Set<Subscriptions[Type]>;
  } = {};

  /** Registers a handler and returns the function that removes it. */
  public subscribe = <Type extends keyof Subscriptions>(
    type: Type,
    handler: Subscriptions[Type],
  ): (() => void) => {
    let handlers = this.listeners[type];
    if (!handlers) {
      handlers = new Set<Subscriptions[Type]>();
      this.listeners[type] = handlers;
    }
    handlers.add(handler);

    return () => {
      this.listeners[type]?.delete(handler);
    };
  };

  /**
   * Calls every handler registered for an event.
   *
   * The set is walked in place rather than copied, because `frame` is notified
   * once per rendered frame and a copy per notification would allocate at that
   * rate. A handler that removes itself while being called is safe; one that
   * subscribes during its own notification may be called in the same pass.
   */
  public notify = <Type extends keyof Subscriptions>(
    type: Type,
    ...args: Parameters<Subscriptions[Type]>
  ): void => {
    this.listeners[type]?.forEach((handler) => {
      handler(...args);
    });
  };
}
