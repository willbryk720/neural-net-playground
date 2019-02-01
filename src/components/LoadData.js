import React, { Component } from "react";

import * as tf from "@tensorflow/tfjs";
import { IMAGE_H, IMAGE_W, MnistData } from "../utils/data";
import { Button, Input } from "semantic-ui-react";

class LoadData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentlyGettingData: false,
      data: {}
    };
  }

  async load() {
    let data = new MnistData();
    await data.load();
    this.setState({ data });
    this.props.onLoadedDataset("MNIST");
    return data;
  }

  getRandomTestImage = () => {
    return this.state.data.getTestImage();
  };

  getTrainData = () => {
    return this.state.data.getTrainData();
  };
  getTestData = () => {
    return this.state.data.getTestData();
  };

  async getData() {
    const data = await this.load();
    this.setState({ currentlyGettingData: false });

    // const trainData = data.getTrainData();
    // const testData = data.getTestData();
  }

  render() {
    return (
      <div>
        <Button
          disabled={this.state.currentlyGettingData}
          loading={this.state.currentlyGettingData}
          color="blue"
          onClick={() => {
            this.setState({ currentlyGettingData: true });
            this.getData();
          }}
        >
          Load Data
        </Button>
      </div>
    );
  }
}

export default LoadData;
