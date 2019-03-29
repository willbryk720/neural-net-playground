import React, { Component } from "react";
import { Button, Icon, Segment, Input, Dropdown } from "semantic-ui-react";

let networks = [
  {
    name: "Dense",
    dataset: "MNIST",
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
  {
    name: "ConvSmall",
    dataset: "MNIST",
    layers: [
      {
        layerType: "conv2d",
        options: {
          inputShape: [28, 28, 1],
          kernelSize: 3,
          filters: 6,
          activation: "relu"
        }
      },
      { layerType: "maxPooling2d", options: { poolSize: 2, strides: 2 } },
      {
        layerType: "conv2d",
        options: { kernelSize: 3, filters: 6, activation: "relu" }
      },
      { layerType: "flatten", options: {} },
      { layerType: "dense", options: { units: 64, activation: "relu" } },
      { layerType: "dense", options: { units: 10, activation: "softmax" } }
    ]
  },
  {
    name: "Conv",
    dataset: "MNIST",
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
    dataset: "FacesOrNot",
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
    const options = networks
      .filter(network => network.dataset === this.props.datasetInfo.name)
      .map(network => {
        return { key: network.name, text: network.name, value: network.name };
      });

    return (
      <div>
        <Dropdown
          placeholder="Starter Network"
          search
          selection
          options={options}
          value={this.props.starterNetworkName}
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
