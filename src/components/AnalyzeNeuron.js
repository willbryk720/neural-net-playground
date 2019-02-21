import React, { Component } from "react";
import { Button } from "semantic-ui-react";

import * as tf from "@tensorflow/tfjs";

import { getOneLayerOutputColors } from "../utils/scene";
import { getLayerOutputs, getLayerTypeFromLayerName } from "../utils/prediction";
import {
  reshape4DTensorToArray,
  reshape2DTensorToArray,
  reshapeArrayTo4DTensor,
  reshapeArrayTo2DTensor
} from "../utils/reshaping";

import NeuronAnalyzeCanvas from "./analyze/NeuronAnalyzeCanvas";
import DenseAnalyze from "./analyze/DenseAnalyze";

class AnalyzeNeuron extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    // this.myRefs = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => React.createRef());
    // this.myRefs = [];
  }

  onChangeWeightsToZero = () => {
    const { analyzeInfo, trainedModel } = this.props;
    const {
      layerIndex,
      group: groupIndex,
      row: rowIndex,
      col: colIndex
    } = analyzeInfo.neuron.indexInfo;

    const inLayer = trainedModel.layers.filter(
      l => getLayerTypeFromLayerName(l.name) !== "flatten"
    )[layerIndex - 1];
    const weightsAndBiases = inLayer.getWeights();
    if (weightsAndBiases.length != 2) {
      console.log("Shouldnt be able to zero pooling layer");
      return; // actually shouldnt ever get to here, this is for testing
    }

    const weightsTensor = weightsAndBiases[0];
    const biasesTensor = weightsAndBiases[1];
    let weightsData = [];
    if (weightsTensor.shape.length === 4) {
      weightsData = reshape4DTensorToArray(weightsTensor.dataSync(), ...weightsTensor.shape);
      weightsData[groupIndex].forEach((neuronGroup, g) => {
        weightsData[groupIndex][g].forEach((row, r) => {
          row.forEach((_c, c) => {
            weightsData[groupIndex][g][r][c] = 0;
          });
        });

        const newTensor = reshapeArrayTo4DTensor(weightsData);
        inLayer.setWeights([newTensor, biasesTensor]);
      });
      this.props.alertChangedWeights();
    } else if (weightsTensor.shape.length === 2) {
      weightsData = reshape2DTensorToArray(weightsTensor.dataSync(), ...weightsTensor.shape);
      weightsData.forEach((_, g) => {
        weightsData[g][colIndex] = 0;
      });
      let newBiasesData = biasesTensor.dataSync();
      if (groupIndex) {
        newBiasesData[groupIndex] = -1000;
      } else {
        newBiasesData[colIndex] = -1000;
      }
      const newWeightsTensor = reshapeArrayTo2DTensor(weightsData);
      const newBiasesTensor = tf.tensor(newBiasesData);
      inLayer.setWeights([newWeightsTensor, newBiasesTensor]);
      this.props.alertChangedWeights();
    }
  };

  render() {
    const { analyzeInfo, trainedModel } = this.props;

    if (Object.keys(analyzeInfo).length === 0) {
      return <div />;
    }

    const { edges, inLayerOutput, inLayerMetadata, drawing, neuron, hasOutputs } = analyzeInfo;
    const { position, indexInfo, layerType, color, layerIsSquare } = neuron;
    const { layerIndex, group, row, col } = indexInfo;

    console.log("analyzeInfo, trainedModel", analyzeInfo, trainedModel);

    let canvases;
    if (layerIndex == 1 && hasOutputs) {
      // drawing is in fraction, but need hex
      const newDrawing = drawing.map(row => row.map(color => color * 0xffffff));
      canvases = (
        <div key={neuron.id}>
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
          <React.Fragment>
            <div style={{ display: "inline-block" }} key={"" + i + neuron.id}>
              <NeuronAnalyzeCanvas canvasWidth={100} canvasHeight={100} colorSquare={colorSquare} />
              {/* <Button color="green" size="mini">
                Set weights to 0
              </Button> */}
              <button type="button">Set to 0</button>
              <div style={{ height: "7px" }} />
            </div>
            <div style={{ width: "5px", display: "inline-block" }} />
          </React.Fragment>
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

    const locationString =
      `Neuron:  ` +
      (layerIsSquare ? `row ${row}, col ${col}, filter ${group}` : `index ${col}`) +
      ` in layer ${layerIndex + 1} (${layerType})` +
      `    |   Color: ${color}`;

    return (
      <div>
        <div style={{ float: "left" }}>
          <div> {locationString}</div>
          {/* <div>{`LayerType: ${layerType}`}</div>
          <div>{`Color: ${color}`}</div> */}
        </div>
        <div style={{ float: "right" }}>
          <Button color="green" size="small" onClick={this.onChangeWeightsToZero}>
            Set All Weights to 0
          </Button>
        </div>
        <br />
        <br />
        <hr />
        {canvases}
      </div>
    );
  }
}

export default AnalyzeNeuron;
