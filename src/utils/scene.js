import {
  LAYER_VERTICAL_SPACING,
  DENSE_NEURON_SPACING,
  SQUARE_NEURON_SPACING,
  CONV_FILTERS_SPACING,
  NEURON_WIDTH
} from "./constants";

import { reshapeArrayTo4D, reshapeArrayTo2D } from "./reshaping";

// Returns 1d array of positions of neurons spaced evenly with the line center at [0,0,height]
export const getPositionsOfLineOfItems = (
  itemSpacing,
  itemWidth,
  numItems,
  height
) => {
  const itemPositions = [];

  const spacingAndWidth = itemSpacing + itemWidth;
  const halfNumItems = Math.floor(numItems / 2);
  const oddNumNeurons = numItems % 2 == 1;

  for (let i = halfNumItems - 1; i >= 0; i--) {
    const distance =
      spacingAndWidth * (i + 0.5) + (oddNumNeurons ? spacingAndWidth / 2 : 0);
    itemPositions.push([-distance, 0, height]);
  }
  if (oddNumNeurons) itemPositions.push([0, 0, height]);
  for (let i = 0; i < halfNumItems; i++) {
    const distance =
      spacingAndWidth * (i + 0.5) + (oddNumNeurons ? spacingAndWidth / 2 : 0);
    itemPositions.push([distance, 0, height]);
  }

  return itemPositions;
};

export const getNeuronsInLine = ({ center, numNodes }) => {
  const nodePositions = getPositionsOfLineOfItems(
    SQUARE_NEURON_SPACING,
    NEURON_WIDTH,
    numNodes,
    center[2]
  );
  return nodePositions;
};

// Returns 2d array of neuron positions (starting from farleft going right then down)
// Takes as input the center position of the square of neurons and the number of nodes per side
export const getNeuronsInSquare = ({ center, numNodesWide }) => {
  const height = center[2];
  const centerX = center[0];

  let nodePositions = []; // array of arrays
  const linePositions = getPositionsOfLineOfItems(
    SQUARE_NEURON_SPACING,
    NEURON_WIDTH,
    numNodesWide,
    height
  );

  for (let i = 0; i < numNodesWide; i++) {
    const newY = linePositions[numNodesWide - i - 1][0]; // hacky way to get y position of row in square
    let newRow = getPositionsOfLineOfItems(
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

export const getSquareCenters = (dimensions, layerHeight) => {
  let numSquares = dimensions[2];
  const numNodesPerSide = dimensions[0];

  const squareWidth =
    numNodesPerSide * (NEURON_WIDTH + SQUARE_NEURON_SPACING) -
    SQUARE_NEURON_SPACING;

  const squareCenters = getPositionsOfLineOfItems(
    CONV_FILTERS_SPACING,
    squareWidth,
    numSquares,
    layerHeight
  );

  return squareCenters;
};

export const getLayersMetadataFromLayers = newLayers => {
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
        layersMetadata.push({ layerType }); // add only layerType
        break;
      }
      default:
        alert("haven't seen that layer type before! :(");
    }
  });

  return layersMetadata;
};

export const getAllNeuronPositions = layersMetadata => {
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

    if (layerType === "flatten") return; // skip flatten layers

    let neuronPositions = [];
    if (index == 0) {
      if (isSquare) {
        neuronPositions.push(
          getNeuronsInSquare({
            center: [0, 0, layerHeight],
            numNodesWide: dimensions[0]
          })
        );
      } else {
        neuronPositions.push(
          getNeuronsInLine({
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
          squareCenters = getSquareCenters(dimensions, layerHeight);
        }

        squareCenters.forEach(squareCenter => {
          neuronPositions.push(
            getNeuronsInSquare({
              center: squareCenter,
              numNodesWide: dimensions[0]
            })
          );
        });
        previousSquareCenters = squareCenters;
      } else {
        neuronPositions.push(
          getNeuronsInLine({
            center: [0, 0, layerHeight],
            numNodes: dimensions[0]
          })
        );
      }
    }

    // array that includes neuronPositions which are all the positions
    allNeuronPositions.push({
      isSquare,
      dimensions,
      layerType,
      neuronPositions
    });
    layerHeight += LAYER_VERTICAL_SPACING;
  });

  return allNeuronPositions;
};

export function fracToHex(frac) {
  return Math.round(frac * 255) * 65793;
}

export function isObjectsEquivalent(a, b) {
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

export const getAllNeuronEdgesData = (
  layersMetadata,
  trainedModel,
  layerOutputs
) => {
  if (Object.keys(trainedModel).length === 0) return;
  let edgesData = [];

  for (let i = 0; i < trainedModel.layers.length; i++) {
    if (trainedModel.layers[i].name.split("_")[0] === "flatten") continue;

    const weightsAndBiases = trainedModel.layers[i].getWeights();
    if (weightsAndBiases.length != 2) {
      edgesData.push({
        name: trainedModel.layers[i].name
      });
      continue;
    }

    const weightsObj = weightsAndBiases[0];
    const biasesObj = weightsAndBiases[1];
    let weightsData;
    if (weightsObj.shape.length === 4) {
      weightsData = reshapeArrayTo4D(
        weightsObj.dataSync(),
        ...weightsObj.shape
      );
    } else if (weightsObj.shape.length === 2) {
      weightsData = reshapeArrayTo2D(
        weightsObj.dataSync(),
        ...weightsObj.shape
      );
    }
    edgesData.push({
      biases: biasesObj.dataSync(),
      weights: weightsData,
      name: weightsObj.name
    });
  }

  return edgesData;
};
