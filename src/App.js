import React, { Component } from "react";
// import "./App.css";
import NetworkScene from "./components/NetworkScene";
import Left from "./components/Left";

import TfStuff from "./components/TfStuff";
import Draw from "./components/Draw";

import AddPreTrainedModel from "./components/AddPreTrainedModel";
import LoadData from "./components/LoadData";

import ShowLoading from "./components/ShowLoading";
import Info from "./components/Info";

import { Input, Button } from "semantic-ui-react";

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
      datasetName: null,
      starterNetworkName: null,
      networkSceneWindowRatios: {
        windowHeightRatio: 0.5,
        windowWidthRatio: 0.5
      }
    };
    this.dataRef = React.createRef();
  }

  updateLayers = (newLayers, starterNetworkName) => {
    this.setState({
      layers: newLayers,
      layerOutputs: [],
      trainedModel: {},
      starterNetworkName
    });
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
    return randomTestImage;
  };

  getTrainData = () => {
    return this.dataRef.current.getTrainData();
  };
  getTestData = () => {
    return this.dataRef.current.getTestData();
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
            <Info
              datasetName={this.state.datasetName}
              starterNetworkName={this.state.starterNetworkName}
              trainedModel={this.state.trainedModel}
            />
            <ShowLoading isCurrentlyTraining={this.state.isCurrentlyTraining} />
            <Draw
              onMakePrediction={this.onMakePrediction}
              trainedModel={this.state.trainedModel}
              getRandomTestImage={this.getRandomTestImage}
              datasetName={this.state.datasetName}
            />
            <AddPreTrainedModel
              onLoadPreTrainedModel={this.onLoadPreTrainedModel}
              starterNetworkName={this.state.starterNetworkName}
            />
            <Left updateLayers={this.updateLayers} />
          </div>
        </div>

        <div style={{ display: "inline-block", width: "50%" }}>
          <NetworkScene
            windowHeightRatio={
              this.state.networkSceneWindowRatios.windowHeightRatio
            }
            windowWidthRatio={
              this.state.networkSceneWindowRatios.windowWidthRatio
            }
            layers={this.state.layers}
            drawing={this.state.drawing}
            layerOutputs={this.state.layerOutputs}
          />
          <Button
            onClick={() => {
              const isHalfScreen =
                this.state.networkSceneWindowRatios.windowHeightRatio === 0.5;
              console.log(this.state.networkSceneWindowRatios);
              let networkSceneWindowRatios;
              if (isHalfScreen) {
                networkSceneWindowRatios = {
                  windowHeightRatio: 0.9,
                  windowWidthRatio: 1.0
                };
              } else {
                networkSceneWindowRatios = {
                  windowHeightRatio: 0.5,
                  windowWidthRatio: 0.5
                };
              }
              this.setState({
                networkSceneWindowRatios
              });
            }}
          >
            FullScreen
          </Button>
          <LoadData ref={this.dataRef} onLoadedDataset={this.onLoadedDataset} />
          <TfStuff
            layers={this.state.layers}
            numEpochs={this.state.numEpochs}
            onChangeNumEpochs={this.onChangeNumEpochs}
            onFinishedTrainingModel={this.onFinishedTrainingModel}
            onStartTrainingModel={this.onStartTrainingModel}
            drawing={this.state.drawing}
            datasetName={this.state.datasetName}
            getTrainData={this.getTrainData}
            getTestData={this.getTestData}
          />
        </div>
      </div>
    );
  }
}

export default App;
