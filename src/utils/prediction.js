export async function getLayerOutputs(inputTensor, trainedModel) {
  let layerOutputs = [];

  const layers = trainedModel.layers;
  for (var i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var output = await layer.apply(inputTensor);
    inputTensor = output;
    layerOutputs.push(output);
  }

  return layerOutputs;
}
