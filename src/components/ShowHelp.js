import React, { Component } from "react";

import { Button, Icon, Dropdown, Popup } from "semantic-ui-react";

const helpMessages = {
  step1: (
    <div>
      <p>
        The first thing we need is a dataset to work with. There are a few datasets that have been
        prepared.
      </p>
      <p>
        MNIST is a dataset consisting of 60000 handwritten digits. "FacesOrNot" is a custom dataset
        that contains both objects and human faces
      </p>
    </div>
  ),
  step2: (
    <div>
      <p>Let's build a network architecture!</p>
      <p>
        First, choose a starter network to kick you off with a working network. Then you can modify
        it if you want.
      </p>
      <p>
        <ul>
          <li>
            Create layer by clicking the <Icon name="add" color="blue" /> icon between layers.{" "}
          </li>
          <li>
            Edit a layer by clicking the <Icon name="edit" color="blue" /> icon to the right of any
            layer.{" "}
          </li>
          <li>
            Delete a layer by clicking the <Icon name="delete" color="blue" /> icon to the right of
            any layer.
          </li>
        </ul>
      </p>
      <p>The network will automatically update with your changes</p>
    </div>
  ),
  step3: (
    <div>
      <p>The network now needs weights! You have two options:</p>
      <p>
        a) You can load pre-prepaired weights, if we have pre-trained weights for your specific
        network architecture{" "}
      </p>
      <p>
        b) Or you can train your network in the browser. Just choose the number of epochs, and click
        train. (If your network is large, it might take several minutes)
      </p>
    </div>
  ),
  step4: (
    <div>
      <p>The next step is to predict on new data!</p>
      <p>You can use a test image by clicking the button "New Test Image"</p>
      <p>
        You can also create your own image by drawing with the mouse. Feel free to change the
        drawing color or size
      </p>
    </div>
  )
};
class ShowHelp extends Component {
  constructor(props) {
    super(props);
    this.state = { showHelp: false };
  }

  render() {
    const content = helpMessages[this.props.sectionName];

    return (
      <React.Fragment>
        {this.state.showHelp ? (
          <div>
            <Icon
              name="hide"
              onClick={() => this.setState({ showHelp: false })}
              style={{ float: "right", cursor: "pointer" }}
            />
            <br />
            {content}
            <br />
          </div>
        ) : (
          <div style={{ display: "inline-block", width: "5%", textAlign: "right" }}>
            <Icon
              name="question"
              onClick={() => this.setState({ showHelp: true })}
              style={{ cursor: "pointer" }}
            />
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default ShowHelp;
