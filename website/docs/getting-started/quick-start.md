---
sidebar_position: 1
---

import BrowserWindow from '@site/src/components/BrowserWindow/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quick Start

A 1-minute quickstart guide on how to install and use `lottie-react`. For additional details and explanations, check out the other sections.

## 1. Installation 

### Install **peer dependencies**

In case you don't have them already, you have to add the `react` and `react-dom` packages.

<Tabs groupId="package-manager">
<TabItem value="yarn" label="Yarn">

```shell
yarn add react@^16.8.0 react-dom@^16.8.0
```

</TabItem>
<TabItem value="npm" label="npm">

```shell
npm i react@^16.8.0 react-dom@^16.8.0
```

</TabItem>
</Tabs>

:::info React version >=16.8.0

This library is using React Hooks, so the minimum version required for both `react` and `react-dom` is **v16.8.0**.

:::

### Install **Lottie React**

<Tabs groupId="package-manager">
<TabItem value="yarn" label="Yarn">

```shell
yarn add lottie-react
```

</TabItem>
<TabItem value="npm" label="npm">

```shell
npm i lottie-react
```

</TabItem>
</Tabs>


## 2. Usage

Now that you have installed `lottie-react` you can use it with **local** or **remove** animation `.json` files.

```mdx-code-block
import Lottie from "./../../../src/components/Lottie";
import groovyWalkAnimation from "./../../static/assets/animations/groovyWalk.json";

<BrowserWindow bodyHeight={200}>
    <Lottie data={groovyWalkAnimation} />
</BrowserWindow>
```

<Tabs>
<TabItem value="local" label="Local animation">

```tsx
import Lottie from "lottie-react";
import animation from "./assets/animation.json";

const MyApp = () => <Lottie data={animation} />

export default App;
```

</TabItem>
<TabItem value="remote" label="Remote animation">

```tsx
import Lottie from "lottie-react";

const MyApp = () => <Lottie data={"https://myapp.com/assets/animation.json"} />;

export default App;
```

</TabItem>
</Tabs>
