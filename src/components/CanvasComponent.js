import React, { Component } from "react";
import { Button } from "semantic-ui-react";

import { getColorStyle } from "../utils/analyze";

const BORDER_WIDTH = 2;

class CanvasComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      points: this.props.drawing.length > 0 ? this.props.drawing : this.getStartDrawing(),
      lineWidth: 1
    };
  }

  getStartDrawing = () => {
    const inputLength = this.props.datasetInfo.inputLength;
    return Array(inputLength)
      .fill()
      .map(() => Array(inputLength).fill(0));
  };

  componentWillReceiveProps(nextProps) {
    console.log("Rendered Predict CanvasComponent");
    if (nextProps.drawing.length > 0) this.setState({ points: nextProps.drawing });
  }
  componentDidMount() {
    this.setCanvasToDrawing();
  }

  setCanvasToDrawing = () => {
    // const { drawing } = this.props;
    // if (drawing.length === 0) return;

    const { points } = this.state;
    const ctx = this.refs.canvas.getContext("2d");
    const squareWidth = this.props.canvasWidth / this.props.datasetInfo.inputLength;
    points.forEach((row, r) => {
      row.forEach((col, c) => {
        const colorStyle = getColorStyle(points[r][c] * 0xffffff);
        ctx.fillStyle = colorStyle;
        ctx.fillRect(c * squareWidth, r * squareWidth, squareWidth, squareWidth);
      });
    });
    // this.setState({ points: drawing });
  };

  updateCanvas(point) {
    const ctx = this.refs.canvas.getContext("2d");
    const squareWidth = this.props.canvasWidth / this.props.datasetInfo.inputLength;
    ctx.fillRect(point[0] * squareWidth, point[1] * squareWidth, squareWidth, squareWidth);
  }

  clear = () => {
    //clears it to all white, resets state to original
    this.ctx = this.refs.canvas.getContext("2d");
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.props.canvasWidth, this.props.canvasHeight);
    this.ctx.fillStyle = "black";

    this.setState({
      pen: "up",
      points: this.getStartDrawing()
    });
  };

  drawing(e) {
    if (this.state.pen === "down") {
      const inputLength = this.props.datasetInfo.inputLength;
      let x = e.nativeEvent.offsetX;
      let y = e.nativeEvent.offsetY;
      if (x === this.props.canvasWidth) x -= 1;
      if (y === this.props.canvasHeight) y -= 1;

      const { lineWidth, points } = this.state;
      const squareWidth = this.props.canvasWidth / inputLength;

      let copyPoints = points.slice();
      for (let i = -lineWidth; i <= lineWidth; i++) {
        const newX = x + (i * squareWidth) / 3;
        for (let j = -lineWidth; j <= lineWidth; j++) {
          const newY = y + (j * squareWidth) / 3;

          let point = [
            Math.floor((inputLength * newX) / this.props.canvasWidth),
            Math.floor((inputLength * newY) / this.props.canvasHeight)
          ];

          const c = point[0];
          const r = point[1];

          if (c >= 0 && c < inputLength && r >= 0 && r < inputLength) {
            copyPoints[r][c] = 1;
            this.updateCanvas([c, r]);
          }
        }
      }
      this.setState({
        points: copyPoints
      });
    }
  }

  penDown(e) {
    //mouse is down on the canvas
    this.setState({
      pen: "down",
      penCoords: [e.nativeEvent.offsetX, e.nativeEvent.offsetY]
    });
  }

  penUp() {
    //mouse is up on the canvas
    this.setState({ pen: "up" });
  }

  render() {
    if (this.refs.canvas) this.setCanvasToDrawing(); // it takes a bit to load canvas

    return (
      <div>
        <div
          style={{
            border: BORDER_WIDTH + "px blue solid",
            width: this.props.canvasWidth + 2 * BORDER_WIDTH + "px"
          }}
        >
          <canvas
            ref="canvas"
            width={this.props.canvasWidth}
            height={this.props.canvasHeight}
            onMouseMove={e => this.drawing(e)}
            onMouseDown={e => this.penDown(e)}
            onMouseUp={e => this.penUp(e)}
          />
        </div>
      </div>
    );
  }
}

export default CanvasComponent;
