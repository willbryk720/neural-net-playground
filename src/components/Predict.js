import React, { Component } from "react";
import { Button } from "semantic-ui-react";
import CanvasComponent from "./CanvasComponent";

import * as tf from "@tensorflow/tfjs";

import { reshape2DTensorToArray } from "../utils/reshaping";
import { getLayerOutputs, getGradient } from "../utils/prediction";

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
    const { datasetInfo } = this.props;
    // const drawing = this.getDrawing();
    const drawing = this.myRef.current.state.points;
    const imageTensor = tf
      .tensor(drawing)
      .reshape([1, datasetInfo.inputLength, datasetInfo.inputLength, 1]);
    const layerOutputs = await getLayerOutputs(imageTensor, this.props.trainedModel);
    this.props.onMakePrediction(layerOutputs, drawing);
  };

  makeTestImagePrediction = async () => {
    const { datasetInfo } = this.props;
    const { xs, labels } = this.props.getRandomTestImage();
    const imageTensor = xs;
    const imageVector = await imageTensor.dataSync();
    const image = reshape2DTensorToArray(
      imageVector,
      datasetInfo.inputLength,
      datasetInfo.inputLength
    );
    console.log(image);
    const layerOutputs = await getLayerOutputs(imageTensor, this.props.trainedModel);
    this.props.onMakePrediction(layerOutputs, image);
  };

  makeAdversarialPrediction = async () => {
    const { datasetInfo } = this.props;

    const drawing = this.myRef.current.state.points;
    const imageTensor = tf
      .tensor(drawing)
      .reshape([1, datasetInfo.inputLength, datasetInfo.inputLength, 1]);
    let newImage = await getGradient(imageTensor, this.props.trainedModel, 0);
    // newImage = newImage.reshape([1, datasetInfo.inputLength, datasetInfo.inputLength, 1]);
    console.log("NEWIMAGE", newImage);
    const imageVector = await newImage.dataSync();
    const image = reshape2DTensorToArray(
      imageVector,
      datasetInfo.inputLength,
      datasetInfo.inputLength
    );
    image.forEach((row, r) => {
      row.forEach((col, c) => {
        if (image[r][c] < 0) {
          image[r][c] = 0;
        } else if (image[r][c] > 1) {
          image[r][c] = 1;
        }
      });
    });
    console.log("IMAGE", image);
    const layerOutputs = await getLayerOutputs(newImage, this.props.trainedModel);
    this.props.onMakePrediction(layerOutputs, image);
  };

  render() {
    const { trainedModel, datasetInfo } = this.props;

    const shouldShow = Object.keys(trainedModel).length !== 0 && datasetInfo.name;
    if (!shouldShow) {
      return <div />;
    }

    return (
      <div>
        <CanvasComponent
          ref={this.myRef}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          datasetInfo={this.props.datasetInfo}
          drawing={this.props.drawing}
        />
        <Button size="mini" onClick={this.clearDrawing}>
          Clear
        </Button>
        <Button
          size="mini"
          color="blue"
          onClick={this.makeDrawingPrediction}
          disabled={Object.keys(trainedModel).length === 0 || !datasetInfo.name} // this might be unecessary
        >
          Predict Drawing
        </Button>
        <Button
          size="mini"
          color="blue"
          onClick={this.makeTestImagePrediction}
          disabled={Object.keys(trainedModel).length === 0 || !datasetInfo.name} // this might be unecessary
        >
          Predict Test Image
        </Button>
        <Button
          size="mini"
          color="blue"
          onClick={this.makeAdversarialPrediction}
          disabled={Object.keys(trainedModel).length === 0 || !datasetInfo.name} // this might be unecessary
        >
          Adverary
        </Button>
      </div>
    );
  }
}

export default Predict;
