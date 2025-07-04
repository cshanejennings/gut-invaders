import { Enemy } from '../types';

export const generateEnemies = (
  rows = 5,
  cols = 10,
  spacingX = 60,
  spacingY = 50,
  offsetX = 50,
  offsetY = 50,
  size = 10
): Enemy[] =>
  Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => ({
      x: offsetX + j * spacingX,
      y: offsetY + i * spacingY,
      width: size,
      height: size,
      state: 'spawning' as const,
      frame: 0,
      // randomly pick spawn row 2 (index 2) or 3 (index 3)
      row: Math.random() < 0.5 ? 2 : 3,
      nextFrameTime: performance.now() + 100,
      opacity: 1,
    }))
  ).flat();
