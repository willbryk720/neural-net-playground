import React, { Component } from "react";
import { Button } from "semantic-ui-react";

import { getOneLayerOutputColors } from "../utils/scene";

class AnalyzeLayers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // componentWillReceiveProps(nextProps) {
  //   this.setState({ analyzeInfo: nextProps.analyzeInfo });
  // }

  render() {
    const { analyzeInfo } = this.props;

    if (Object.keys(analyzeInfo).length === 0) {
      return <h1>Analyze Neurons</h1>;
    }

    const {
      layerIndex,
      position,
      layerType,
      indexInfo,
      edges,
      inLayerOutput,
      inLayerMetadata,
      drawing
    } = analyzeInfo;

    console.log("analyzeInfo", analyzeInfo);

    const { weights, biases } = edges;

    if (inLayerOutput) {
      const oneLayerOutputColors = getOneLayerOutputColors(
        inLayerOutput,
        inLayerMetadata.isSquare,
        inLayerMetadata.dimensions
      );
      console.log(oneLayerOutputColors);
    } else {
    }

    return (
      <div>
        <h1>Analyze Layers</h1>
        <h3>LayerType: {layerType}</h3>
        <h3>
          {indexInfo.group}, {indexInfo.row}, {indexInfo.col}
        </h3>
      </div>
    );
  }
}

export default AnalyzeLayers;
