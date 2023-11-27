import { Maze } from "../domain";

export const isCoordinateOutOfMap = (maze: Maze, x: number, y: number): boolean => {
  const mazeHeight = maze.length
  const mazeWidth = maze[0].length

  if (x < 0 || y < 0)
    return true

  if (x >= mazeWidth || y >= mazeHeight)
    return true

  return false
}
