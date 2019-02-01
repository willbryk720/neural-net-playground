import React, { Component } from "react";
import { Button, Icon } from "semantic-ui-react";

import * as tf from "@tensorflow/tfjs";

class AddPreTrainedModel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async downloadPreTrainedModel(modelName) {
    // const preTrainedModel = await tf.loadModel(
    //   `http://localhost:3000/${modelName}.json`
    // );
    console.log(process.env.NODE_ENV);
    console.log(`${process.env.PUBLIC_URL}/${modelName}.json`);
    let urlStr;
    if (process.env.NODE_ENV === "development") {
      urlStr = `http://localhost:3000/${modelName}.json`;
    } else {
      urlStr = `https://calm-thicket-77808.herokuapp.com/${modelName}.json`;
    }
    console.log("URLSTR", urlStr);
    const preTrainedModel = await tf.loadModel(urlStr);
    preTrainedModel.preTrainedModelName = modelName;
    console.log(modelName, preTrainedModel);
    this.props.onLoadPreTrainedModel(preTrainedModel);
  }

  render() {
    const { onLoadPreTrainedModel, preTrainedModelOptions } = this.props;

    const preTrainedModelAllowedOptions = preTrainedModelOptions.filter(
      pTM => this.props.starterNetworkName === pTM.name.split("-")[0]
    );

    if (preTrainedModelAllowedOptions.length === 0) {
      return <div />;
    }

    return (
      <div>
        <h5>Choose from Pre-trained options:</h5>
        {preTrainedModelAllowedOptions.map(pTM => (
          <Button
            key={pTM.name}
            size="small"
            color="green"
            onClick={() => this.downloadPreTrainedModel(pTM.name)}
          >
            {pTM.name}
          </Button>
        ))}
        {this.props.preTrainedModelName && (
          <span>
            {this.props.preTrainedModelName} <Icon name="check" color="green" />
          </span>
        )}
      </div>
    );
  }
}

export default AddPreTrainedModel;
