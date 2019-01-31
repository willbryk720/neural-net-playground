import React, { Component } from "react";
import SortableLayers from "./SortableLayers";
import CanvasDraw from "react-canvas-draw";
import { Button } from "semantic-ui-react";

import * as tf from "@tensorflow/tfjs";

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;

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

  makePrediction = async () => {
    const drawing = this.getDrawing();
    const { trainedModel } = this.props;

    let layerOutputs = [];

    let input = tf.tensor(drawing).reshape([1, 28, 28, 1]);

    console.log("INPUT", input, input.dataSync());
    const layers = trainedModel.layers;
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var output = await layer.apply(input);
      input = output;
      console.log("OUTPUT BRO");
      console.log(output, output.dataSync());
      layerOutputs.push(output);
    }
    console.log("----------------------------------");

    this.props.onMakePrediction(layerOutputs, drawing);
  };

  render() {
    const { trainedModel } = this.props;
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
          onClick={this.makePrediction}
          disabled={Object.keys(trainedModel).length === 0}
        >
          Predict
        </Button>
      </div>
    );
  }
}

export default Draw;
