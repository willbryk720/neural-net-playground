import React, { Component } from "react";
import { Button, Input, Form } from "semantic-ui-react";

import * as tf from "@tensorflow/tfjs";

import { reshape2DTensorToArray } from "../../utils/reshaping";
import { getLayerOutputs, getGradient } from "../../utils/prediction";
import { getArrayMax, getArrayMin } from "../../utils/general";

class MaximizeNeuron extends Component {
  constructor(props) {
    super(props);
    this.state = { numIterations: 3, epsilon: 0.5 };
  }

  maximizeNeuron = async numSteps => {
    const { datasetInfo, drawing, trainedModel, analyzeInfo } = this.props;

    let imageTensor = tf
      .tensor(drawing)
      .reshape([1, datasetInfo.inputLength, datasetInfo.inputLength, 1]);

    for (let i = 0; i < numSteps; i++) {
      const gradient = await getGradient(imageTensor, trainedModel, analyzeInfo);
      const newImage = imageTensor.sub(gradient.mul(tf.scalar(Number(this.state.epsilon))));
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
  };

  render() {
    const { trainedModel, datasetInfo, analyzeInfo, drawing } = this.props;

    if (Object.keys(analyzeInfo).length === 0) {
      return <p>No neuron selected yet</p>;
    } else if (drawing.length === 0) {
      return <p>No image predicted yet</p>;
    }

    return (
      <div>
        <p>Maximize the output of the selected Neuron</p>
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
            size="mini"
            color="blue"
            onClick={() => this.maximizeNeuron(1)}
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
            size="mini"
            color="blue"
            onClick={() => this.maximizeNeuron(this.state.numIterations)}
            disabled={Object.keys(trainedModel).length === 0 || !datasetInfo.name} // this might be unecessary
          >
            Multiple Steps
          </Button>
        </Form>
      </div>
    );
  }
}

export default MaximizeNeuron;
