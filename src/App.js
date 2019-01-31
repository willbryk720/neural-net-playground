import React, { Component } from "react";
// import "./App.css";
import NetworkScene from "./components/NetworkScene";
import Left from "./components/Left";

import TfStuff from "./components/TfStuff";
import Draw from "./components/Draw";

import AddPreTrainedModel from "./components/AddPreTrainedModel";
import LoadData from "./components/LoadData";

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
      isCurrentlyTraining: false,
      datasetName: null
    };
    this.dataRef = React.createRef();
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

  getRandomTestImage = () => {
    const randomTestImage = this.dataRef.current.getRandomTestImage();
    console.log(randomTestImage);
    return randomTestImage;
  };

  onLoadedDataset = datasetName => {
    this.setState({ datasetName });
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
              getRandomTestImage={this.getRandomTestImage}
              datasetName={this.state.datasetName}
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
          <LoadData ref={this.dataRef} onLoadedDataset={this.onLoadedDataset} />
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
