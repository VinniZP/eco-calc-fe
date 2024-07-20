import { Nutrients } from '../nutrients';

function clampFn(val: number, min: number, max: number) {
  return val < min ? min : val > max ? max : val;
}

export function interpolate(value: number, min: number, max: number, clamp: boolean): number {
  let result = (max - min) * value + min;
  if (clamp) result = clampFn(result, min, max);
  return result;
}

export function sumValues(nutrients: Nutrients): number {
  return Object.values(nutrients).reduce((sum, value) => sum + value, 0);
}
