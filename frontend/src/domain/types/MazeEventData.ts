import { Maze } from "./Maze"
import { Player } from "./Player"
import { Bullet } from "./Bullet"

export type MazeEventData = {
  mazePath: Maze
  maze: Maze
  dimensions: {
    width: number
    height: number
  }
  players: Array<Player>
  bullets: Array<Bullet>
}
