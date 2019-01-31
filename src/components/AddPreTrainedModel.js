import React, { Component } from "react";
import { Button, Icon, Segment, Input, Dropdown } from "semantic-ui-react";

import * as tf from "@tensorflow/tfjs";

const preTrainedModelOptions = [
  { name: "dense-1epoch" },
  { name: "dense-3epochs" },
  { name: "conv-1epoch" },
  { name: "conv-3epochs" }
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
