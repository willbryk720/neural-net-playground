import { valueToHex } from "./scene";

export const DENSE_NEURON_WIDTH = 20;

export function getColorStyle(color, maxValue, minValue) {
  color = valueToHex(color, maxValue, minValue);
  let s =
    "" +
    Math.round(color)
      .toString(16)
      .toUpperCase();
  s = "#" + "0".repeat(6 - s.length) + s;
  return s;
}
