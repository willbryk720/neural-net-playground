/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

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

        const datasetBytesBuffer = new ArrayBuffer(
          NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4
        );

        const chunkSize = 5000;
        canvas.width = img.width;
        canvas.height = chunkSize;

        for (let i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i++) {
          const datasetBytesView = new Float32Array(
            datasetBytesBuffer,
            i * IMAGE_SIZE * chunkSize * 4,
            IMAGE_SIZE * chunkSize
          );
          ctx.drawImage(
            img,
            0,
            i * chunkSize,
            img.width,
            chunkSize,
            0,
            0,
            img.width,
            chunkSize
          );

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
    const [imgResponse, labelsResponse] = await Promise.all([
      imgRequest,
      labelsRequest
    ]);

    this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

    const start = new Date();

    // FLIP EACH IMAGE (BC EACH IS BACKWARDS)
    // let datasetImages = this.datasetImages;
    // let index = 0;
    // let index2 = 0;
    // for (let i = 0; i < NUM_DATASET_ELEMENTS; i++) {
    //   let image = [];
    //   for (let r = 0; r < IMAGE_H; r++) {
    //     let row = [];
    //     for (let c = 0; c < IMAGE_W; c++) {
    //       row.push(datasetImages[index]);
    //       index += 1;
    //     }
    //     image.push(row);
    //   }
    //   image.reverse(); // flip image upside down
    //   // update datasetImages
    //   for (let r = 0; r < IMAGE_H; r++) {
    //     for (let c = 0; c < IMAGE_W; c++) {
    //       datasetImages[index2] = image[r][c];
    //       index2 += 1;
    //     }
    //   }
    // }
    // this.datasetImages = datasetImages;

    // const datasetImages = this.datasetImages;
    // let test = 0;
    // for (let i = 0; i < NUM_DATASET_ELEMENTS; i++) {
    //     const imageIndex = i * IMAGE_SIZE;
    //     const halfH = Math.floor(IMAGE_H / 2);
    //     for (let j = 0; j < halfH; j++) {
    //       const rowIndex = j * IMAGE_W;
    //       const rowIndex2 = (IMAGE_H - j - 1) * IMAGE_W;
    //       for (let k = 0; k < IMAGE_W; k++) {
    //         const i1 = imageIndex + rowIndex + k;
    //         const i2 = imageIndex + rowIndex2 + k;
    //         const save = datasetImages[i1];
    //         datasetImages[i1] = datasetImages[i2];
    //         datasetImages[i2] = save;
    //       }
    //     }
    // }
    // this.datasetImages = datasetImages;

    const end = new Date();
    console.log(end - start);

    // Slice the the images and labels into train and test sets.
    this.trainImages = this.datasetImages.slice(
      0,
      IMAGE_SIZE * NUM_TRAIN_ELEMENTS
    );
    this.testImages = this.datasetImages.slice(IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
    this.trainLabels = this.datasetLabels.slice(
      0,
      NUM_CLASSES * NUM_TRAIN_ELEMENTS
    );
    this.testLabels = this.datasetLabels.slice(
      NUM_CLASSES * NUM_TRAIN_ELEMENTS
    );
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
    let labels = tf.tensor2d(this.testLabels, [
      this.testLabels.length / NUM_CLASSES,
      NUM_CLASSES
    ]);

    if (numExamples != null) {
      xs = xs.slice([0, 0, 0, 0], [numExamples, IMAGE_H, IMAGE_W, 1]);
      labels = labels.slice([0, 0], [numExamples, NUM_CLASSES]);
    }
    return { xs, labels };
  }
}
