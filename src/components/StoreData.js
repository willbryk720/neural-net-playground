import React, { Component } from "react";

import { MnistData, FacesOrNotData } from "../utils/data";
import { Button, Icon } from "semantic-ui-react";

class StoreData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
  }

  componentDidMount = () => {
    console.log("REMOUNTED STOREDATA");
  };

  componentWillReceiveProps(nextProps) {
    console.log("STORE DATA RECEIVED NEW PROPS");
    // If requestedDataLoading is not null and its different from the previous props
    // Then the user wants to fetch new data
    // It might be different but nonNull if the user requests a new dataset
    if (
      nextProps.requestedDatasetLoading &&
      nextProps.requestedDatasetLoading !== this.props.requestedDatasetLoading
    ) {
      this.getData(nextProps.requestedDatasetLoading);
    }
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
    return <div style={{ display: "none" }} />;
  }
}

export default StoreData;
