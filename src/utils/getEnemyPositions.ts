export type EnemyType = 'empty' | 'enemy'
export type Formation = EnemyType[][]

export const getEnemyPositions = (
  formation: Formation
): { x: number; y: number }[] => {
  const positions: { x: number; y: number }[] = []
  for (let y = 0; y < formation.length; y += 1) {
    const row = formation[y]
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] !== 'empty') {
        positions.push({ x, y })
      }
    }
  }
  return positions
}
