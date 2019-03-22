export const LAYER_SPACING_TO_LENGTH_RATIO = 0.4;
export const DENSE_NEURON_SPACING = 0.5;
export const SQUARE_NEURON_SPACING = 0.4;
export const CONV_FILTERS_SPACING = 20;
export const NEURON_WIDTH = 1;

export const KEY_A = 65;
export const KEY_D = 68;
export const KEY_W = 87;
export const KEY_S = 83;

export const SELECTED_NEURON_COLOR = 0xffff00;
export const SELECTED_SQUARE_COLOR = 0xffff00;

export const layerTypes = [
  { key: "dense", value: "dense", text: "Dense" },
  { key: "flatten", value: "flatten", text: "Flatten" },
  { key: "maxPooling2d", value: "maxPooling2d", text: "maxPooling2d" },
  { key: "conv2d", value: "conv2d", text: "conv2d" }
];

export const d = {
  dense: {
    inputs: [
      { optionName: "units", type: "Number", initialVal: 10, required: true },
      {
        optionName: "activation",
        options: ["relu", "softmax"],
        type: "Dropdown",
        initialVal: "relu"
      }
    ],
    message: "This is how a dense layer works"
  },
  conv2d: {
    inputs: [
      { optionName: "units", type: "Number", initialVal: 10, required: true },
      { optionName: "kernelSize", type: "Number", initialVal: 3, required: true },
      { optionName: "filters", type: "Number", initialVal: 6, required: true },
      {
        optionName: "activation",
        options: ["relu", "softmax"],
        type: "Dropdown",
        initialVal: "relu"
      }
    ],
    message: "This is how a Conv2D layer works"
  },
  maxPooling2d: {
    inputs: [
      { optionName: "poolSize", type: "Number", initialVal: 2, required: true },
      { optionName: "strides", type: "Number", initialVal: 2, required: true }
    ],
    message: "This is how a maxPooling2d layer works"
  },
  flatten: {
    inputs: [],
    message: "This is how a flatten layer works"
  }
};
