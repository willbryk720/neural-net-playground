import { facesOrNotData } from "./FacesOrNotData";

import * as tf from "@tensorflow/tfjs";
import { range } from "@tensorflow/tfjs";

export const IMAGE_H = 28;
export const IMAGE_W = 28;
const IMAGE_SIZE = IMAGE_H * IMAGE_W;
const NUM_CLASSES = 10;
const NUM_DATASET_ELEMENTS = 65000;

const NUM_TRAIN_ELEMENTS = 55000;
const NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;

const MNIST_IMAGES_SPRITE_PATH =
  "https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png";
const MNIST_LABELS_PATH =
  "https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8";

/**
 * A class that fetches the sprited MNIST dataset and provide data as
 * tf.Tensors.
 */
export class MnistData {
  constructor() {}

  async load() {
    // Make a request for the MNIST sprited image.
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const imgRequest = new Promise((resolve, reject) => {
      img.crossOrigin = "";
      img.onload = () => {
        img.width = img.naturalWidth;
        img.height = img.naturalHeight;

        const datasetBytesBuffer = new ArrayBuffer(NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4);

        const chunkSize = 5000;
        canvas.width = img.width;
        canvas.height = chunkSize;

        for (let i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i++) {
          const datasetBytesView = new Float32Array(
            datasetBytesBuffer,
            i * IMAGE_SIZE * chunkSize * 4,
            IMAGE_SIZE * chunkSize
          );
          ctx.drawImage(img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width, chunkSize);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          for (let j = 0; j < imageData.data.length / 4; j++) {
            // All channels hold an equal value since the image is grayscale, so
            // just read the red channel.
            datasetBytesView[j] = imageData.data[j * 4] / 255;
          }
        }
        this.datasetImages = new Float32Array(datasetBytesBuffer);

        resolve();
      };
      img.src = MNIST_IMAGES_SPRITE_PATH;
    });

    const labelsRequest = fetch(MNIST_LABELS_PATH);
    const [imgResponse, labelsResponse] = await Promise.all([imgRequest, labelsRequest]);

    this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

    // Slice the the images and labels into train and test sets.
    this.trainImages = this.datasetImages.slice(0, IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
    this.testImages = this.datasetImages.slice(IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
    this.trainLabels = this.datasetLabels.slice(0, NUM_CLASSES * NUM_TRAIN_ELEMENTS);
    this.testLabels = this.datasetLabels.slice(NUM_CLASSES * NUM_TRAIN_ELEMENTS);
  }

  /**
   * Get all training data as a data tensor and a labels tensor.
   *
   * @returns
   *   xs: The data tensor, of shape `[numTrainExamples, 28, 28, 1]`.
   *   labels: The one-hot encoded labels tensor, of shape
   *     `[numTrainExamples, 10]`.
   */
  getTrainData() {
    const xs = tf.tensor4d(this.trainImages, [
      this.trainImages.length / IMAGE_SIZE,
      IMAGE_H,
      IMAGE_W,
      1
    ]);
    const labels = tf.tensor2d(this.trainLabels, [
      this.trainLabels.length / NUM_CLASSES,
      NUM_CLASSES
    ]);

    return { xs, labels };
  }

  /**
   * Get all test data as a data tensor a a labels tensor.
   *
   * @param {number} numExamples Optional number of examples to get. If not
   *     provided,
   *   all test examples will be returned.
   * @returns
   *   xs: The data tensor, of shape `[numTestExamples, 28, 28, 1]`.
   *   labels: The one-hot encoded labels tensor, of shape
   *     `[numTestExamples, 10]`.
   */
  getTestData(numExamples) {
    let xs = tf.tensor4d(this.testImages, [
      this.testImages.length / IMAGE_SIZE,
      IMAGE_H,
      IMAGE_W,
      1
    ]);
    let labels = tf.tensor2d(this.testLabels, [this.testLabels.length / NUM_CLASSES, NUM_CLASSES]);

    if (numExamples != null) {
      xs = xs.slice([0, 0, 0, 0], [numExamples, IMAGE_H, IMAGE_W, 1]);
      labels = labels.slice([0, 0], [numExamples, NUM_CLASSES]);
    }
    return { xs, labels };
  }

  getTestImage() {
    let xs = tf.tensor4d(this.testImages, [
      this.testImages.length / IMAGE_SIZE,
      IMAGE_H,
      IMAGE_W,
      1
    ]);
    let labels = tf.tensor2d(this.testLabels, [this.testLabels.length / NUM_CLASSES, NUM_CLASSES]);

    const totalNumberExamples = this.testImages.length / IMAGE_SIZE;
    const randIndex = Math.floor(Math.random() * totalNumberExamples);

    xs = xs.slice([randIndex, 0, 0, 0], [1, IMAGE_H, IMAGE_W, 1]);
    labels = labels.slice([randIndex, 0], [1, NUM_CLASSES]);

    return { xs, labels };
  }
}

/**
 * A class that fetches FacesOrNot dataset
 */
export class FacesOrNotData {
  constructor() {}

  async load() {
    // // Slice the the images and labels into train and test sets.

    // this.trainImages = this.datasetImages.slice(
    //   0,
    //   IMAGE_SIZE * NUM_TRAIN_ELEMENTS
    // );
    this.IMAGE_H = 48;
    this.IMAGE_W = 48;
    this.IMAGE_SIZE = 48 * 48;

    this.imageIndex = 0;
    this.datasetImages = facesOrNotData;
    this.testImages = this.datasetImages;
    console.log(this.datasetImages.length);
    // this.trainLabels = this.datasetLabels.slice(
    //   0,
    //   NUM_CLASSES * NUM_TRAIN_ELEMENTS
    // );
    // this.testLabels = this.datasetLabels.slice(
    //   NUM_CLASSES * NUM_TRAIN_ELEMENTS
    // );
  }

  /**
   * Get all training data as a data tensor and a labels tensor.
   *
   * @returns
   *   xs: The data tensor, of shape `[numTrainExamples, 28, 28, 1]`.
   *   labels: The one-hot encoded labels tensor, of shape
   *     `[numTrainExamples, 10]`.
   */
  // getTrainData() {
  //   const xs = tf.tensor4d(this.trainImages, [
  //     this.trainImages.length / IMAGE_SIZE,
  //     IMAGE_H,
  //     IMAGE_W,
  //     1
  //   ]);
  //   const labels = tf.tensor2d(this.trainLabels, [
  //     this.trainLabels.length / NUM_CLASSES,
  //     NUM_CLASSES
  //   ]);

  //   return { xs, labels };
  // }

  /**
   * Get all test data as a data tensor a a labels tensor.
   *
   * @param {number} numExamples Optional number of examples to get. If not
   *     provided,
   *   all test examples will be returned.
   * @returns
   *   xs: The data tensor, of shape `[numTestExamples, 28, 28, 1]`.
   *   labels: The one-hot encoded labels tensor, of shape
   *     `[numTestExamples, 10]`.
   */
  // getTestData(numExamples) {
  //   let xs = tf.tensor4d(this.testImages, [
  //     this.testImages.length / IMAGE_SIZE,
  //     IMAGE_H,
  //     IMAGE_W,
  //     1
  //   ]);
  //   let labels = tf.tensor2d(this.testLabels, [
  //     this.testLabels.length / NUM_CLASSES,
  //     NUM_CLASSES
  //   ]);

  //   if (numExamples != null) {
  //     xs = xs.slice([0, 0, 0, 0], [numExamples, IMAGE_H, IMAGE_W, 1]);
  //     labels = labels.slice([0, 0], [numExamples, NUM_CLASSES]);
  //   }
  //   return { xs, labels };
  // }

  getTestImage() {
    let xs = tf.tensor4d(this.testImages, [
      this.testImages.length / this.IMAGE_SIZE,
      this.IMAGE_H,
      this.IMAGE_W,
      1
    ]);
    console.log(xs.shape);
    // let labels = tf.tensor2d(this.testLabels, [this.testLabels.length / NUM_CLASSES, NUM_CLASSES]);
    let labels = null;

    const totalNumberExamples = this.testImages.length / this.IMAGE_SIZE;
    // const randIndex = Math.floor(Math.random() * totalNumberExamples);

    xs = xs.slice([this.imageIndex, 0, 0, 0], [1, this.IMAGE_H, this.IMAGE_W, 1]);
    // labels = labels.slice([randIndex, 0], [1, NUM_CLASSES]);
    labels = null;

    if (this.imageIndex === totalNumberExamples - 1) {
      this.imageIndex = 0;
    } else {
      this.imageIndex += 1;
    }

    return { xs, labels };
  }
}
