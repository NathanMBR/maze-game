import type { Maze } from "./Maze"
import type { Player } from "./Player"
import type { Bullet } from "./Bullet"
import type { Bomb } from "./Bomb"

export type MazeEventData = {
  mazePath: Maze
  maze: Maze
  dimensions: {
    width: number
    height: number
  }
  players: Array<Player>
  bullets: Array<Bullet>
  bombs: Array<Bomb>
}
