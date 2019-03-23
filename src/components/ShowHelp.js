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
        Create layer by clicking add icon between layers. Edit layer by clicking edit icon on the
        right of any layer. Delete a layer by clicking the x icon.
      </p>
      <p>The network will automatically update with your changes</p>
    </div>
  ),
  step3: (
    <div>
      <p>The network now needs weights! There are two options:</p>
      <p>You can load pre-prepaired weights from this same network that was trained before</p>
      <p>
        But if you are using a different network than one of the prepared ones, you can train your
        network in the browser. Just choose the number of epochs, and click train. If your network
        is large, it might take many minutes
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
      <div>
        <br />
        {this.state.showHelp ? (
          <div>
            <Icon
              name="hide"
              onClick={() => this.setState({ showHelp: false })}
              style={{ float: "right", cursor: "pointer" }}
            />
            <br />
            {content}
          </div>
        ) : (
          <Icon
            name="question"
            onClick={() => this.setState({ showHelp: true })}
            style={{ float: "right", cursor: "pointer" }}
          />
        )}
      </div>
    );
  }
}

export default ShowHelp;
