import React, { Component } from "react";
import { Button, Icon, Input, Dropdown, Modal, Header, Form } from "semantic-ui-react";

import { d, layerTypes } from "../../utils/layerInfo";
import { explanations } from "../../utils/explanations";

import { capitalize } from "../../utils/general";

class CreateEditLayer extends Component {
  constructor(props) {
    super(props);
    this.state = { layerType: "", isModalOpen: false, inputs: {}, showExplanation: false };
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

  openModal = () => {
    this.props.onChangedCreateLayerModal(true);
    this.setState({ isModalOpen: true });
  };
  closeModal = () => {
    this.props.onChangedCreateLayerModal(false);
    this.setState({ isModalOpen: false, showExplanation: false });
  };

  render() {
    const { isCreatingLayer } = this.props;

    const layerType = this.state.layerType ? this.state.layerType : this.props.layerType;
    const layerTypeExists = layerType;

    let inputItems = [];
    if (layerTypeExists) {
      inputItems = d[layerType].inputs.map((input, z) => {
        const { optionName, type, options, initialVal } = input;

        if (type === "Number") {
          return (
            <Form.Field key={optionName} style={{ width: "30%" }}>
              <label>
                <b>{optionName}</b>
              </label>
              <Input
                key={optionName}
                type={"Number"}
                value={this.state.inputs[optionName] ? this.state.inputs[optionName] : initialVal}
                onChange={(e, { value }) => {
                  console.log(value);
                  this.updateInputs(optionName, Number(value));
                }}
              />
            </Form.Field>
          );
        } else if (type === "Dropdown") {
          const dropdownOptions = options.map(o => ({ key: o, value: o, text: o }));
          return (
            <Form.Field key={optionName} style={{ width: "30%" }}>
              <label>
                <b>{optionName}</b>
              </label>
              <Dropdown
                placeholder={optionName}
                search
                fluid
                selection
                options={dropdownOptions}
                value={this.state.inputs[optionName] ? this.state.inputs[optionName] : initialVal}
                onChange={(e, { value }) => {
                  this.updateInputs(optionName, value);
                }}
              />
            </Form.Field>
          );
        }
      });
    }

    // // Trying to automatically create groups for when there are many input fields
    // // so that the fields dont go out of the modal
    // let formGroups = [];
    // let formGroup = [];
    // for (let i = 0; i < inputItems.length; i++) {
    //   formGroup.push(inputItems[i]);
    //   if (i % 2 === 1) {
    //     formGroups.push(<div>{formGroup}</div>);
    //     formGroup = [];
    //   } else if (i === inputItems.length - 1) {
    //     formGroups.push(<div>{formGroup}</div>);
    //   }
    // }

    return (
      <div>
        <Modal
          style={{ zIndex: "10000", width: "40%", marginLeft: "0%", centered: false }}
          trigger={
            isCreatingLayer ? (
              <Icon
                name="add"
                color="blue"
                style={{ cursor: "pointer" }}
                onClick={this.openModal}
              />
            ) : (
              <Icon
                name="edit"
                color="blue"
                onClick={() => {
                  this.setEditInputs();
                  this.openModal();
                }}
              />
            )
          }
          dimmer="inverted"
          closeOnDimmerClick={false}
          open={this.state.isModalOpen}
        >
          <Modal.Header>{isCreatingLayer ? "Create Layer" : "Editing Layer"}</Modal.Header>
          <Modal.Content>
            <div>
              <Form>
                {isCreatingLayer ? (
                  <Form.Field style={{ display: "inline-block", width: "30%" }}>
                    <label>
                      <b>Layer Type</b>
                    </label>
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
                  </Form.Field>
                ) : (
                  <h3>
                    This is a <u>{capitalize(layerType)}</u> Layer
                  </h3>
                )}

                <br />
                <Form.Group>{inputItems}</Form.Group>
              </Form>
              {layerTypeExists && !this.state.showExplanation && (
                <Button
                  style={{ float: "right" }}
                  size="small"
                  onClick={() => this.setState({ showExplanation: true })}
                >
                  Explain
                </Button>
              )}
              <br />
              <br />
              <div>
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
                        this.props.onEditLayer(
                          this.props.indexOfLayer,
                          layerType,
                          this.state.inputs
                        );
                      }
                      this.closeModal();
                    }}
                  >
                    {isCreatingLayer ? "Add Layer" : "Edit Layer"}
                  </Button>
                )}

                <Button
                  size="mini"
                  onClick={() => {
                    this.resetInputs();
                    this.closeModal();
                  }}
                >
                  Cancel
                </Button>
              </div>

              {layerTypeExists && this.state.showExplanation && (
                <div>
                  <hr />
                  <br />
                  {explanations[layerType]}
                </div>
              )}
            </div>
          </Modal.Content>
        </Modal>
      </div>
    );
  }
}

export default CreateEditLayer;
