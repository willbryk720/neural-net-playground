import React, { Component } from "react";
import { render } from "react-dom";
import {
  sortableContainer,
  SortableElement,
  arrayMove
} from "react-sortable-hoc";

import { Button, Icon, Segment, Input } from "semantic-ui-react";
import Layer from "./Layer";
import AddStarterNetworks from "./AddStarterNetworks";

const SortableContainer = sortableContainer(({ children }) => {
  return <ul>{children}</ul>;
});

const SortableItem = SortableElement(
  ({ layer, indexOfItem, onChangeLayer, onClickDelete }) => {
    return (
      <Layer
        layer={layer}
        indexOfItem={indexOfItem}
        onChangeLayer={onChangeLayer}
        onClickDelete={onClickDelete}
      />
    );
  }
);

class SortableLayers extends Component {
  state = {
    layers: []
  };
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState(({ layers }) => ({
      layers: arrayMove(layers, oldIndex, newIndex)
    }));
  };

  onChangeLayer = (index, newLayer) => {
    this.setState({
      layers: this.state.layers.map((item, i) =>
        i === index ? newLayer : item
      )
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

  loadStarterNetwork = layers => {
    this.setState({
      layers: layers
    });
    this.props.updateLayers(layers);
  };
  render() {
    return (
      <div>
        <h1>Create Neural Network</h1>
        <AddStarterNetworks loadStarterNetwork={this.loadStarterNetwork} />

        <Button
          color="blue"
          size="large"
          onClick={() => {
            this.props.updateLayers(this.state.layers);
          }}
        >
          Update
        </Button>
        <Button
          color="blue"
          size="small"
          onClick={this.onClickAdd}
          style={{ float: "right" }}
        >
          Add New Layer
        </Button>
        <SortableContainer
          onSortEnd={this.onSortEnd}
          useDragHandle
          distance={1}
        >
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
