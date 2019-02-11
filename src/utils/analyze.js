export const DENSE_NEURON_WIDTH = 20;

export function getColorStyle(color) {
  let s =
    "" +
    Math.round(color)
      .toString(16)
      .toUpperCase();
  s = "#" + "0".repeat(6 - s.length) + s;
  return s;
}
