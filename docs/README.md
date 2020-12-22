## Setup up for development

1. Link the local `lottie-react` library
    - `cd .. && yarn link && cd docs`
    - `yarn link lottie-react`
  
2. Link the docs' `react` & `react-dom` instance to the local `lottie-react` to avoid the [Invalid Hook Call Warning](https://reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react) issue.
    - `cd node_modules/react && yarn link && cd ../react-dom && yarn link && cd ../..`
    - `cd .. && yarn link react && yarn link react-dom && cd docs`