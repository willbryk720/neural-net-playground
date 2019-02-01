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

const preTrainedModelOptions = [
  { name: "Dense-1epoch" },
  { name: "Dense-3epochs" },
  { name: "Conv-1epoch" },
  { name: "Conv-3epochs" }
];

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
      <div
        className="App"
        style={{
          height: "100%"
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: "50%",
            verticalAlign: "top",
            height: "100%",
            overflowY: "auto"
          }}
        >
          <div
            style={{
              marginLeft: "2%",
              marginRight: "2%",
              height: "100%"
            }}
          >
            <ShowLoading isCurrentlyTraining={this.state.isCurrentlyTraining} />
            <h1>1. Load Data</h1>
            <LoadData
              ref={this.dataRef}
              onLoadedDataset={this.onLoadedDataset}
            />
            <h1>2. Create Layers</h1>
            <Left updateLayers={this.updateLayers} />

            <h1>3. Create Weights</h1>
            <AddPreTrainedModel
              onLoadPreTrainedModel={this.onLoadPreTrainedModel}
              starterNetworkName={this.state.starterNetworkName}
              preTrainedModelOptions={preTrainedModelOptions}
            />
            {preTrainedModelOptions.find(
              pTM => pTM.name.split("-")[0] === this.state.starterNetworkName
            ) ? (
              <h5>Or train model from scratch:</h5>
            ) : (
              <h5>Train model from scratch:</h5>
            )}
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

        <div style={{ display: "inline-block", width: "50%", height: "100%" }}>
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
          {/* <Button
            onClick={() => {
              const isHalfScreen =
                this.state.networkSceneWindowRatios.windowWidthRatio === 0.5;
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
          </Button> */}
          <h1>Predict</h1>
          <Draw
            onMakePrediction={this.onMakePrediction}
            trainedModel={this.state.trainedModel}
            getRandomTestImage={this.getRandomTestImage}
            datasetName={this.state.datasetName}
          />
          {/* <Info
            datasetName={this.state.datasetName}
            starterNetworkName={this.state.starterNetworkName}
            trainedModel={this.state.trainedModel}
          /> */}
        </div>
      </div>
    );
  }
}

export default App;
