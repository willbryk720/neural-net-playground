import React, { Component } from "react";
import { Button, Icon, Segment, Input, Dropdown } from "semantic-ui-react";

import * as tf from "@tensorflow/tfjs";

const preTrainedModelOptions = [
  { name: "Dense-1epoch" },
  { name: "Dense-3epochs" },
  { name: "Conv-1epoch" },
  { name: "Conv-3epochs" }
];

class AddPreTrainedModel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async downloadPreTrainedModel(modelName) {
    const preTrainedModel = await tf.loadModel(
      `http://localhost:3000/${modelName}.json`
    );
    console.log(modelName, preTrainedModel);
    this.props.onLoadPreTrainedModel(preTrainedModel);
  }

  render() {
    const { onLoadPreTrainedModel } = this.props;
    return (
      <div>
        <h3>Load Pre-trained Model</h3>
        {preTrainedModelOptions.map(pTM => (
          <Button
            key={pTM.name}
            size="small"
            color="green"
            disabled={this.props.starterNetworkName !== pTM.name.split("-")[0]}
            onClick={() => this.downloadPreTrainedModel(pTM.name)}
          >
            {pTM.name}
          </Button>
        ))}
      </div>
    );
  }
}

export default AddPreTrainedModel;
