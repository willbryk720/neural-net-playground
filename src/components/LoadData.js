import React, { Component } from "react";

import { MnistData, FacesOrNotData } from "../utils/data";
import { Button, Icon } from "semantic-ui-react";

class LoadData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentlyGettingData: false,
      data: {}
    };
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

  async getData(datasetName) {
    if (datasetName === "MNIST") {
      let data = new MnistData();
      await data.load();
      this.setState({ data, currentlyGettingData: false });
      this.props.onLoadedDataset({ name: "MNIST", inputLength: 28 });
    } else if (datasetName === "FacesOrNot") {
      let data = new FacesOrNotData();
      await data.load();
      console.log("FACEDATA", data.getTestImage());
      this.setState({ data, currentlyGettingData: false });
      this.props.onLoadedDataset({ name: "FacesOrNot", inputLength: 48 });
    }
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
            this.getData("MNIST");
          }}
        >
          Load MNIST Data
        </Button>
        <Button
          disabled={this.state.currentlyGettingData}
          loading={this.state.currentlyGettingData}
          color="blue"
          onClick={() => {
            this.setState({ currentlyGettingData: true });
            this.getData("FacesOrNot");
          }}
        >
          Load FacesOrNot Data
        </Button>
        {this.props.datasetInfo.name && (
          <span>
            <b>{this.props.datasetInfo.name}</b>
            <Icon name="check" color="green" />
          </span>
        )}
      </div>
    );
  }
}

export default LoadData;
