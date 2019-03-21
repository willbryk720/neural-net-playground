import React, { Component } from "react";
import { Button, Input, Form, Radio } from "semantic-ui-react";
import PredictCanvas from "./PredictCanvas";

import * as tf from "@tensorflow/tfjs";

import { reshape2DTensorToArray } from "../../utils/reshaping";
import { getLayerOutputs, getGradient } from "../../utils/prediction";

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;

class Predict extends Component {
  constructor(props) {
    super(props);
    this.state = { drawColorFrac: 1.0, pointerSize: "big" };
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

  handleChange = (e, { name, value }) => this.setState({ [name]: value });
  handleRadioChange = (e, { value }) => this.setState({ pointerSize: value });

  render() {
    const { trainedModel, datasetInfo } = this.props;

    const shouldShow = Object.keys(trainedModel).length !== 0 && datasetInfo.name;
    if (!shouldShow) {
      return <div />;
    }

    return (
      <div>
        <PredictCanvas
          ref={this.myRef}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          datasetInfo={this.props.datasetInfo}
          drawing={this.props.drawing}
          drawColorFrac={this.state.drawColorFrac}
          pointerSize={this.state.pointerSize}
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
        <Input
          min={0}
          max={1}
          name="drawColorFrac"
          onChange={this.handleChange}
          step={0.1}
          type="range"
          value={this.state.drawColorFrac}
        />
        {/* <Dropdown
          closeOnChange
          onChange={this.onChange}
          options={[
            { key: 1, text: "small", value: 0 },
            { key: 2, text: "medium", value: 0.5 },
            { key: 3, text: "big", value: 1 }
          ]}
          placeholder={"Size"}
          clearable
          fluid
          selection
          compact
          selectOnNavigation={false}
          selectOnBlur={false}
        /> */}
        <div style={{ float: "right" }}>
          <Form>
            <Form.Field>
              <Radio
                label="Small"
                name="radioGroup"
                value="small"
                checked={this.state.pointerSize === "small"}
                onChange={this.handleRadioChange}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="Medium"
                name="radioGroup"
                value="medium"
                checked={this.state.pointerSize === "medium"}
                onChange={this.handleRadioChange}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="Big"
                name="radioGroup"
                value="big"
                checked={this.state.pointerSize === "big"}
                onChange={this.handleRadioChange}
              />
            </Form.Field>
          </Form>
        </div>
      </div>
    );
  }
}

export default Predict;
