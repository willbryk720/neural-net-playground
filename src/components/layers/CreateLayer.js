import React, { Component } from "react";
import { Button, Icon, Input, Dropdown, Modal, Header, Form } from "semantic-ui-react";

import { layerTypes, d } from "../../utils/constants";

class CreateLayer extends Component {
  constructor(props) {
    super(props);
    this.state = { layerType: "", isModalOpen: false, inputs: {} };
  }

  updateInputs = (optionName, newValue) => {
    const inputsCopy = Object.assign({}, this.state.inputs);
    inputsCopy[optionName] = newValue;
    this.setState({ inputs: inputsCopy });
  };

  resetInputs = () => {
    this.setState({ inputs: {}, layerType: "" });
  };

  setRequiredInputs = layerType => {
    const inputs = {};
    d[layerType].inputs.forEach(input => {
      const { required, optionName, initialVal } = input;
      // if (required)
      inputs[optionName] = initialVal;
    });
    this.setState({ layerType, inputs });
  };

  render() {
    const { layerType } = this.state;

    let inputItems = [];
    if (layerType !== "") {
      inputItems = d[layerType].inputs.map(input => {
        const { optionName, type, options, initialVal } = input;

        if (type === "Number") {
          return (
            <div key={optionName}>
              <label>
                <b>{optionName}</b>
              </label>
              <Input
                key={optionName}
                type={"Number"}
                value={this.state.inputs[optionName] ? this.state.inputs[optionName] : initialVal}
                onChange={(e, { value }) => {
                  this.updateInputs(optionName, Number(value));
                }}
              />
            </div>
          );
        } else if (type === "Dropdown") {
          const dropdownOptions = options.map(o => ({ key: o, value: o, text: o }));
          return (
            <div key={optionName}>
              <label>
                <b>{optionName}</b>
              </label>
              <Dropdown
                key={optionName}
                placeholder={optionName}
                search
                selection
                options={dropdownOptions}
                value={this.state.inputs[optionName] ? this.state.inputs[optionName] : initialVal}
                onChange={(e, { value }) => {
                  this.updateInputs(optionName, value);
                }}
              />
            </div>
          );
        }
      });
    }

    return (
      <div>
        <Modal
          trigger={
            <Icon
              name="add"
              color="blue"
              style={{ cursor: "pointer" }}
              onClick={() => this.setState({ isModalOpen: true })}
            />
          }
          style={{ width: "40%" }}
          dimmer="inverted"
          closeOnDimmerClick={false}
          open={this.state.isModalOpen}
        >
          <Modal.Header>Create Layer</Modal.Header>
          <Modal.Content>
            <div style={{ width: "100%" }}>
              <div style={{ display: "inline-block", width: "30%" }}>
                <Dropdown
                  placeholder="Layer Type"
                  fluid
                  search
                  selection
                  options={layerTypes}
                  value={layerType}
                  onChange={(e, { value }) => {
                    this.setRequiredInputs(value);
                  }}
                />
              </div>
              <div style={{ display: "inline-block", width: "5%" }} />
              <Form>
                <Form.Group>{inputItems}</Form.Group>
              </Form>

              {layerType && <p>{d[layerType].message}</p>}

              <Button
                size="small"
                color="blue"
                onClick={() => {
                  this.props.onCreateLayer(this.props.indexOfBeforeLayer, this.state);
                  this.setState({ isModalOpen: false });
                }}
              >
                Add Layer
              </Button>

              <Button
                size="mini"
                onClick={() => {
                  this.resetInputs();
                  this.setState({ isModalOpen: false });
                }}
              >
                Cancel
              </Button>
            </div>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

export default CreateLayer;
