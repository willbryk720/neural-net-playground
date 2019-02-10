import React, { Component } from "react";
import { Button } from "semantic-ui-react";

class AnalyzeLayers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ analyzeInfo: nextProps.analyzeInfo });
  }

  render() {
    const { analyzeInfo } = this.state;

    if (!analyzeInfo) {
      return <h1>Analyze Neurons</h1>;
    }

    const {
      layerIndex,
      position,
      indexInfo,
      layerType,
      edges,
      layerOutput
    } = analyzeInfo;

    console.log(this.props);

    return (
      <div>
        <h1>Analyze Layers</h1>
        <h3>LayerType: {layerType}</h3>
        <h3>{indexInfo}</h3>
      </div>
    );
  }
}

export default AnalyzeLayers;
