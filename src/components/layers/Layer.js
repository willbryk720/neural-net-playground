import React, { Component } from "react";
import { Button, Icon, Segment, Input, Dropdown } from "semantic-ui-react";

import CreateEditLayer from "./CreateEditLayer";

function getstringFromOptions(options) {
  let s = "";
  const o = JSON.parse(options);
  const keys = Object.keys(o);

  if (keys.length === 0) {
    return "No options"; // for flatten layer
  }
  for (const key of keys) {
    s += `${key}: ${o[key]}, `;
  }
  return s.replace(/,\s*$/, "");
}

class Layer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { onClickDelete, layer, indexOfLayer, isLastLayer } = this.props;
    const { layerType, options } = layer;

    const editLayerItem = (
      <CreateEditLayer
        indexOfLayer={indexOfLayer}
        onEditLayer={this.props.onEditLayer}
        isCreatingLayer={false}
        layerType={layerType}
        layerInputs={JSON.parse(options)}
      />
    );
    let icons;
    if (!isLastLayer && !(indexOfLayer === 0)) {
      icons = (
        <div style={{ float: "right", cursor: "pointer" }}>
          <Icon name="delete" onClick={() => onClickDelete(indexOfLayer)} />
          <div>{editLayerItem}</div>
        </div>
      );
    } else if (!isLastLayer) {
      icons = <div style={{ float: "right", cursor: "pointer" }}>{editLayerItem}</div>;
    }

    return (
      <div>
        {icons}
        <div style={{}}>
          <b>
            {indexOfLayer + 1} {". "}
            {layerType.charAt(0).toUpperCase() + layerType.slice(1)}
          </b>
        </div>
        <div>{getstringFromOptions(options)}</div>
      </div>
    );
  }
}

export default Layer;
