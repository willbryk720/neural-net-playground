// Figured out how to do this from https://medium.com/@colesayershapiro/using-three-js-in-react-6cb71e87bdf4

import React, { Component } from "react";
import * as THREE from "three";
import * as OrbitControls from "three-orbitcontrols";

import { MnistData } from "../utils/data";

import {
  getAllNeuronPositions,
  getLayersMetadataFromLayers
} from "../utils/scene";

import { NEURON_WIDTH, LAYER_VERTICAL_SPACING } from "../utils/constants";

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

    this.updateNetworkSetup(this.props.layers, this.props.drawing);

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

  async loadMnist() {
    let data = new MnistData();
    await data.load();
    return data;
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.layers !== this.props.numLayers) {
    //   //Perform some operation here

    // Clear all objects (check that this doesnt have memory leaks TODO)
    this.scene.remove.apply(this.scene, this.scene.children);
    this.updateNetworkSetup(nextProps.layers, nextProps.drawing);
    console.log("BUDDY", nextProps.layers);
    // this.animate();
    this.markLastChange(); // should it be this or markLastChange TODO
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

  drawAllNeuronPositionsWithInputColored = (
    allNeuronPositions,
    inputNeuronValues
  ) => {
    // VISUALIZE
    var geometry = new THREE.BoxGeometry(
      NEURON_WIDTH,
      NEURON_WIDTH,
      NEURON_WIDTH
    );

    allNeuronPositions.forEach((layerOfPositions, index) => {
      const { isSquare, neuronPositions } = layerOfPositions;
      neuronPositions.forEach(neuronGrouping => {
        if (isSquare) {
          let color = 0x000000;

          neuronGrouping.forEach((row, r) => {
            row.forEach((pos, c) => {
              if (index === 0) {
                color = inputNeuronValues[r][c] * 0xffffff;
              }
              const material = new THREE.MeshBasicMaterial({ color: color });
              let mesh = new THREE.Mesh(geometry, material);
              mesh.position.x = pos[0];
              mesh.position.y = pos[1];
              mesh.position.z = pos[2];
              this.scene.add(mesh);
            });
          });
          color = 0x000000;
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

  async updateNetworkSetup(newLayers, drawing) {
    const layersMetadata = getLayersMetadataFromLayers(newLayers);
    console.log("LAYERSMETADATA", layersMetadata);

    this.allNeuronPositions = getAllNeuronPositions(layersMetadata);

    // const data = await this.loadMnist();
    // const q = 1;
    // const { xs, labels } = data.getTestData(q);
    // let input = xs.slice([q - 1, 0], [1, 28, 28, 1]);
    // const d = input.dataSync();
    // let image2 = [];
    // d.forEach(d => {
    //   image2.push(d);
    // });

    console.log("DRAWING", drawing);
    if (drawing.length === 0) {
      this.drawAllNeuronPositionsBlack(this.allNeuronPositions);
    } else {
      console.log("drawing2", drawing);
      // draw the nodes from the positions
      this.drawAllNeuronPositionsWithInputColored(
        this.allNeuronPositions,
        drawing
      );
    }
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
      const intersects = this.raycaster
        .intersectObjects(this.scene.children)
        .filter(o => o.object.type === "Mesh");
      if (intersects.length > 0) {
        const intersectObject = intersects[0].object;
        // dont want this to trigger for a Line
        intersectObject.material.color.set(0x0000ff);
        this.drawEdges(this.hoverIntersectObject);
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
