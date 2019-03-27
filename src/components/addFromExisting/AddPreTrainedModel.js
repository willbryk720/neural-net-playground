import React, { Component } from "react";
import { Button, Icon, Dropdown } from "semantic-ui-react";

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
    // console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
    // console.log("process.env.PUBLIC_URL:", process.env.PUBLIC_URL);
    // console.log(`${process.env.PUBLIC_URL}/${modelName}.json`);

    let urlStr;
    // urlStr = `https://artificialneuroscientist.herokuapp.com/${
    //   process.env.PUBLIC_URL
    // }/${modelName}.json`;
    // urlStr = `http://localhost:3000/${modelName}.json`;
    // console.log("URLSTR:", urlStr);

    // using relative path instead
    urlStr = process.env.PUBLIC_URL + `${modelName}.json`;

    const preTrainedModel = await tf.loadModel(urlStr);
    preTrainedModel.preTrainedModelName = modelName;
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

    const options = preTrainedModelAllowedOptions.map(pTM => {
      return { key: pTM.name, text: pTM.name, value: pTM.name };
    });

    return (
      <div>
        {/* <img src={logo} alt="Logo" /> */}
        <h5>Choose from Pre-trained options:</h5>
        <Dropdown
          placeholder="Starter Weights"
          search
          selection
          options={options}
          onChange={(e, { value }) => {
            this.downloadPreTrainedModel(value);
          }}
          selectOnNavigation={false}
          selectOnBlur={false}
        />
      </div>
    );
  }
}

export default AddPreTrainedModel;
