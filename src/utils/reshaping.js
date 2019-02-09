export function reshapeArrayTo4D(arr, numA, numB, numC, numD) {
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
      setOfSquares.push(reshapeArrayTo2D(oneSquareArr, numA, numB));
    }
    newArr.push(setOfSquares);
  }
  return newArr;
}

export function reshapeArrayTo3D(arr, numA, numB, numC) {
  const sizeSquares = numA * numB;

  let newArr = [];
  for (let c = 0; c < numC; c++) {
    let oneFilterArr = [];
    for (let i = 0; i < sizeSquares; i++) {
      oneFilterArr.push(arr[c + i * numC]);
    }
    newArr.push(reshapeArrayTo2D(oneFilterArr, numA, numB));
  }
  return newArr;
}

export function reshapeArrayTo2D(arr, numRows, numCols) {
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
