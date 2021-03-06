import React, { Component } from "react";
import { Button, Input, Form } from "semantic-ui-react";

import * as tf from "@tensorflow/tfjs";

import { reshape2DTensorToArray } from "../../utils/reshaping";
import { getLayerOutputs, getGradient, getFilterGradient } from "../../utils/prediction";
import { getArrayMax, getArrayMin } from "../../utils/general";

class FilterViz extends Component {
  constructor(props) {
    super(props);
    this.state = { numIterations: 3, epsilon: 0.5, loadingOneStep: false, loadingMultSteps: false };
  }

  maximizeFilter = async numSteps => {
    const { datasetInfo, drawing, trainedModel, analyzeInfo } = this.props;

    let imageTensor = tf
      .tensor(drawing)
      .reshape([1, datasetInfo.inputLength, datasetInfo.inputLength, 1]);

    for (let i = 0; i < numSteps; i++) {
      const gradient = await getFilterGradient(imageTensor, trainedModel, analyzeInfo);
      const newImage = imageTensor.add(gradient.mul(tf.scalar(Number(this.state.epsilon))));
      imageTensor = newImage;
    }

    // update App.js with new drawing and new layerOutputs
    const imageVector = await imageTensor.dataSync();
    const image = reshape2DTensorToArray(
      imageVector,
      datasetInfo.inputLength,
      datasetInfo.inputLength
    );

    const maxValue = getArrayMax(imageVector);
    const minValue = getArrayMin(imageVector);
    image.forEach((row, r) => {
      row.forEach((col, c) => {
        image[r][c] = (image[r][c] - minValue) / (maxValue - minValue);
      });
    });

    const layerOutputs = await getLayerOutputs(imageTensor, trainedModel);
    this.props.onMakePrediction(layerOutputs, image);

    this.setState({ loadingOneStep: false, loadingMultSteps: false });
  };

  render() {
    const { trainedModel, datasetInfo, analyzeInfo, drawing } = this.props;

    const { inLayerMetadata, curLayerMetadata } = analyzeInfo;

    if (Object.keys(analyzeInfo).length === 0) {
      return <p>No filter selected yet</p>;
    } else if (drawing.length === 0) {
      return <p>No image predicted yet</p>;
    } else if (!curLayerMetadata.isSquare) {
      return <p>You must select a neuron inside a square filter</p>;
    }

    return (
      <div>
        <p>Maximize the filter of the selected Neuron</p>
        <Form>
          <Form.Field inline>
            <label>Epsilon</label>
            <Input
              width={1}
              type={"Number"}
              value={this.state.epsilon}
              onChange={(e, { value }) => {
                console.log(value);
                console.log(typeof value);
                this.setState({ epsilon: value });
              }}
            />
          </Form.Field>
          <Button
            loading={this.state.loadingOneStep}
            size="mini"
            color="blue"
            onClick={() => {
              this.setState({ loadingOneStep: true });
              this.maximizeFilter(1);
            }}
            disabled={Object.keys(trainedModel).length === 0 || !datasetInfo.name} // this might be unecessary
          >
            One Step
          </Button>

          <Form.Field inline>
            <label>Take Multiple Steps</label>
            <Input
              width={1}
              type={"Number"}
              value={this.state.numIterations}
              onChange={(e, { value }) => this.setState({ numIterations: Number(value) })}
            />
          </Form.Field>
          <Button
            loading={this.state.loadingMultSteps}
            size="mini"
            color="blue"
            onClick={() => {
              this.setState({ loadingMultSteps: true });
              this.maximizeFilter(this.state.numIterations);
            }}
            disabled={Object.keys(trainedModel).length === 0 || !datasetInfo.name} // this might be unecessary
          >
            Multiple Steps
          </Button>
        </Form>
      </div>
    );
  }
}

export default FilterViz;
