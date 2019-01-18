import React, { Component } from "react";
import { render } from "react-dom";
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from "react-sortable-hoc";

import { Button, Icon, Segment, Input } from "semantic-ui-react";

const SortableItem = SortableElement(
  ({ value, indexOfItem, onChangeLayers, onClickDelete }) => {
    return (
      <Segment>
        <div
          style={{ display: "inline-block", width: "5%", cursor: "pointer" }}
        >
          <Icon name="bars" />
        </div>
        <div style={{ display: "inline-block", width: "90%" }}>
          <div>
            <Input
              value={value}
              fluid
              onChange={(e, { value }) => onChangeLayers(indexOfItem, value)}
            />
          </div>
        </div>
        <div
          style={{ display: "inline-block", width: "5%", cursor: "pointer" }}
        >
          <Icon name="delete" onClick={() => onClickDelete(indexOfItem)} />
        </div>
      </Segment>
    );
  }
);

const SortableList = SortableContainer(
  ({ items, onChangeLayers, onClickDelete }) => {
    return (
      <ul>
        {items.map((value, index) => (
          <SortableItem
            key={`item-${index}`}
            index={index}
            value={value}
            indexOfItem={index}
            onChangeLayers={onChangeLayers}
            onClickDelete={onClickDelete}
          />
        ))}
      </ul>
    );
  }
);

class SortableLayers extends Component {
  state = {
    items: []
  };
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState(({ items }) => ({
      items: arrayMove(items, oldIndex, newIndex)
    }));
  };

  onChangeLayers = (index, value) => {
    this.setState({
      items: this.state.items.map((item, i) => (i === index ? value : item))
    });
  };
  onClickDelete = index => {
    this.setState({
      items: this.state.items.filter((item, i) => i !== index)
    });
  };
  onClickAdd = () => {
    this.setState({
      items: [...this.state.items, "X neurons"]
    });
  };
  render() {
    return (
      <div>
        <h1>Create Neural Network</h1>

        <Button
          color="blue"
          size="large"
          onClick={() => this.props.updateLayers(this.state.items)}
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
        <SortableList
          distance={1}
          items={this.state.items}
          onSortEnd={this.onSortEnd}
          onChangeLayers={this.onChangeLayers.bind(this)}
          onClickDelete={this.onClickDelete}
        />
      </div>
    );
  }
}

export default SortableLayers;
