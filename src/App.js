import React, { Component } from "react";
// import "./App.css";
import NetworkScene from "./components/NetworkScene";
import Left from "./components/Left";

import TfStuff from "./components/TfStuff";
import Draw from "./components/Draw";

import AddPreTrainedModel from "./components/AddPreTrainedModel";

import { Input } from "semantic-ui-react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layers: [],
      layerOutputs: [],
      numEpochs: 2,
      drawing: [],
      trainedModel: {},
      isCurrentlyTraining: false
    };
  }

  updateLayers = newLayers => {
    this.setState({ layers: newLayers, layerOutputs: [], trainedModel: {} });
  };

  onChangeNumEpochs = newNumEpochs => {
    this.setState({ numEpochs: newNumEpochs });
  };

  onMakePrediction = (layerOutputs, drawing) => {
    this.setState({ drawing, layerOutputs });
  };

  onFinishedTrainingModel = model => {
    this.setState({ trainedModel: model, isCurrentlyTraining: false });
    console.log("NEWMODEL", model);
  };

  onStartTrainingModel = () => {
    this.setState({
      isCurrentlyTraining: true,
      trainedModel: {}
    });
  };

  onLoadPreTrainedModel = preTrainedModel => {
    // isLoadingPreTrainedModel
    this.setState({
      trainedModel: preTrainedModel
    });
  };

  render() {
    return (
      <div className="App">
        <div
          style={{
            display: "inline-block",
            width: "50%",
            verticalAlign: "top"
          }}
        >
          <div style={{ marginLeft: "2%", marginRight: "2%" }}>
            <Draw
              onMakePrediction={this.onMakePrediction}
              trainedModel={this.state.trainedModel}
            />
            <AddPreTrainedModel
              onLoadPreTrainedModel={this.onLoadPreTrainedModel}
            />
            <Left updateLayers={this.updateLayers} />
          </div>
        </div>

        <div style={{ display: "inline-block", width: "50%" }}>
          <NetworkScene
            windowHeightRatio={0.5}
            windowWidthRatio={0.5}
            layers={this.state.layers}
            drawing={this.state.drawing}
            layerOutputs={this.state.layerOutputs}
          />
          <TfStuff
            layers={this.state.layers}
            numEpochs={this.state.numEpochs}
            onChangeNumEpochs={this.onChangeNumEpochs}
            onFinishedTrainingModel={this.onFinishedTrainingModel}
            onStartTrainingModel={this.onStartTrainingModel}
            drawing={this.state.drawing}
          />
        </div>
      </div>
    );
  }
}

export default App;
