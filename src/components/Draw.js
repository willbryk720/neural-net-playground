import React, { Component } from "react";
import SortableLayers from "./SortableLayers";
import CanvasDraw from "react-canvas-draw";
import { Button } from "semantic-ui-react";

import * as tf from "@tensorflow/tfjs";

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;

function reshapeArrayTo2D(arr, numRows, numCols) {
  let newArr = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push(arr[i * numRows + j]);
    }
    newArr.push(row);
  }
  return newArr;
}

class Draw extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.myRef = React.createRef();
  }

  getDrawingFromPoints = points => {
    let drawing = Array.from(Array(28), _ => Array(28).fill(0));
    points.forEach(p => {
      const row = Math.floor((28 * p.y) / CANVAS_HEIGHT);
      const col = Math.floor((28 * p.x) / CANVAS_WIDTH);
      drawing[row][col] = 0.95;
    });
    return drawing;
  };

  clearDrawing = () => {
    this.myRef.current.clear();

    // const t = tf.tensor([[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]]);
    // console.log(t.dataSync());
    // console.log(t.shape);
  };

  getDrawing = () => {
    const node = this.myRef.current;
    const drawingData = JSON.parse(node.getSaveData()).lines;
    let points = [];
    console.log(drawingData);
    drawingData.forEach(l => {
      points = points.concat(l.points);
    });
    const drawing = this.getDrawingFromPoints(points);

    return drawing;
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

  makeDrawingPrediction = async () => {
    const drawing = this.getDrawing();
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
  };

  render() {
    const { trainedModel, datasetName } = this.props;
    return (
      <div>
        <h3>Predict</h3>
        <CanvasDraw
          loadTimeOffset={5}
          lazyRadius={0}
          brushRadius={4}
          hideGrid={false}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          ref={this.myRef}
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

export default Draw;
