import React, { Component } from "react";
import { Button } from "semantic-ui-react";

import { getOneLayerOutputColors } from "../utils/scene";
import { getLayerOutputs } from "../utils/prediction";

import NeuronAnalyzeCanvas from "./analyze/NeuronAnalyzeCanvas";
import DenseAnalyze from "./analyze/DenseAnalyze";

class AnalyzeLayers extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    // this.myRefs = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => React.createRef());
    // this.myRefs = [];
  }

  // componentWillReceiveProps(nextProps) {
  //   this.setState({ analyzeInfo: nextProps.analyzeInfo });
  // }

  render() {
    const { analyzeInfo, trainedModel } = this.props;

    if (Object.keys(analyzeInfo).length === 0) {
      return (
        <div>
          <h1>Analyze Neurons</h1>
        </div>
      );
    }

    const { edges, inLayerOutput, inLayerMetadata, drawing, neuron, hasOutputs } = analyzeInfo;
    const { position, indexInfo, layerType, color } = neuron;
    const { layerIndex, group, row, col } = indexInfo;

    console.log("analyzeInfo", analyzeInfo);

    let canvases;
    if (layerIndex == 1) {
      // drawing is in fraction, but need hex
      const newDrawing = drawing.map(row => row.map(color => color * 0xffffff));
      canvases = (
        <div key={neuron.id}>
          <hr />
          <NeuronAnalyzeCanvas canvasWidth={200} canvasHeight={200} colorSquare={newDrawing} />
        </div>
      );
    } else if (inLayerOutput) {
      const oneLayerOutputColors = getOneLayerOutputColors(
        inLayerOutput,
        inLayerMetadata.isSquare,
        inLayerMetadata.dimensions
      );

      if (inLayerMetadata.isSquare) {
        canvases = oneLayerOutputColors.map((colorSquare, i) => (
          <div key={"" + i + neuron.id}>
            <hr />
            <NeuronAnalyzeCanvas canvasWidth={200} canvasHeight={200} colorSquare={colorSquare} />
          </div>
        ));
      } else {
        canvases = (
          <DenseAnalyze
            canvasWidth={200}
            oneLayerOutputColors={oneLayerOutputColors}
            key={neuron.id}
          />
        );
      }
    } else {
    }

    const inIsSquare = inLayerMetadata.isSquare;

    return (
      <div>
        <h1>Analyze Layers</h1>
        <h3>LayerType: {layerType}</h3>
        <h3>
          Layer: {layerIndex} <br />
          {inIsSquare ? (
            <div>
              Square: {group}, Row: {row}, Col: {col}
            </div>
          ) : (
            <div>index: {col}</div>
          )}
          <div>Color: {color}</div>
        </h3>
        {canvases}
        <Button color="green" size="small">
          Update Weights
        </Button>
      </div>
    );
  }
}

export default AnalyzeLayers;
