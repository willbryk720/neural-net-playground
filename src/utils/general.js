export function diffPropBetweenObjects(a, b) {
  // Create arrays of property names
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  if (aProps.length != bProps.length) {
    throw "Objects must be same size!";
  }

  let propDiffs = [];

  for (let i = 0; i < aProps.length; i++) {
    const propName = aProps[i];
    if (a[propName] !== b[propName]) {
      propDiffs.push(propName);
    }
  }

  return propDiffs;
}

export function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const getArrayMax = array => array.reduce((a, b) => Math.max(a, b));
export const getArrayMin = array => array.reduce((a, b) => Math.min(a, b));
export const getArrayMax2d = array2d => getArrayMax(array2d.map(getArrayMax));
export const getArrayMin2d = array2d => getArrayMin(array2d.map(getArrayMin));
