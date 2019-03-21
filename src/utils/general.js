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
