// Figured out how to do this from https://medium.com/@colesayershapiro/using-three-js-in-react-6cb71e87bdf4

import React, { Component } from "react";
import * as THREE from "three";
import * as OrbitControls from "three-orbitcontrols";

import {
  getAllNeuronPositions,
  getLayersMetadataFromLayers,
  diffPropBetweenObjects,
  getAllNeuronEdgesData,
  getOutputColors
} from "../utils/scene";

import {
  NEURON_WIDTH,
  KEY_A,
  KEY_D,
  KEY_W,
  KEY_S,
  SELECTED_NEURON_COLOR,
  SELECTED_SQUARE_COLOR,
  LAYER_SPACING_TO_LENGTH_RATIO
} from "../utils/constants";

import { reshape3DTensorToArray } from "../utils/reshaping";

const NEURON_GEOMETRY = new THREE.BoxGeometry(NEURON_WIDTH, NEURON_WIDTH, NEURON_WIDTH);

function getEdgeColor(edgeValue) {
  return edgeValue;
}

class NetworkScene extends Component {
  componentDidMount() {
    // if (!Detector.webgl) Detector.addGetWebGLMessage();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.0008);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      window.innerWidth * this.props.windowWidthRatio,
      window.innerHeight * this.props.windowHeightRatio
    );
    this.mount.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      60,
      (window.innerWidth * this.props.windowWidthRatio) /
        (window.innerHeight * this.props.windowHeightRatio),
      1,
      1600
    );
    this.camera.position.set(0, -40, 40);
    this.camera.up.set(0, 0, 1);

    this.mouse = new THREE.Vector2();

    // for saving object that is currently being hovered over, or was clicked on
    this.hoverIntersectObject = null;
    this.clickIntersectObject = null;

    // For selecting neuron or square
    this.selectedNeuron = null;
    this.selectedSquare = null;

    this.raycaster = new THREE.Raycaster();

    // initialize neuron cubes and edges
    this.neuronEdgeObjects = [];
    this.allNeuronObjects = [];

    this.allNeuronPositions = [];
    this.allNeuronEdgesData = [];

    this.layersMetadata = [];

    // controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.1;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 500;
    this.controls.keyPanSpeed = 1.5;
    this.controls.panSpeed = 0.6;
    this.controls.rotateSpeed = 0.05;

    this.updateNetworkSetup(this.props);

    // lights
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    this.scene.add(light);
    var light = new THREE.DirectionalLight(0x002288);
    light.position.set(-1, -1, -1);
    this.scene.add(light);
    var light = new THREE.AmbientLight(0x222222);
    this.scene.add(light);

    window.addEventListener("resize", () => this.onWindowResize(this.props), false);
    window.addEventListener("mousemove", this.onDocumentMouseMove, false);
    window.addEventListener("mousedown", this.onDocumentMouseDown, false);
    window.addEventListener("dblclick", this.onDocumentDblClick, false);
    document.addEventListener("keydown", this.onDocumentKeyDown, false);

    this.start();
  }

  componentWillReceiveProps(nextProps) {
    const propDiffs = diffPropBetweenObjects(this.props, nextProps);
    if (propDiffs.includes("windowWidthRatio") || propDiffs.includes("windowHeightRatio")) {
      this.onWindowResize(nextProps);
    }
    if (propDiffs.length === 1 && propDiffs.includes("selectedNeuron")) {
      // dont do anything
    } else if (propDiffs.length > 0) {
      console.log("Rendered Whole Scene Again");
      // Clear all objects (check that this doesnt have memory leaks TODO)
      this.scene.remove.apply(this.scene, this.scene.children);
      this.updateNetworkSetup(nextProps);
      this.markLastChange(); // should it be this or markLastChange TODO
      // this.animate();
    }
  }

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  async updateNetworkSetup(nextProps) {
    // this.props.onBeginUpdateNetwork();

    const { layers, drawing, layerOutputs, trainedModel, datasetInfo } = nextProps;

    const layersMetadata = getLayersMetadataFromLayers(layers);
    this.layersMetadata = layersMetadata;
    // console.log(
    //   "IMPORTANT:",
    //   "drawing:",
    //   drawing,
    //   "layers:",
    //   layers,
    //   "layerOutputs:",
    //   layerOutputs,
    //   "layerOutputDataSync:",
    //   layerOutputs.map(lO => lO.dataSync()),
    //   "layersMetadata:",
    //   layersMetadata
    // );

    const layerVerticalSpacing = datasetInfo.inputLength
      ? datasetInfo.inputLength * LAYER_SPACING_TO_LENGTH_RATIO
      : 28 * LAYER_SPACING_TO_LENGTH_RATIO;

    this.allNeuronPositions = getAllNeuronPositions(layersMetadata, layerVerticalSpacing);
    this.allNeuronEdgesData = getAllNeuronEdgesData(trainedModel);

    this.drawAllNeuronPositions(this.allNeuronPositions, layerOutputs, layersMetadata, drawing);

    this.drawSquareSelects(this.allNeuronPositions);

    if (nextProps.selectedNeuron) {
      const { position, indexInfo, layerType, color, layerIsSquare } = nextProps.selectedNeuron;
      const { layerIndex, group, row, col } = indexInfo;
      const newNeuronAtLocation = group
        ? this.allNeuronObjects[layerIndex][group][row][col]
        : this.allNeuronObjects[layerIndex][0][0][col];

      if (nextProps.selectedNeuron !== newNeuronAtLocation) {
        this.selectedNeuron = newNeuronAtLocation;
        this.selectedNeuron.formerColorHex = 0x000000;
        this.modifyObject(this.selectedNeuron, SELECTED_NEURON_COLOR, 1.5);
        this.onDblClickNode(newNeuronAtLocation, nextProps);
      }
    }
  }

  drawNeuron = (pos, color, layerType, indexInfo, layerIsSquare) => {
    const material = new THREE.MeshBasicMaterial({ color: color });
    let neuronObj = new THREE.Mesh(NEURON_GEOMETRY, material);
    neuronObj.position.x = pos[0];
    neuronObj.position.y = pos[1];
    neuronObj.position.z = pos[2];
    neuronObj.layerType = layerType;
    neuronObj.indexInfo = indexInfo;
    neuronObj.isNeuron = true;
    neuronObj.color = color;
    neuronObj.layerIsSquare = layerIsSquare;
    this.scene.add(neuronObj);
    return neuronObj;
  };

  drawAllNeuronPositions = (allNeuronPositions, layerOutputs, layersMetadata, input2DArray) => {
    const hasLayerOutputs = layerOutputs.length > 0;

    let layerOutputColors;
    if (hasLayerOutputs) {
      layerOutputColors = getOutputColors(layerOutputs, layersMetadata, input2DArray);
    }

    const allNeuronObjects = [];

    allNeuronPositions.forEach((layerOfPositions, layerIndex) => {
      const { isSquare, neuronPositions, layerType } = layerOfPositions;

      let layerOfGroups = [];
      neuronPositions.forEach((neuronGrouping, g) => {
        let groupOfRows = [];
        if (isSquare) {
          neuronGrouping.forEach((row, r) => {
            let rowOfObjects = []; // row of neuron objects
            row.forEach((pos, c) => {
              const color = hasLayerOutputs ? layerOutputColors[layerIndex][g][r][c] : 0x000000;
              const indexInfo = { group: g, row: r, col: c, layerIndex };
              const neuronObj = this.drawNeuron(pos, color, layerType, indexInfo, isSquare);
              rowOfObjects.push(neuronObj);
            });
            groupOfRows.push(rowOfObjects);
          });
        } else {
          let rowOfObjects = [];
          // draw line
          neuronGrouping.forEach((pos, i) => {
            const color = hasLayerOutputs ? layerOutputColors[layerIndex][i] : 0x000000;
            const indexInfo = { col: i, layerIndex };
            const neuronObj = this.drawNeuron(pos, color, layerType, indexInfo, isSquare);
            rowOfObjects.push(neuronObj);
          });
          groupOfRows.push(rowOfObjects);
        }
        layerOfGroups.push(groupOfRows);
      });
      allNeuronObjects.push(layerOfGroups);
    });

    this.allNeuronObjects = allNeuronObjects;
  };

  removeEdges = () => {
    // remove previous edges
    this.neuronEdgeObjects.forEach(edge => {
      this.scene.remove(edge);
    });
  };

  drawEdges = neuron => {
    const edgesData = this.allNeuronEdgesData;

    this.removeEdges();

    const targetNeuronPos = [
      neuron.position.x,
      neuron.position.y,
      neuron.position.z - NEURON_WIDTH / 2
    ];

    const { layerType, indexInfo } = neuron;
    if (layerType === "input") {
      return;
    }

    const previousLayerIndex = neuron.indexInfo.layerIndex - 1;

    const { isSquare, neuronPositions: prevNeuronPositions } = this.allNeuronPositions[
      previousLayerIndex
    ];
    const edgesLayer = edgesData[previousLayerIndex];
    const edgesLayerWeights = edgesLayer.weights;
    const outLayerMetadata = this.layersMetadata.filter(lM => lM.layerType !== "flatten")[
      previousLayerIndex + 1
    ]; // layersMetadata has an extra input layer, and want to remove flatten layer

    let neuronEdges = [];
    if (layerType === "dense") {
      prevNeuronPositions.forEach((neuronGrouping, g) => {
        const rowSize = neuronGrouping[0].length;
        const neuronGroupingSize = neuronGrouping.length * rowSize;

        if (isSquare) {
          neuronGrouping.forEach((row, r) => {
            row.forEach((pos, c) => {
              const adjustedPos = [pos[0], pos[1], pos[2] + NEURON_WIDTH / 2];
              let axisGeometry = new THREE.Geometry();
              axisGeometry.vertices.push(
                new THREE.Vector3(...targetNeuronPos),
                new THREE.Vector3(...adjustedPos)
              );
              neuronEdges.push(
                new THREE.Line(
                  axisGeometry,
                  new THREE.LineBasicMaterial({
                    color: getEdgeColor(
                      edgesLayerWeights[g * neuronGroupingSize + r * rowSize + c][indexInfo["col"]]
                    )
                  })
                )
              );
            });
          });
        } else {
          neuronGrouping.forEach((pos, i) => {
            let axisGeometry = new THREE.Geometry();
            const adjustedPos = [pos[0], pos[1], pos[2] + NEURON_WIDTH / 2];
            axisGeometry.vertices.push(
              new THREE.Vector3(...targetNeuronPos),
              new THREE.Vector3(...adjustedPos)
            );
            neuronEdges.push(
              new THREE.Line(
                axisGeometry,
                new THREE.LineBasicMaterial({
                  color: getEdgeColor(edgesLayerWeights[i][indexInfo["col"]])
                })
              )
            );
          });
        }
      });
    } else if (layerType === "conv2d") {
      const { group, row: rowIndex, col: colIndex } = indexInfo;
      prevNeuronPositions.forEach((neuronGrouping, g) => {
        const prevWindow = edgesLayerWeights[group][g];

        prevWindow.forEach((row, r) => {
          row.forEach((col, c) => {
            const pos = neuronGrouping[rowIndex + r][colIndex + c];
            const adjustedPos = [pos[0], pos[1], pos[2] + NEURON_WIDTH / 2];
            let axisGeometry = new THREE.Geometry();
            axisGeometry.vertices.push(
              new THREE.Vector3(...targetNeuronPos),
              new THREE.Vector3(...adjustedPos)
            );
            neuronEdges.push(
              new THREE.Line(
                axisGeometry,
                new THREE.LineBasicMaterial({
                  color: getEdgeColor(edgesLayerWeights[group][g][r][c])
                })
              )
            );
          });
        });
      });
    } else if (layerType === "maxPooling2d") {
      const { group, row: rowIndex, col: colIndex } = indexInfo;
      const neuronGrouping = prevNeuronPositions[group];
      // const { poolSize, strides } = edgesLayer.outLayerMetadata.options;
      const { poolSize, strides } = outLayerMetadata.options;

      for (let r = 0; r < poolSize; r++) {
        for (let c = 0; c < poolSize; c++) {
          const pos = neuronGrouping[rowIndex * poolSize + r][colIndex * poolSize + c];
          const adjustedPos = [pos[0], pos[1], pos[2] + NEURON_WIDTH / 2];
          let axisGeometry = new THREE.Geometry();
          axisGeometry.vertices.push(
            new THREE.Vector3(...targetNeuronPos),
            new THREE.Vector3(...adjustedPos)
          );
          neuronEdges.push(
            new THREE.Line(
              axisGeometry,
              new THREE.LineBasicMaterial({
                color: 0x00ff00
              })
            )
          );
        }
      }
    }
    this.neuronEdgeObjects = neuronEdges;
    this.neuronEdgeObjects.forEach(edge => {
      this.scene.add(edge);
    });
  };

  drawSquareSelects = allNeuronPositions => {
    const geometry = new THREE.BoxGeometry(3, 1, 0.3);

    allNeuronPositions.forEach((layerOfPositions, index) => {
      const { isSquare, neuronPositions, layerType, squareCenters } = layerOfPositions;

      if (!isSquare || !squareCenters) return;

      for (let i = 0; i < squareCenters.length; i++) {
        const squareXpos = squareCenters[i][0];
        const neuronGroup = neuronPositions[i];
        const bottomNeuron = neuronGroup[neuronGroup.length - 1][0];
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = squareXpos;
        mesh.position.y = bottomNeuron[1] - 5;
        mesh.position.z = bottomNeuron[2];
        mesh.isSquareSelect = true;
        mesh.layerIndex = index;
        mesh.squareIndex = i;
        this.scene.add(mesh);
      }
    });
  };

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
      this.countSinceCtrlChange = 0;
      // this saves computer processing, because nothing updates after a few seconds
      // after the last change of the
      this.controls.addEventListener("change", this.markLastChange);
    }
  };
  stop = () => {
    cancelAnimationFrame(this.frameId);
  };
  animate = () => {
    this.renderScene();
    this.countSinceCtrlChange += 1;

    if (this.countSinceCtrlChange < 100) {
      this.frameId = window.requestAnimationFrame(this.animate);
    }
    // console.log("rendering again", this.countSinceCtrlChange);
    this.controls.update();

    // const cameraPos = this.camera.position;
    // if (this.camera.position.x > 748) {
    //   this.camera.position.set(600, cameraPos[1], cameraPos[2]);
    // }
  };

  // Returns nearest mesh according to mouse, or null if there is none
  getNearestMeshIntersect = () => {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster
      .intersectObjects(this.scene.children)
      .filter(o => o.object.type === "Mesh");

    return intersects.length > 0 ? intersects[0].object : null;
  };

  modifyObject = (object, newHex, newScale) => {
    object.material.color.set(newHex);

    object.scale.x = newScale;
    object.scale.y = newScale;
    object.scale.z = newScale;
  };

  resetObjectToPrevious = object => {
    object.material.color.set(object.formerColorHex);
    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;
  };

  updateHoverIntersectObject = () => {
    const intersectObject = this.getNearestMeshIntersect();

    if (intersectObject) {
      if (this.hoverIntersectObject != intersectObject) {
        // only do things if its a new object
        if (
          this.hoverIntersectObject &&
          this.hoverIntersectObject != this.selectedNeuron &&
          this.hoverIntersectObject != this.selectedSquare
        ) {
          // set object back to former color
          this.modifyObject(this.hoverIntersectObject, this.hoverIntersectObject.formerColorHex, 1);
        }

        this.hoverIntersectObject = intersectObject;

        // change object color only if not selected
        if (
          this.hoverIntersectObject != this.selectedNeuron &&
          this.hoverIntersectObject != this.selectedSquare
        ) {
          this.hoverIntersectObject.formerColorHex = this.hoverIntersectObject.material.color.getHex();
          this.modifyObject(this.hoverIntersectObject, 0x00ff00, 1.5);
        }

        if (this.hoverIntersectObject.isNeuron && this.isNetworkTrained() && !this.selectedNeuron) {
          this.drawEdges(this.hoverIntersectObject);
        }
      }
    } else {
      if (
        this.hoverIntersectObject &&
        this.hoverIntersectObject != this.selectedNeuron &&
        this.hoverIntersectObject != this.selectedSquare
      ) {
        // set back to former color
        this.modifyObject(this.hoverIntersectObject, this.hoverIntersectObject.formerColorHex, 1);

        if (!this.selectedNeuron) {
          // remove edges from previous hoverNode (if there are any)
          this.removeEdges();
        }
      }
      this.hoverIntersectObject = null;
    }
  };

  renderScene = () => {
    this.updateHoverIntersectObject();
    this.renderer.render(this.scene, this.camera);
  };

  markLastChange = () => {
    if (this.countSinceCtrlChange >= 100) {
      this.countSinceCtrlChange = 0;
      this.animate();
    }
  };

  onWindowResize = myProps => {
    this.camera.aspect =
      (window.innerWidth * myProps.windowWidthRatio) /
      (window.innerHeight * myProps.windowHeightRatio);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth * myProps.windowWidthRatio,
      window.innerHeight * myProps.windowHeightRatio
    );
  };

  onDocumentMouseMove = event => {
    const canvasBounds = this.renderer.context.canvas.getBoundingClientRect();
    if (
      event.clientX >= canvasBounds.left &&
      event.clientX <= canvasBounds.right &&
      event.clientY >= canvasBounds.top &&
      event.clientY <= canvasBounds.bottom
    ) {
      event.preventDefault();
      this.markLastChange();

      // update mouse x and y for raycaster
      this.updateMouse(event, canvasBounds);
    }
  };

  onDocumentMouseDown = event => {
    const canvasBounds = this.renderer.context.canvas.getBoundingClientRect();
    if (
      event.clientX >= canvasBounds.left &&
      event.clientX <= canvasBounds.right &&
      event.clientY >= canvasBounds.top &&
      event.clientY <= canvasBounds.bottom
    ) {
      event.preventDefault();
      this.markLastChange();

      // update mouse
      this.updateMouse(event, canvasBounds);

      const intersectObject = this.getNearestMeshIntersect();
      if (intersectObject) {
        const clickedObj = intersectObject;
        if (clickedObj.isNeuron) {
          this.onClickNode(clickedObj);
        }
      }
    }
  };

  isNetworkTrained = () => {
    return Object.keys(this.props.trainedModel).length !== 0;
  };

  onClickNode = neuron => {
    if (this.isNetworkTrained()) {
      // this.drawEdges(neuron);
    }
  };

  onDblClickNode = (neuron, myProps) => {
    const { layerOutputs, trainedModel } = myProps;
    const { position, indexInfo, layerType } = neuron;
    const layerIndex = indexInfo.layerIndex;

    if (layerIndex === 0) {
      // Tell parent not to show analysis
      // Should change at some point bc want to analyze input too
      this.props.onDblClickNeuron({});
      return;
    }

    if (Object.keys(this.props.trainedModel).length === 0) return;

    this.removeEdges();
    this.drawEdges(neuron);

    const analyzeInfo = {
      layerIndex,
      neuron,
      inLayerMetadata: this.layersMetadata.filter(lM => lM.layerType !== "flatten")[layerIndex - 1],
      curLayerMetadata: this.layersMetadata.filter(lM => lM.layerType !== "flatten")[layerIndex],
      edges: this.allNeuronEdgesData.length > 0 ? this.allNeuronEdgesData[layerIndex - 1] : null,
      inLayerOutput:
        layerOutputs.length > 0 && layerIndex >= 2
          ? layerOutputs.filter(lM => lM.layerType !== "flatten")[layerIndex - 2]
          : null,
      drawing: this.props.drawing,
      hasOutputs: layerOutputs.length > 0
    };
    this.props.onDblClickNeuron(analyzeInfo);
  };

  onDocumentDblClick = event => {
    const canvasBounds = this.renderer.context.canvas.getBoundingClientRect();
    if (
      event.clientX >= canvasBounds.left &&
      event.clientX <= canvasBounds.right &&
      event.clientY >= canvasBounds.top &&
      event.clientY <= canvasBounds.bottom
    ) {
      event.preventDefault();
      this.markLastChange();

      // update mouse
      this.updateMouse(event, canvasBounds);

      const intersectObject = this.getNearestMeshIntersect();

      if (intersectObject) {
        // remove color from previously selected object in all situations
        if (this.selectedSquare) {
          this.resetObjectToPrevious(this.selectedSquare);
          this.selectedSquare = null;
        }

        if (intersectObject.isNeuron) {
          if (this.selectedNeuron) {
            this.resetObjectToPrevious(this.selectedNeuron);
          }
          this.selectedNeuron = intersectObject;
          this.selectedNeuron.material.color.set(SELECTED_NEURON_COLOR);
          this.onDblClickNode(intersectObject, this.props);
        } else if (intersectObject.isSquareSelect) {
          this.selectedSquare = intersectObject;
          this.selectedSquare.formerColorHex = 0x000000;
          this.selectedSquare.material.color.set(SELECTED_SQUARE_COLOR);
        }
      } else {
        if (this.selectedNeuron) {
          this.resetObjectToPrevious(this.selectedNeuron);
          this.selectedNeuron = null;
          this.props.onDblClickNeuron({}); // tell parent that no more neuron clicked
        }

        this.removeEdges();
      }
    }
  };

  updateMouse = (event, canvasBounds) => {
    this.mouse.x =
      ((event.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
    this.mouse.y =
      -((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
  };

  onDocumentKeyDown = event => {
    if (this.selectedSquare) {
      var keyCode = event.which;
      if (![KEY_A, KEY_D, KEY_W, KEY_S].includes(keyCode)) return;

      const { layerIndex, squareIndex } = this.selectedSquare;
      const square = this.allNeuronObjects[layerIndex][squareIndex];

      if ([KEY_A, KEY_D].includes(keyCode)) {
        const moveDistance = keyCode === KEY_A ? -3.0 : 3.0;
        square.forEach((row, r) => {
          row.forEach((col, c) => {
            square[r][c].position.x += moveDistance;
            this.allNeuronPositions[layerIndex].neuronPositions[squareIndex][r][
              c
            ][0] += moveDistance;
          });
        });
        this.selectedSquare.position.x += moveDistance;
      } else {
        const moveDistance = keyCode === KEY_S ? -3.0 : 3.0;
        square.forEach((row, r) => {
          row.forEach((col, c) => {
            square[r][c].position.y += moveDistance;
            this.allNeuronPositions[layerIndex].neuronPositions[squareIndex][r][
              c
            ][1] += moveDistance;
          });
        });
        this.selectedSquare.position.y += moveDistance;
      }

      this.allNeuronObjects[layerIndex][squareIndex] = square;

      this.markLastChange();
    }
  };

  render() {
    return (
      <div
        id="three-div"
        ref={mount => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default NetworkScene;
