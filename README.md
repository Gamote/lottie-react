<p align="center">
  <a href="https://lottiereact.com"><img src="https://raw.githubusercontent.com/Gamote/lottie-react/main/website/public/lottie-logo.svg" width="140" alt="lottie-react" /></a>
</p>

<h1 align="center">lottie-react</h1>

<p align="center">Lottie animations in React: one component for the easy path, the whole engine when you need control.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/lottie-react"><img src="https://img.shields.io/npm/v/lottie-react.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/lottie-react"><img src="https://img.shields.io/npm/dm/lottie-react.svg" alt="npm downloads" /></a>
  <a href="https://github.com/Gamote/lottie-react/actions/workflows/check.yml"><img src="https://img.shields.io/github/actions/workflow/status/Gamote/lottie-react/check.yml" alt="build status" /></a>
  <a href="https://codecov.io/github/Gamote/lottie-react"><img src="https://codecov.io/github/Gamote/lottie-react/graph/badge.svg" alt="coverage" /></a>
  <a href="https://github.com/Gamote/lottie-react/blob/main/LICENSE.md"><img src="https://img.shields.io/npm/l/lottie-react.svg" alt="license" /></a>
</p>

## Installation

```bash
npm i lottie-react
```

`react` and `react-dom` at 18.2 or newer are peer dependencies; [lottie-web](https://github.com/airbnb/lottie-web) comes with it.
The package is tree-shakeable: an import pays only for what it reaches.

## Usage

### The component

```tsx
import { Lottie } from "lottie-react";

export function Hero() {
  return <Lottie src="/hero.json" autoplay loop />;
}
```

`src` takes a path, a URL, or the parsed animation object.
The animation fills its element, so size the element and you are done.

### The hook

```tsx
import { useLottie } from "lottie-react";

export function Hero() {
  const lottie = useLottie({ src: "/hero.json", autoplay: true, loop: true });
  return <div ref={lottie.setDisplayRef} style={{ height: 300 }} />;
}
```

The hook returns the instance: values that re-render with the animation, commands like `play` and `seek`, and a subscription point.

## Documentation

Guides, live examples and the full API reference: **[lottiereact.com](https://lottiereact.com)**.

Coming from v2? The [migration guide](https://lottiereact.com/docs/migration) maps every v2 surface onto v3.

## Contributing

Issues and pull requests are welcome.
[CONTRIBUTING.md](https://github.com/Gamote/lottie-react/blob/main/CONTRIBUTING.md) carries the setup and the checks.

## License

[MIT](https://github.com/Gamote/lottie-react/blob/main/LICENSE.md)
