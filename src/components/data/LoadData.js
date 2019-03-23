import React, { Component } from "react";

import { MnistData, FacesOrNotData } from "../../utils/data";
import { Button, Icon, Dropdown, Popup } from "semantic-ui-react";

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
        <Dropdown
          disabled={isLoadingDataset}
          loading={isLoadingDataset}
          placeholder="Load Dataset"
          search
          selection
          options={[
            { key: 1, text: "MNIST Dataset", value: "MNIST" },
            { key: 2, text: "FacesOrNot Dataset", value: "FacesOrNot" }
          ]}
          onChange={(e, { value }) => {
            onClickedLoadDataset(value);
          }}
          selectOnNavigation={false}
          selectOnBlur={false}
        />
      </div>
    );
  }
}

export default LoadData;
