import React, { Component } from "react";
import { Input, Menu, Segment } from "semantic-ui-react";

import ModifyWeights from "./ModifyWeights";

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
    } else if (activeItem === "adversarial") {
      content = <h2>Adversarial</h2>;
    } else if (activeItem === "filterviz") {
      content = <h2>Filter Visualization</h2>;
    }

    return (
      <div>
        <Menu attached="top" tabular>
          <Menu.Item
            name="Weights"
            idname="weights"
            active={activeItem === "weights"}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name="Adversarial"
            idname="adversarial"
            active={activeItem === "adversarial"}
            onClick={this.handleItemClick}
          />
          <Menu.Item
            name="Filter Visualization"
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

        <div>{content}</div>
      </div>
    );
  }
}

export default AnalyzeNeuron;
