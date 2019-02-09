// Figured out how to do this from https://medium.com/@colesayershapiro/using-three-js-in-react-6cb71e87bdf4

import React, { Component } from "react";
import * as THREE from "three";
import * as OrbitControls from "three-orbitcontrols";

import {
  getAllNeuronPositions,
  getLayersMetadataFromLayers
} from "../utils/scene";

import { NEURON_WIDTH, LAYER_VERTICAL_SPACING } from "../utils/constants";

import { reshapeArrayTo3D, reshapeArrayTo4D } from "../utils/reshaping";

function reshapeArrayTo2D(arr, numRows, numCols) {
  let newArr = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push(arr[i * numRows + j]);
    }
    newArr.push(row);
  }
  return newArr;
}

function getAllNeuronEdges(layersMetadata, trainedModel, layerOutputs) {}

function fracToHex(frac) {
  return Math.round(frac * 255) * 65793;
}

function isObjectsEquivalent(a, b) {
  // Create arrays of property names
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  if (aProps.length != bProps.length) {
    return false;
  }

  for (let i = 0; i < aProps.length; i++) {
    const propName = aProps[i];
    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  return true;
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

    this.raycaster = new THREE.Raycaster();

    // initialize neuron edges
    this.neuronEdges = [];

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

    window.addEventListener("resize", this.onWindowResize, false);
    window.addEventListener("mousemove", this.onDocumentMouseMove, false);
    window.addEventListener("mousedown", this.onDocumentMouseDown, false);
    window.addEventListener("dblclick", this.onDocumentDblClick, false);

    this.start();
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    // if (nextProps.layers !== this.props.numLayers) {
    //   //Perform some operation here

    if (!isObjectsEquivalent(this.props, nextProps)) {
      // Clear all objects (check that this doesnt have memory leaks TODO)
      this.scene.remove.apply(this.scene, this.scene.children);
      this.updateNetworkSetup(nextProps);
      this.markLastChange(); // should it be this or markLastChange TODO
      // this.animate();
    }
  }

  drawAllNeuronPositionsBlack = allNeuronPositions => {
    // VISUALIZE
    var geometry = new THREE.BoxGeometry(
      NEURON_WIDTH,
      NEURON_WIDTH,
      NEURON_WIDTH
    );

    allNeuronPositions.forEach(layerOfPositions => {
      const { isSquare, neuronPositions } = layerOfPositions;
      neuronPositions.forEach(neuronGrouping => {
        if (isSquare) {
          neuronGrouping.forEach(row => {
            row.forEach(pos => {
              const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
              let mesh = new THREE.Mesh(geometry, material);
              mesh.position.x = pos[0];
              mesh.position.y = pos[1];
              mesh.position.z = pos[2];
              this.scene.add(mesh);
            });
          });
        } else {
          // draw line
          neuronGrouping.forEach(pos => {
            const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = pos[0];
            mesh.position.y = pos[1];
            mesh.position.z = pos[2];
            mesh.layerShape = "line";
            this.scene.add(mesh);
          });
        }
      });
    });
  };

  drawAllNeuronPositionsWithOutputs = (
    allNeuronPositions,
    layerOutputs,
    layersMetadata,
    input2DArray
  ) => {
    // VISUALIZE
    const geometry = new THREE.BoxGeometry(
      NEURON_WIDTH,
      NEURON_WIDTH,
      NEURON_WIDTH
    );

    let allLayerOutputColors = [];

    // change input colors to hex
    let input2DArrayColors = [];
    input2DArray.forEach(r => {
      let rArr = [];
      r.forEach(c => rArr.push(fracToHex(c)));
      input2DArrayColors.push(rArr);
    });
    allLayerOutputColors.push([input2DArrayColors]); // push input as 3d array

    // going to be skipping flatten layersMetadata but dont want layerOutputs index to increment too
    // so layerOutputs needs its own index
    //loop starts at 1 bc skips input metadata layer
    let outputIndex = 0;
    for (let i = 1; i < layersMetadata.length; i++) {
      const layerMetadata = layersMetadata[i];
      const { isSquare, dimensions, layerType } = layerMetadata;

      if (layerType === "flatten") {
        outputIndex += 1;
        continue;
      }

      const lO = layerOutputs[outputIndex];
      let values = lO.dataSync();

      const colors = values.map(v => fracToHex(v));
      if (isSquare) {
        // return [reshapeArrayTo2D(values, 28, 28)]; //TODO BAD BAD
        allLayerOutputColors.push(reshapeArrayTo3D(colors, ...dimensions));
      } else {
        allLayerOutputColors.push(colors);
      }
      outputIndex += 1;
    }
    // console.log("allLayerOutputColors", allLayerOutputColors);

    allNeuronPositions.forEach((layerOfPositions, index) => {
      const { isSquare, neuronPositions } = layerOfPositions;
      const outputColors = allLayerOutputColors[index];

      neuronPositions.forEach((neuronGrouping, g) => {
        if (isSquare) {
          neuronGrouping.forEach((row, r) => {
            row.forEach((pos, c) => {
              const color = outputColors[g][r][c];
              const material = new THREE.MeshBasicMaterial({ color: color });
              let mesh = new THREE.Mesh(geometry, material);
              mesh.position.x = pos[0];
              mesh.position.y = pos[1];
              mesh.position.z = pos[2];
              this.scene.add(mesh);
            });
          });
        } else {
          // draw line
          neuronGrouping.forEach((pos, i) => {
            const material = new THREE.MeshBasicMaterial({
              color: outputColors[i]
            });
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = pos[0];
            mesh.position.y = pos[1];
            mesh.position.z = pos[2];
            mesh.layerShape = "line";
            this.scene.add(mesh);
          });
        }
      });
    });
  };

  async updateNetworkSetup(nextProps) {
    // this.props.onBeginUpdateNetwork();

    const { layers, drawing, layerOutputs, trainedModel } = nextProps;

    const layersMetadata = getLayersMetadataFromLayers(layers);
    console.log(
      "IMPORTANT: drawing, layers, layerOutputs, layerOutputDataSync, layersMetadata ",
      drawing,
      layers,
      layerOutputs,
      layerOutputs.map(lO => lO.dataSync()),
      layersMetadata
    );

    this.allNeuronPositions = getAllNeuronPositions(layersMetadata);
    this.allNeuronEdges = getAllNeuronEdges(
      layersMetadata,
      trainedModel,
      layerOutputs
    );

    if (layerOutputs.length === 0) {
      this.drawAllNeuronPositionsBlack(this.allNeuronPositions);
    } else {
      this.drawAllNeuronPositionsWithOutputs(
        this.allNeuronPositions,
        layerOutputs,
        layersMetadata,
        drawing
      );
    }

    // this.props.onEndUpdateNetwork();
  }

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }
  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);

      this.countSincelastControlsChange = 0;

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
    this.countSincelastControlsChange += 1;

    if (this.countSincelastControlsChange < 100) {
      this.frameId = window.requestAnimationFrame(this.animate);
    }
    // console.log("rendering again", this.countSincelastControlsChange);

    this.controls.update();

    // const cameraPos = this.camera.position;
    // if (this.camera.position.x > 748) {
    //   this.camera.position.set(600, cameraPos[1], cameraPos[2]);
    // }
  };

  drawEdges = neuron => {
    const { trainedModel } = this.props;

    // remove previous edges
    this.neuronEdges.forEach(edge => {
      this.scene.remove(edge);
    });

    let neuronEdges = [];
    if (neuron.layerShape === "line") {
      const previousLayerIndex =
        Math.round(neuron.position.z / LAYER_VERTICAL_SPACING) - 1;
      const { isSquare, neuronPositions } = this.allNeuronPositions[
        previousLayerIndex
      ];
      const secondPos = [
        neuron.position.x,
        neuron.position.y,
        neuron.position.z - NEURON_WIDTH / 2
      ];

      neuronPositions.forEach(neuronGrouping => {
        if (isSquare) {
          neuronGrouping.forEach(row => {
            row.forEach(pos => {
              let axisGeometry = new THREE.Geometry();
              axisGeometry.vertices.push(
                new THREE.Vector3(...secondPos),
                new THREE.Vector3(...pos)
              );
              neuronEdges.push(
                new THREE.Line(
                  axisGeometry,
                  new THREE.LineBasicMaterial({
                    color: fracToHex(Math.random())
                  })
                )
              );
            });
          });
        } else {
          neuronGrouping.forEach(pos => {
            let axisGeometry = new THREE.Geometry();
            axisGeometry.vertices.push(
              new THREE.Vector3(...secondPos),
              new THREE.Vector3(...pos)
            );
            neuronEdges.push(
              new THREE.Line(
                axisGeometry,
                new THREE.LineBasicMaterial({
                  color: fracToHex(Math.random()),
                  linewidth: 10
                })
              )
            );
          });
        }
      });

      this.neuronEdges = neuronEdges;
      this.neuronEdges.forEach(edge => {
        this.scene.add(edge);
      });
    }
  };

  renderScene = () => {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster
      .intersectObjects(this.scene.children)
      .filter(o => o.object.type === "Mesh");

    if (intersects.length > 0) {
      if (this.hoverIntersectObject != intersects[0].object) {
        if (this.hoverIntersectObject) {
          // set back to former color
          this.hoverIntersectObject.material.color.set(
            this.hoverIntersectObject.formerColorHex
          );
        }

        this.hoverIntersectObject = intersects[0].object;
        this.hoverIntersectObject.formerColorHex = this.hoverIntersectObject.material.color.getHex();
        this.hoverIntersectObject.material.color.set(0x00ff00);
      }
    } else {
      if (this.hoverIntersectObject) {
        // set back to former color
        this.hoverIntersectObject.material.color.set(
          this.hoverIntersectObject.formerColorHex
        );
      }
      this.hoverIntersectObject = null;
    }
    this.renderer.render(this.scene, this.camera);
  };

  markLastChange = () => {
    if (this.countSincelastControlsChange >= 100) {
      this.countSincelastControlsChange = 0;
      this.animate();
    }
  };

  onWindowResize = () => {
    this.camera.aspect =
      (window.innerWidth * this.props.windowWidthRatio) /
      (window.innerHeight * this.props.windowHeightRatio);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth * this.props.windowWidthRatio,
      window.innerHeight * this.props.windowHeightRatio
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
    }

    // update mouse x and y for raycaster
    this.updateMouse(event, canvasBounds);
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

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster
        .intersectObjects(this.scene.children)
        .filter(o => o.object.type === "Mesh");
      if (intersects.length > 0) {
        this.onClickNode(intersects[0].object);
        // dont want this to trigger for a Line
        // intersectObject.material.color.set(0x00ffff);
        // TODO use this.clickIntersectObject
        // intersectObject.formerColorHex = 0x0000ff;
      }
    }
  };

  onClickNode = neuron => {
    this.drawEdges(neuron);
  };

  onDblClickNode = neuron => {
    console.log("double");
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

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster
        .intersectObjects(this.scene.children)
        .filter(o => o.object.type === "Mesh");
      if (intersects.length > 0) {
        this.onDblClickNode(intersects[0].object);
      }
    }
  };

  updateMouse = (event, canvasBounds) => {
    this.mouse.x =
      ((event.clientX - canvasBounds.left) /
        (canvasBounds.right - canvasBounds.left)) *
        2 -
      1;
    this.mouse.y =
      -(
        (event.clientY - canvasBounds.top) /
        (canvasBounds.bottom - canvasBounds.top)
      ) *
        2 +
      1;
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
