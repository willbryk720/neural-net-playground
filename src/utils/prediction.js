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

export function getLayerTypeFromLayerName(layerName) {
  const splitArr = layerName.split("_");
  if (splitArr.length === 0) {
    return splitArr[0];
  } else {
    splitArr.pop();
    return splitArr.join("");
  }
}
