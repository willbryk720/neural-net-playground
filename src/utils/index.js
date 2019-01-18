import * as tf from "@tensorflow/tfjs";

import { IMAGE_H, IMAGE_W, MnistData } from "./data";

import * as ui from "./ui";

// function createConvModel() {

//   const model = tf.sequential();
//   model.add(
//     tf.layers.conv2d({
//       inputShape: [IMAGE_H, IMAGE_W, 1],
//       kernelSize: 3,
//       filters: 16,
//       activation: "relu"
//     })
//   );
//   model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
//   model.add(
//     tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: "relu" })
//   );
//   model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
//   model.add(
//     tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: "relu" })
//   );
//   model.add(tf.layers.flatten({}));
//   model.add(tf.layers.dense({ units: 64, activation: "relu" }));
//   model.add(tf.layers.dense({ units: 10, activation: "softmax" }));

//   return model;
// }

/**
 * Creates a model consisting of only flatten, dense and dropout layers.
 *
 * The model create here has approximately the same number of parameters
 * (~31k) as the convnet created by `createConvModel()`, but is
 * expected to show a significantly worse accuracy after training, due to the
 * fact that it doesn't utilize the spatial information as the convnet does.

 */
export function createDenseModel() {
  const model = tf.sequential();
  model.add(tf.layers.flatten({ inputShape: [IMAGE_H, IMAGE_W, 1] }));
  model.add(tf.layers.dense({ units: 42, activation: "relu" }));
  model.add(tf.layers.dense({ units: 10, activation: "softmax" }));
  return model;
}

export async function train(model, onIteration) {
  ui.logStatus("Training model...");

  const LEARNING_RATE = 0.01;
  const optimizer = "rmsprop";

  model.compile({
    optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });
  const batchSize = 320;
  const validationSplit = 0.15;
  const trainEpochs = ui.getTrainEpochs();
  let trainBatchCount = 0;

  const trainData = data.getTrainData();
  const testData = data.getTestData();

  const totalNumBatches =
    Math.ceil((trainData.xs.shape[0] * (1 - validationSplit)) / batchSize) *
    trainEpochs;

  // During the long-running fit() call for model training, we include
  // callbacks, so that we can plot the loss and accuracy values in the page
  // as the training progresses.
  let valAcc;
  await model.fit(trainData.xs, trainData.labels, {
    batchSize,
    validationSplit,
    epochs: trainEpochs,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        trainBatchCount++;
        ui.logStatus(
          `Training... (` +
            `${((trainBatchCount / totalNumBatches) * 100).toFixed(1)}%` +
            ` complete). To stop training, refresh or close page.`
        );
        console.log(
          `Training... (` +
            `${((trainBatchCount / totalNumBatches) * 100).toFixed(1)}%` +
            ` complete).`
        );
        // ui.plotLoss(trainBatchCount, logs.loss, "train");
        // ui.plotAccuracy(trainBatchCount, logs.acc, "train");
        // if (onIteration && batch % 10 === 0) {
        //   onIteration("onBatchEnd", batch, logs);
        // }
        await tf.nextFrame();
      },
      onEpochEnd: async (epoch, logs) => {
        valAcc = logs.val_acc;
        // ui.plotLoss(trainBatchCount, logs.val_loss, "validation");
        // ui.plotAccuracy(trainBatchCount, logs.val_acc, "validation");
        // if (onIteration) {
        //   onIteration("onEpochEnd", epoch, logs);
        // }
        await tf.nextFrame();
      }
    }
  });

  const testResult = model.evaluate(testData.xs, testData.labels);
  const testAccPercent = testResult[1].dataSync()[0] * 100;
  const finalValAccPercent = valAcc * 100;
  ui.logStatus(
    `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
      `Final test accuracy: ${testAccPercent.toFixed(1)}%`
  );
}

export async function showPredictions(model) {
  const testExamples = 100;
  const examples = data.getTestData(testExamples);

  // Code wrapped in a tf.tidy() function callback will have their tensors freed
  // from GPU memory after execution without having to call dispose().
  // The tf.tidy callback runs synchronously.
  tf.tidy(() => {
    const output = model.predict(examples.xs);

    // tf.argMax() returns the indices of the maximum values in the tensor along
    // a specific axis. Categorical classification tasks like this one often
    // represent classes as one-hot vectors. One-hot vectors are 1D vectors with
    // one element for each output class. All values in the vector are 0
    // except for one, which has a value of 1 (e.g. [0, 0, 0, 1, 0]). The
    // output from model.predict() will be a probability distribution, so we use
    // argMax to get the index of the vector element that has the highest
    // probability. This is our prediction.
    // (e.g. argmax([0.07, 0.1, 0.03, 0.75, 0.05]) == 3)
    // dataSync() synchronously downloads the tf.tensor values from the GPU so
    // that we can use them in our normal CPU JavaScript code
    // (for a non-blocking version of this function, use data()).
    const axis = 1;
    const labels = Array.from(examples.labels.argMax(axis).dataSync());
    const predictions = Array.from(output.argMax(axis).dataSync());

    ui.showTestResults(examples, predictions, labels);
  });
}

let data;
export async function load() {
  data = new MnistData();
  await data.load();
}
