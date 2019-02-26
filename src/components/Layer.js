import React, { Component } from "react";
import { Button, Icon, Segment, Input, Dropdown } from "semantic-ui-react";

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
  { key: "conv1d", value: "conv1d", text: "conv1d" },
  { key: "conv2d", value: "conv2d", text: "conv2d" },
  { key: "conv2dTranspose", value: "conv2dTranspose", text: "conv2dTranspose" },
  { key: "cropping2d", value: "cropping2d", text: "cropping2d" },
  { key: "depthwiseConv2d", value: "depthwiseConv2d", text: "depthwiseConv2d" },
  { key: "separableConv2d", value: "separableConv2d", text: "separableConv2d" },
  { key: "upSampling2d", value: "upSampling2d", text: "upSampling2d" }
];

class Layer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { onChangeLayer, onClickDelete, layer, indexOfItem } = this.props;
    const { layerType, options } = layer;
    return (
      <Segment>
        <DragHandle />

        <div style={{ display: "inline-block", width: "25%" }}>
          <Dropdown
            placeholder="Layer Type"
            fluid
            search
            selection
            options={layerTypes}
            value={layerType}
            onChange={(e, { value }) => {
              let newLayer = Object.assign({}, layer);
              newLayer.layerType = value;
              onChangeLayer(indexOfItem, newLayer);
            }}
          />
        </div>
        <div style={{ display: "inline-block", width: "5%" }} />
        <div style={{ display: "inline-block", width: "60%" }}>
          <div>
            <Input
              value={options}
              fluid
              onChange={(e, { value }) => {
                let newLayer = Object.assign({}, layer);
                newLayer.options = value;
                onChangeLayer(indexOfItem, newLayer);
              }}
            />
          </div>
        </div>
        <div style={{ display: "inline-block", width: "5%", cursor: "pointer" }}>
          <Icon name="delete" onClick={() => onClickDelete(indexOfItem)} />
        </div>
      </Segment>
    );
  }
}

export default Layer;
