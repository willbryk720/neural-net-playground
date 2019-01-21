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
        options: { units: 10, activation: "relu" }
      }
    ]
  },
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
      { layerType: "maxPooling2d", options: { poolSize: 2, strides: 2 } },
      {
        layerType: "conv2d",
        options: { kernelSize: 3, filters: 32, activation: "relu" }
      },
      { layerType: "flatten", options: {} },
      { layerType: "dense", options: { units: 64, activation: "relu" } },
      { layerType: "dense", options: { units: 10, activation: "softmax" } }
    ]
  }
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

  render() {
    const { loadStarterNetwork } = this.props;
    return (
      <div>
        {networks.map(network => {
          return (
            <Button onClick={() => loadStarterNetwork(network.layers)}>
              {network.name}
            </Button>
          );
        })}
      </div>
    );
  }
}

export default AddStarterNetworks;
