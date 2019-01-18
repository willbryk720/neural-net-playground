import React, { Component } from "react";
import SortableLayers from "./SortableLayers";

class Left extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <SortableLayers updateLayers={this.props.updateLayers} />
      </div>
    );
  }
}

export default Left;
