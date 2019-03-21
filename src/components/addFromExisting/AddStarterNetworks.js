import React, { Component } from "react";
import { Button, Icon, Segment, Input, Dropdown } from "semantic-ui-react";

let networks = [
  {
    name: "Dense",
    layers: [
      {
        layerType: "flatten",
        options: { inputShape: [28, 28, 1] }
      },
      {
        layerType: "dense",
        options: { units: 42, activation: "relu" }
      },
      {
        layerType: "dense",
        options: { units: 10, activation: "softmax" }
      }
    ]
  },
  // {
  //   name: "Conv",
  //   layers: [
  //     {
  //       layerType: "conv2d",
  //       options: {
  //         inputShape: [28, 28, 1],
  //         kernelSize: 3,
  //         filters: 2,
  //         activation: "relu"
  //       }
  //     },
  //     { layerType: "maxPooling2d", options: { poolSize: 2, strides: 2 } },
  //     {
  //       layerType: "conv2d",
  //       options: { kernelSize: 3, filters: 4, activation: "relu" }
  //     },
  //     { layerType: "flatten", options: {} },
  //     { layerType: "dense", options: { units: 10, activation: "softmax" } }
  //   ]
  // }
  {
    name: "Conv",
    layers: [
      {
        layerType: "conv2d",
        options: {
          inputShape: [28, 28, 1],
          kernelSize: 3,
          filters: 16,
          activation: "relu"
        }
      },
      { layerType: "maxPooling2d", options: { poolSize: 2, strides: 2 } },
      {
        layerType: "conv2d",
        options: { kernelSize: 3, filters: 32, activation: "relu" }
      },
      { layerType: "flatten", options: {} },
      { layerType: "dense", options: { units: 64, activation: "relu" } },
      { layerType: "dense", options: { units: 10, activation: "softmax" } }
    ]
  },
  {
    name: "FacesOrNot",
    layers: [
      {
        layerType: "conv2d",
        options: {
          inputShape: [48, 48, 1],
          kernelSize: 3,
          filters: 8,
          activation: "relu"
        }
      },
      { layerType: "maxPooling2d", options: { poolSize: 2, strides: 2 } },
      {
        layerType: "conv2d",
        options: { kernelSize: 3, filters: 12, activation: "relu" }
      },
      { layerType: "maxPooling2d", options: { poolSize: 2, strides: 2 } },
      { layerType: "flatten", options: {} },
      { layerType: "dense", options: { units: 2, activation: "softmax" } }
    ]
  }
  // {
  //   name: "Conv",
  //   layers: [
  //     {
  //       layerType: "conv2d",
  //       options: {
  //         inputShape: [28, 28, 1],
  //         kernelSize: 3,
  //         filters: 16,
  //         activation: "relu"
  //       }
  //     },
  //     { layerType: "maxPooling2d", options: { poolSize: 2, strides: 2 } },
  //     {
  //       layerType: "conv2d",
  //       options: { kernelSize: 3, filters: 32, activation: "relu" }
  //     },
  //     { layerType: "maxPooling2d", options: { poolSize: 2, strides: 2 } },
  //     {
  //       layerType: "conv2d",
  //       options: { kernelSize: 3, filters: 32, activation: "relu" }
  //     },
  //     { layerType: "flatten", options: {} },
  //     { layerType: "dense", options: { units: 64, activation: "relu" } },
  //     { layerType: "dense", options: { units: 10, activation: "softmax" } }
  //   ]
  // }
];
networks.forEach(network => {
  network.layers.forEach(layer => {
    layer.options = JSON.stringify(layer.options);
  });
});

class AddStarterNetworks extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onChooseStarterNetwork(value) {
    const chosenNetwork = networks.find(network => network.name === value);
    this.props.loadStarterNetwork(chosenNetwork.layers, value);
  }

  render() {
    const options = networks.map(network => {
      return { key: network.name, text: network.name, value: network.name };
    });

    return (
      <div>
        <Dropdown
          placeholder="Starter Network"
          search
          selection
          options={options}
          onChange={(e, { value }) => {
            this.onChooseStarterNetwork(value);
          }}
          selectOnNavigation={false}
          selectOnBlur={false}
        />
      </div>
    );
  }
}

export default AddStarterNetworks;
