import { Enemy } from '../types';

export type FormationMatrix = number[][];

export const levelOneFormation: FormationMatrix = [
  [0, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 0],
];

export const generateEnemies = (
  formationOrRows: FormationMatrix | number = 5,
  cols = 10,
  spacingX = 60,
  spacingY = 50,
  offsetX = 50,
  offsetY = 50,
  size = 10,
  baseCols = 10,
  baseRows = 5,
): Enemy[] => {
  const formation: FormationMatrix =
    typeof formationOrRows === 'number'
      ? Array.from({ length: formationOrRows }, () =>
          Array.from({ length: cols }, () => 1),
        )
      : formationOrRows;

  const usedRows = formation.length;
  const usedCols = formation.reduce(
    (max, row) => Math.max(max, row.length),
    0,
  );

  const centeredOffsetX = offsetX + ((baseCols - usedCols) * spacingX) / 2;
  const centeredOffsetY = offsetY + ((baseRows - usedRows) * spacingY) / 2;

  const enemies: Enemy[] = [];
  for (let i = 0; i < formation.length; i += 1) {
    const row = formation[i];
    for (let j = 0; j < row.length; j += 1) {
      if (row[j]) {
        enemies.push({
          x: centeredOffsetX + j * spacingX,
          y: centeredOffsetY + i * spacingY,
          width: size,
          height: size,
          state: 'spawning',
          frame: 0,
          // randomly pick spawn row 2 (index 2) or 3 (index 3)
          row: Math.random() < 0.5 ? 2 : 3,
          nextFrameTime: performance.now() + 100,
          opacity: 1,
        });
      }
    }
  }

  return enemies;
};
