import React, { Component } from "react";
import SortableLayers from "./SortableLayers";
import CanvasDraw from "react-canvas-draw";
import { Button } from "semantic-ui-react";

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;

class Draw extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.myRef = React.createRef();
  }

  getDrawingFromPoints = points => {
    let drawing = Array.from(Array(28), _ => Array(28).fill(0));
    points.forEach(p => {
      const row = Math.floor((28 * p.y) / CANVAS_HEIGHT);
      const col = Math.floor((28 * p.x) / CANVAS_WIDTH);
      drawing[row][col] = 1;
    });
    return drawing;
  };

  clearDrawing = () => {
    this.myRef.current.clear();
  };

  newDrawing = () => {
    const node = this.myRef.current;
    const drawingData = JSON.parse(node.getSaveData()).lines;
    let points = [];
    console.log(drawingData);
    drawingData.forEach(l => {
      points = points.concat(l.points);
    });
    const drawing = this.getDrawingFromPoints(points);
    this.props.onUpdateDrawing(drawing);
  };

  render() {
    return (
      <div>
        <CanvasDraw
          loadTimeOffset={5}
          lazyRadius={0}
          brushRadius={8}
          hideGrid={false}
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          ref={this.myRef}
        />
        <Button size="mini" onClick={this.newDrawing}>
          print
        </Button>
        <Button size="mini" onClick={this.clearDrawing}>
          Clear
        </Button>
      </div>
    );
  }
}

export default Draw;
