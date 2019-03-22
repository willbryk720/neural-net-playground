import React, { Component } from "react";
import { Button } from "semantic-ui-react";

import * as tf from "@tensorflow/tfjs";

import { getOneLayerOutputColors } from "../../utils/scene";
import { getLayerOutputs, getLayerTypeFromLayerName } from "../../utils/prediction";
import {
  reshape4DTensorToArray,
  reshape2DTensorToArray,
  reshapeArrayTo4DTensor,
  reshapeArrayTo2DTensor
} from "../../utils/reshaping";

import NeuronAnalyzeCanvas from "./NeuronAnalyzeCanvas";
import DenseAnalyze from "./DenseAnalyze";

class ModifyWeights extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // change a particular filter (group) weights into neuron to zero
  // if groupTargetIndex is -1, set whole layer inputs to neuron to zero
  onChangeWeightsToZero = groupTargetIndex => {
    const { analyzeInfo, trainedModel } = this.props;
    const { neuron, inLayerMetadata } = analyzeInfo;
    const { layerIndex, group: groupIndex, row: rowIndex, col: colIndex } = neuron.indexInfo;

    const inLayer = trainedModel.layers.filter(
      l => getLayerTypeFromLayerName(l.name) !== "flatten"
    )[layerIndex - 1];

    const weightsAndBiases = inLayer.getWeights();
    if (weightsAndBiases.length != 2) {
      return; // actually shouldnt ever get to here, this is for testing
    }

    const weightsTensor = weightsAndBiases[0];
    const biasesTensor = weightsAndBiases[1];
    let weightsData = [];
    if (weightsTensor.shape.length === 4) {
      // means inLayer is a layer with squares

      weightsData = reshape4DTensorToArray(weightsTensor.dataSync(), ...weightsTensor.shape);

      if (groupTargetIndex === -1) {
        weightsData[groupIndex].forEach((neuronGroup, g) => {
          weightsData[groupIndex][g].forEach((row, r) => {
            row.forEach((_c, c) => {
              weightsData[groupIndex][g][r][c] = 0;
            });
          });
        });
      } else {
        weightsData[groupIndex][groupTargetIndex].forEach((row, r) => {
          row.forEach((_c, c) => {
            weightsData[groupIndex][groupTargetIndex][r][c] = 0;
          });
        });
      }

      const newTensor = reshapeArrayTo4DTensor(weightsData);
      inLayer.setWeights([newTensor, biasesTensor]);

      this.props.alertChangedWeights();
    } else if (weightsTensor.shape.length === 2) {
      // means selected neuron is in a dense layer
      weightsData = reshape2DTensorToArray(weightsTensor.dataSync(), ...weightsTensor.shape);
      let newBiasesData = biasesTensor.dataSync();
      if (groupTargetIndex === -1) {
        weightsData.forEach((_, g) => {
          weightsData[g][colIndex] = 0;
        });
        if (groupIndex) {
          newBiasesData[groupIndex] = -1000;
        } else {
          newBiasesData[colIndex] = -1000;
        }
      } else {
        const inSquareSize = inLayerMetadata.dimensions[0] * inLayerMetadata.dimensions[0];
        for (
          let i = groupTargetIndex * inSquareSize;
          i < (groupTargetIndex + 1) * inSquareSize;
          i++
        ) {
          weightsData[i][colIndex] = 0;
        }
      }

      const newWeightsTensor = reshapeArrayTo2DTensor(weightsData);
      const newBiasesTensor = tf.tensor(newBiasesData);
      inLayer.setWeights([newWeightsTensor, newBiasesTensor]);
      this.props.alertChangedWeights();
    }
  };

  render() {
    console.log("RERENDERED ANALYZE INFO");
    const { analyzeInfo, trainedModel } = this.props;

    if (Object.keys(analyzeInfo).length === 0) {
      return <p>No neuron selected yet</p>;
    }

    const { edges, inLayerOutput, inLayerMetadata, drawing, neuron, hasOutputs } = analyzeInfo;
    const { position, indexInfo, layerType, colorObj, layerIsSquare } = neuron;
    const { layerIndex, group, row, col } = indexInfo;

    let canvases;
    if (layerIndex == 1 && hasOutputs) {
      // drawing is in fraction, but need hex
      const drawingInHex = drawing.map(row => row.map(color => ({ colorHex: color * 0xffffff })));
      canvases = (
        <div key={neuron.id}>
          <NeuronAnalyzeCanvas canvasWidth={100} canvasHeight={100} colorSquare={drawingInHex} />
        </div>
      );
    } else if (inLayerOutput) {
      const oneLayerOutputColors = getOneLayerOutputColors(
        inLayerOutput,
        inLayerMetadata.isSquare,
        inLayerMetadata.dimensions
      );

      if (layerType === "maxPooling2d") {
        const colorSquare = oneLayerOutputColors[group];
        console.log("YOO", colorSquare);

        canvases = (
          <div key={neuron.id}>
            <NeuronAnalyzeCanvas canvasWidth={100} canvasHeight={100} colorSquare={colorSquare} />
          </div>
        );
      } else if (inLayerMetadata.isSquare) {
        canvases = oneLayerOutputColors.map((colorSquare, i) => (
          <React.Fragment key={"" + i + neuron.id}>
            <div style={{ display: "inline-block" }}>
              <NeuronAnalyzeCanvas canvasWidth={100} canvasHeight={100} colorSquare={colorSquare} />
              <button type="button" onClick={() => this.onChangeWeightsToZero(i)}>
                Set to 0
              </button>
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

    return (
      <div>
        <br />
        <div>
          {layerType !== "maxPooling2d" && (
            <div style={{ float: "right" }}>
              <button onClick={() => this.onChangeWeightsToZero(-1)}>Set All Weights to 0</button>
            </div>
          )}
        </div>
        {canvases}
      </div>
    );
  }
}

export default ModifyWeights;
