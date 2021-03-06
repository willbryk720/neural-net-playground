import React, { Component } from "react";
import { Input, Menu, Segment } from "semantic-ui-react";

import ModifyWeights from "./ModifyWeights";
import MaximizeNeuron from "./MaximizeNeuron";
import FilterViz from "./FilterViz";

function expo(x) {
  if (x < 100 && x > 0.01) {
    return x.toPrecision(3);
  } else if (x === 0) {
    return 0;
  }
  return Number.parseFloat(x).toExponential(2);
}

class AnalyzeNeuron extends Component {
  state = { activeItem: "weights" };

  handleItemClick = (e, { idname }) => {
    this.setState({ activeItem: idname });
  };

  render() {
    const { activeItem } = this.state;

    let content;

    if (activeItem === "weights") {
      content = <ModifyWeights {...this.props} />;
    } else if (activeItem === "maximizeNeuron") {
      content = <MaximizeNeuron {...this.props} />;
    } else if (activeItem === "filterviz") {
      content = <FilterViz {...this.props} />;
    }

    let locationString;
    if (Object.keys(this.props.analyzeInfo).length > 0) {
      const { neuron } = this.props.analyzeInfo;
      const { layerIndex, group, row, col } = neuron.indexInfo;
      const { layerIsSquare, layerType, colorObj } = neuron;

      locationString =
        `Selected Neuron:  ` +
        (layerIsSquare ? `row ${row}, col ${col}, filter ${group}` : `index ${col}`) +
        ` in layer ${layerIndex + 1} (${layerType})` +
        `    |   Output: ${expo(colorObj.val)},  Max-in-layer: ${expo(colorObj.maxVal)}`;
    }

    return (
      <div style={{ height: "100%" }}>
        <Menu attached="top" tabular size="small" fluid>
          <Menu.Item
            name="Modify Weights"
            idname="weights"
            active={activeItem === "weights"}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name="Maximize Output"
            idname="maximizeNeuron"
            active={activeItem === "maximizeNeuron"}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name="Visualize Filters"
            idname="filterviz"
            active={activeItem === "filterviz"}
            onClick={this.handleItemClick}
          />
          {/* <Menu.Menu position='right'>
            <Menu.Item>
              <Input
                transparent
                icon={{ name: 'search', link: true }}
                placeholder='Search users...'
              />
            </Menu.Item>
          </Menu.Menu> */}
        </Menu>
        <div style={{ height: "100%", marginLeft: "2%", marginRight: "2%", overflowY: "auto" }}>
          <div style={{ textAlign: "center" }}>
            <b>{locationString}</b>
          </div>
          {content}
        </div>
      </div>
    );
  }
}

export default AnalyzeNeuron;
