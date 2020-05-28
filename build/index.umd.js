(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lottie-web'), require('react'), require('prop-types')) :
  typeof define === 'function' && define.amd ? define(['exports', 'lottie-web', 'react', 'prop-types'], factory) :
  (global = global || self, factory(global['lottie-react'] = {}, global.Lottie, global.React, global.PropTypes));
}(this, (function (exports, lottie, React, PropTypes) { 'use strict';

  lottie = lottie && Object.prototype.hasOwnProperty.call(lottie, 'default') ? lottie['default'] : lottie;
  var React__default = 'default' in React ? React['default'] : React;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};

    var target = _objectWithoutPropertiesLoose(source, excluded);

    var key, i;

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }

    return target;
  }

  var useLottie = function useLottie(props) {
    var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    var animationData = props.animationData,
        loop = props.loop,
        autoplay = props.autoplay,
        initialSegment = props.initialSegment,
        onComplete = props.onComplete,
        onLoopComplete = props.onLoopComplete,
        onEnterFrame = props.onEnterFrame,
        onSegmentStart = props.onSegmentStart,
        onConfigReady = props.onConfigReady,
        onDataReady = props.onDataReady,
        onDataFailed = props.onDataFailed,
        onLoadedImages = props.onLoadedImages,
        onDOMLoaded = props.onDOMLoaded,
        onDestroy = props.onDestroy;
    var animationInstanceRef = React.useRef();
    var animationContainer = React.useRef(null);
    /*
        ======================================
            INTERACTION METHODS
        ======================================
     */

    /**
     * Play
     * TODO: complete
     */

    var play = function play() {
      if (animationInstanceRef.current) {
        animationInstanceRef.current.play();
      }
    };
    /**
     * Stop
     * TODO: complete
     */


    var stop = function stop() {
      if (animationInstanceRef.current) {
        animationInstanceRef.current.stop();
      }
    };
    /**
     * Pause
     * TODO: complete
     */


    var pause = function pause() {
      if (animationInstanceRef.current) {
        animationInstanceRef.current.pause();
      }
    };
    /**
     * Set animation speed
     * TODO: complete
     * @param speed
     */


    var setSpeed = function setSpeed(speed) {
      if (animationInstanceRef.current) {
        animationInstanceRef.current.setSpeed(speed);
      }
    };
    /**
     * Got to frame and play
     * TODO: complete
     * @param value
     * @param isFrame
     */


    var goToAndPlay = function goToAndPlay(value, isFrame) {
      if (animationInstanceRef.current) {
        animationInstanceRef.current.goToAndPlay(value, isFrame);
      }
    };
    /**
     * Got to frame and stop
     * TODO: complete
     * @param value
     * @param isFrame
     */


    var goToAndStop = function goToAndStop(value, isFrame) {
      if (animationInstanceRef.current) {
        animationInstanceRef.current.goToAndStop(value, isFrame);
      }
    };
    /**
     * Set animation direction
     * TODO: complete
     * @param direction
     */


    var setDirection = function setDirection(direction) {
      if (animationInstanceRef.current) {
        animationInstanceRef.current.setDirection(direction);
      }
    };
    /**
     * Play animation segments
     * TODO: complete
     * @param segment
     * @param force
     */


    var playSegments = function playSegments(segment, force) {
      if (animationInstanceRef.current) {
        animationInstanceRef.current.playSegments(segment, force);
      }
    };
    /**
     * Set sub frames
     * TODO: complete
     * @param useSubFrames
     */


    var setSubframe = function setSubframe(useSubFrames) {
      if (animationInstanceRef.current) {
        animationInstanceRef.current.setSubframe(useSubFrames);
      }
    };
    /**
     * Destroy animation
     * TODO: complete
     */


    var destroy = function destroy() {
      if (animationInstanceRef.current) {
        animationInstanceRef.current.destroy();
      }
    };
    /**
     * Get animation duration
     * TODO: complete
     * @param inFrames
     */


    var getDuration = function getDuration(inFrames) {
      if (animationInstanceRef.current) {
        return animationInstanceRef.current.getDuration(inFrames);
      }

      return undefined;
    };
    /*
        ======================================
            LOTTIE
        ======================================
     */

    /**
     * Load a new animation, and if it's the case, destroy the previous one
     * @param {Object} forcedConfigs
     */


    var loadAnimation = function loadAnimation() {
      var forcedConfigs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // Return if the container ref is null
      if (!animationContainer.current) {
        return;
      } // Destroy any previous instance


      if (animationInstanceRef.current) {
        animationInstanceRef.current.destroy();
      } // Build the animation configuration


      var config = _objectSpread2(_objectSpread2(_objectSpread2({}, props), forcedConfigs), {}, {
        container: animationContainer.current
      }); // Save the animation instance


      animationInstanceRef.current = lottie.loadAnimation(config);
    };
    /**
     * Initialize and listen for changes that need to reinitialize Lottie
     */


    React.useEffect(function () {
      loadAnimation();
    }, [animationData, loop, autoplay, initialSegment]);
    /*
        ======================================
            EVENTS
        ======================================
     */

    /**
     * Handle the process of adding an event listener
     * @param {AnimationEventName} eventName
     * @param {AnimationEventHandler} eventHandler
     * @return {Function} Function that deregister the listener
     */

    var addEventListenerHelper = function addEventListenerHelper(eventName, eventHandler) {
      if (animationInstanceRef.current && eventName && eventHandler) {
        animationInstanceRef.current.addEventListener(eventName, eventHandler); // Return a function to deregister this listener

        return function () {
          var _a;

          (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener(eventName, eventHandler);
        };
      }

      return function () {};
    };
    /**
     * Reinitialize listener on change
     */


    React.useEffect(function () {
      var listeners = [{
        name: "complete",
        handler: onComplete
      }, {
        name: "loopComplete",
        handler: onLoopComplete
      }, {
        name: "enterFrame",
        handler: onEnterFrame
      }, {
        name: "segmentStart",
        handler: onSegmentStart
      }, {
        name: "config_ready",
        handler: onConfigReady
      }, {
        name: "data_ready",
        handler: onDataReady
      }, {
        name: "data_failed",
        handler: onDataFailed
      }, {
        name: "loaded_images",
        handler: onLoadedImages
      }, {
        name: "DOMLoaded",
        handler: onDOMLoaded
      }, {
        name: "destroy",
        handler: onDestroy
      }];
      var deregisterList = listeners.map(function (event) {
        return addEventListenerHelper(event.name, event.handler);
      }); // Deregister listeners on unmount

      return function () {
        deregisterList.forEach(function (deregister) {
          return deregister();
        });
      };
    }, [onComplete, onLoopComplete, onEnterFrame, onSegmentStart, onConfigReady, onDataReady, onDataFailed, onLoadedImages, onDOMLoaded, onDestroy]);
    /**
     * Build the animation view
     */

    var View = React__default.createElement("div", {
      style: style,
      ref: animationContainer
    });
    return {
      View: View,
      play: play,
      stop: stop,
      pause: pause,
      setSpeed: setSpeed,
      goToAndStop: goToAndStop,
      goToAndPlay: goToAndPlay,
      setDirection: setDirection,
      playSegments: playSegments,
      setSubframe: setSubframe,
      destroy: destroy,
      getDuration: getDuration
    };
  };

  var Lottie = React.forwardRef(function (props, ref) {
    var style = props.style,
        lottieProps = _objectWithoutProperties(props, ["style"]); // TODO: find a better was to specified the ref type
    //  instead of redefining


    var parentRef = ref;
    /**
     * Initialize the 'useLottie' hook
     */

    var _useLottie = useLottie(lottieProps, style),
        View = _useLottie.View,
        play = _useLottie.play,
        stop = _useLottie.stop,
        pause = _useLottie.pause,
        setSpeed = _useLottie.setSpeed,
        goToAndStop = _useLottie.goToAndStop,
        goToAndPlay = _useLottie.goToAndPlay,
        setDirection = _useLottie.setDirection,
        playSegments = _useLottie.playSegments,
        setSubframe = _useLottie.setSubframe,
        destroy = _useLottie.destroy,
        getDuration = _useLottie.getDuration;
    /**
     * Share methods which control Lottie to the parent component
     */


    React.useEffect(function () {
      if (parentRef) {
        parentRef.current = {
          play: play,
          stop: stop,
          pause: pause,
          setSpeed: setSpeed,
          goToAndPlay: goToAndPlay,
          goToAndStop: goToAndStop,
          setDirection: setDirection,
          playSegments: playSegments,
          setSubframe: setSubframe,
          destroy: destroy,
          getDuration: getDuration
        };
      }
    }, [parentRef.current]);
    return View;
  });
  Lottie.propTypes = {
    animationData: PropTypes.shape(undefined).isRequired,
    loop: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    autoplay: PropTypes.bool,
    initialSegment: PropTypes.arrayOf(PropTypes.number.isRequired),
    onComplete: PropTypes.func,
    onLoopComplete: PropTypes.func,
    onEnterFrame: PropTypes.func,
    onSegmentStart: PropTypes.func,
    onConfigReady: PropTypes.func,
    onDataReady: PropTypes.func,
    onDataFailed: PropTypes.func,
    onLoadedImages: PropTypes.func,
    onDOMLoaded: PropTypes.func,
    onDestroy: PropTypes.func,
    style: PropTypes.shape(undefined)
  };
  Lottie.defaultProps = {
    loop: true,
    autoplay: true,
    initialSegment: null,
    onComplete: null,
    onLoopComplete: null,
    onEnterFrame: null,
    onSegmentStart: null,
    onConfigReady: null,
    onDataReady: null,
    onDataFailed: null,
    onLoadedImages: null,
    onDOMLoaded: null,
    onDestroy: null,
    style: undefined
  };

  var Animator = Lottie;
  var useAnimator = useLottie;

  exports.LottiePlayer = lottie;
  exports.Animator = Animator;
  exports.default = Lottie;
  exports.useAnimator = useAnimator;
  exports.useLottie = useLottie;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.umd.js.map
