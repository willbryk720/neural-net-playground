import React, { Component } from "react";
import { Button } from "semantic-ui-react";

import CanvasComponent from "./CanvasComponent";

import * as tf from "@tensorflow/tfjs";

import {
  reshapeArrayTo4D,
  reshapeArrayTo3D,
  reshapeArrayTo2D
} from "../utils/reshaping";

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;

class Predict extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.myRef = React.createRef();
  }

  clearDrawing = () => {
    this.myRef.current.clear();

    // const t = tf.tensor([[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]]);
    // console.log(t.dataSync());
    // console.log(t.shape);
  };

  getLayerOutputs = async inputTensor => {
    const { trainedModel } = this.props;
    let layerOutputs = [];

    console.log("INPUT", inputTensor, inputTensor.dataSync());
    const layers = trainedModel.layers;
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var output = await layer.apply(inputTensor);
      inputTensor = output;
      console.log("OUTPUT BRO");
      console.log(output, output.dataSync());
      layerOutputs.push(output);
    }
    console.log("----------------------------------");

    return layerOutputs;
  };

  async testWeightCreation(layerOutputs, image, model) {
    console.log(
      "----------------------------------------------------------------------"
    );
    console.log("layers", model.layers);
    console.log(layerOutputs);

    console.log(
      "FIRST",
      reshapeArrayTo3D(layerOutputs[1].dataSync(), 13, 13, 2)
    );
    console.log(
      "SECOND",
      reshapeArrayTo3D(layerOutputs[2].dataSync(), 11, 11, 4)
    );

    let weightsObj;
    let biases;
    for (let i = 0; i < model.layers.length; i++) {
      console.log("-------LAYER_" + i + "-------");
      const weightsAndBiases = model.layers[i].getWeights();
      if (weightsAndBiases.length != 2) {
        console.log(weightsAndBiases);
        continue;
      }

      weightsObj = weightsAndBiases[0];
      biases = weightsAndBiases[1];

      // if (weightsObj.shape.length === 4 && weightsObj.shape[2] > 1) {
      //   console.log("CHECK");
      //   console.log(weightsObj.dataSync());
      //   console.log(biases.dataSync());
      //   console.log(
      //     reshapeArrayTo4D(weightsObj.dataSync(), ...weightsObj.shape)
      //   );
      // }

      console.log("BIASES", biases, biases.dataSync());
      console.log("WEIGHTS", weightsObj, weightsObj.dataSync());
    }

    // const output42 = layerOutputs[1];
    // const output10 = layerOutputs[2];

    // console.log(
    //   output42
    //     .matMul(weightsObj)
    //     .add(biases)
    //     .dataSync()
    // );
    // console.log(output10.dataSync());
  }

  makeDrawingPrediction = async () => {
    // const drawing = this.getDrawing();
    const drawing = this.myRef.current.state.points;
    const imageTensor = tf.tensor(drawing).reshape([1, 28, 28, 1]);
    const layerOutputs = await this.getLayerOutputs(imageTensor);
    this.props.onMakePrediction(layerOutputs, drawing);
  };

  makeTestImagePrediction = async () => {
    const { xs, labels } = this.props.getRandomTestImage();
    const imageTensor = xs;
    const imageVector = await imageTensor.dataSync();
    const image = reshapeArrayTo2D(imageVector, 28, 28);
    const layerOutputs = await this.getLayerOutputs(imageTensor);
    this.props.onMakePrediction(layerOutputs, image);

    this.testWeightCreation(layerOutputs, image, this.props.trainedModel);
  };

  render() {
    const { trainedModel, datasetName } = this.props;
    return (
      <div>
        <CanvasComponent
          ref={this.myRef}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
        />
        <Button size="mini" onClick={this.clearDrawing}>
          Clear
        </Button>
        <Button
          size="mini"
          color="blue"
          onClick={this.makeDrawingPrediction}
          disabled={Object.keys(trainedModel).length === 0 || !datasetName}
        >
          Predict Drawing
        </Button>
        <Button
          size="mini"
          color="blue"
          onClick={this.makeTestImagePrediction}
          disabled={Object.keys(trainedModel).length === 0 || !datasetName}
        >
          Predict Test Image
        </Button>
      </div>
    );
  }
}

export default Predict;
