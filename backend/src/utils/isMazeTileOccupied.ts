import { Maze } from "../domain"

export const isMazeTileOccupied = (maze: Maze, x: number, y: number) => {
  const mazeHeight = maze.length
  const mazeWidth = maze[0].length

  if (x < 0 || y < 0)
    return false

  if (x >= mazeWidth || y >= mazeHeight)
    return false

  const isTileUsed = !!maze[y][x]
  return isTileUsed
}
