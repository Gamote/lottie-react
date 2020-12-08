<p align="center">
  <a href="https://www.npmjs.com/lottie-react" target="blank"><img src="https://svgshare.com/i/RtR.svg" width="500" alt="lottie-react Logo" /></a>
</p>

<p align="center">A lightweight <a href="https://reactjs.org" target="_blank">React</a> library for rendering complex After Effects animations in real time using <a href="https://airbnb.design/lottie" target="_blank">Lottie</a>.</p>

<p align="center">
    <a href="https://www.npmjs.com/lottie-react" target="_blank"><img src="https://img.shields.io/npm/v/lottie-react.svg" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/lottie-react" target="_blank"><img src="https://img.shields.io/npm/l/lottie-react.svg" alt="Package License" /></a>
    <a href="https://www.npmjs.com/lottie-react" target="_blank"><img src="https://img.shields.io/npm/dm/lottie-react.svg" alt="NPM Downloads" /></a>
    <a href="https://travis-ci.org/Gamote/lottie-react" target="_blank"><img src="https://travis-ci.org/Gamote/lottie-react.svg?branch=master" alt="TravisCI" /></a>
    <a href="https://coveralls.io/github/Gamote/lottie-react?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/Gamote/lottie-react/badge.svg?branch=master" alt="Coverage" /></a>
    <a href="https://github.com/facebook/jest" target="_blank"><img src="https://img.shields.io/badge/tested_with-jest-99424f.svg" alt="Tested with Jest" /></a>
    <a href="https://www.codacy.com/manual/Gamote/lottie-react" target="_blank"><img src="https://app.codacy.com/project/badge/Grade/13a28cb016c941daa9084654bc2bac75" alt="Code Quality" /></a>
    <a href="https://snyk.io/test/github/Gamote/lottie-react?targetFile=package.json" target="_blank"><img src="https://snyk.io/test/github/Gamote/lottie-react/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" /></a>
    <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

## Description

TODO: about Lottie and this library.

## Installation

Install **react** and **react-dom** if you don’t have them already:

_**Note:** This library is using React hooks, so the minimum version required for both react and react-dom is 16.8.0._

```text
npm i react@^16.8.0 react-dom@^16.8.0
```

Install **lottie-react** using npm:

```text
npm i lottie-react
```

## Usage

### Component

```js
import Lottie from "lottie-react";
import groovyWalkAnimation from "./groovyWalk.json";

const Example = () => {
  return <Lottie animationData={groovyWalkAnimation} />;
};

export default Example;
```

[Try it on CodeSandbox](https://codesandbox.io/s/lottie-react-component-2k13t)

### Hook

```js
import { useLottie } from "lottie-react";
import groovyWalkAnimation from "./groovyWalk.json";

const Example = () => {
  const options = {
    animationData: groovyWalkAnimation,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);

  return View;
};

export default Example;
```

[Try it on CodeSandbox](https://codesandbox.io/s/lottie-react-hook-13nio)

## Documentation

Checkout the [Documentation](https://gamote.github.io/lottie-react) for more information and examples.

## Test
```text
npm test
```

### Coverage report
```text
-----------------------------|---------|----------|---------|---------|-------------------
File                         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------------|---------|----------|---------|---------|-------------------
All files                    |     100 |      100 |     100 |     100 |                   
 components                  |     100 |      100 |     100 |     100 |                   
  Lottie.ts                  |     100 |      100 |     100 |     100 |                   
 hooks                       |     100 |      100 |     100 |     100 |                   
  useLottie.tsx              |     100 |      100 |     100 |     100 |                   
  useLottieInteractivity.tsx |     100 |      100 |     100 |     100 |                   
-----------------------------|---------|----------|---------|---------|-------------------
```

## Contribution

Let us know if you have any suggestions or contributions. This package has the mission to help developers, so if you have any features that you think we should prioritize, reach out to us.

## Projects to check out

- [lottie-web](https://github.com/airbnb/lottie-web) - Lottie implementation for Web. Our project is based on it and you should check it because it will help you understand what's behind this package and it will give you a better understanding on what features should you expect to have in the future.
- [lottie-android](https://github.com/airbnb/lottie-android) - Lottie implementation for Android
- [lottie-ios](https://github.com/airbnb/lottie-ios) - Lottie implementation for iOS
- [lottie-react-native](https://github.com/react-native-community/lottie-react-native) - Lottie implementation for React Native
- [LottieFiles](https://lottiefiles.com/) - Are you looking for animations? LottieFiles is the way to go!

## License

**lottie-react** is available under the [MIT license](https://github.com/Gamote/lottie-react/blob/master/LICENSE.md).

Thanks to [David Probst Jr](https://lottiefiles.com/davidprobstjr) for the animations used in the examples.
