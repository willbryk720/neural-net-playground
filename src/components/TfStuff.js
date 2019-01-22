import React, { Component } from "react";

import * as tf from "@tensorflow/tfjs";
import * as ui from "../utils/ui";
import { IMAGE_H, IMAGE_W, MnistData } from "../utils/data";
import { Button, Input } from "semantic-ui-react";

import { Chart } from "react-google-charts";
import LineChart from "react-linechart";

import "../../node_modules/react-linechart/dist/styles.css";

let accuracyValues = [[], []];

class TfStuff extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "",
      currentlyTraining: false,
      trainingAccuracyValues: []
    };
  }

  logStatus(s) {
    this.setState({ status: s });
  }

  createModel() {
    const model = tf.sequential();
    this.props.layers.forEach(layer => {
      const { layerType, options } = layer;
      const optionsObj = JSON.parse(options);
      model.add(tf.layers[layerType](optionsObj));
    });
    return model;
  }

  plotAccuracy(batch, accuracy, set) {
    // const accuracyContainer = document.getElementById("accuracy-canvas");
    // const series = set === "train" ? 0 : 1;
    accuracyValues[0].push({ x: batch, y: accuracy });

    this.setState({
      trainingAccuracyValues: [
        ...this.state.trainingAccuracyValues,
        { x: batch, y: accuracy }
      ]
    });
    console.log(accuracyValues);
    // tfvis.render.linechart(
    //   { values: accuracyValues, series: ["train", "validation"] },
    //   accuracyContainer,
    //   {
    //     xLabel: "Batch #",
    //     yLabel: "Loss",
    //     width: 400,
    //     height: 300
    //   }
    // );
    // accuracyLabelElement.innerText = `last accuracy: ${(accuracy * 100).toFixed(
    //   1
    // )}%`;
  }

  async train(model, onIteration, data) {
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

    const trainData = data.getTrainData();
    const testData = data.getTestData();

    const totalNumBatches =
      Math.ceil((trainData.xs.shape[0] * (1 - validationSplit)) / batchSize) *
      trainEpochs;

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

  // draw(image, canvas) {
  //   const [width, height] = [28, 28];
  //   canvas.width = width;
  //   canvas.height = height;
  //   const ctx = canvas.getContext("2d");
  //   const imageData = new ImageData(width, height);
  //   const data = image.dataSync();
  //   for (let i = 0; i < height * width; ++i) {
  //     const j = i * 4;
  //     imageData.data[j + 0] = data[i] * 255;
  //     imageData.data[j + 1] = data[i] * 255;
  //     imageData.data[j + 2] = data[i] * 255;
  //     imageData.data[j + 3] = 255;
  //   }
  //   ctx.putImageData(imageData, 0, 0);
  // }

  // showTestResults(batch, predictions, labels) {
  //   const testExamples = batch.xs.shape[0];
  //   // imagesElement.innerHTML = "";
  //   for (let i = 0; i < testExamples; i++) {
  //     const image = batch.xs.slice([i, 0], [1, batch.xs.shape[1]]);

  //     const div = document.createElement("div");
  //     div.className = "pred-container";

  //     const canvas = document.createElement("canvas");
  //     canvas.className = "prediction-canvas";
  //     draw(image.flatten(), canvas);

  //     const pred = document.createElement("div");

  //     const prediction = predictions[i];
  //     const label = labels[i];
  //     const correct = prediction === label;

  //     pred.className = `pred ${correct ? "pred-correct" : "pred-incorrect"}`;
  //     pred.innerText = `pred: ${prediction}`;

  //     div.appendChild(pred);
  //     div.appendChild(canvas);

  //     // imagesElement.appendChild(div);
  //   }
  // }

  async showPredictions(model, data) {
    const testExamples = 100;
    const examples = data.getTestData(testExamples);

    // Code wrapped in a tf.tidy() function callback will have their tensors freed
    // from GPU memory after execution without having to call dispose().
    // The tf.tidy callback runs synchronously.
    tf.tidy(() => {
      const output = model.predict(examples.xs);

      const axis = 1;
      const labels = Array.from(examples.labels.argMax(axis).dataSync());
      const predictions = Array.from(output.argMax(axis).dataSync());

      // this.showTestResults(examples, predictions, labels);
    });
  }

  async load() {
    let data = new MnistData();
    await data.load();
    return data;
  }

  async printStuff(model) {
    console.log("layers", model.layers);
    const weights = model.layers[1].getWeights();
    console.log(weights);
    // console.log(await weights[0].as1D().data());
    return weights;
  }

  async runTF() {
    // This is the main function. It loads the MNIST data, trains the model, and
    // then shows what the model predicted on unseen test data.
    this.logStatus("Loading MNIST data...");
    const data = await this.load();

    this.logStatus("Creating model...");
    const model = this.createModel();

    model.summary();

    const layer0 = this.printStuff(model);
    console.log(layer0);

    this.logStatus("Starting model training...");
    await this.train(model, () => this.showPredictions(model, data), data);

    this.setState({ currentlyTraining: false });
  }

  render() {
    const data = [
      {
        color: "steelblue",
        points: this.state.trainingAccuracyValues
      }
    ];
    // const chartData = [
    //   {
    //     color: "steelblue",
    //     points: this.state.trainingAccuracyValues
    //   }
    // ];
    return (
      <div className="tfjs-example-container">
        <h3>Recognize handwritten digits from the MNIST database</h3>
        <section>
          <div>
            <label># of training epochs:</label>
            <Input
              value={this.props.numEpochs}
              onChange={(e, { value }) => this.props.onChangeNumEpochs(value)}
            />
          </div>
          <br />

          <Button
            disabled={this.state.currentlyTraining}
            loading={this.state.currentlyTraining}
            color="blue"
            onClick={() => {
              this.setState({ currentlyTraining: true });
              this.runTF();
            }}
          >
            Load Data and Train Model{" "}
          </Button>
        </section>
        <section>
          <p>{this.state.status} </p>
          <p id="message" />

          <div id="stats">
            <div className="canvases">
              <label id="loss-label" />
              <div id="loss-canvas" />
            </div>
            <div className="canvases">
              <label id="accuracy-label" />
              <div id="accuracy-canvas" />
            </div>
          </div>
        </section>
        {/* <Chart
          chartType="ScatterChart"
          data={[["Age", "Weight"], [4, 5.5], [6, 5.5], [8, 12]]}
          width="100%"
          height="400px"
          legendToggle
        /> */}
        {/* <Chart
          width={"600px"}
          height={"400px"}
          chartType="LineChart"
          loader={<div>Loading Chart</div>}
          data={this.state.trainingAccuracyValues}
          options={{
            hAxis: {
              title: "Batch"
            },
            vAxis: {
              title: "Accuracy"
            }
          }}
          rootProps={{ "data-testid": "1" }}
        /> */}
        <LineChart
          width={600}
          height={400}
          data={data}
          xLabel={"Batch"}
          yLabel={"Accuracy"}
          pointRadius={2}
          yMax={1}
        />{" "}
        <br />
        <br />
      </div>
    );
  }
}

export default TfStuff;
