import { exp } from "@tensorflow/tfjs";

import { deflateRawSync } from "zlib";

import { ones } from "@tensorflow/tfjs-layers/dist/exports_initializers";

import * as tf from "@tensorflow/tfjs";

function createArray(dimensions, fillVal) {
  const numDim = dimensions.length;

  if (numDim === 1) {
    return Array(dimensions[0]).fill(fillVal);
  }
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
  const { group, row, col, layerIndex } = analyzeInfo.neuron.indexInfo;
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
    }

    console.log("LAYERMETADATA", inLayerMetadata, curLayerMetadata);
    let targetArr = createArray(curLayerMetadata.dimensions, 0);
    targetArr[col] = 1;
    const targetTensor = tf.tensor(targetArr);

    console.log(output.dataSync());

    // output.exp().dot(tf.tensor1d([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]))
    // return output.dot(c);

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
  // return inputTensor.sub(grads.mul(tf.scalar(epsilon)));
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
