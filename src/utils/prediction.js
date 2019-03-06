import { exp } from "@tensorflow/tfjs";

import { deflateRawSync } from "zlib";

import { ones } from "@tensorflow/tfjs-layers/dist/exports_initializers";

import * as tf from "@tensorflow/tfjs";

function createArray(outputTensor, dimensions, indexInfo) {
  const { group, row, col, layerIndex } = indexInfo;
  const numDim = dimensions.length;

  let targetArr;
  if (numDim === 1) {
    targetArr = Array(dimensions[0]).fill(0);
    targetArr[col] = 1;
  } else if (numDim === 3) {
    const squareSize = dimensions[0] * dimensions[1];
    const numFilters = dimensions[2];
    const numNeurons = squareSize * numFilters;

    targetArr = Array(numNeurons).fill(0);
    const targetNeuronIndex = 0; // TODO
    targetArr[targetNeuronIndex] = 1;
  }
  return targetArr;
}

export async function getLayerOutputs(inputTensor, trainedModel) {
  let layerOutputs = [];

  const layers = trainedModel.layers;
  for (var i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var output = await layer.apply(inputTensor);
    inputTensor = output;
    output.layerType = getLayerTypeFromLayerName(layer.name); // add helpful metadata
    layerOutputs.push(output);
  }

  return layerOutputs;
}

export async function getGradient(inputTensor, trainedModel, analyzeInfo) {
  const { indexInfo } = analyzeInfo.neuron;
  const { inLayerMetadata, curLayerMetadata } = analyzeInfo;

  let layerOutputs = [];

  const f = inputTensor => {
    const layers = trainedModel.layers;
    let nextInput;
    let output;

    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      if (i === 0) {
        output = layer.apply(inputTensor);
      } else {
        output = layer.apply(nextInput);
      }
      nextInput = output;

      console.log("LAYEROUTPUT", output.dataSync());

      // Stop after applied current layer (the one that contains the selected neuron)
      if (i === curLayerMetadata.layersArrIndex) {
        break;
      }
    }

    console.log("INLAYER, CURLAYER", inLayerMetadata, curLayerMetadata);

    const targetTensor = tf.tensor(createArray(output, curLayerMetadata.dimensions, indexInfo));

    console.log(
      "reshaped",
      tf.reshape(output, [-1]).dataSync(),
      "targetTensor",
      targetTensor.dataSync()
    );
    const loss = tf.metrics.categoricalCrossentropy(tf.reshape(output, [-1]), targetTensor);
    console.log("LOSS", loss.dataSync());
    return loss;
  };

  const g = tf.grad(f);
  let grads = g(inputTensor);

  console.log(
    "GRAD SUM:",
    grads.dataSync().reduce(function(a, b) {
      return a + b;
    }, 0)
  );

  grads = grads.div(tf.add(tf.sqrt(tf.mean(tf.square(grads))), tf.scalar(0.00001)));

  console.log(
    "GRAD SUM:",
    grads.dataSync().reduce(function(a, b) {
      return a + b;
    }, 0)
  );
  return grads;
}

export async function getFilterGradient(inputTensor, trainedModel, analyzeInfo) {
  const { indexInfo } = analyzeInfo.neuron;
  const { inLayerMetadata, curLayerMetadata } = analyzeInfo;

  let layerOutputs = [];

  const f = inputTensor => {
    const layers = trainedModel.layers;
    let nextInput;
    let output;

    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      if (i === 0) {
        output = layer.apply(inputTensor);
      } else {
        output = layer.apply(nextInput);
      }
      nextInput = output;

      // Stop after applied current layer (the one that contains the selected neuron)
      if (i === curLayerMetadata.layersArrIndex) {
        break;
      }
    }

    const filterShape = output.shape.slice();
    filterShape[3] = 1;

    const posLoss = output.slice([0, 0, 0, indexInfo.group], filterShape).mean();
    const negLoss = output.mean();

    const loss = tf.sub(tf.mul(posLoss, tf.scalar(5)), negLoss);

    console.log("LOSS", loss.dataSync());
    return loss;
  };

  const g = tf.grad(f);
  let grads = g(inputTensor);

  console.log(
    "GRAD SUM:",
    grads.dataSync().reduce(function(a, b) {
      return a + b;
    }, 0)
  );

  grads = grads.div(tf.add(tf.sqrt(tf.mean(tf.square(grads))), tf.scalar(0.00001)));

  console.log(
    "GRAD SUM:",
    grads.dataSync().reduce(function(a, b) {
      return a + b;
    }, 0)
  );
  return grads;
}

export function getLayerTypeFromLayerName(layerName) {
  const splitArr = layerName.split("_");
  if (splitArr.length === 0) {
    return splitArr[0];
  } else {
    splitArr.pop();
    return splitArr.join("");
  }
}
