import React, { Component } from "react";

import { Button } from "semantic-ui-react";

class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { datasetInfo, starterNetworkName, trainedModel } = this.props;
    return (
      <div>
        <h3>Info</h3>
        <ul>
          <li>datasetInfo: {datasetInfo}</li>
          <li>starterNetworkName: {starterNetworkName}</li>
          <li>preTrainedModelName: {trainedModel.preTrainedModelName}</li>
        </ul>
      </div>
    );
  }
}

export default Info;
