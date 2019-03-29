import React, { Component } from "react";
import { Button } from "semantic-ui-react";

import { getColorStyle } from "../../utils/analyze";

class NeuronAnalyzeCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  initializeNeurons = () => {
    const ctx = this.refs.canvas.getContext("2d");

    const { colorSquare } = this.props;

    const squareWidth = this.props.canvasWidth / colorSquare.length;

    colorSquare.forEach((row, r) => {
      row.forEach((col, c) => {
        const colorStyle = getColorStyle(colorSquare[r][c].colorHex, 0xffffff, 0x000000);
        ctx.fillStyle = colorStyle;

        ctx.fillRect(c * squareWidth, r * squareWidth, squareWidth, squareWidth);
      });
    });
  };
  componentDidMount() {
    this.initializeNeurons();
  }

  render() {
    return (
      <div>
        <div>
          <canvas
            ref="canvas"
            width={this.props.canvasWidth}
            height={this.props.canvasHeight}
            style={{ verticalAlign: "bottom" }}
          />
        </div>
      </div>
    );
  }
}

export default NeuronAnalyzeCanvas;
