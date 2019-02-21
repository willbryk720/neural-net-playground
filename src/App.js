import React, { Component } from "react";
import NetworkScene from "./components/NetworkScene";
import SortableLayers from "./components/SortableLayers";

import TfStuff from "./components/TfStuff";
import Predict from "./components/Predict";

import AddPreTrainedModel from "./components/AddPreTrainedModel";

import LoadData from "./components/LoadData";
import StoreData from "./components/StoreData";

import ShowLoading from "./components/ShowLoading";
import Info from "./components/Info";
import AnalyzeNeuron from "./components/AnalyzeNeuron";

import CircularLoading from "./components/common/CircularLoading";

import { Input, Button, Icon } from "semantic-ui-react";

const preTrainedModelOptions = [
  { name: "Dense-1epoch" },
  { name: "Dense-3epochs" },
  { name: "Conv-1epoch" },
  { name: "Conv-3epochs" },
  { name: "FacesOrNot-1epoch" },
  { name: "FacesOrNot-3epochs" }
  // { name: "Conv-testweights" }
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
      datasetInfo: {},
      requestedDatasetLoading: null,
      starterNetworkName: null,
      isFullScreenMode: false,
      analyzeInfo: {},
      countForRendering: 0
    };
    this.dataRef = React.createRef();
  }

  updateLayers = (newLayers, starterNetworkName) => {
    this.setState({
      layers: newLayers,
      layerOutputs: [],
      trainedModel: {},
      analyzeInfo: {},
      starterNetworkName
    });
    console.log(this.state);
  };

  alertChangedWeights = () => {
    this.setState({ countForRendering: this.state.countForRendering + 1 });
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

  onLoadedDataset = datasetInfo => {
    this.setState({ datasetInfo, requestedDatasetLoading: null });
  };

  onClickedLoadDataset = datasetName => {
    this.setState({ requestedDatasetLoading: datasetName });
  };

  onDblClickNeuron = analyzeInfo => {
    console.log("STATE NEURON", analyzeInfo);
    this.setState({ analyzeInfo });
  };

  // onBeginUpdateNetwork = () => {
  //   this.setState({ networkLoading: true });
  // };
  // onEndUpdateNetwork = () => this.setState({ networkLoading: false });

  render() {
    const storeDataComponent = (
      <StoreData
        ref={this.dataRef}
        onLoadedDataset={this.onLoadedDataset}
        requestedDatasetLoading={this.state.requestedDatasetLoading}
      />
    );

    let wholeApp;

    if (this.state.isFullScreenMode) {
      wholeApp = (
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
              onDblClickNeuron={this.onDblClickNeuron}
              datasetInfo={this.state.datasetInfo}
              selectedNeuron={this.state.analyzeInfo.neuron}
            />
          </div>
          <div
            style={{
              width: "30%",
              display: "inline-block",
              verticalAlign: "top"
            }}
          >
            <Icon
              name="compress"
              style={{ cursor: "pointer", float: "left" }}
              onClick={() => this.setState({ isFullScreenMode: false })}
            />
            <AnalyzeNeuron
              analyzeInfo={this.state.analyzeInfo}
              trainedModel={this.state.trainedModel}
              alertChangedWeights={this.alertChangedWeights}
            />
            <div>
              <Predict
                drawing={this.state.drawing}
                onMakePrediction={this.onMakePrediction}
                trainedModel={this.state.trainedModel}
                getRandomTestImage={this.getRandomTestImage}
                datasetInfo={this.state.datasetInfo}
                countForRendering={this.state.countForRendering}
              />
            </div>
          </div>
        </div>
      );
    } else {
      wholeApp = (
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
                onClickedLoadDataset={this.onClickedLoadDataset}
                datasetInfo={this.state.datasetInfo}
                requestedDatasetLoading={this.state.requestedDatasetLoading}
              />
              <h1>2. Create Layers</h1>
              {/* <Left updateLayers={this.updateLayers} layers={this.state.layers} /> */}
              <SortableLayers updateLayers={this.updateLayers} layers={this.state.layers} />

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
                datasetInfo={this.state.datasetInfo}
                getTrainData={this.getTrainData}
                getTestData={this.getTestData}
              />
              <h1>4. Predict</h1>
              <Predict
                drawing={this.state.drawing}
                onMakePrediction={this.onMakePrediction}
                trainedModel={this.state.trainedModel}
                getRandomTestImage={this.getRandomTestImage}
                datasetInfo={this.state.datasetInfo}
                countForRendering={this.state.countForRendering}
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
              onDblClickNeuron={this.onDblClickNeuron}
              datasetInfo={this.state.datasetInfo}
              selectedNeuron={this.state.analyzeInfo.neuron}
            />
            <Icon
              name="expand"
              style={{ cursor: "pointer", float: "left" }}
              onClick={() => this.setState({ isFullScreenMode: true })}
            />
            <AnalyzeNeuron
              analyzeInfo={this.state.analyzeInfo}
              trainedModel={this.state.trainedModel}
              alertChangedWeights={this.alertChangedWeights}
            />

            {/* <Info
            datasetInfo={this.state.datasetInfo}
            starterNetworkName={this.state.starterNetworkName}
            trainedModel={this.state.trainedModel}
          /> */}
          </div>
        </div>
      );
    }
    return (
      <div style={{ height: "100%" }}>
        {storeDataComponent}
        {wholeApp}
      </div>
    );
  }
}

export default App;
