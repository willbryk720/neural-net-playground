import React, { Component } from "react";
import { render } from "react-dom";

import { Button, Icon, Segment, Input, Divider } from "semantic-ui-react";
import Layer from "./Layer";
import AddStarterNetworks from "../addFromExisting/AddStarterNetworks";

import CreateEditLayer from "./CreateEditLayer";

class Layers extends Component {
  state = {
    layers: this.props.layers
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.datasetInfo.name !== this.props.datasetInfo.name) {
      this.setState({ layers: [] });
    }
  }

  onClickDelete = index => {
    const newLayers = this.state.layers.filter((item, i) => i !== index);
    this.setState({
      layers: newLayers
    });
    this.props.updateLayers(newLayers, null);
  };

  onCreateLayer = (indexOfBeforeLayer, layerType, inputs) => {
    // named them inputs, but here named them options
    // (they are used differently in different contexts so they're named differently)
    const newLayer = {
      layerType,
      options: JSON.stringify(inputs)
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

  onEditLayer = (indexOfLayer, layerType, inputs) => {
    // named them inputs, but here named them options
    // (they are used differently in different contexts so they're named differently)
    const newLayer = {
      layerType,
      options: JSON.stringify(inputs)
    };
    const newLayers = this.state.layers.slice();
    newLayers[indexOfLayer] = newLayer;
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
          <AddStarterNetworks
            loadStarterNetwork={this.loadStarterNetwork}
            datasetInfo={this.props.datasetInfo}
            starterNetworkName={this.props.starterNetworkName}
          />
        </div>
        <br />
        <div>
          <div style={{ height: "8px" }} />
          {this.state.layers.map((layer, index) => {
            if (index === this.state.layers.length - 1) {
              return (
                <div key={index}>
                  <Layer
                    isLastLayer={index === this.state.layers.length - 1}
                    layer={layer}
                    indexOfLayer={index}
                    onClickDelete={this.onClickDelete}
                    onEditLayer={this.onEditLayer}
                    onChangedCreateLayerModal={this.props.onChangedCreateLayerModal}
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
                    onClickDelete={this.onClickDelete}
                    onEditLayer={this.onEditLayer}
                    onChangedCreateLayerModal={this.props.onChangedCreateLayerModal}
                  />

                  <Divider horizontal style={{ marginTop: "5px", marginBottom: "5px" }}>
                    <CreateEditLayer
                      indexOfBeforeLayer={index}
                      onCreateLayer={this.onCreateLayer}
                      isCreatingLayer={true}
                      onChangedCreateLayerModal={this.props.onChangedCreateLayerModal}
                    />
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
