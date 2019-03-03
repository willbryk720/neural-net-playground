import React, { Component } from "react";
import { Button, Input } from "semantic-ui-react";

import * as tf from "@tensorflow/tfjs";

import { reshape2DTensorToArray } from "../../utils/reshaping";
import { getLayerOutputs, getGradient } from "../../utils/prediction";

class MaximizeNeuron extends Component {
  constructor(props) {
    super(props);
    this.state = { numIterations: 3, epsilon: 0.5 };
  }

  maximizeNeuron = async numSteps => {
    console.log(numSteps, typeof numSteps);
    const { datasetInfo, drawing, trainedModel, analyzeInfo } = this.props;

    console.log(analyzeInfo);

    let imageTensor = tf
      .tensor(drawing)
      .reshape([1, datasetInfo.inputLength, datasetInfo.inputLength, 1]);

    for (let i = 0; i < numSteps; i++) {
      const gradient = await getGradient(imageTensor, trainedModel, 0);
      const newImage = imageTensor.sub(gradient.mul(tf.scalar(this.state.epsilon)));
      imageTensor = newImage;
    }

    // update App.js with new drawing and new layerOutputs
    console.log("NEWIMAGE", imageTensor);
    const imageVector = await imageTensor.dataSync();
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

    const layerOutputs = await getLayerOutputs(imageTensor, trainedModel);
    this.props.onMakePrediction(layerOutputs, image);
  };

  render() {
    const { trainedModel, datasetInfo } = this.props;

    return (
      <div>
        <Input
          width={1}
          type={"Number"}
          value={this.state.epsilon}
          onChange={(e, { value }) => {
            console.log(value);
            console.log(typeof value);
            this.setState({ epsilon: Number(value) });
          }}
        />
        <Button
          size="mini"
          color="blue"
          onClick={() => this.maximizeNeuron(1)}
          disabled={Object.keys(trainedModel).length === 0 || !datasetInfo.name} // this might be unecessary
        >
          One Step
        </Button>
        <Input
          width={1}
          type={"Number"}
          value={this.state.numIterations}
          onChange={(e, { value }) => this.setState({ numIterations: Number(value) })}
        />
        <Button
          size="mini"
          color="blue"
          onClick={() => this.maximizeNeuron(this.state.numIterations)}
          disabled={Object.keys(trainedModel).length === 0 || !datasetInfo.name} // this might be unecessary
        >
          Multiple Steps
        </Button>
      </div>
    );
  }
}

export default MaximizeNeuron;
