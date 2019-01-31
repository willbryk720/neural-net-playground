import React, { Component } from "react";
import { Button, Icon, Segment, Input, Dropdown } from "semantic-ui-react";

class AddPreTrainedModel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { loadPreTrainedModel } = this.props;
    return (
      <div>
        <h3>Load Pre-trained Model</h3>
        <Button onClick={() => loadPreTrainedModel()}>Conv1 (3 epochs)</Button>
      </div>
    );
  }
}

export default AddPreTrainedModel;
