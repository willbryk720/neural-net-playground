import React, { Component } from "react";
import { Button } from "semantic-ui-react";

import { getColorStyle } from "../utils/analyze";

const NUM_SQUARES_PER_ROW = 28;
const NUM_SQUARES_PER_COL = 28;
const BORDER_WIDTH = 2;

function getStartDrawing() {
  return Array(NUM_SQUARES_PER_ROW)
    .fill()
    .map(() => Array(NUM_SQUARES_PER_ROW).fill(0));
}

class CanvasComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      points: this.props.drawing.length > 0 ? this.props.drawing : getStartDrawing(),
      lineWidth: 1
    };
  }

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
    const squareWidth = this.props.canvasWidth / NUM_SQUARES_PER_ROW;
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
    const squareWidth = this.props.canvasWidth / NUM_SQUARES_PER_ROW;
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
      points: getStartDrawing()
    });
  };

  drawing(e) {
    if (this.state.pen === "down") {
      let x = e.nativeEvent.offsetX;
      let y = e.nativeEvent.offsetY;
      if (x === this.props.canvasWidth) x -= 1;
      if (y === this.props.canvasHeight) y -= 1;

      const { lineWidth, points } = this.state;
      const squareWidth = this.props.canvasWidth / NUM_SQUARES_PER_ROW;

      let copyPoints = points.slice();
      for (let i = -lineWidth; i <= lineWidth; i++) {
        const newX = x + (i * squareWidth) / 3;
        for (let j = -lineWidth; j <= lineWidth; j++) {
          const newY = y + (j * squareWidth) / 3;

          let point = [
            Math.floor((NUM_SQUARES_PER_COL * newX) / this.props.canvasWidth),
            Math.floor((NUM_SQUARES_PER_ROW * newY) / this.props.canvasHeight)
          ];

          const c = point[0];
          const r = point[1];

          if (c >= 0 && c < NUM_SQUARES_PER_ROW && r >= 0 && r < NUM_SQUARES_PER_ROW) {
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
