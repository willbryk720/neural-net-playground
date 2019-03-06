import React, { Component } from "react";
import NetworkScene from "./components/NetworkScene";
import SortableLayers from "./components/SortableLayers";

import TfStuff from "./components/TfStuff";
import Predict from "./components/predict/Predict";

import AddPreTrainedModel from "./components/addFromExisting/AddPreTrainedModel";

import LoadData from "./components/LoadData";
import StoreData from "./components/StoreData";

import ShowLoading from "./components/ShowLoading";
import AnalyzeNeuron from "./components/analyze/AnalyzeNeuron";

import CircularLoading from "./components/common/CircularLoading";

import { Input, Button, Icon } from "semantic-ui-react";

import "./components/NavLeft.css";

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
      countForRendering: 0,
      navLeftOpen: true,
      navBottomOpen: true,
      networkLoading: false
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
    this.setState({ analyzeInfo });
  };

  onBeginUpdateNetwork = () => {
    console.log("begin");
    this.setState({ networkLoading: true });
  };
  onEndUpdateNetwork = () => {
    console.log("end");
    this.setState({ networkLoading: false });
  };

  render() {
    const storeDataComponent = (
      <StoreData
        ref={this.dataRef}
        onLoadedDataset={this.onLoadedDataset}
        requestedDatasetLoading={this.state.requestedDatasetLoading}
      />
    );

    let wholeApp = (
      <div
        className="App"
        style={{
          height: "100%"
        }}
      >
        {/* {!this.state.navLeftOpen && (
          <div id="openbtn-left">
            {!this.state.requestedDatasetLoading ? ( // need to change this to when scene is loading!
              <a
                href=""
                onClick={e => {
                  e.preventDefault();
                  this.setState({ navLeftOpen: true });
                }}
              >
                ->
              </a>
            ) : (
              <CircularLoading />
            )}
          </div>
        )}
        {!this.state.navBottomOpen && (
          <div id="openbtn-bottom">
            {!this.state.requestedDatasetLoading ? ( // need to change this to when scene is loading!
              <a
                href=""
                onClick={e => {
                  e.preventDefault();
                  this.setState({ navBottomOpen: true });
                }}
              >
                ^
              </a>
            ) : (
              <CircularLoading />
            )}
          </div>
        )} */}
        {!this.state.navLeftOpen && (
          <div id="openbtn-left">
            <a
              href=""
              onClick={e => {
                e.preventDefault();
                this.setState({ navLeftOpen: true });
              }}
            >
              ->
            </a>
          </div>
        )}
        {!this.state.navBottomOpen && (
          <div id="openbtn-bottom">
            <a
              href=""
              onClick={e => {
                e.preventDefault();
                this.setState({ navBottomOpen: true });
              }}
            >
              ^
            </a>
          </div>
        )}
        <div
          id="sidenavLeft"
          style={{
            display: "inline-block",
            width: this.state.navLeftOpen ? "30%" : "0%",
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
            <div className="closebtn">
              <a
                href=""
                onClick={e => {
                  e.preventDefault();
                  this.setState({ navLeftOpen: false });
                }}
              >
                &times;
              </a>
            </div>

            <h1 style={{ marginTop: "3px" }}>1. Load Data</h1>
            <LoadData
              onClickedLoadDataset={this.onClickedLoadDataset}
              datasetInfo={this.state.datasetInfo}
              requestedDatasetLoading={this.state.requestedDatasetLoading}
            />
            <hr />
            <h1>2. Create Layers</h1>
            <SortableLayers updateLayers={this.updateLayers} layers={this.state.layers} />
            <hr />
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
            <hr />
            <h1>4. Predict</h1>
            <Predict
              drawing={this.state.drawing}
              onMakePrediction={this.onMakePrediction}
              trainedModel={this.state.trainedModel}
              getRandomTestImage={this.getRandomTestImage}
              datasetInfo={this.state.datasetInfo}
              countForRendering={this.state.countForRendering}
            />
            <ShowLoading loading={this.state.networkLoading} />
            {this.state.networkLoading && <CircularLoading />}
          </div>
        </div>

        <div
          style={{
            display: "inline-block",
            width: this.state.navLeftOpen ? "70%" : "100%",
            height: "100%",
            marginLeft: this.state.navLeftOpen ? "30%" : "0%"
          }}
        >
          <NetworkScene
            windowHeightRatio={this.state.navBottomOpen ? 0.5 : 1.0}
            windowWidthRatio={this.state.navLeftOpen ? 0.7 : 1.0}
            layers={this.state.layers}
            drawing={this.state.drawing}
            layerOutputs={this.state.layerOutputs}
            trainedModel={this.state.trainedModel}
            onBeginUpdateNetwork={this.onBeginUpdateNetwork}
            onEndUpdateNetwork={this.onEndUpdateNetwork}
            onDblClickNeuron={this.onDblClickNeuron}
            datasetInfo={this.state.datasetInfo}
            selectedNeuron={this.state.analyzeInfo.neuron}
            networkLoading={this.state.networkLoading}
          />

          <div
            id="sidenavBottom"
            style={{
              height: "100%",
              width: this.state.navLeftOpen ? "70%" : "100%"
            }}
          >
            <div className="closebtn">
              <a
                href=""
                onClick={e => {
                  e.preventDefault();
                  this.setState({ navBottomOpen: false });
                }}
              >
                &times;
              </a>
            </div>
            <AnalyzeNeuron
              analyzeInfo={this.state.analyzeInfo}
              trainedModel={this.state.trainedModel}
              alertChangedWeights={this.alertChangedWeights}
              onMakePrediction={this.onMakePrediction}
              datasetInfo={this.state.datasetInfo}
              drawing={this.state.drawing}
            />
          </div>
        </div>
      </div>
    );

    console.log("RELOADED WHOLE APP BRO", this.state.networkLoading);

    return (
      <div style={{ height: "100%" }}>
        {storeDataComponent}
        {wholeApp}
      </div>
    );
  }
}

export default App;
