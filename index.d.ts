/// <reference types="react" />
import { AnimationDirection, AnimationSegment, AnimationItem, AnimationConfigWithData, AnimationEventName } from 'lottie-web';
export { default as LottiePlayer } from 'lottie-web';
import * as React from 'react';
import React__default, { MutableRefObject, AnimationEventHandler, ReactElement } from 'react';

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
declare type LottieOptions = AnimationConfigWithData & {
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
} & React__default.HTMLProps<HTMLDivElement>;
declare type PartialLottieOptions = Omit<LottieOptions, "animationData"> & {
    animationData?: LottieOptions["animationData"];
};
declare type LottieComponentProps = LottieOptions & React__default.HTMLProps<HTMLDivElement> & {
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

declare const Lottie: (props: LottieComponentProps) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;

declare const useLottie: (props: LottieOptions, style?: React__default.CSSProperties | undefined) => {
    View: ReactElement;
} & LottieRefCurrentProps;

declare const useLottieInteractivity: ({ actions, mode, lottieObj, }: InteractivityProps) => ReactElement;

declare const Animator: typeof Lottie;
declare const useAnimator: typeof useLottie;

export { Action, Animator, Axis, InteractivityProps, Listener, LottieComponentProps, LottieOptions, LottieRef, LottieRefCurrentProps, PartialListener, PartialLottieComponentProps, PartialLottieOptions, Position, Lottie as default, useAnimator, useLottie, useLottieInteractivity };
