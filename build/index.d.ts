/// <reference types="react" />
import { AnimationDirection, AnimationSegment, AnimationItem, SVGRendererConfig, CanvasRendererConfig, HTMLRendererConfig, AnimationEventName } from 'lottie-web';
export { default as LottiePlayer } from 'lottie-web';
import React, { MutableRefObject, AnimationEventHandler, ReactElement } from 'react';
import { Validator, InferProps, Requireable } from 'prop-types';

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
    getDuration: (inFrames?: boolean) => number | undefined;
    destroy: () => void;
    animationLoaded: boolean;
    animationItem: AnimationItem | undefined;
};
declare type LottieRef = MutableRefObject<LottieRefCurrentProps | null>;
declare type LottieOptions = {
    animationData: object;
    renderer?: "svg" | "canvas" | "html";
    loop?: boolean | number;
    autoplay?: boolean;
    name?: string;
    assetsPath?: string;
    rendererSettings?: SVGRendererConfig | CanvasRendererConfig | HTMLRendererConfig;
    initialSegment?: AnimationSegment;
} & {
    lottieRef?: LottieRef;
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
} & React.HTMLProps<HTMLDivElement>;
declare type PartialLottieOptions = Omit<LottieOptions, "animationData"> & {
    animationData?: LottieOptions["animationData"];
};
declare type LottieComponentProps = LottieOptions & React.HTMLProps<HTMLDivElement> & {
    interactivity?: Omit<InteractivityProps, "lottieObj">;
};
declare type PartialLottieComponentProps = Omit<LottieComponentProps, "animationData"> & {
    animationData?: LottieOptions["animationData"];
};
declare type Listener = {
    name: AnimationEventName;
    handler: AnimationEventHandler;
};
declare type PartialListener = Omit<Listener, "handler"> & {
    handler?: Listener["handler"] | null;
};
declare type Axis = "x" | "y";
declare type Position = {
    [key in Axis]: number | [number, number];
};
declare type Action = {
    type: "seek" | "play" | "stop" | "loop";
    frames: [number] | [number, number];
    visibility?: [number, number];
    position?: Position;
};
declare type InteractivityProps = {
    lottieObj: {
        View: ReactElement;
    } & LottieRefCurrentProps;
    actions: Action[];
    mode: "scroll" | "cursor";
};

declare const Lottie: {
    (props: LottieComponentProps): ReactElement<any, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)>;
    propTypes: {
        animationData: Validator<InferProps<any>>;
        loop: Requireable<number | boolean>;
        autoplay: Requireable<boolean>;
        initialSegment: Requireable<number[]>;
        onComplete: Requireable<(...args: any[]) => any>;
        onLoopComplete: Requireable<(...args: any[]) => any>;
        onEnterFrame: Requireable<(...args: any[]) => any>;
        onSegmentStart: Requireable<(...args: any[]) => any>;
        onConfigReady: Requireable<(...args: any[]) => any>;
        onDataReady: Requireable<(...args: any[]) => any>;
        onDataFailed: Requireable<(...args: any[]) => any>;
        onLoadedImages: Requireable<(...args: any[]) => any>;
        onDOMLoaded: Requireable<(...args: any[]) => any>;
        onDestroy: Requireable<(...args: any[]) => any>;
        style: Requireable<InferProps<any>>;
    };
    defaultProps: {
        loop: boolean;
        autoplay: boolean;
        initialSegment: null;
        onComplete: null;
        onLoopComplete: null;
        onEnterFrame: null;
        onSegmentStart: null;
        onConfigReady: null;
        onDataReady: null;
        onDataFailed: null;
        onLoadedImages: null;
        onDOMLoaded: null;
        onDestroy: null;
        style: undefined;
    };
};

declare const useLottie: (props: LottieOptions, style?: React.CSSProperties | undefined) => {
    View: ReactElement;
} & LottieRefCurrentProps;

declare const useLottieInteractivity: ({ actions, mode, lottieObj, }: InteractivityProps) => ReactElement;

declare const Animator: typeof Lottie;
declare const useAnimator: typeof useLottie;

export default Lottie;
export { Action, Animator, Axis, InteractivityProps, Listener, LottieComponentProps, LottieOptions, LottieRef, LottieRefCurrentProps, PartialListener, PartialLottieComponentProps, PartialLottieOptions, Position, useAnimator, useLottie, useLottieInteractivity };
