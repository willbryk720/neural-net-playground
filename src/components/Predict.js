import React, { Component } from "react";
import { Button } from "semantic-ui-react";
import CanvasComponent from "./CanvasComponent";

import * as tf from "@tensorflow/tfjs";

import { reshape2DTensorToArray } from "../utils/reshaping";
import { getLayerOutputs } from "../utils/prediction";

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;

class Predict extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.myRef = React.createRef();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.countForRendering !== this.props.countForRendering) {
      this.makeDrawingPrediction();
    }
  }

  clearDrawing = () => {
    this.myRef.current.clear();
  };

  makeDrawingPrediction = async () => {
    // const drawing = this.getDrawing();
    const drawing = this.myRef.current.state.points;
    const imageTensor = tf.tensor(drawing).reshape([1, 28, 28, 1]);
    const layerOutputs = await getLayerOutputs(imageTensor, this.props.trainedModel);
    this.props.onMakePrediction(layerOutputs, drawing);
  };

  makeTestImagePrediction = async () => {
    const { xs, labels } = this.props.getRandomTestImage();
    const imageTensor = xs;
    const imageVector = await imageTensor.dataSync();
    const image = reshape2DTensorToArray(imageVector, 28, 28);
    const layerOutputs = await getLayerOutputs(imageTensor, this.props.trainedModel);
    this.props.onMakePrediction(layerOutputs, image);
  };

  render() {
    const { trainedModel, datasetName } = this.props;
    return (
      <div>
        <CanvasComponent
          ref={this.myRef}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          drawing={this.props.drawing}
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
