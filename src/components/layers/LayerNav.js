import React, { Component } from "react";
import { Button, Icon, Segment, Input, Dropdown, Modal, Header } from "semantic-ui-react";

import { sortableHandle } from "react-sortable-hoc";

const DragHandle = sortableHandle(() => (
  <span style={{ cursor: "pointer" }}>
    <Icon name="bars" />
  </span>
));

const layerTypes = [
  { key: "dense", value: "dense", text: "Dense" },
  { key: "flatten", value: "flatten", text: "Flatten" },
  { key: "maxPooling2d", value: "maxPooling2d", text: "maxPooling2d" },
  { key: "conv2d", value: "conv2d", text: "conv2d" }
];

const d = {
  dense: {
    inputs: [
      { optionName: "units", type: "Number" },
      { optionName: "activation", options: ["relu", "softmax"], type: "Dropdown" }
    ],
    message: "This is how a dense layer works"
  },
  conv2d: {
    inputs: [
      { optionName: "units", type: "Number" },
      { optionName: "kernelSize", type: "Number" },
      { optionName: "filters", type: "Number" },
      { optionName: "activation", options: ["relu", "softmax"], type: "Dropdown" }
    ],
    message: "This is how a Conv2D layer works"
  },
  maxPooling2d: {
    inputs: [{ optionName: "poolSize", type: "Number" }, { optionName: "strides", type: "Number" }],
    message: "This is how a maxPooling2d layer works"
  },
  flatten: {
    inputs: [],
    message: "This is how a flatten layer works"
  }
};

class LayerNav extends Component {
  constructor(props) {
    super(props);
    this.state = { layerType: "", isModalOpen: false };
  }

  render() {
    // const { onChangeLayer, onClickDelete, layer, indexOfItem } = this.props;
    // const { layers } = this.props;
    // const layer = layers[1];
    // const { layerType, options } = layer;

    const { layerType } = this.state;

    let inputItems = [];
    console.log(d[layerType], "d[layerType]", layerType);
    if (layerType !== "") {
      inputItems = d[layerType].inputs.map(input => {
        console.log(input, "INPUT");
        const { optionName, type, options } = input;
        if (type === "Number") {
          return (
            <Input key={optionName} label={optionName} fluid onChange={(e, { value }) => {}} />
          );
        } else if (type === "Dropdown") {
          const dropdownOptions = options.map(o => ({ key: o, value: o, text: o }));
          return (
            <Dropdown
              key={optionName}
              placeholder={optionName}
              fluid
              search
              selection
              label={optionName}
              options={dropdownOptions}
              onChange={(e, { value }) => {
                console.log(value);
              }}
            />
          );
        }
      });
    }

    return (
      <div>
        <Modal
          trigger={
            <Button size="small" color="blue" onClick={() => this.setState({ isModalOpen: true })}>
              Add Layer
            </Button>
          }
          style={{ width: "40%" }}
          dimmer="inverted"
          closeOnDimmerClick="false"
          open={this.state.isModalOpen}
        >
          <Modal.Header>Create Layer</Modal.Header>
          <Modal.Content>
            <div>
              <div style={{ display: "inline-block", width: "30%" }}>
                <Dropdown
                  placeholder="Layer Type"
                  fluid
                  search
                  selection
                  options={layerTypes}
                  value={layerType}
                  onChange={(e, { value }) => {
                    console.log(value);
                    this.setState({ layerType: value });
                  }}
                />
              </div>
              <div style={{ display: "inline-block", width: "5%" }} />
              {inputItems}
              {layerType && <p>{d[layerType].message}</p>}

              <Button
                size="small"
                color="blue"
                onClick={() => this.setState({ isModalOpen: false })}
              >
                Add Layer
              </Button>

              <Button size="mini" onClick={() => this.setState({ isModalOpen: false })}>
                Cancel
              </Button>
            </div>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

export default LayerNav;
