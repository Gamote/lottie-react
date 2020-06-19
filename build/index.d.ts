import { AnimationDirection, AnimationSegment } from 'lottie-web';
export { default as LottiePlayer } from 'lottie-web';
import React, { MutableRefObject, AnimationEventHandler, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, CSSProperties, ReactElement } from 'react';

declare type LottieRefCurrentProps = {
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
declare type LottieRef = MutableRefObject<LottieRefCurrentProps>;
declare type LottieOptions = {
    animationData: object;
    loop?: boolean | number;
    autoplay?: boolean;
    initialSegment?: number[] | null;
} & {
    ref?: LottieRef;
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
declare type LottieComponentProps = React.HTMLProps<HTMLDivElement> & LottieOptions;

declare const Lottie: ForwardRefExoticComponent<PropsWithoutRef<LottieComponentProps> & RefAttributes<LottieRefCurrentProps>>;

declare const useLottie: (props: LottieOptions, style?: CSSProperties | undefined) => {
    View: ReactElement;
} & LottieRefCurrentProps;

declare const Animator: typeof Lottie;
declare const useAnimator: typeof useLottie;

export default Lottie;
export { Animator, LottieComponentProps, LottieOptions, LottieRef, LottieRefCurrentProps, useAnimator, useLottie };
