/**
 * Draws a random integer between the requested range
 * @param min The minimum value
 * @param max The maximum value
 * @returns The random integer
 */
export const getRandomInteger = (min: number, max: number) => Math.floor(
  Math.random() * (max - min + 1) + min
);
