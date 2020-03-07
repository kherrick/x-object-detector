# \<x-object-detector>

## About

Detecting objects with TensorFlow.js.

## Installation

```bash
npm i git+https://github.com/kherrick/x-object-detector.git#semver:^1.0.1
```

## Usage

```html
<x-object-detector
  draw
  label
  strokeStyle="red"
  labelTextColor="yellow"
  labelBGColor="blue"
  labelFontSize="16"
  maxNumBoxes="10"
  lineWidth="5"
  imgurl="https://avatars3.githubusercontent.com/u/3065761"
  wasmpath="node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm"
>
  loading...
</x-object-detector>
<script
  type="module"
  src="node_modules/x-object-detector/dist/XObjectDetector.js"
>
</script>
```
