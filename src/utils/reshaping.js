import * as tf from "@tensorflow/tfjs";

export function reshape4DTensorToArray(arr, numA, numB, numC, numD) {
  const sizeSquares = numA * numB;
  const lenSkip = numC * numD;

  let newArr = [];
  for (let d = 0; d < numD; d++) {
    let setOfSquares = [];
    for (let c = 0; c < numC; c++) {
      let oneSquareArr = [];
      for (let i = 0; i < sizeSquares; i++) {
        oneSquareArr.push(arr[d + c * numD + i * lenSkip]);
      }
      setOfSquares.push(reshape2DTensorToArray(oneSquareArr, numA, numB));
    }
    newArr.push(setOfSquares);
  }
  return newArr;
}

export function reshape3DTensorToArray(arr, numA, numB, numC) {
  const sizeSquares = numA * numB;

  let newArr = [];
  for (let c = 0; c < numC; c++) {
    let oneFilterArr = [];
    for (let i = 0; i < sizeSquares; i++) {
      oneFilterArr.push(arr[c + i * numC]);
    }
    newArr.push(reshape2DTensorToArray(oneFilterArr, numA, numB));
  }
  return newArr;
}

export function reshape2DTensorToArray(arr, numRows, numCols) {
  let newArr = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push(arr[i * numCols + j]);
    }
    newArr.push(row);
  }
  return newArr;
}

export function reshapeArrayTo4DTensor(arr) {
  const aLen = arr.length;
  const bLen = arr[0].length;
  const cLen = arr[0][0].length;
  const dLen = arr[0][0][0].length;

  let newArr = [];
  for (let c = 0; c < cLen; c++) {
    for (let d = 0; d < dLen; d++) {
      for (let b = 0; b < bLen; b++) {
        for (let a = 0; a < aLen; a++) {
          newArr.push(arr[a][b][c][d]);
        }
      }
    }
  }
  return tf.tensor(newArr, [dLen, cLen, bLen, aLen]);
}

export function reshapeArrayTo2DTensor(arr) {
  const aLen = arr.length;
  const bLen = arr[0].length;

  let newArr = [];

  for (let a = 0; a < aLen; a++) {
    for (let b = 0; b < bLen; b++) {
      newArr.push(arr[a][b]);
    }
  }

  return tf.tensor(newArr, [aLen, bLen]);
}
