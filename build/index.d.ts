import { AnimationDirection, AnimationSegment } from 'lottie-web';
export { default as LottiePlayer } from 'lottie-web';
import { AnimationEventHandler, CSSProperties, MutableRefObject, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, ReactElement } from 'react';

declare type LottieOptionsType = {
    animationData: object;
    loop?: boolean | number;
    autoplay?: boolean;
    initialSegment?: number[] | null;
    onComplete?: AnimationEventHandler | null;
    onLoopComplete?: AnimationEventHandler | null;
    onEnterFrame?: AnimationEventHandler | null;
    onSegmentStart?: AnimationEventHandler | null;
    onConfigReady?: AnimationEventHandler | null;
    onDataReady?: AnimationEventHandler | null;
    onDataFailed?: AnimationEventHandler | null;
    onLoadedImages?: AnimationEventHandler | null;
    onDOMLoaded?: AnimationEventHandler | null;
    onDestroy?: AnimationEventHandler | null;
};
declare type LottieComponentProps = LottieOptionsType & {
    style?: CSSProperties;
};
declare type LottieRefCurrentType = {
    play: () => void;
    stop: () => void;
    pause: () => void;
    setSpeed: (speed: number) => void;
    goToAndStop: (value: number, isFrame?: boolean) => void;
    goToAndPlay: (value: number, isFrame?: boolean) => void;
    setDirection: (direction: AnimationDirection) => void;
    playSegments: (segments: AnimationSegment | AnimationSegment[], forceFlag?: boolean) => void;
    setSubframe: (useSubFrames: boolean) => void;
    destroy: () => void;
    getDuration: (inFrames?: boolean) => number | undefined;
};
declare type LottieRefType = MutableRefObject<LottieRefCurrentType>;

declare const Lottie: ForwardRefExoticComponent<PropsWithoutRef<LottieComponentProps> & RefAttributes<LottieRefCurrentType>>;

declare const useLottie: (props: LottieOptionsType, style?: CSSProperties | undefined) => {
    View: ReactElement;
} & LottieRefCurrentType;

declare const Animator: typeof Lottie;
declare const useAnimator: typeof useLottie;

export default Lottie;
export { Animator, LottieComponentProps, LottieOptionsType, LottieRefCurrentType, LottieRefType, useAnimator, useLottie };
