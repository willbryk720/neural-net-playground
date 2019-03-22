import React, { Component } from "react";
import { Button, Icon, Input, Dropdown, Modal, Header, Form } from "semantic-ui-react";

import { layerTypes, d } from "../../utils/constants";

class CreateEditLayer extends Component {
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

  setEditInputs = () => {
    const inputs = {};
    const layerInputs = this.props.layerInputs;
    this.setState({ inputs: layerInputs });
  };

  render() {
    const { isCreatingLayer } = this.props;

    const layerType = this.state.layerType ? this.state.layerType : this.props.layerType;
    const layerTypeExists = layerType;

    let inputItems = [];
    if (layerTypeExists) {
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
            isCreatingLayer ? (
              <Icon
                name="add"
                color="blue"
                style={{ cursor: "pointer" }}
                onClick={() => this.setState({ isModalOpen: true })}
              />
            ) : (
              <Icon
                name="edit"
                onClick={() => {
                  this.setEditInputs();
                  this.setState({ isModalOpen: true });
                }}
              />
            )
          }
          style={{ width: "40%" }}
          dimmer="inverted"
          closeOnDimmerClick={false}
          open={this.state.isModalOpen}
        >
          <Modal.Header>{isCreatingLayer ? "Create Layer" : "Editing Layer"}</Modal.Header>
          <Modal.Content>
            <div>
              <div style={{ display: "inline-block", width: "30%" }}>
                {isCreatingLayer ? (
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
                ) : (
                  <b>{layerType}</b>
                )}
              </div>
              <Form>
                <Form.Group>{inputItems}</Form.Group>
              </Form>

              {layerTypeExists && <p>{d[layerType].message}</p>}

              {layerTypeExists && (
                <Button
                  size="small"
                  color="blue"
                  onClick={() => {
                    if (isCreatingLayer) {
                      this.props.onCreateLayer(
                        this.props.indexOfBeforeLayer,
                        layerType,
                        this.state.inputs
                      );
                    } else {
                      this.props.onEditLayer(this.props.indexOfLayer, layerType, this.state.inputs);
                    }
                    this.setState({ isModalOpen: false });
                  }}
                >
                  {isCreatingLayer ? "Add Layer" : "Edit Layer"}
                </Button>
              )}

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

export default CreateEditLayer;
