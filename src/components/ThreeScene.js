// Figured out how to do this from https://medium.com/@colesayershapiro/using-three-js-in-react-6cb71e87bdf4

import React, { Component } from "react";
import * as THREE from "three";
import * as OrbitControls from "three-orbitcontrols";

class BrcksScene extends Component {
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

    // controls

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.1;

    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 400;
    this.controls.keyPanSpeed = 1.5;
    this.controls.panSpeed = 0.6;
    this.controls.rotateSpeed = 0.05;
    // this.controls.maxPolarAngle = (0.98 * Math.PI) / 2;

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

    // Network info

    window.addEventListener("resize", this.onWindowResize, false);

    this.start();
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.numLayers !== this.props.numLayers) {
  //     //Perform some operation here
  //     // this.setState({numLayers: this.props.numLayers});
  //     this.updateNetworkSetup();
  //   }
  // }
  componentWillReceiveProps(nextProps) {
    // console.log(nextProps, this.props);
    // if (nextProps.layers !== this.props.numLayers) {
    //   //Perform some operation here

    //   // Clear all objects (check that this doesnt have memory leaks TODO)
    //   this.scene.remove.apply(this.scene, this.scene.children);
    //   this.updateNetworkSetup(nextProps.numLayers);
    //   this.animate();
    // }
    // Clear all objects (check that this doesnt have memory leaks TODO)
    this.scene.remove.apply(this.scene, this.scene.children);
    this.updateNetworkSetup(nextProps.layers);
    this.animate();
  }

  getLayerDataFromString = newLayer => {
    const numNeurons = parseInt(newLayer.split("neurons")[0]);
    return { numNeurons: numNeurons };
  };

  updateNetworkSetup(newLayers) {
    // var geometry = new THREE.BoxGeometry(1, 1, 1);
    var geometry = new THREE.SphereGeometry(0.8);
    var material = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const NUM_LAYERS = newLayers.length;
    let NUM_NODES_PER_LAYER = 100;
    const LAYER_SPACING = 10;
    let layers = [];
    let layerSizes = [];
    for (var l = 0; l < NUM_LAYERS; l++) {
      const layerData = this.getLayerDataFromString(newLayers[l]);
      let layer = [];
      NUM_NODES_PER_LAYER = layerData.numNeurons;
      layerSizes.push(NUM_NODES_PER_LAYER);
      const sqrt_num_nodes = Math.round(Math.sqrt(NUM_NODES_PER_LAYER));

      for (var i = 0; i < NUM_NODES_PER_LAYER; i++) {
        var mesh = new THREE.Mesh(geometry, material);
        const pos = [
          LAYER_SPACING * (l - NUM_LAYERS / 2),
          1 * (i % sqrt_num_nodes) + (i % sqrt_num_nodes),
          1 * Math.floor(i / sqrt_num_nodes) + Math.floor(i / sqrt_num_nodes)
        ];
        mesh.position.x = pos[0];
        mesh.position.y = pos[1];
        mesh.position.z = pos[2];
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        this.scene.add(mesh);

        layer.push(pos);
      }
      layers.push(layer);
    }

    for (var l = 0; l < NUM_LAYERS - 1; l++) {
      for (var i = 0; i < layerSizes[l]; i++) {
        const pos1 = layers[l][i];

        for (var j = 0; j < layerSizes[l + 1]; j++) {
          const pos2 = layers[l + 1][j];
          // if (Math.random() < 0.5) {
          var axisGeometry = new THREE.Geometry();
          axisGeometry.vertices.push(
            new THREE.Vector3(...pos1),
            new THREE.Vector3(...pos2)
          );

          this.scene.add(
            new THREE.Line(
              axisGeometry,
              new THREE.LineBasicMaterial({
                color: 0xff0000
              })
            )
          );
          // }
        }
      }
    }

    // Axes
    var axisGeometry = new THREE.Geometry();
    axisGeometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(100, 0, 0)
    );

    this.scene.add(
      new THREE.Line(
        axisGeometry,
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          linewidth: 50
        })
      )
    );

    axisGeometry = new THREE.Geometry();
    axisGeometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 100, 0)
    );

    this.scene.add(
      new THREE.Line(
        axisGeometry,
        new THREE.LineBasicMaterial({
          color: 0x00ff00,
          linewidth: 50
        })
      )
    );

    axisGeometry = new THREE.Geometry();
    axisGeometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 100)
    );

    this.scene.add(
      new THREE.Line(
        axisGeometry,
        new THREE.LineBasicMaterial({
          color: 0x0000ff
        })
      )
    );
  }
  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }
  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);

      this.lastTimeControlsChanged = new Date();
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

    this.controls.update();

    // const cameraPos = this.camera.position;
    // if (this.camera.position.x > 748) {
    //   this.camera.position.set(600, cameraPos[1], cameraPos[2]);
    // }
  };
  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };
  markLastChange = () => {
    if (this.countSincelastControlsChange >= 100) {
      this.countSincelastControlsChange = 0;
      this.animate();
    }
  };
  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth * this.props.windowRatio,
      window.innerHeight * this.props.windowRatio
    );
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
export default BrcksScene;
