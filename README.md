# lottie-react

[![npm version](https://img.shields.io/npm/v/lottie-react)](https://www.npmjs.com/package/lottie-react) [![npm downloads/month](https://img.shields.io/npm/dm/lottie-react)](https://www.npmjs.com/package/lottie-react) [![Known Vulnerabilities](https://snyk.io/test/github/Gamote/lottie-react/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Gamote/lottie-react?targetFile=package.json) [![Coverage Status](https://coveralls.io/repos/github/Gamote/lottie-react/badge.svg?branch=master)](https://coveralls.io/github/Gamote/lottie-react?branch=master) [![Tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Gamote/lottie-react/blob/master/LICENSE)

This project is meant to give developers full control over **[Lottie](https://airbnb.design/lottie/)** instance with minimal implementation by wrapping **[lottie-web](https://github.com/airbnb/lottie-web)** in a Component or Hook that can be easily used in **React** applications.

> 👩‍💻 `v3` is under development and is planning to bring a lot of features and improvements. But unfortunately, at the moment all the maintainers are super busy with work related projects. You can check out the progress under the `v3` branch. And of course, you are encouraged to contribute. :)

> 🙋‍♂️ Are you using `lottie-react` in production? Please send us a message with your website, feature requests and recommendations at: [contact@gamote.ro](mailto:contact@gamote.ro).


## Installation

Install **react**, **react-dom** if you don’t have them already:

_**Note:** This library is using React hooks so the minimum version required for both react and react-dom is 16.8.0._

```shell
yarn add react@^16.8.0 react-dom@^16.8.0
```

Install **lottie-react** using npm:

```shell
yarn add lottie-react
```

## Usage

### Component

```tsx
import Lottie from "lottie-react";
import groovyWalkAnimation from "./groovyWalk.json";

const Example = () => {
  return <Lottie animationData={groovyWalkAnimation} />;
};

export default Example;
```

[Try it on CodeSandbox](https://codesandbox.io/s/lottie-react-component-2k13t)

### Hook

```ts
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

Checkout the [Documentation](https://lottiereact.com) for more information and examples: [lottiereact.com](https://lottiereact.com)

## Test
```text
yarn test
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

**lottie-react** is available under the [MIT license](https://github.com/Gamote/lottie-react/blob/main/LICENSE).

Thanks to [David Probst Jr](https://lottiefiles.com/davidprobstjr) for the animations used in the examples.
