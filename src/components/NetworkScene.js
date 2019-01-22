// Figured out how to do this from https://medium.com/@colesayershapiro/using-three-js-in-react-6cb71e87bdf4

import React, { Component } from "react";
import * as THREE from "three";
import * as OrbitControls from "three-orbitcontrols";

const LAYER_VERTICAL_SPACING = 10;
const DENSE_NEURON_SPACING = 0.5;
const SQUARE_NEURON_SPACING = 0.5;
const CONV_FILTERS_SPACING = 20;
const NEURON_WIDTH = 1;

class NetworkScene extends Component {
  componentDidMount() {
    // if (!Detector.webgl) Detector.addGetWebGLMessage();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.0008);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      window.innerWidth * this.props.windowRatio,
      window.innerHeight * this.props.windowRatio
    );
    this.mount.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1600
    );
    this.camera.position.set(-2, -50, 2);
    this.camera.up.set(0, 0, 1);

    this.mouse = new THREE.Vector2();
    this.hoverIntersectObject = null;
    this.raycaster = new THREE.Raycaster();
    this.updateDocumentOrigin();

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

    this.updateNetworkSetup(this.props.layers);

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

    this.start();
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.layers !== this.props.numLayers) {
    //   //Perform some operation here

    // Clear all objects (check that this doesnt have memory leaks TODO)
    this.scene.remove.apply(this.scene, this.scene.children);
    this.updateNetworkSetup(nextProps.layers);
    this.animate();
  }

  getPositionsOfLineOfItems = (itemSpacing, itemWidth, numItems, height) => {
    const itemPositions = [];
    if (numItems % 2 == 1) {
      itemPositions.push([0, 0, height]);
      numItems -= 1;
      for (let i = 0; i < numItems / 2; i++) {
        const distance = itemWidth / 2 + (itemSpacing + itemWidth) * (i + 0.5);
        itemPositions.push([distance, 0, height]);
        itemPositions.push([-distance, 0, height]);
      }
    } else {
      for (let i = 0; i < numItems / 2; i++) {
        const distance = (itemSpacing + itemWidth) * (i + 0.5);
        itemPositions.push([distance, 0, height]);
        itemPositions.push([-distance, 0, height]);
      }
    }
    return itemPositions;
  };

  getNeuronsInLine = ({ center, numNodes }) => {
    const nodePositions = this.getPositionsOfLineOfItems(
      SQUARE_NEURON_SPACING,
      NEURON_WIDTH,
      numNodes,
      center[2]
    );
    return nodePositions;
  };

  getNeuronsInSquare = ({ center, numNodesWide }) => {
    const height = center[2];
    const centerX = center[0];

    let nodePositions = []; // array of arrays
    const linePositions = this.getPositionsOfLineOfItems(
      SQUARE_NEURON_SPACING,
      NEURON_WIDTH,
      numNodesWide,
      height
    );

    for (let i = 0; i < numNodesWide; i++) {
      const newY = linePositions[i][0]; // hacky way to get a new y position in square
      let newRow = this.getPositionsOfLineOfItems(
        SQUARE_NEURON_SPACING,
        NEURON_WIDTH,
        numNodesWide,
        height
      );
      // modify y values
      newRow = newRow.map(pos => [pos[0] + centerX, newY, height]);
      nodePositions.push(newRow);
    }

    return nodePositions;
  };

  getSquareCenters = (dimensions, layerHeight) => {
    let numSquares = dimensions[2];
    const numNodesPerSide = dimensions[0];

    const squareWidth =
      numNodesPerSide * (NEURON_WIDTH + SQUARE_NEURON_SPACING) -
      SQUARE_NEURON_SPACING;

    const squareCenters = this.getPositionsOfLineOfItems(
      CONV_FILTERS_SPACING,
      squareWidth,
      numSquares,
      layerHeight
    );

    return squareCenters;
  };

  getLayersMetadataFromLayers = newLayers => {
    const layers = newLayers.map(l => {
      const newL = Object.assign({}, l);
      newL.options = JSON.parse(newL.options);
      return newL;
    });
    if (layers.length == 0) return [];
    const firstLayer = layers[0];
    const inputDim = firstLayer.options.inputShape;

    let layersMetadata = [];
    let previousLayerMetadata = {
      dimensions: inputDim,
      isSquare: inputDim.length > 1,
      directlyAbovePrevious: false,
      layerType: "input"
    };
    layersMetadata.push(previousLayerMetadata);

    layers.forEach(layer => {
      const { layerType, options } = layer;
      switch (layerType) {
        case "dense": {
          const { units, activation } = options;
          previousLayerMetadata = {
            dimensions: [units],
            isSquare: false,
            directlyAbovePrevious: false,
            layerType
          };
          layersMetadata.push(previousLayerMetadata);
          break;
        }
        case "conv2d": {
          const { kernelSize, filters, activation, strides } = options;
          const numSquares = filters; // TODO might eventually be this multiplied by depth of previous layer

          // TODO: Calculate this for variable kernelSize and strides
          const prevDims = previousLayerMetadata.dimensions;
          let dimensions;
          if (!Array.isArray(kernelSize) && !Array.isArray(strides)) {
            dimensions = [
              prevDims[0] - kernelSize + 1,
              prevDims[1] - kernelSize + 1,
              numSquares
            ];
          } else {
            throw "Havent implemented array kernelSize or array strides";
          }

          previousLayerMetadata = {
            dimensions: dimensions,
            isSquare: true,
            directlyAbovePrevious: false,
            layerType
          };
          layersMetadata.push(previousLayerMetadata);
          break;
        }
        case "maxPooling2d": {
          const { poolSize, strides } = options;
          const numSquares = previousLayerMetadata.dimensions[2];

          // TODO: Calculate this for variable kernelSize and strides
          const prevDims = previousLayerMetadata.dimensions;
          let dimensions;
          if (!Array.isArray(poolSize) && !Array.isArray(strides)) {
            dimensions = [
              Math.floor(prevDims[0] / strides),
              Math.floor(prevDims[1] / strides),
              numSquares
            ];
          } else {
            throw "Havent implemented array poolsize or array strides";
          }

          previousLayerMetadata = {
            dimensions: dimensions,
            isSquare: true,
            directlyAbovePrevious: true,
            layerType
          };
          layersMetadata.push(previousLayerMetadata);
          break;
        }
        case "flatten": {
          // skip adding it to layersMetadata
          break;
        }
        default:
          alert("haven't seen that layer type before! :(");
      }
    });

    return layersMetadata;
  };

  getAllNeuronPositions = layersMetadata => {
    let allNeuronPositions = [];

    let layerHeight = 0;
    let previousSquareCenters;

    layersMetadata.forEach((layerMetadata, index) => {
      const {
        dimensions,
        isSquare,
        directlyAbovePrevious,
        layerType
      } = layerMetadata;

      let neuronPositions = [];
      if (index == 0) {
        if (isSquare) {
          neuronPositions.push(
            this.getNeuronsInSquare({
              center: [0, 0, layerHeight],
              numNodesWide: dimensions[0]
            })
          );
        } else {
          neuronPositions.push(
            this.getNeuronsInLine({
              center: [0, 0, layerHeight],
              numNodes: dimensions[0]
            })
          );
        }
      } else {
        if (layerMetadata.isSquare) {
          let squareCenters;
          if (directlyAbovePrevious) {
            squareCenters = previousSquareCenters.map(psc => {
              psc[2] = layerHeight; // change height of previous centers
              return psc;
            });
          } else {
            squareCenters = this.getSquareCenters(dimensions, layerHeight);
          }

          squareCenters.forEach(squareCenter => {
            neuronPositions.push(
              this.getNeuronsInSquare({
                center: squareCenter,
                numNodesWide: dimensions[0]
              })
            );
          });
          previousSquareCenters = squareCenters;
        } else {
          neuronPositions.push(
            this.getNeuronsInLine({
              center: [0, 0, layerHeight],
              numNodes: dimensions[0]
            })
          );
        }
      }

      // array that includes neuronPositions which are all the positions
      allNeuronPositions.push({ isSquare, dimensions, neuronPositions });
      layerHeight += LAYER_VERTICAL_SPACING;
    });

    return allNeuronPositions;
  };

  drawAllNeuronPositions = allNeuronPositions => {
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

  // drawAxes = () => {
  //   // Axes
  //   var axisGeometry = new THREE.Geometry();
  //   axisGeometry.vertices.push(
  //     new THREE.Vector3(0, 0, 0),
  //     new THREE.Vector3(100, 0, 0)
  //   );

  //   this.scene.add(
  //     new THREE.Line(
  //       axisGeometry,
  //       new THREE.LineBasicMaterial({
  //         color: 0xffffff,
  //         linewidth: 50
  //       })
  //     )
  //   );

  //   axisGeometry = new THREE.Geometry();
  //   axisGeometry.vertices.push(
  //     new THREE.Vector3(0, 0, 0),
  //     new THREE.Vector3(0, 100, 0)
  //   );

  //   this.scene.add(
  //     new THREE.Line(
  //       axisGeometry,
  //       new THREE.LineBasicMaterial({
  //         color: 0x00ff00,
  //         linewidth: 50
  //       })
  //     )
  //   );

  //   axisGeometry = new THREE.Geometry();
  //   axisGeometry.vertices.push(
  //     new THREE.Vector3(0, 0, 0),
  //     new THREE.Vector3(0, 0, 100)
  //   );

  //   this.scene.add(
  //     new THREE.Line(
  //       axisGeometry,
  //       new THREE.LineBasicMaterial({
  //         color: 0x0000ff
  //       })
  //     )
  //   );
  // };

  updateNetworkSetup(newLayers) {
    const layersMetadata = this.getLayersMetadataFromLayers(newLayers);
    console.log("LAYERSMETADATA", layersMetadata);

    this.allNeuronPositions = this.getAllNeuronPositions(layersMetadata);

    // draw the nodes from the positions
    this.drawAllNeuronPositions(this.allNeuronPositions);

    // this.drawAxes();
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
                    color: 0xff0000
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
                  color: 0xff0000
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
    const intersects = this.raycaster.intersectObjects(this.scene.children);
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
        this.hoverIntersectObject.material.color.set(0xff0000);
        // this.drawEdges(this.hoverIntersectObject);
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

  updateDocumentOrigin = () => {
    this.documentOrigin = [window.innerWidth * this.props.windowRatio, 0];
  };

  onWindowResize = () => {
    this.updateDocumentOrigin();
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth * this.props.windowRatio,
      window.innerHeight * this.props.windowRatio
    );
  };

  onDocumentMouseMove = event => {
    const xOffset = event.clientX - this.documentOrigin[0];
    const yOffset = event.clientY - this.documentOrigin[1];
    const windowWidth = window.innerWidth * this.props.windowRatio;
    const windowHeight = window.innerHeight * this.props.windowRatio;
    if (
      xOffset >= 0 &&
      event.clientX <= this.documentOrigin[0] + windowWidth &&
      yOffset >= 0 &&
      event.clientY <= this.documentOrigin[1] + windowHeight
    ) {
      event.preventDefault();
      this.markLastChange();
    }

    // Dont know why the docs said to multiply by 2 and subtract 1
    this.mouse.x = (xOffset / windowWidth) * 2 - 1;
    this.mouse.y = -(yOffset / windowHeight) * 2 + 1;
  };

  onDocumentMouseDown = event => {
    const xOffset = event.clientX - this.documentOrigin[0];
    const yOffset = event.clientY - this.documentOrigin[1];
    const windowWidth = window.innerWidth * this.props.windowRatio;
    const windowHeight = window.innerHeight * this.props.windowRatio;
    if (
      xOffset >= 0 &&
      event.clientX <= this.documentOrigin[0] + windowWidth &&
      yOffset >= 0 &&
      event.clientY <= this.documentOrigin[1] + windowHeight
    ) {
      event.preventDefault();
      this.markLastChange();

      // update mouse
      this.mouse.x = (xOffset / windowWidth) * 2 - 1;
      this.mouse.y = -(yOffset / windowHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children);
      if (intersects.length > 0) {
        const intersectObject = intersects[0].object;
        if (intersectObject.type === "Mesh") {
          // dont want this to trigger for a Line
          intersectObject.material.color.set(0x0000ff);
          this.drawEdges(this.hoverIntersectObject);
        }
      }
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
