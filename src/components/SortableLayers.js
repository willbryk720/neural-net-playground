import React, { Component } from "react";
import { render } from "react-dom";
import { sortableContainer, SortableElement, arrayMove } from "react-sortable-hoc";

import { Button, Icon, Segment, Input } from "semantic-ui-react";
import Layer from "./Layer";
import AddStarterNetworks from "./AddStarterNetworks";

const SortableContainer = sortableContainer(({ children }) => {
  return <div>{children}</div>;
});

const SortableItem = SortableElement(({ layer, indexOfItem, onChangeLayer, onClickDelete }) => {
  return (
    <Layer
      layer={layer}
      indexOfItem={indexOfItem}
      onChangeLayer={onChangeLayer}
      onClickDelete={onClickDelete}
    />
  );
});

class SortableLayers extends Component {
  state = {
    layers: this.props.layers
  };
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState(({ layers }) => ({
      layers: arrayMove(layers, oldIndex, newIndex)
    }));
  };

  onChangeLayer = (index, newLayer) => {
    this.setState({
      layers: this.state.layers.map((item, i) => (i === index ? newLayer : item))
    });
  };
  onClickDelete = index => {
    this.setState({
      layers: this.state.layers.filter((item, i) => i !== index)
    });
  };
  onClickAdd = () => {
    this.setState({
      layers: [...this.state.layers, { layerType: "dense", options: "" }]
    });
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
        <h5>Choose Defaults:</h5>
        <AddStarterNetworks loadStarterNetwork={this.loadStarterNetwork} />
        <h5>Or build your own:</h5>
        <Button
          color="blue"
          size="small"
          onClick={() => {
            this.props.updateLayers(this.state.layers, null);
          }}
        >
          Update
        </Button>
        <Button color="blue" size="small" onClick={this.onClickAdd} style={{ float: "right" }}>
          Add New Layer
        </Button>
        <div style={{ height: "5px" }} />
        <SortableContainer onSortEnd={this.onSortEnd} useDragHandle distance={1}>
          {this.state.layers.map((layer, index) => (
            <SortableItem
              key={`item-${index}`}
              index={index}
              layer={layer}
              indexOfItem={index}
              onChangeLayer={this.onChangeLayer.bind(this)}
              onClickDelete={this.onClickDelete}
            />
          ))}
        </SortableContainer>
      </div>
    );
  }
}

export default SortableLayers;
