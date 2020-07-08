import lottie from 'lottie-web';
export { default as LottiePlayer } from 'lottie-web';
import React, { useState, useRef, useEffect } from 'react';
import { shape, oneOfType, bool, number, arrayOf, func } from 'prop-types';

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

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var useLottie = function useLottie(props, style) {
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

  var _useState = useState(false),
      _useState2 = _slicedToArray(_useState, 2),
      animationLoaded = _useState2[0],
      setAnimationLoaded = _useState2[1];

  var animationInstanceRef = useRef();
  var animationContainer = useRef(null);
  /*
        ======================================
            INTERACTION METHODS
        ======================================
     */

  /**
   * Play
   */

  var play = function play() {
    var _a;

    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.play();
  };
  /**
   * Stop
   */


  var stop = function stop() {
    var _a;

    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.stop();
  };
  /**
   * Pause
   */


  var pause = function pause() {
    var _a;

    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.pause();
  };
  /**
   * Set animation speed
   * @param speed
   */


  var setSpeed = function setSpeed(speed) {
    var _a;

    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.setSpeed(speed);
  };
  /**
   * Got to frame and play
   * @param value
   * @param isFrame
   */


  var goToAndPlay = function goToAndPlay(value, isFrame) {
    var _a;

    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.goToAndPlay(value, isFrame);
  };
  /**
   * Got to frame and stop
   * @param value
   * @param isFrame
   */


  var goToAndStop = function goToAndStop(value, isFrame) {
    var _a;

    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.goToAndStop(value, isFrame);
  };
  /**
   * Set animation direction
   * @param direction
   */


  var setDirection = function setDirection(direction) {
    var _a;

    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.setDirection(direction);
  };
  /**
   * Play animation segments
   * @param segments
   * @param forceFlag
   */


  var playSegments = function playSegments(segments, forceFlag) {
    var _a;

    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.playSegments(segments, forceFlag);
  };
  /**
   * Set sub frames
   * @param useSubFrames
   */


  var setSubframe = function setSubframe(useSubFrames) {
    var _a;

    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.setSubframe(useSubFrames);
  };
  /**
   * Get animation duration
   * @param inFrames
   */


  var getDuration = function getDuration(inFrames) {
    var _a;

    return (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.getDuration(inFrames);
  };
  /**
   * Destroy animation
   */


  var destroy = function destroy() {
    var _a;

    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.destroy();
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

    var _a; // Return if the container ref is null


    if (!animationContainer.current) {
      return;
    } // Destroy any previous instance


    (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.destroy(); // Build the animation configuration

    var config = _objectSpread2(_objectSpread2(_objectSpread2({}, props), forcedConfigs), {}, {
      container: animationContainer.current
    }); // Save the animation instance


    animationInstanceRef.current = lottie.loadAnimation(config);
    setAnimationLoaded(!!animationInstanceRef.current);
  };
  /**
   * Initialize and listen for changes that need to reinitialize Lottie
   */


  useEffect(function () {
    loadAnimation();
  }, [animationData, loop, autoplay, initialSegment]);
  /*
        ======================================
            EVENTS
        ======================================
     */

  /**
   * Reinitialize listener on change
   */

  useEffect(function () {
    var partialListeners = [{
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
    var listeners = partialListeners.filter(function (listener) {
      return listener.handler != null;
    });

    if (!listeners.length) {
      return;
    }

    var deregisterList = listeners.map(
    /**
     * Handle the process of adding an event listener
     * @param {Listener} listener
     * @return {Function} Function that deregister the listener
     */
    function (listener) {
      var _a;

      (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.addEventListener(listener.name, listener.handler); // Return a function to deregister this listener

      return function () {
        var _a;

        (_a = animationInstanceRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener(listener.name, listener.handler);
      };
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

  var View = /*#__PURE__*/React.createElement("div", {
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
    getDuration: getDuration,
    destroy: destroy,
    animationLoaded: animationLoaded,
    animationItem: animationInstanceRef.current
  };
};

var Lottie = function Lottie(props) {
  var _a;

  var style = props.style,
      lottieProps = _objectWithoutProperties(props, ["style"]);
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
      getDuration = _useLottie.getDuration,
      destroy = _useLottie.destroy,
      animationLoaded = _useLottie.animationLoaded,
      animationItem = _useLottie.animationItem;
  /**
   * Make the hook variables/methods available through the provided 'lottieRef'
   */


  useEffect(function () {
    if (props.lottieRef) {
      props.lottieRef.current = {
        play: play,
        stop: stop,
        pause: pause,
        setSpeed: setSpeed,
        goToAndPlay: goToAndPlay,
        goToAndStop: goToAndStop,
        setDirection: setDirection,
        playSegments: playSegments,
        setSubframe: setSubframe,
        getDuration: getDuration,
        destroy: destroy,
        animationLoaded: animationLoaded,
        animationItem: animationItem
      };
    }
  }, [(_a = props.lottieRef) === null || _a === void 0 ? void 0 : _a.current]);
  return View;
};

Lottie.propTypes = {
  animationData: shape(undefined).isRequired,
  loop: oneOfType([bool, number]),
  autoplay: bool,
  initialSegment: arrayOf(number.isRequired),
  onComplete: func,
  onLoopComplete: func,
  onEnterFrame: func,
  onSegmentStart: func,
  onConfigReady: func,
  onDataReady: func,
  onDataFailed: func,
  onLoadedImages: func,
  onDOMLoaded: func,
  onDestroy: func,
  style: shape(undefined)
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

export default Lottie;
export { Animator, useAnimator, useLottie };
//# sourceMappingURL=index.es.js.map
