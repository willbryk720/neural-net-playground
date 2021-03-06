import React, { Component } from "react";

import * as tf from "@tensorflow/tfjs";
// import * as ui from "../utils/ui";
import { IMAGE_H, IMAGE_W, MnistData } from "../utils/data";
import { Button, Input } from "semantic-ui-react";

import LineChart from "react-linechart";

import "../../node_modules/react-linechart/dist/styles.css";

const CHART_COLORS = ["steelblue", "green", "red", "orange", "black"];
let accuracyValues = [[], []];

class TfStuff extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "",
      currentlyTraining: false,
      trainingAccuracyValues: [[]],
      trainingInstanceId: 0,
      showChart: false
    };
  }

  logStatus(s) {
    this.setState({ status: s });
  }

  createModel() {
    console.log("CREATING MODEL");
    const model = tf.sequential();
    this.props.layers.forEach(layer => {
      const { layerType, options } = layer;
      const optionsObj = JSON.parse(options);
      model.add(tf.layers[layerType](optionsObj));
    });

    const layer0 = this.printStuff(model);

    return model;
  }

  plotAccuracy(batch, accuracy, set) {
    // const accuracyContainer = document.getElementById("accuracy-canvas");
    // const series = set === "train" ? 0 : 1;
    accuracyValues[0].push({ x: batch, y: accuracy });

    const { trainingInstanceId } = this.state;
    const trainingAccuracyArr = this.state.trainingAccuracyValues[trainingInstanceId];
    // this.setState({
    //   trainingAccuracyValues: [...this.state.trainingAccuracyValues, { x: batch, y: accuracy }]
    // });
    this.setState({
      trainingAccuracyValues: this.state.trainingAccuracyValues.map((arr, i) => {
        if (i === trainingInstanceId) {
          return [...trainingAccuracyArr, { x: batch, y: accuracy }];
        } else {
          return arr;
        }
      })
    });
  }

  async train(model, onIteration) {
    accuracyValues = [[], []];

    this.logStatus("Training model...");
    const LEARNING_RATE = 0.01;
    const optimizer = "rmsprop";

    model.compile({
      optimizer,
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"]
    });
    const batchSize = 320;
    const validationSplit = 0.15;
    const trainEpochs = this.props.numEpochs;
    let trainBatchCount = 0;

    const trainData = this.props.getTrainData();
    const testData = this.props.getTestData();

    const totalNumBatches =
      Math.ceil((trainData.xs.shape[0] * (1 - validationSplit)) / batchSize) * trainEpochs;

    let valAcc;
    await model.fit(trainData.xs, trainData.labels, {
      batchSize,
      validationSplit,
      epochs: trainEpochs,
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          trainBatchCount++;
          if (batch % 10 === 0) {
            this.logStatus(
              `Training... (` +
                `${((trainBatchCount / totalNumBatches) * 100).toFixed(1)}%` +
                ` complete). To stop training, refresh or close page.`
            );
          }

          // ui.plotLoss(trainBatchCount, logs.loss, "train");
          if (batch % 10 === 0) {
            this.plotAccuracy(trainBatchCount, logs.acc, "train");
          }

          // if (onIteration && batch % 10 === 0) {
          //   onIteration("onBatchEnd", batch, logs);
          // }
          await tf.nextFrame();
        },
        onEpochEnd: async (epoch, logs) => {
          valAcc = logs.val_acc;
          // ui.plotLoss(trainBatchCount, logs.val_loss, "validation");
          this.plotAccuracy(trainBatchCount, logs.val_acc, "validation");
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
    this.logStatus(
      `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
        `Final test accuracy: ${testAccPercent.toFixed(1)}%`
    );
  }

  async showPredictions(model) {
    const testExamples = 100;
    const examples = this.props.getTestData(testExamples);

    // Code wrapped in a tf.tidy() function callback will have their tensors freed
    // from GPU memory after execution without having to call dispose().
    // The tf.tidy callback runs synchronously.
    tf.tidy(() => {
      const output = model.predict(examples.xs);

      const axis = 1;
      const labels = Array.from(examples.labels.argMax(axis).dataSync());
      const predictions = Array.from(output.argMax(axis).dataSync());
    });
  }

  async printStuff(model) {
    console.log("layers", model.layers);

    for (let i = 0; i < model.layers.length; i++) {
      console.log("-------LAYER_" + i + "-------");
      const weightsAndBiases = model.layers[i].getWeights();
      console.log("WEIGHTS_AND_BIASES", weightsAndBiases);
      // weightsAndBiases has length 2, the first is for weights, the second is for biases
      if (weightsAndBiases.length != 2) {
        continue;
      }
      // const biases = await weightsAndBiases[1].as1D().data();
      const biases = weightsAndBiases[1].dataSync();

      const weightsObj = weightsAndBiases[0];
      let weightsArr;
      // if (weightsObj.rank === 1) {
      //   weightsArr = await weightsObj.as1D().data();
      // } else if (weightsObj.rank === 2) {
      //   weightsArr = await weightsObj.as2D().data();
      // }
      weightsArr = weightsObj.dataSync();
      console.log(biases);
      console.log(weightsArr);

      // weightsObj.print()
    }

    let weights = model.layers[0].getWeights();

    return weights;
  }

  async runTF() {
    this.logStatus("Creating model...");
    const model = this.createModel();

    // model.summary();

    this.logStatus("Starting model training...");
    this.props.onStartTrainingModel();
    await this.train(model, () => this.showPredictions(model));

    this.props.onFinishedTrainingModel(model);

    // await model.save("downloads:///Convsmall-2epochs");

    this.printStuff(model);

    this.setState({
      currentlyTraining: false,
      trainingInstanceId: (this.state.trainingInstanceId += 1),
      trainingAccuracyValues: [...this.state.trainingAccuracyValues, []] // add arr for next line in chart
    });
  }

  render() {
    const data = this.state.trainingAccuracyValues.map((arr, i) => ({
      color: CHART_COLORS[i % CHART_COLORS.length],
      points: this.state.trainingAccuracyValues[i]
    }));
    return (
      <div>
        <div>
          <label># Training Epochs:</label>
          <Input
            style={{ width: "80px" }}
            type={"Number"}
            value={this.props.numEpochs}
            onChange={(e, { value }) => this.props.onChangeNumEpochs(value)}
          />
          <div style={{ width: "10px", display: "inline-block" }} />
          <Button
            disabled={
              this.state.currentlyTraining ||
              !this.props.datasetInfo.name ||
              this.props.layers.length === 0
            }
            loading={this.state.currentlyTraining}
            color="blue"
            onClick={() => {
              this.setState({ currentlyTraining: true, showChart: true });
              this.runTF();
            }}
            size="small"
          >
            Train
          </Button>

          {this.state.showChart && (
            <div>
              <p>{this.state.status} </p>
              <LineChart
                width={300}
                height={250}
                data={data}
                xLabel={"Batch"}
                yLabel={"Accuracy"}
                pointRadius={2}
                yMax={1}
              />
            </div>
          )}
        </div>
        <br />
      </div>
    );
  }
}

export default TfStuff;
