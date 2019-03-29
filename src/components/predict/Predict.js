import React, { Component } from "react";
import { Button, Input, Form, Icon } from "semantic-ui-react";
import PredictCanvas from "./PredictCanvas";

import * as tf from "@tensorflow/tfjs";

import { reshape2DTensorToArray } from "../../utils/reshaping";
import { getLayerOutputs, getGradient } from "../../utils/prediction";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 300;

class Predict extends Component {
  constructor(props) {
    super(props);
    this.state = { drawColorFrac: 1.0, pointerSize: "medium" };
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
    const layerOutputs = await getLayerOutputs(imageTensor, this.props.trainedModel);
    this.props.onMakePrediction(layerOutputs, image);
  };

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  render() {
    const { trainedModel, datasetInfo } = this.props;

    const shouldShow = Object.keys(trainedModel).length !== 0 && datasetInfo.name;
    if (!shouldShow) {
      return <div />;
    }

    return (
      <div>
        <div>
          <Button
            size="small"
            color="blue"
            onClick={this.makeTestImagePrediction}
            disabled={Object.keys(trainedModel).length === 0 || !datasetInfo.name} // this might be unecessary
          >
            New Test Image
          </Button>
        </div>
        <div style={{ height: "4px" }} />
        <PredictCanvas
          ref={this.myRef}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          datasetInfo={this.props.datasetInfo}
          drawing={this.props.drawing}
          drawColorFrac={this.state.drawColorFrac}
          pointerSize={this.state.pointerSize}
        />

        <div>
          <Icon name="circle" size="large" />
          <Input
            min={0}
            max={1}
            name="drawColorFrac"
            onChange={this.handleChange}
            step={0.1}
            type="range"
            value={this.state.drawColorFrac}
          />
          <Icon name="circle outline" size="large" />
          <div
            style={{
              width: "20px",
              display: "inline-block"
            }}
          />
          <div style={{ display: "inline-block" }}>
            <div style={{ height: "4px" }} />
            <div
              style={{
                width: "12px",
                height: "12px",
                background: "grey",
                display: "inline-block",
                outline: this.state.pointerSize === "small" ? "3px solid lightblue" : ""
              }}
              onClick={() => this.setState({ pointerSize: "small" })}
            />
            <div
              style={{
                width: "10px",
                display: "inline-block"
              }}
            />
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "grey",
                display: "inline-block",
                outline: this.state.pointerSize === "medium" ? "3px solid lightblue" : ""
              }}
              onClick={() => this.setState({ pointerSize: "medium" })}
            />
            <div
              style={{
                width: "10px",
                display: "inline-block"
              }}
            />
            <div
              style={{
                width: "30px",
                height: "30px",
                background: "grey",
                display: "inline-block",
                outline: this.state.pointerSize === "big" ? "3px solid lightblue" : ""
              }}
              onClick={() => this.setState({ pointerSize: "big" })}
            />
          </div>
          <Button size="mini" onClick={this.clearDrawing} style={{ float: "right" }}>
            Clear
          </Button>

          <Button
            size="small"
            color="blue"
            onClick={this.makeDrawingPrediction}
            disabled={Object.keys(trainedModel).length === 0 || !datasetInfo.name} // this might be unecessary
          >
            Predict Modified Image
          </Button>
        </div>
      </div>
    );
  }
}

export default Predict;
