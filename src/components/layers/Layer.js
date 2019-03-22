import React, { Component } from "react";
import { Button, Icon, Segment, Input, Dropdown } from "semantic-ui-react";

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
    const { onChangeLayer, onClickDelete, layer, indexOfLayer, isLastLayer } = this.props;
    const { layerType, options } = layer;

    console.log("OPTIONS", options);
    let deleteIcon;
    if (!isLastLayer && !(indexOfLayer === 0)) {
      deleteIcon = (
        <div style={{ display: "inline-block", width: "5%", cursor: "pointer" }}>
          <Icon name="delete" onClick={() => onClickDelete(indexOfLayer)} />
        </div>
      );
    }

    return (
      <div>
        <div style={{ display: "inline-block", width: "30%" }}>
          <b>
            {indexOfLayer + 1} {". "}
            {layerType}:
          </b>
        </div>
        <div style={{ display: "inline-block", width: "50%" }}>
          <div>
            <Input
              onDoubleClick={e => console.log(e)}
              value={options}
              fluid
              onChange={(e, { value }) => {
                let newLayer = Object.assign({}, layer);
                newLayer.options = value;
                onChangeLayer(indexOfLayer, newLayer);
              }}
            />
          </div>
        </div>
        {deleteIcon}
      </div>
    );
  }
}

export default Layer;