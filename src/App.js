import React, { Component } from "react";
// import "./App.css";
import ThreeScene from "./components/ThreeScene";
import Left from "./components/Left";

import TfStuff from "./components/TfStuff";

import { Input } from "semantic-ui-react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { layers: [], numEpochs: 3 };
  }

  updateLayers = newLayers => {
    console.log(newLayers);
    this.setState({ layers: newLayers });
  };

  onChangeNumEpochs = newNumEpochs => {
    this.setState({ numEpochs: newNumEpochs });
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
            <Left updateLayers={this.updateLayers} />
          </div>
        </div>
        <div style={{ display: "inline-block", width: "50%" }}>
          <ThreeScene windowRatio={0.5} layers={this.state.layers} />
          <TfStuff
            layers={this.state.layers}
            numEpochs={this.state.numEpochs}
            onChangeNumEpochs={this.onChangeNumEpochs}
          />
        </div>
      </div>
    );
  }
}

export default App;
