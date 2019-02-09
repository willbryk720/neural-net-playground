import React, { Component } from "react";
// import "./App.css";
import NetworkScene from "./components/NetworkScene";
import SortableLayers from "./components/SortableLayers";

import TfStuff from "./components/TfStuff";
import Predict from "./components/Predict";

import AddPreTrainedModel from "./components/AddPreTrainedModel";
import LoadData from "./components/LoadData";

import ShowLoading from "./components/ShowLoading";
import Info from "./components/Info";
import AnalyzeLayers from "./components/AnalyzeLayers";

import CircularLoading from "./components/common/CircularLoading";

import { Input, Button } from "semantic-ui-react";

const preTrainedModelOptions = [
  { name: "Dense-1epoch" },
  { name: "Dense-3epochs" },
  { name: "Conv-1epoch" },
  { name: "Conv-3epochs" },
  { name: "Conv-testweights" }
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
      isFullScreenMode: false
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
      trainedModel: preTrainedModel,
      layerOutputs: []
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

  // onBeginUpdateNetwork = () => {
  //   this.setState({ networkLoading: true });
  // };
  // onEndUpdateNetwork = () => this.setState({ networkLoading: false });

  render() {
    if (this.state.isFullScreenMode) {
      return (
        <div>
          <div style={{ width: "70%", display: "inline-block" }}>
            <NetworkScene
              windowHeightRatio={1.0}
              windowWidthRatio={0.68}
              layers={this.state.layers}
              drawing={this.state.drawing}
              layerOutputs={this.state.layerOutputs}
              trainedModel={this.state.trainedModel}
              onBeginUpdateNetwork={this.onBeginUpdateNetwork}
              onEndUpdateNetwork={this.onEndUpdateNetwork}
            />
          </div>
          <div
            style={{
              width: "30%",
              display: "inline-block",
              verticalAlign: "top"
            }}
          >
            <Button
              onClick={() => this.setState({ isFullScreenMode: false })}
              style={{ float: "right" }}
            >
              Back
            </Button>
            <AnalyzeLayers />
          </div>
        </div>
      );
    }
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
              datasetName={this.state.datasetName}
            />
            <h1>2. Create Layers</h1>
            {/* <Left updateLayers={this.updateLayers} layers={this.state.layers} /> */}
            <SortableLayers
              updateLayers={this.updateLayers}
              layers={this.state.layers}
            />

            <h1>3. Create Weights</h1>
            <AddPreTrainedModel
              onLoadPreTrainedModel={this.onLoadPreTrainedModel}
              starterNetworkName={this.state.starterNetworkName}
              preTrainedModelOptions={preTrainedModelOptions}
              preTrainedModelName={this.state.trainedModel.preTrainedModelName}
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
            <h1>4. Predict</h1>
            <Predict
              onMakePrediction={this.onMakePrediction}
              trainedModel={this.state.trainedModel}
              getRandomTestImage={this.getRandomTestImage}
              datasetName={this.state.datasetName}
            />
          </div>
        </div>

        <div style={{ display: "inline-block", width: "50%", height: "100%" }}>
          <NetworkScene
            windowHeightRatio={0.5}
            windowWidthRatio={0.5}
            layers={this.state.layers}
            drawing={this.state.drawing}
            layerOutputs={this.state.layerOutputs}
            trainedModel={this.state.trainedModel}
            onBeginUpdateNetwork={this.onBeginUpdateNetwork}
            onEndUpdateNetwork={this.onEndUpdateNetwork}
          />
          <Button onClick={() => this.setState({ isFullScreenMode: true })}>
            FullScreen
          </Button>
          <AnalyzeLayers />

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
