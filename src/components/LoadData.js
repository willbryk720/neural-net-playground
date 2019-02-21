import React, { Component } from "react";

import { MnistData, FacesOrNotData } from "../utils/data";
import { Button, Icon } from "semantic-ui-react";

class LoadData extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    console.log("REMOUNTED LOADDATA");
  };

  render() {
    const { onClickedLoadDataset, requestedDatasetLoading, datasetInfo } = this.props;

    const isLoadingDataset = requestedDatasetLoading !== null;

    return (
      <div>
        <Button
          disabled={isLoadingDataset}
          loading={requestedDatasetLoading === "MNIST"}
          color="blue"
          onClick={() => {
            onClickedLoadDataset("MNIST");
          }}
        >
          Load MNIST Data
        </Button>
        <Button
          disabled={isLoadingDataset}
          loading={requestedDatasetLoading === "FacesOrNot"}
          color="blue"
          onClick={() => {
            onClickedLoadDataset("FacesOrNot");
          }}
        >
          Load FacesOrNot Data
        </Button>
        {datasetInfo.name && (
          <span>
            <b>{datasetInfo.name}</b>
            <Icon name="check" color="green" />
          </span>
        )}
      </div>
    );
  }
}

export default LoadData;
