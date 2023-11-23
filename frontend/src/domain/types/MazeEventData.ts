import { Maze } from "./Maze"
import { Player } from "./Player"

export type MazeEventData = {
  mazePath: Maze
  maze: Maze
  dimensions: {
    width: number
    height: number
  }
  players: Array<Player>
}
