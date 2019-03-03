import { exp } from "@tensorflow/tfjs";

import { deflateRawSync } from "zlib";

import { ones } from "@tensorflow/tfjs-layers/dist/exports_initializers";

import * as tf from "@tensorflow/tfjs";

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

export async function getGradient(inputTensor, trainedModel, targetIndex) {
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

    const target = tf.tensor1d([1, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    // output = tf.reshape(output, [-1]);
    console.log(output.dataSync());

    // output.exp().dot(tf.tensor1d([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]))
    // return output.dot(c);

    const loss = tf.metrics.categoricalCrossentropy(tf.reshape(output, [-1]), target);
    return loss;
  };

  // const { value, grads } = tf.grad(f); // gradient of f as respect of each variable
  // Object.keys(grads).forEach(varName => grads[varName].print());

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
