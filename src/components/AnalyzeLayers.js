import React, { Component } from "react";
import { Button } from "semantic-ui-react";

import { getOneLayerOutputColors } from "../utils/scene";
import { getLayerOutputs } from "../utils/prediction";

class AnalyzeLayers extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // componentWillReceiveProps(nextProps) {
  //   this.setState({ analyzeInfo: nextProps.analyzeInfo });
  // }

  render() {
    const { analyzeInfo, trainedModel } = this.props;

    if (Object.keys(analyzeInfo).length === 0) {
      return <h1>Analyze Neurons</h1>;
    }

    const {
      position,
      layerType,
      indexInfo,
      edges,
      inLayerOutput,
      inLayerMetadata,
      drawing
    } = analyzeInfo;

    const { layerIndex, group, row, col } = indexInfo;

    console.log("analyzeInfo", analyzeInfo);

    if (layerIndex == 1) {
      console.log(drawing);
    } else if (inLayerOutput) {
      console.log(inLayerOutput, inLayerMetadata);
      const oneLayerOutputColors = getOneLayerOutputColors(
        inLayerOutput,
        inLayerMetadata.isSquare,
        inLayerMetadata.dimensions
      );
      console.log(analyzeInfo, oneLayerOutputColors);
    } else {
    }

    return (
      <div>
        <h1>Analyze Layers</h1>
        <h3>LayerType: {layerType}</h3>
        <h3>
          {layerIndex} <br />
          {group}, {row}, {col}
        </h3>
        <Button color="green" size="small">
          Update Weights
        </Button>
      </div>
    );
  }
}

export default AnalyzeLayers;
