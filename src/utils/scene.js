import {
  // LAYER_VERTICAL_SPACING,
  DENSE_NEURON_SPACING,
  SQUARE_NEURON_SPACING,
  CONV_FILTERS_SPACING,
  NEURON_WIDTH
} from "./constants";

import {
  reshape2DTensorToArray,
  reshape3DTensorToArray,
  reshape4DTensorToArray
} from "./reshaping";

const getArrayMax = array => array.reduce((a, b) => Math.max(a, b));
const getArrayMax2d = array2d => getArrayMax(array2d.map(getArrayMax));

// Returns 1d array of positions of neurons spaced evenly with the line center at [0,0,height]
export const getPositionsOfLineOfItems = (itemSpacing, itemWidth, numItems, height) => {
  const itemPositions = [];

  const spacingAndWidth = itemSpacing + itemWidth;
  const halfNumItems = Math.floor(numItems / 2);
  const oddNumNeurons = numItems % 2 == 1;

  for (let i = halfNumItems - 1; i >= 0; i--) {
    const distance = spacingAndWidth * (i + 0.5) + (oddNumNeurons ? spacingAndWidth / 2 : 0);
    itemPositions.push([-distance, 0, height]);
  }
  if (oddNumNeurons) itemPositions.push([0, 0, height]);
  for (let i = 0; i < halfNumItems; i++) {
    const distance = spacingAndWidth * (i + 0.5) + (oddNumNeurons ? spacingAndWidth / 2 : 0);
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
    numNodesPerSide * (NEURON_WIDTH + SQUARE_NEURON_SPACING) - SQUARE_NEURON_SPACING;

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

  layers.forEach((layer, layersArrIndex) => {
    const { layerType, options } = layer;
    switch (layerType) {
      case "dense": {
        const { units, activation } = options;
        previousLayerMetadata = {
          dimensions: [units],
          isSquare: false,
          directlyAbovePrevious: false,
          layerType,
          options: options,
          layersArrIndex
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
          dimensions = [prevDims[0] - kernelSize + 1, prevDims[1] - kernelSize + 1, numSquares];
        } else {
          throw "Havent implemented array kernelSize or array strides";
        }

        previousLayerMetadata = {
          dimensions: dimensions,
          isSquare: true,
          directlyAbovePrevious: false,
          layerType,
          options: options,
          layersArrIndex
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
          layerType,
          options: options,
          layersArrIndex
        };
        layersMetadata.push(previousLayerMetadata);
        break;
      }
      case "flatten": {
        layersMetadata.push({ layerType, layersArrIndex }); // add only layerType
        break;
      }
      default:
        alert("haven't seen that layer type before! :(");
    }
  });

  return layersMetadata;
};

export const getAllNeuronPositions = (layersMetadata, layerVerticalSpacing) => {
  let allNeuronPositions = [];

  let layerHeight = 0;
  let previousSquareCenters;

  layersMetadata.forEach((layerMetadata, index) => {
    const { dimensions, isSquare, directlyAbovePrevious, layerType } = layerMetadata;

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
        // dont think this has been used yet (input to network as line)
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
      neuronPositions,
      squareCenters: previousSquareCenters
    });
    layerHeight += layerVerticalSpacing;
  });

  return allNeuronPositions;
};

export function getOutputColors(layerOutputs, layersMetadata, input2DArray) {
  let layerOutputColors = [];

  // change input colors to hex
  const maxValue = getArrayMax2d(input2DArray);
  let input2DArrayColors = [];
  input2DArray.forEach(r => {
    let rArr = [];
    r.forEach(c => rArr.push({ colorHex: valueToHex(c, maxValue), maxVal: maxValue, val: c }));
    input2DArrayColors.push(rArr);
  });
  layerOutputColors.push([input2DArrayColors]); // push input as 3d array

  // going to be skipping flatten layersMetadata but dont want layerOutputs index to increment too
  // so layerOutputs needs its own index
  // loop starts at 1 bc skips input metadata layer
  let outputIndex = 0;
  for (let i = 1; i < layersMetadata.length; i++) {
    const layerMetadata = layersMetadata[i];
    const { isSquare, dimensions, layerType } = layerMetadata;

    if (layerType === "flatten") {
      outputIndex += 1;
      continue;
    }

    const lO = layerOutputs[outputIndex];

    const oneLayerOutputColors = getOneLayerOutputColors(lO, isSquare, dimensions);
    layerOutputColors.push(oneLayerOutputColors);

    outputIndex += 1;
  }
  return layerOutputColors;
}

export function getOneLayerOutputColors(layerOutput, isSquare, dimensions) {
  const values = layerOutput.dataSync();
  const maxValue = getArrayMax(values);

  const colorArray = Array.prototype.slice.call(values);
  const colorObjs = colorArray.map(v => ({
    colorHex: valueToHex(v, maxValue),
    maxVal: maxValue,
    val: v
  }));
  if (isSquare) {
    return reshape3DTensorToArray(colorObjs, ...dimensions);
  } else {
    return colorObjs;
  }
}

export function fracToHex(value) {
  return Math.round(value * 255) * 65793;
}

export function valueToHex(value, maxValue) {
  if (value <= 0) {
    return 0;
  } else if (maxValue <= 1) {
    return fracToHex(value);
  } else {
    const frac = value / maxValue;
    return fracToHex(frac);
  }
}

export function diffPropBetweenObjects(a, b) {
  // Create arrays of property names
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  if (aProps.length != bProps.length) {
    throw "Objects must be same size!";
  }

  let propDiffs = [];

  for (let i = 0; i < aProps.length; i++) {
    const propName = aProps[i];
    if (a[propName] !== b[propName]) {
      propDiffs.push(propName);
    }
  }

  return propDiffs;
}

export const getAllNeuronEdgesData = trainedModel => {
  if (Object.keys(trainedModel).length === 0) return [];
  let edgesData = [];

  for (let i = 0; i < trainedModel.layers.length; i++) {
    const layer = trainedModel.layers[i];

    if (layer.name.split("_")[0] === "flatten") continue;

    const weightsAndBiases = layer.getWeights();
    if (weightsAndBiases.length != 2) {
      edgesData.push({
        name: layer.name
      });
      continue;
    }

    const weightsObj = weightsAndBiases[0];
    const biasesObj = weightsAndBiases[1];
    let weightsData;
    if (weightsObj.shape.length === 4) {
      weightsData = reshape4DTensorToArray(weightsObj.dataSync(), ...weightsObj.shape);
    } else if (weightsObj.shape.length === 2) {
      weightsData = reshape2DTensorToArray(weightsObj.dataSync(), ...weightsObj.shape);
    }
    edgesData.push({
      biases: biasesObj.dataSync(),
      weights: weightsData,
      name: weightsObj.name
    });
  }

  return edgesData;
};
