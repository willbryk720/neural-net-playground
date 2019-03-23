import React, { Component } from "react";

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
    ]
  },
  conv2d: {
    inputs: [
      { optionName: "kernelSize", type: "Number", initialVal: 3, required: true },
      { optionName: "filters", type: "Number", initialVal: 6, required: true },
      {
        optionName: "activation",
        options: ["relu", "softmax"],
        type: "Dropdown",
        initialVal: "relu"
      }
    ]
  },
  maxPooling2d: {
    inputs: [
      { optionName: "poolSize", type: "Number", initialVal: 2, required: true },
      { optionName: "strides", type: "Number", initialVal: 2, required: true }
    ]
  },
  flatten: {
    inputs: []
  }
};

export const layerTypes = [
  { key: "dense", value: "dense", text: "Dense" },
  { key: "flatten", value: "flatten", text: "Flatten" },
  { key: "maxPooling2d", value: "maxPooling2d", text: "maxPooling2d" },
  { key: "conv2d", value: "conv2d", text: "conv2d" }
];
