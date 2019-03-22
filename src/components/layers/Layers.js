import React, { Component } from "react";
import { render } from "react-dom";

import { Button, Icon, Segment, Input, Divider } from "semantic-ui-react";
import Layer from "./Layer";
import AddStarterNetworks from "../addFromExisting/AddStarterNetworks";

import CreateLayer from "./CreateLayer";

class Layers extends Component {
  state = {
    layers: this.props.layers
  };

  onChangeLayer = (index, newLayer) => {
    this.setState({
      layers: this.state.layers.map((item, i) => (i === index ? newLayer : item))
    });
  };

  onClickDelete = index => {
    const newLayers = this.state.layers.filter((item, i) => i !== index);
    this.setState({
      layers: newLayers
    });
    this.props.updateLayers(newLayers, null);
  };

  onCreateLayer = (indexOfBeforeLayer, newLayerInfo) => {
    const newLayer = {
      layerType: newLayerInfo.layerType,
      options: JSON.stringify(newLayerInfo.inputs)
    };
    const newLayers = [
      ...this.state.layers.slice(0, indexOfBeforeLayer + 1),
      newLayer,
      ...this.state.layers.slice(indexOfBeforeLayer + 1)
    ];
    this.setState({
      layers: newLayers
    });
    this.props.updateLayers(newLayers, null);
  };

  loadStarterNetwork = (layers, starterNetworkName) => {
    this.setState({
      layers: layers
    });
    this.props.updateLayers(layers, starterNetworkName);
  };
  render() {
    return (
      <div>
        <div>
          <h5>Choose Default Network Architecture</h5>
          <AddStarterNetworks loadStarterNetwork={this.loadStarterNetwork} />
        </div>
        <br />
        <div>
          {/* <h5>Add layers of your own:</h5> */}
          {/* <Button
            color="blue"
            size="small"
            onClick={() => {
              this.props.updateLayers(this.state.layers, null);
            }}
          >
            Update
          </Button> */}
          <div style={{ height: "8px" }} />
          {this.state.layers.map((layer, index) => {
            if (index === this.state.layers.length - 1) {
              return (
                <div key={index}>
                  <Layer
                    isLastLayer={index === this.state.layers.length - 1}
                    layer={layer}
                    indexOfLayer={index}
                    onChangeLayer={this.onChangeLayer}
                    onClickDelete={this.onClickDelete}
                  />
                </div>
              );
            } else {
              return (
                <div key={index}>
                  <Layer
                    isLastLayer={index === this.state.layers.length - 1}
                    layer={layer}
                    indexOfLayer={index}
                    onChangeLayer={this.onChangeLayer}
                    onClickDelete={this.onClickDelete}
                  />

                  <Divider horizontal style={{ marginTop: "5px", marginBottom: "5px" }}>
                    <CreateLayer indexOfBeforeLayer={index} onCreateLayer={this.onCreateLayer} />
                  </Divider>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  }
}

export default Layers;
