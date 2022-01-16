import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useCallback, useRef, useEffect, useMemo, forwardRef } from 'react';
import lottie from 'lottie-web';
import isEqual from 'react-fast-compare';
import { EventEmitter } from 'events';

/**
 * Render types that Lottie's animation supports
 */
var AnimationRenderer;
(function (AnimationRenderer) {
    AnimationRenderer["Svg"] = "svg";
    AnimationRenderer["Html"] = "html";
    AnimationRenderer["Canvas"] = "canvas";
})(AnimationRenderer || (AnimationRenderer = {}));
/**
 * Enum with Lottie's subscription types
 */
var LottieSubscription;
(function (LottieSubscription) {
    LottieSubscription["Load"] = "load";
    LottieSubscription["Failure"] = "failure";
    LottieSubscription["Ready"] = "ready";
    LottieSubscription["Play"] = "play";
    LottieSubscription["Pause"] = "pause";
    LottieSubscription["Stop"] = "stop";
    LottieSubscription["Freeze"] = "freeze";
    LottieSubscription["LoopCompleted"] = "loop_completed";
    LottieSubscription["Complete"] = "complete";
    LottieSubscription["Frame"] = "frame";
    LottieSubscription["NewState"] = "new_state";
})(LottieSubscription || (LottieSubscription = {}));
/**
 * Enum with the Lottie's states
 */
var LottieState;
(function (LottieState) {
    LottieState["Loading"] = "loading";
    LottieState["Playing"] = "playing";
    LottieState["Paused"] = "paused";
    LottieState["Stopped"] = "stopped";
    LottieState["Frozen"] = "frozen";
    LottieState["Failure"] = "failure";
})(LottieState || (LottieState = {}));
/**
 * Enum with the PlayerControls' elements
 */
var PlayerControlsElement;
(function (PlayerControlsElement) {
    PlayerControlsElement["Play"] = "play";
    PlayerControlsElement["Pause"] = "pause";
    PlayerControlsElement["FramesIndicator"] = "framesIndicator";
    PlayerControlsElement["ProgressBar"] = "progressBar";
    PlayerControlsElement["Loop"] = "loop";
})(PlayerControlsElement || (PlayerControlsElement = {}));

/**
 * Used to emit typed events to internal component and/or consumer handlers
 *
 * * USE CASE
 * * Instead of storing the `currentFrame` value (which would've rerender
 * * the parent and all the child components) we are letting consumers subscribe to it.
 * * This way we avoid rerender all the components on evey new frame and the consumer
 * * can pass it directly to elements (e.g. `<input>`) using `Ref`s.
 *
 * TODO: revisit the typing and see if we can do better
 *
 * @internal
 */
class SubscriptionManager {
    subscriptionManager = new EventEmitter();
    /**
     * Subscribe to a specific subscription type
     * @param type
     * @param action
     */
    subscribe = (type, action) => {
        this.subscriptionManager.on(String(type), action);
        // Return a function to unsubscribe
        return () => this.subscriptionManager.off(String(type), action);
    };
    /**
     * Subscribe to multiple notification types using an object
     * @param subscriptions
     */
    addSubscriptions = (subscriptions) => {
        const eventListenerRemovers = [];
        if (subscriptions) {
            for (const type in subscriptions) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                eventListenerRemovers.push(this.subscribe(type, subscriptions[type]));
            }
        }
        // Return a function to unregister all the listeners
        return () => eventListenerRemovers.forEach((deregister) => deregister());
    };
    /**
     * Send a notification to all the subscribers
     * @param type
     * @param payload
     */
    notify = (type, 
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    payload) => this.subscriptionManager.emit(String(type), payload);
}

/**
 * Extract a number from a number or percentage
 * @param value
 */
const getNumberFromNumberOrPercentage = (value) => {
    const matches = /^(([0-9]*[.])?[0-9]+)(%?)$/.exec(String(value));
    if (matches?.[1]) {
        return {
            number: Number(matches[1]),
            isPercentage: matches[3] === "%",
        };
    }
    return null;
};

const isFunction = (value) => typeof value === "function";

/**
 * Keep the state of the logger
 */
/**
 * Prefix a message with a custom message
 * @param message
 */
const prefixMessage = (message) => `[lottie-react]${message !== undefined ? ` ${message}` : ""}`;
/**
 * Method to wrap console's log methods
 * @param method
 */
const customLogger = (method) => (message, ...optionalParams) => {
    isFunction(method) && method(prefixMessage(message), ...optionalParams);
};
/**
 * Custom Logger
 */
const logger = {
    // eslint-disable-next-line no-console
    log: customLogger(console.log),
    // eslint-disable-next-line no-console
    error: customLogger(console.error),
    // eslint-disable-next-line no-console
    warn: customLogger(console.warn),
    // eslint-disable-next-line no-console
    info: customLogger(console.info),
};

/**
 * Check if the value is a valid animation source that can be passed to Lottie
 * @param source
 */
const normalizeAnimationSource = (source) => {
    // If JSON file
    if (source && typeof source === "string" && source.endsWith(".json")) {
        return { path: source };
    }
    // If object
    if (source && typeof source === "object") {
        return { animationData: source };
    }
    return null;
};

/**
 * Ref that rerender on change
 * TODO: check if it's the MOST efficient way to do it
 * @param initialValue
 */
const useCallbackRef = (initialValue) => {
    const [current, setCurrent] = useState(initialValue ?? null);
    const setRef = useCallback((node) => {
        setCurrent(node);
    }, []);
    return { ref: { current }, setRef };
};

/**
 * Custom hook for getting previous value
 * @param value
 */
const usePreviousState = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

/**
 * Hook that handle the state for LottiePlayer
 * @param options
 */
const useLottieState = (options) => {
    const { initialState, onChange } = options ?? {};
    if (!initialState) {
        throw new Error(`Please specify the "options.initialState" when you use the "useLottiePlayerState" hook.`);
    }
    const [state, setState] = useState(initialState);
    const previousState = usePreviousState(state);
    useEffect(() => {
        if (onChange && isFunction(onChange)) {
            onChange(previousState, state);
        }
    }, [onChange, state, previousState]);
    return {
        previousState,
        state,
        setState,
    };
};

/**
 * Lottie's animation hook
 * @param options
 */
const useLottie = ({ src, enableReinitialize = false, ...rest }) => {
    const options = {
        enableReinitialize,
        ...rest,
    };
    // (Ref) Animation's container
    // By using a callback ref, a rerender will be trigger when its value changed
    // this way the consumer have the option to set the container, and we know
    // when, and if, the animation should be (re)loaded
    const { ref: containerRef, setRef: setContainerRef } = useCallbackRef();
    // (State) Animation instance
    const [animationItem, setAnimationItem] = useState(null);
    // (State) Subscription manager
    const subscriptionManager = useMemo(() => new SubscriptionManager(), []);
    // (State) Animation's state
    const { previousState, state, setState } = useLottieState({
        initialState: LottieState.Loading,
        onChange: (previousPlayerState, newPlayerState) => {
            // Let the subscribers know about the new state
            subscriptionManager.notify(LottieSubscription.NewState, { state: newPlayerState });
        },
    });
    // (Ref) Initial values provided by the consumer
    const _initialValues = useRef(options.initialValues);
    const _subscriptions = useRef(undefined);
    // (State) Initial states converted to local states
    const [loop, setLoop] = useState(options.initialValues?.loop || false);
    const [autoplay, setAutoplay] = useState(options.initialValues?.autoplay || false);
    const [initialSegment, setInitialSegment] = useState(options.initialValues?.segment || undefined);
    // (State) Animation's state before seeking
    // By keeping this we can pause the animation while the seeking action is
    // happening and return to it immediately, offering a smooth experience
    const [stateBeforeSeeking, setStateBeforeSeeking] = useState(null);
    /**
     * (Re)initialize the animation when the container and/or source change
     */
    useEffect(() => {
        logger.log("🪄 Trying to (re)initialize the animation");
        // Set the state to loading until the animation is (re)initialized
        setState((prevState) => prevState === LottieState.Loading ? prevState : LottieState.Loading);
        // Checks that the container is ready
        if (!containerRef?.current) {
            logger.log("⌛️ The container is not ready yet");
            return;
        }
        // Destroy any previous animation
        if (animationItem) {
            logger.log("🗑 Animation already initialized, destroying it");
            animationItem.destroy();
        }
        // Checks if the animation's source have the right format
        const normalizedAnimationSource = normalizeAnimationSource(src);
        if (!normalizedAnimationSource) {
            logger.log("😥 Animation source is not valid");
            subscriptionManager.notify(LottieSubscription.Failure, undefined);
            setState((prevState) => prevState === LottieState.Failure ? prevState : LottieState.Failure);
            return;
        }
        // Initialize animation
        let _animationItem;
        try {
            _animationItem = lottie.loadAnimation({
                ...normalizedAnimationSource,
                container: containerRef.current,
                renderer: "svg",
                loop,
                autoplay,
                initialSegment,
                assetsPath: _initialValues.current?.assetsPath,
                rendererSettings: _initialValues.current?.rendererSettings,
            });
        }
        catch (e) {
            logger.warn("⚠️ Error while trying to load animation", e);
            subscriptionManager.notify(LottieSubscription.Failure, undefined);
            setState((prevState) => prevState === LottieState.Failure ? prevState : LottieState.Failure);
            return;
        }
        // Save Lottie's animation item
        logger.log("👌 Animation was initialized", _animationItem);
        setAnimationItem(_animationItem);
        // Register the internal listeners for the animation's events
        const registerInternalListeners = () => {
            const internalListeners = [
                {
                    name: "complete",
                    handler: () => {
                        setState(LottieState.Stopped);
                        subscriptionManager.notify(LottieSubscription.Complete, undefined);
                    },
                },
                {
                    name: "loopComplete",
                    handler: () => {
                        subscriptionManager.notify(LottieSubscription.LoopCompleted, undefined);
                    },
                },
                {
                    name: "enterFrame",
                    handler: () => {
                        if (_animationItem) {
                            subscriptionManager.notify(LottieSubscription.Frame, {
                                currentFrame: _animationItem.currentFrame,
                            });
                        }
                    },
                },
                { name: "segmentStart", handler: () => undefined },
                { name: "config_ready", handler: () => undefined },
                {
                    name: "data_ready",
                    handler: () => {
                        subscriptionManager.notify(LottieSubscription.Ready, undefined);
                    },
                },
                {
                    name: "data_failed",
                    handler: () => {
                        setState(LottieState.Failure);
                    },
                },
                { name: "loaded_images", handler: () => undefined },
                {
                    name: "DOMLoaded",
                    handler: () => {
                        setState(_animationItem?.autoplay ? LottieState.Playing : LottieState.Stopped);
                    },
                },
                { name: "destroy", handler: () => undefined },
            ];
            const internalListenerRemovers = internalListeners.map((listener) => {
                try {
                    _animationItem?.addEventListener(listener.name, listener.handler);
                }
                catch (e) {
                    // * There might be cases in which the `animationItem` exists but
                    // * it's not ready yet, and in that case `addEventListener` will
                    // * throw an error. That's why we skip these errors.
                }
                // Return a function to deregister this listener
                return () => {
                    try {
                        _animationItem?.removeEventListener(listener.name, listener.handler);
                    }
                    catch (e) {
                        // * There might be cases in which the `animationItem` exists but
                        // * it was destroyed, and in that case `removeEventListener` will
                        // * throw an error. That's why we skip these errors.
                    }
                };
            });
            logger.log("👂 Internal listeners were registered");
            // Return a function to unregister all the listeners
            return () => {
                internalListenerRemovers.forEach((deregister) => deregister());
            };
        };
        const unregisterInternalListeners = registerInternalListeners();
        // Cleanup sequence on unmount
        return () => {
            logger.log("🧹 Animation is unloading, cleaning up...");
            unregisterInternalListeners();
            _animationItem.destroy();
            setAnimationItem(null);
        };
    }, 
    // * We are disabling the `exhaustive-deps` here because we want to
    // * (re)initialise only when the container ref and/or the source change
    // ! DON'T CHANGE because we will end up having the "Maximum update depth exceeded" error
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containerRef.current, src]);
    /**
     * Process initial values changes and update any dependent state
     */
    useEffect(() => {
        // Skip update if there is no animation item, reinitialization is not enabled
        // or the initial values are the same with the previous ones
        if (!animationItem ||
            !enableReinitialize ||
            isEqual(_initialValues.current, options.initialValues)) {
            return;
        }
        // Save the new values
        _initialValues.current = options.initialValues;
        // Loop
        setLoop((prevState) => {
            // Skip update if equal
            if (_initialValues.current?.loop === prevState) {
                return prevState;
            }
            const newState = _initialValues.current?.loop ?? false;
            // * Typing is wrong in `lottie-web`; loop can accept boolean AND number
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            animationItem.loop = newState;
            return newState;
        });
        // Autoplay
        setAutoplay((prevState) => {
            // Skip update if equal
            if (_initialValues.current?.autoplay === prevState) {
                return prevState;
            }
            const newState = _initialValues.current?.autoplay ?? false;
            animationItem.autoplay = newState;
            return newState;
        });
        // TODO: handle initialSegment change
        // Initial segment
        // useEffect(() => {
        //   if (!animationItem) {
        //     return;
        //   }
        //
        //   // When null should reset to default animation length
        //   if (!initialSegment) {
        //     animationItem.resetSegments(false);
        //     // TODO: find a way to increase the totalFrames to the max in the current loop
        //     return;
        //   }
        //
        //   // If it's not a valid segment, do nothing
        //   if (!Array.isArray(initialSegment) || !initialSegment.length) {
        //     return;
        //   }
        //
        //   // If the current frame it's not in the new initial segment
        //   // set the current frame to the first position of the initial segment
        //   if (
        //     animationItem.currentRawFrame < initialSegment[0] ||
        //     animationItem.currentRawFrame > initialSegment[1]
        //   ) {
        //     animationItem.currentRawFrame = initialSegment[0];
        //   }
        //
        //   // Update the segment
        //   animationItem.setSegment(initialSegment[0], initialSegment[1]);
        // }, [animationItem, initialSegment]);
        // TODO: handle assetsPath change
        // TODO: handle rendererSettings change
    }, [animationItem, enableReinitialize, options.initialValues]);
    /**
     * Checks for and (re)register the consumer's subscriptions
     */
    useEffect(() => {
        // Skip update if there is no subscription manager
        // or the new subscriptions are the same with the previous ones
        if (!subscriptionManager || isEqual(_subscriptions.current, options.subscriptions)) {
            return;
        }
        // Save the new subscriptions
        _subscriptions.current = options.subscriptions;
        // Register consumer's subscriptions
        const unregisterConsumerSubscriptions = subscriptionManager.addSubscriptions(options.subscriptions);
        logger.log("👂 Consumer's subscriptions were registered");
        return () => {
            logger.log("🧹 Unregistering consumer's subscriptions...");
            unregisterConsumerSubscriptions();
        };
    }, [subscriptionManager, options.subscriptions]);
    /**
     * Interaction methods
     */
    // Play
    const play = useCallback(() => {
        if (animationItem) {
            animationItem.play();
            setState(LottieState.Playing);
            subscriptionManager.notify(LottieSubscription.Play, undefined);
        }
    }, [animationItem, subscriptionManager, setState]);
    // Pause
    const pause = useCallback(() => {
        if (animationItem) {
            animationItem.pause();
            setState(LottieState.Paused);
            subscriptionManager.notify(LottieSubscription.Pause, undefined);
        }
    }, [animationItem, subscriptionManager, setState]);
    // Stop
    const stop = useCallback(() => {
        if (animationItem) {
            animationItem.goToAndStop(1);
            setState(LottieState.Stopped);
            subscriptionManager.notify(LottieSubscription.Stop, undefined);
        }
    }, [animationItem, subscriptionManager, setState]);
    // Toggle looping
    const toggleLoop = useCallback(() => {
        if (animationItem) {
            animationItem.loop = !animationItem.loop;
            setLoop(animationItem.loop);
        }
    }, [animationItem]);
    // Set player speed
    const setSpeed = useCallback((speed) => {
        if (animationItem) {
            animationItem?.setSpeed(speed);
        }
    }, [animationItem]);
    /**
     * Change the current frame from the animation
     * @param value
     * @param isSeekingEnded
     */
    const seek = useCallback((value, isSeekingEnded) => {
        if (!animationItem) {
            return;
        }
        const seekInfo = getNumberFromNumberOrPercentage(value);
        if (!seekInfo) {
            return;
        }
        const frame = seekInfo.isPercentage
            ? (animationItem.totalFrames * seekInfo.number) / 100
            : seekInfo.number;
        setState((prevState) => {
            // Remember the state before seeking, so we can set it back when the seeking is done
            if (!isSeekingEnded && !stateBeforeSeeking) {
                setStateBeforeSeeking(prevState);
            }
            else if (isSeekingEnded && stateBeforeSeeking) {
                setStateBeforeSeeking(null);
            }
            const shouldPlayAfter = isSeekingEnded &&
                (prevState === LottieState.Playing || stateBeforeSeeking === LottieState.Playing);
            if (shouldPlayAfter) {
                animationItem?.goToAndPlay(frame, true);
                return LottieState.Playing;
            }
            else {
                animationItem?.goToAndStop(frame, true);
                if (prevState !== LottieState.Stopped) {
                    return LottieState.Paused;
                }
            }
            // Skip update
            return prevState;
        });
    }, [animationItem, setState, stateBeforeSeeking]);
    return {
        setContainerRef,
        animationItem,
        state,
        subscribe: subscriptionManager.subscribe,
        totalFrames: animationItem?.totalFrames ?? 0,
        loop,
        play,
        pause,
        stop,
        toggleLoop,
        setSpeed,
        seek,
    };
};

const PlayerContainer = (props) => {
    const { children, ...rest } = props;
    return (jsx("div", { ...rest, style: {
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            ...rest.style,
        }, children: children }, void 0));
};

/**
 * Container for displaying the animation
 * @param props
 * @param ref
 */
const _PlayerDisplay = (props, ref) => {
    const { children, ...rest } = props;
    // Warn about missing `ref` property
    useEffect(() => {
        if (!ref) {
            logger.warn("😬 Seems like you forgot to pass the `ref` property to the `PlayerContainer` component.");
        }
    }, [ref]);
    return (jsx("div", { ...rest, style: {
            display: "flex",
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            justifyContent: "center",
            ...rest.style,
        }, ref: ref, children: children }, void 0));
};
const PlayerDisplay = forwardRef(_PlayerDisplay);

/**
 * Add a div with padding to the left and right of `size` / 2
 */
const Spacer = ({ size }) => (jsx("div", { style: { paddingLeft: size / 2, paddingRight: size / 2 } }, void 0));

const styles = {
    container: {
        display: "flex",
        background: "rgb(77 77 77)",
        fontSize: 12,
        fontWeight: "500",
        color: "white",
        justifyContent: "center",
        borderRadius: 3,
    },
    frameSpan: {
        padding: "2px 2px",
        minWidth: 30,
        height: 25,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    },
    delimiterSpan: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    },
};
/**
 * Show the current frame and the total
 */
const PlayerControlsFramesIndicator = ({ subscribe, totalFrames, decimals, }) => {
    const containerRef = useRef(null);
    const _decimals = useMemo(() => decimals ?? 0, [decimals]);
    const getFrameSpanMinWidth = useCallback((numberLength) => 15 + numberLength * 7, []);
    /**
     * Listen for event regarding the `currentFrame`
     */
    useEffect(() => {
        if (subscribe) {
            return subscribe(LottieSubscription.Frame, ({ currentFrame }) => {
                if (containerRef.current) {
                    containerRef.current.innerText = currentFrame?.toFixed(_decimals);
                }
            });
        }
    }, [_decimals, subscribe]);
    return (jsxs("div", { style: styles.container, children: [jsx("span", { ref: containerRef, style: {
                    ...styles.frameSpan,
                    minWidth: getFrameSpanMinWidth(String(totalFrames).length + (_decimals ? _decimals + 1 : 0)),
                }, children: "0" }, void 0), jsx("span", { style: styles.delimiterSpan, children: "/" }, void 0), jsx("span", { style: {
                    ...styles.frameSpan,
                    minWidth: getFrameSpanMinWidth(String(totalFrames).length),
                }, children: totalFrames }, void 0)] }, void 0));
};

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z$1 = "input[type=range].player-controls-progress-bar{--range:calc(var(--max) - var(--min));--ratio:calc((var(--value) - var(--min))/var(--range));--sx:calc(1em + var(--ratio)*(100% - 2em));-webkit-appearance:none;background:none;margin:0;padding:0;width:100%}input[type=range].player-controls-progress-bar:disabled{cursor:default}input[type=range].player-controls-progress-bar:focus{outline:none}input[type=range].player-controls-progress-bar::-webkit-slider-runnable-track{background:linear-gradient(#00d1c1,#00d1c1) 0 /var(--sx) 100% no-repeat,#4d4d4d;border:0 solid transparent;border-radius:5px;box-shadow:0 0 0 transparent,0 0 0 hsla(0,0%,5%,0);cursor:pointer;height:10px;width:100%}input[type=range].player-controls-progress-bar:active::-webkit-slider-runnable-track,input[type=range].player-controls-progress-bar:hover::-webkit-slider-runnable-track{background:linear-gradient(#00ebd9,#00ebd9) 0 /var(--sx) 100% no-repeat,#5a5a5a}input[type=range].player-controls-progress-bar::-webkit-slider-thumb{-webkit-appearance:none;background:#007a87;border:0 solid transparent;border-radius:10px;box-shadow:0 0 0 transparent,0 0 0 hsla(0,0%,5%,0);cursor:pointer;height:20px;margin-top:-5px;width:20px}input[type=range].player-controls-progress-bar::-webkit-slider-thumb:hover{background:#0091a1}input[type=range].player-controls-progress-bar::-moz-range-track{background:linear-gradient(#00d1c1,#00d1c1) 0 /var(--sx) 100% no-repeat,#4d4d4d;border:0 solid transparent;border-radius:5px;box-shadow:0 0 0 transparent,0 0 0 hsla(0,0%,5%,0);cursor:pointer;height:10px;width:100%}input[type=range].player-controls-progress-bar:active::-moz-range-track,input[type=range].player-controls-progress-bar:hover::-moz-range-track{background:linear-gradient(#00ebd9,#00ebd9) 0 /var(--sx) 100% no-repeat,#5a5a5a}input[type=range].player-controls-progress-bar::-moz-range-progress{cursor:pointer}input[type=range].player-controls-progress-bar::-moz-range-thumb{background:#007a87;border:0 solid transparent;border-radius:10px;box-shadow:0 0 0 transparent,0 0 0 hsla(0,0%,5%,0);cursor:pointer;height:20px;width:20px}input[type=range].player-controls-progress-bar::-moz-range-thumb:hover{background:#0091a1}input[type=range].player-controls-progress-bar::-ms-track{background:transparent;border-color:transparent;border-width:20px 0;color:transparent;cursor:pointer;height:10px;width:100%}input[type=range].player-controls-progress-bar::-ms-fill-lower{background:#00b8a9;border:0 solid transparent;border-radius:10px;box-shadow:0 0 0 transparent,0 0 0 hsla(0,0%,5%,0)}input[type=range].player-controls-progress-bar:focus::-ms-fill-lower{background:#00d1c1}input[type=range].player-controls-progress-bar::-ms-fill-upper{background:#00d1c1;border:0 solid transparent;border-radius:10px;box-shadow:0 0 0 transparent,0 0 0 hsla(0,0%,5%,0)}input[type=range].player-controls-progress-bar:focus::-ms-fill-upper{background:#00ebd9}input[type=range].player-controls-progress-bar::-ms-thumb{background:#007a87;border:0 solid transparent;border-radius:10px;box-shadow:0 0 0 transparent,0 0 0 hsla(0,0%,5%,0);cursor:pointer;height:20px;width:20px}";
styleInject(css_248z$1);

/**
 * Component that show the animation's progress and offer ways to
 * select a new frame from `0` to `totalFrames`
 */
const PlayerControlsProgressBar = (props) => {
    const containerRef = useRef(null);
    const { totalFrames, subscribe, disabled, onChange } = props;
    const _totalFrames = totalFrames ?? 0;
    const isListeningForChanges = isFunction(onChange);
    /**
     * Listen for event regarding the `currentFrame`
     */
    useEffect(() => {
        if (subscribe) {
            return subscribe(LottieSubscription.Frame, ({ currentFrame }) => {
                if (containerRef.current) {
                    // Update the `value` of the input range
                    containerRef.current.value = String(currentFrame);
                    // Set the `--value` CSS value so the styling can adapt
                    containerRef.current.style.setProperty("--value", `${currentFrame}`);
                }
            });
        }
    }, [subscribe]);
    /**
     * Handle any changes of the progress bar
     * @param event
     */
    const onChangeHandler = (event) => {
        const newFrame = Number(event.target.value);
        if (isListeningForChanges) {
            onChange?.(newFrame);
        }
    };
    /**
     * Handle mouse up on progress bar
     */
    const onMouseUpHandler = () => {
        if (isListeningForChanges && containerRef.current) {
            onChange?.(Number(containerRef.current.value), true);
        }
    };
    return (jsx("div", { style: { flex: 1 }, children: jsx("input", { ref: containerRef, disabled: disabled || !_totalFrames, className: "player-controls-progress-bar", type: "range", style: {
                /**
                 * Set the current progress percentage as a CSS var, so it can be used in the style
                 * to properly customize the input range styling across browsers
                 *
                 * Source: https://toughengineer.github.io/demo/slider-styler/slider-styler.html
                 */
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                "--min": 0,
                "--max": _totalFrames,
                // "--value": 0,
            }, onChange: onChangeHandler, onMouseUp: onMouseUpHandler, min: 0, max: _totalFrames, step: 0.001 }, void 0) }, void 0));
};

const config = {
    accentColor: "#00d1c1",
    whiteColor: "#ffffff",
};

const SvgButton = ({ children, onClick }) => (jsx("button", { style: {
        background: "rgb(77 77 77)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        width: 30,
        height: 25,
        borderRadius: 3,
        cursor: "pointer",
        border: 0,
    }, onClick: onClick, children: children }, void 0));

// TODO: add support for numbers on `isOn` (for how many times)
const LoopButton = ({ isOn, onClick }) => (jsx(SvgButton, { onClick: onClick, children: jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "100%", height: "100%", viewBox: "0 0 24 24", children: jsx("path", { d: "M2 12c0 .999.381 1.902.989 2.604l-1.098.732-.587.392c-.814-1.025-1.304-2.318-1.304-3.728 0-3.313 2.687-6 6-6h9v-3l6 4-6 4v-3h-9c-2.206 0-4 1.794-4 4zm20.696-3.728l-.587.392-1.098.732c.608.702.989 1.605.989 2.604 0 2.206-1.795 4-4 4h-9v-3l-6 4 6 4v-3h9c3.313 0 6-2.687 6-6 0-1.41-.489-2.703-1.304-3.728z", fill: !isOn ? "#ffffff" : config.accentColor }, void 0) }, void 0) }, void 0));

const PauseButton = ({ onClick }) => (jsx(SvgButton, { onClick: onClick, children: jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "100%", height: "100%", viewBox: "0 0 24 24", children: jsx("path", { d: "M10 24h-6v-24h6v24zm10-24h-6v24h6v-24z", fill: config.whiteColor }, void 0) }, void 0) }, void 0));

const PlayButton = ({ onClick }) => (jsx(SvgButton, { onClick: onClick, children: jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "100%", height: "100%", viewBox: "0 0 24 24", children: jsx("path", { d: "M2 24v-24l20 12-20 12z", fill: config.whiteColor }, void 0) }, void 0) }, void 0));

const PlayerControls = (props) => {
    const { show, elements, state, totalFrames, loop, play, pause, seek, toggleLoop, subscribe } = props;
    /**
     * Checks if the consumer have any preference on what elements we should display
     */
    const shouldShowElement = useCallback((element) => {
        // If specific elements weren't specified, display all
        if (!elements || !Array.isArray(elements)) {
            return true;
        }
        // Otherwise, display if `element` is in `elements` array
        return elements.includes(element);
    }, [elements]);
    if (!show) {
        return null;
    }
    return (jsxs("div", { style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 10,
            paddingBottom: 10,
        }, children: [shouldShowElement(PlayerControlsElement.Play) && state !== LottieState.Playing && (jsxs(Fragment, { children: [jsx(PlayButton, { onClick: play }, void 0), jsx(Spacer, { size: 10 }, void 0)] }, void 0)), shouldShowElement(PlayerControlsElement.Pause) && state === LottieState.Playing && (jsxs(Fragment, { children: [jsx(PauseButton, { onClick: pause }, void 0), jsx(Spacer, { size: 10 }, void 0)] }, void 0)), shouldShowElement(PlayerControlsElement.FramesIndicator) && (jsxs(Fragment, { children: [jsx(PlayerControlsFramesIndicator, { subscribe: subscribe, totalFrames: totalFrames || 0, decimals: 0 }, void 0), jsx(Spacer, { size: 10 }, void 0)] }, void 0)), shouldShowElement(PlayerControlsElement.ProgressBar) && (jsxs(Fragment, { children: [jsx(PlayerControlsProgressBar, { subscribe: subscribe, totalFrames: totalFrames, onChange: (progress, isDraggingEnded) => {
                            seek(progress, !!isDraggingEnded);
                        } }, void 0), jsx(Spacer, { size: 10 }, void 0)] }, void 0)), shouldShowElement(PlayerControlsElement.Loop) && (jsx(LoopButton, { isOn: loop, onClick: toggleLoop }, void 0))] }, void 0));
};

/**
 * Add a div with padding to the left and right of `size` / 2
 */
const PlayerOverlay = ({ children, style, ...rest }) => (jsx("div", { ...rest, style: {
        position: "absolute",
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,122,135,0.7)",
        zIndex: 1,
        ...style,
    }, children: children }, void 0));

/**
 * Component that is displayed when the player is in the Error state
 */
const PlayerFailure = ({ show, Component, Content }) => {
    if (!show) {
        return null;
    }
    if (Component) {
        return Component;
    }
    return jsx(PlayerOverlay, { children: Content ? Content : "Couldn't load the animation" }, void 0);
};

var css_248z = ".player-loading-spinner{display:inline-block;height:80px;position:relative;width:80px}.player-loading-spinner div{-webkit-animation:player-loading-spinner-animation 1s cubic-bezier(0,.2,.8,1) infinite;animation:player-loading-spinner-animation 1s cubic-bezier(0,.2,.8,1) infinite;border:4px solid #fff;border-radius:50%;opacity:1;position:absolute}.player-loading-spinner div:nth-child(2){-webkit-animation-delay:-.5s;animation-delay:-.5s}@-webkit-keyframes player-loading-spinner-animation{0%{height:0;left:45%;opacity:1;top:45%;width:0}to{height:90%;left:0;opacity:0;top:0;width:90%}}@keyframes player-loading-spinner-animation{0%{height:0;left:45%;opacity:1;top:45%;width:0}to{height:90%;left:0;opacity:0;top:0;width:90%}}";
styleInject(css_248z);

/**
 * Component that is displayed when the player is in the Loading state
 */
const PlayerLoading = ({ show, Component, Content, color = "#FFFFFF", size = 80, }) => {
    if (!show) {
        return null;
    }
    if (Component) {
        return Component;
    }
    const circles = [...Array(2).keys()].map((_, index) => (jsx("div", { style: {
            borderColor: `${color}`,
            borderWidth: size * 0.05,
        } }, index)));
    return (jsx(PlayerOverlay, { children: Content ? (Content) : (jsx("div", { className: "player-loading-spinner", style: { width: size, height: size }, children: circles }, void 0)) }, void 0));
};

/**
 * Lottie's animation component
 *
 * TODO: change `Record<string, unknown>` in the actual type of the Ref
 *
 * @param props
 * @param ref
 */
const _Lottie = (props, ref) => {
    const { src, initialValues, enableReinitialize, controls, subscriptions, LoadingOverlay, FailureOverlay, LoadingOverlayContent, FailureOverlayContent, } = props;
    const { setContainerRef, state, totalFrames, loop, play, pause, toggleLoop, seek, subscribe } = useLottie({
        src,
        initialValues,
        enableReinitialize,
        subscriptions,
    });
    return (jsxs(PlayerContainer, { children: [jsx(PlayerLoading, { show: state === LottieState.Loading, Component: LoadingOverlay, Content: LoadingOverlayContent }, void 0), jsx(PlayerFailure, { show: state === LottieState.Failure, Component: FailureOverlay, Content: FailureOverlayContent }, void 0), jsx(PlayerDisplay, { ref: setContainerRef }, void 0), jsx(PlayerControls, { show: state !== LottieState.Loading && state !== LottieState.Failure && !!controls, elements: Array.isArray(controls) ? controls : undefined, state: state, totalFrames: totalFrames, loop: loop, play: play, pause: pause, seek: seek, toggleLoop: toggleLoop, subscribe: subscribe }, void 0)] }, void 0));
};
const Lottie = forwardRef(_Lottie);

export { AnimationRenderer, Lottie, LottieState, LottieSubscription, PlayerContainer, PlayerControls, PlayerControlsElement, PlayerDisplay, Lottie as default, useLottie };
//# sourceMappingURL=index.esm.js.map
