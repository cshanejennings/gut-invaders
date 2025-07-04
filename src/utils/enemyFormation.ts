import { Entity } from '../types';

export const generateEnemies = (
  rows = 5,
  cols = 10,
  spacingX = 60,
  spacingY = 50,
  offsetX = 50,
  offsetY = 50,
  size = 10
): Entity[] =>
  Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => ({
      x: offsetX + j * spacingX,
      y: offsetY + i * spacingY,
      width: size,
      height: size,
    }))
  ).flat();
