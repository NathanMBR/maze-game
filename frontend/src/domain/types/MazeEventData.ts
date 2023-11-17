import { Maze } from "./Maze"

export type MazeEventData = {
  mazePath: Maze
  maze: Maze
  dimensions: {
    width: number
    height: number
  }
}
