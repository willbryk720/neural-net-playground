import React, { Component } from "react";

import { MnistData } from "../utils/data";
import { Button, Icon } from "semantic-ui-react";

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
        {this.props.datasetName && (
          <span>
            <b>{this.props.datasetName}</b>
            <Icon name="check" color="green" />
          </span>
        )}
      </div>
    );
  }
}

export default LoadData;
