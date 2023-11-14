/**
 * Draws a random integer between 1 and the given value
 * @param max The maximum value
 * @returns The random integer
 */
export function getRandomInteger(max: number): number

/**
 * Draws a random integer between the requested range
 * @param min The minimum value
 * @param max The maximum value
 * @returns The random integer
 */
export function getRandomInteger(min: number, max: number): number

export function getRandomInteger(firstValue: number, secondValue?: number): number {
  const isSecondValueDefined = typeof secondValue === "number"

  const min = isSecondValueDefined ? firstValue : 1;
  const max = isSecondValueDefined ? secondValue : firstValue;

  const randomInteger = Math.floor(
    Math.random() * (max - min + 1) + min
  );

  return randomInteger;
}
