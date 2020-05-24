(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('prop-types'), require('lottie-web')) :
    typeof define === 'function' && define.amd ? define(['exports', 'react', 'prop-types', 'lottie-web'], factory) :
    (global = global || self, factory(global['lottie-react'] = {}, global.React, global.PropTypes, global.Lottie));
}(this, (function (exports, React, PropTypes, lottie) { 'use strict';

    var React__default = 'default' in React ? React['default'] : React;
    PropTypes = PropTypes && Object.prototype.hasOwnProperty.call(PropTypes, 'default') ? PropTypes['default'] : PropTypes;
    lottie = lottie && Object.prototype.hasOwnProperty.call(lottie, 'default') ? lottie['default'] : lottie;

    var useLottie = function useLottie(props) {
      var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
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
      var animationInstanceRef = React.useRef(null);
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
       * @param {Object} forceOptions
       */


      var loadAnimation = function loadAnimation() {
        var forceOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (animationInstanceRef.current) {
          animationInstanceRef.current.destroy();
        }

        var config = Object.assign(Object.assign({
          animationData: animationData || null,
          loop: !Number.isNaN(loop) ? loop : loop !== false,
          autoplay: autoplay !== false,
          initialSegment: initialSegment || null
        }, forceOptions), {
          container: animationContainer.current
        });
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
       * @param {String} eventName
       * @param {Function} eventHandler
       * @param {Boolean} removePreviousListeners
       * @return {Function} Function that deregister the listener
       */

      var addEventListenerHelper = function addEventListenerHelper(eventName, eventHandler) {
        var removePreviousListeners = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        if (animationInstanceRef.current) {
          if (removePreviousListeners) {
            animationInstanceRef.current.removeEventListener(eventName);
          }

          if (eventName && eventHandler) {
            animationInstanceRef.current.addEventListener(eventName, eventHandler); // Return a function to deregister the event

            return function () {
              // TODO: Should we remove all the listeners?
              animationInstanceRef.current.removeEventListener(eventName, eventHandler);
            };
          }
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
        }); // Deregister events on unmount

        return function () {
          deregisterList.forEach(function (deregister) {
            return deregister();
          });
        };
      }, [onComplete, onLoopComplete, onEnterFrame, onSegmentStart, onConfigReady, onDataReady, onDataFailed, onLoadedImages, onDOMLoaded, onDestroy]);
      /**
       * ALPHA
       */
      // Detect changes of the loop param and change it without reloading the animation
      // TODO: needs intensive testing
      // useEffect(() => {
      // 	if (animationInstanceRef.current.loop !== loop) {
      // 		animationInstanceRef.current.loop = loop;
      // 	}
      //
      // 	// // TODO: decide if this is a desired behavior
      // 	// if (animationInstanceRef.current.isPaused) {
      // 	// 	animationInstanceRef.current.play();
      // 	// }
      // }, [loop]);

      /**
       * Build the animation view
       */

      var View = /*#__PURE__*/React__default.createElement("div", {
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

    var __rest = undefined && undefined.__rest || function (s, e) {
      var t = {};

      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
      }

      if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
      return t;
    };
    var Lottie = React.forwardRef(function (props, ref) {
      var style = props.style,
          lottieProps = __rest(props, ["style"]);

      var parentRef = ref || React.useRef();
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
      initialSegment: PropTypes.arrayOf(PropTypes.shape(PropTypes.number.isRequired)),
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
      style: null
    };

    var Animator = Lottie;
    var useAnimator = useLottie;

    exports.Animator = Animator;
    exports.default = Lottie;
    exports.useAnimator = useAnimator;
    exports.useLottie = useLottie;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.umd.js.map
